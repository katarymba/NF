import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

from app import models, schemas
from app.database import get_db
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models import Administrator

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

router = APIRouter(tags=["auth"])

# Настройка для bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    print("\n--- Проверка пароля ---")
    print(f"Входящий пароль: {plain_password}")
    print(f"Длина входящего пароля: {len(plain_password)}")
    print(f"Хеш из базы: {hashed_password}")
    print(f"Длина хеша: {len(hashed_password)}")

    try:
        result = pwd_context.verify(plain_password, hashed_password)
        print(f"Результат проверки: {result}")
        return result
    except Exception as e:
        print(f"❌ Ошибка при проверке пароля: {e}")
        return False

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/token")
def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    # Расширенное логирование
    print("\n--- Попытка входа администратора ---")
    print(f"Входящий username/email: {form_data.username}")
    print(f"Длина пароля: {len(form_data.password)}")

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

    # Подробная проверка пароля
    try:
        is_password_correct = verify_password(form_data.password, user.password_hash)

        print(f"✅ Найден пользователь: {user.username}")
        print(f"✅ Хеш пароля из БД: {user.password_hash}")
        print(f"✅ Результат проверки пароля: {is_password_correct}")

        if not is_password_correct:
            print("❌ Неверный пароль")
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


# Зависимость для получения текущего пользователя
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


# Зависимость для проверки роли администратора
def require_admin(user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для доступа"
        )
    return user


@router.post("/register", response_model=schemas.UserResponse)
def register(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
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
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


