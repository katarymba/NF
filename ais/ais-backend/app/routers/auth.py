import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from app import models, schemas
from app.database import get_db
from app.utils.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models import Administrator

load_dotenv()

# Используем значение из config.py, если не задано в .env
if not SECRET_KEY or SECRET_KEY == "change_this_secret_key":
    SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"

router = APIRouter(tags=["auth"])

# Настройка для bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        print(f" Ошибка при проверке пароля: {e}")
        return False


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Зависимость для получения текущего пользователя
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        if token is None:
            raise credentials_exception
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Сначала проверяем среди администраторов
    user = db.query(Administrator).filter(Administrator.email == username).first()
    if user is None:
        # Если нет в администраторах, проверяем среди обычных пользователей
        user = db.query(models.User).filter(models.User.username == username).first()
        if user is None:
            raise credentials_exception
    return user


# Функция для получения текущего пользователя (опциональная аутентификация)
def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Возвращает пользователя, если токен предоставлен и действителен.
    В противном случае возвращает None, что позволяет использовать API без аутентификации.
    """
    if token is None:
        # Если токен не предоставлен, возвращаем фиктивного пользователя для тестирования API
        return {"id": 0, "username": "anonymous", "role": "guest"}
    
    try:
        # Пытаемся получить пользователя
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return {"id": 0, "username": "anonymous", "role": "guest"}
        
        # Сначала проверяем среди администраторов
        user = db.query(Administrator).filter(Administrator.email == username).first()
        if user is None:
            # Если нет в администраторах, проверяем среди обычных пользователей
            user = db.query(models.User).filter(models.User.username == username).first()
            if user is None:
                return {"id": 0, "username": "anonymous", "role": "guest"}
        return user
        
    except JWTError:
        # В случае ошибки токена возвращаем анонимного пользователя
        return {"id": 0, "username": "anonymous", "role": "guest"}
    except Exception:
        # При любой другой ошибке также возвращаем анонимного пользователя
        return {"id": 0, "username": "anonymous", "role": "guest"}


# Зависимость для проверки роли администратора
def require_admin(user = Depends(get_current_user)):
    if not hasattr(user, 'role') or user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для доступа"
        )
    return user


@router.post("/token")
def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    # Поиск администратора
    user = (
        db.query(Administrator)
        .filter(
            (Administrator.email == form_data.username) |
            (Administrator.username == form_data.username)
        )
        .first()
    )

    if not user:
        print("❌ Пользователь не найден")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверка пароля
    try:
        is_password_correct = verify_password(form_data.password, user.password_hash)

        if not is_password_correct:
            print("Неверный пароль")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Создание токена
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role},
            expires_delta=access_token_expires,
        )

        print("✅ Вход выполнен успешно")
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        print(f"❌ Критическая ошибка: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/debug/administrators")
def debug_list_administrators(db: Session = Depends(get_db)):
    admins = db.query(Administrator).all()
    return [
        {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email,
            "is_active": admin.is_active,
            "hash_length": len(admin.password_hash) if admin.password_hash else 0
        } for admin in admins
    ]


@router.post("/register", response_model=schemas.UserResponse)
def register(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    # Только администратор может создавать новых пользователей
    existing_user = db.query(models.User).filter(models.User.username == user_create.username).first()
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем уже существует",
        )
    hashed_password = get_password_hash(user_create.password)
    new_user = models.User(
        username=user_create.username,
        email=user_create.email,
        password_hash=hashed_password,
        role="user"  # по умолчанию создается обычный пользователь; роль можно изменить при необходимости
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user = Depends(get_current_user)):
    return current_user