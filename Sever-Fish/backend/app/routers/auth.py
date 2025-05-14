from fastapi import APIRouter, Depends, HTTPException, status, Request, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Optional
from datetime import datetime, timedelta
import logging
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models import User
from app.schemas import Token, ApiResponse, UserProfile
from app.utils.auth import (
    verify_password, create_access_token, get_password_hash,
    decode_token, extract_token_from_header
)
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES

# Настройка логирования
logger = logging.getLogger(__name__)

# Создаем роутер
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Настройка OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# Модель для входа через JSON
class LoginRequest(BaseModel):
    email: str
    password: str


# Модель для регистрации пользователя
class RegisterRequest(BaseModel):
    name: str
    password: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None


# Модель для сброса пароля
class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str


@router.post("/register", response_model=Token)
async def register(
        user_data: RegisterRequest,
        db: Session = Depends(get_db)
):
    """
    Регистрирует нового пользователя и возвращает токен доступа.
    """
    try:
        # Проверяем, существует ли пользователь с таким email
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )

        # Проверяем, существует ли пользователь с таким именем
        existing_name = db.query(User).filter(User.name == user_data.name).first()
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким именем уже существует"
            )

        # Хешируем пароль
        hashed_password = get_password_hash(user_data.password)

        # Создаем пользователя
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            phone=user_data.phone,
            created_at=datetime.utcnow(),
            is_active=True
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Создаем JWT токен для нового пользователя
        token_data = {"sub": user_data.email, "user_id": new_user.id}
        access_token = create_access_token(token_data)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при регистрации пользователя: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при регистрации пользователя: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(
        login_data: LoginRequest,
        db: Session = Depends(get_db)
):
    """
    Аутентификация пользователя и выдача токена доступа.
    """
    try:
        # Ищем пользователя по email
        user = db.query(User).filter(User.email == login_data.email).first()

        # Если пользователь не найден по email, проверяем по имени
        if not user:
            user = db.query(User).filter(User.name == login_data.email).first()

        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email/имя пользователя или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Проверяем активность аккаунта
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Аккаунт неактивен"
            )

        # Создаем JWT токен
        token_data = {"sub": user.email, "user_id": user.id}
        access_token = create_access_token(data=token_data)

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при входе пользователя: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при входе пользователя: {str(e)}"
        )


@router.post("/oauth/token", response_model=Token)
async def login_oauth(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    """
    OAuth2 совместимый эндпоинт для аутентификации.
    """
    # Ищем пользователя по имени пользователя (username в OAuth2 может быть и email)
    user = db.query(User).filter(User.name == form_data.username).first()

    # Если не нашли по имени, пробуем по email
    if not user:
        user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверяем активность аккаунта
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт неактивен"
        )

    # Создаем JWT токен
    token_data = {"sub": user.email, "user_id": user.id}
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/forgot-password", response_model=ApiResponse)
async def forgot_password(
        reset_request: PasswordResetRequest,
        db: Session = Depends(get_db)
):
    """
    Инициирует процесс восстановления пароля.
    В реальном приложении здесь должна быть отправка email.
    """
    # Проверяем существование пользователя
    user = db.query(User).filter(User.email == reset_request.email).first()
    if not user:
        # Не сообщаем о несуществующем пользователе для безопасности
        return {
            "success": True,
            "message": "Если указанный email зарегистрирован, инструкции по сбросу пароля будут отправлены"
        }

    # Создаем токен для сброса пароля (срок действия - 1 час)
    reset_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "purpose": "password_reset"},
        expires_delta=timedelta(hours=1)
    )

    # В реальном приложении здесь должна быть отправка email с токеном
    # Например: send_password_reset_email(user.email, reset_token)

    # Для демонстрации логируем токен
    logger.info(f"Токен сброса пароля для {user.email}: {reset_token}")

    return {
        "success": True,
        "message": "Инструкции по сбросу пароля отправлены на указанный email"
    }


@router.post("/reset-password", response_model=ApiResponse)
async def reset_password(
        reset_data: PasswordResetConfirm,
        db: Session = Depends(get_db)
):
    """
    Завершает процесс восстановления пароля.
    """
    # Проверяем токен
    payload = decode_token(reset_data.token)
    if not payload or "purpose" not in payload or payload["purpose"] != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Недействительный или истекший токен сброса пароля"
        )

    # Проверяем пользователя
    user_email = payload.get("sub")
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    # Устанавливаем новый пароль
    user.hashed_password = get_password_hash(reset_data.new_password)
    db.commit()

    return {
        "success": True,
        "message": "Пароль успешно изменен"
    }


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Получает профиль текущего аутентифицированного пользователя.
    """
    # Получаем токен из заголовка
    authorization = request.headers.get("Authorization")
    token = extract_token_from_header(authorization)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не предоставлен токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Декодируем токен
    payload = decode_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Получаем пользователя
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт неактивен"
        )

    return user


@router.post("/logout", response_model=ApiResponse)
async def logout():
    """
    Завершает сессию пользователя.

    Примечание: JWT токены нельзя отозвать на сервере.
    Для полноценного логаута клиент должен удалить токен локально.
    """
    return {
        "success": True,
        "message": "Вы успешно вышли из системы"
    }


@router.post("/refresh-token", response_model=Token)
async def refresh_access_token(
        request: Request,
        db: Session = Depends(get_db)
):
    """
    Обновляет токен доступа.
    """
    # Получаем токен из заголовка
    authorization = request.headers.get("Authorization")
    token = extract_token_from_header(authorization)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не предоставлен токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Декодируем токен
    payload = decode_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен аутентификации",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Получаем пользователя
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт неактивен"
        )

    # Создаем новый токен
    token_data = {"sub": user.email, "user_id": user.id}
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }