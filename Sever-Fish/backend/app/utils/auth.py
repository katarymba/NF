# app/utils/auth.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
import logging
from fastapi import HTTPException, status, Request, Header
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Настройка логирования
logger = logging.getLogger(__name__)

# Контекст для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет соответствие пароля его хешу"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Создает хеш пароля"""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Создает JWT токен доступа

    Args:
        data: Данные для включения в токен
        expires_delta: Время жизни токена

    Returns:
        Строка JWT токена
    """
    to_encode = data.copy()

    # Устанавливаем срок действия токена
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})

    # Кодируем токен
    try:
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        logger.error(f"Ошибка при создании токена: {e}")
        raise e


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Декодирует JWT токен и возвращает его содержимое

    Args:
        token: JWT токен для декодирования

    Returns:
        Словарь с данными из токена или None, если токен недействителен
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"Ошибка декодирования JWT: {e}")
        return None
    except Exception as e:
        logger.error(f"Непредвиденная ошибка при декодировании токена: {e}")
        return None


def extract_token_from_header(authorization: Optional[str] = None) -> Optional[str]:
    """
    Извлекает токен из заголовка Authorization

    Args:
        authorization: Заголовок Authorization

    Returns:
        Строка токена или None, если токен не найден
    """
    if not authorization:
        return None

    try:
        auth_parts = authorization.split()
        if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
            return None

        token = auth_parts[1]
        return token
    except Exception as e:
        logger.error(f"Ошибка при извлечении токена из заголовка: {e}")
        return None


async def get_current_user_id(request: Request) -> Optional[int]:
    """
    Получает ID пользователя из токена в заголовке запроса

    Args:
        request: Объект запроса FastAPI

    Returns:
        ID пользователя или None, если токен отсутствует или недействителен
    """
    authorization = request.headers.get("Authorization")
    token = extract_token_from_header(authorization)

    if not token:
        return None

    payload = decode_token(token)
    if not payload or "user_id" not in payload:
        return None

    return payload.get("user_id")


async def get_current_user(request: Request, db: Session) -> Optional[Dict[str, Any]]:
    """
    Получает данные пользователя из базы данных на основе токена

    Args:
        request: Объект запроса FastAPI
        db: Сессия базы данных

    Returns:
        Словарь с данными пользователя или None
    """
    user_id = await get_current_user_id(request)

    if not user_id:
        return None

    try:
        # Получаем пользователя из БД
        from app.models import User
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception as e:
        logger.error(f"Ошибка при получении пользователя из БД: {e}")
        return None


async def require_auth(request: Request, db: Session) -> Dict[str, Any]:
    """
    Проверяет аутентификацию и возвращает данные пользователя или вызывает исключение

    Args:
        request: Объект запроса FastAPI
        db: Сессия базы данных

    Returns:
        Словарь с данными пользователя

    Raises:
        HTTPException: Если пользователь не аутентифицирован
    """
    user = await get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Необходима авторизация",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверка активности пользователя
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Аккаунт неактивен"
        )

    return user


async def require_admin(request: Request, db: Session) -> Dict[str, Any]:
    """
    Проверяет права администратора и возвращает данные пользователя или вызывает исключение

    Args:
        request: Объект запроса FastAPI
        db: Сессия базы данных

    Returns:
        Словарь с данными пользователя

    Raises:
        HTTPException: Если пользователь не аутентифицирован или не является администратором
    """
    user = await require_auth(request, db)

    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен. Требуются права администратора."
        )

    return user


def is_token_expired(token: str) -> bool:
    """
    Проверяет, истек ли срок действия токена

    Args:
        token: JWT токен

    Returns:
        True, если срок действия токена истек, иначе False
    """
    try:
        payload = decode_token(token)
        if not payload or "exp" not in payload:
            return True

        exp_timestamp = payload["exp"]
        current_timestamp = datetime.utcnow().timestamp()

        return exp_timestamp < current_timestamp
    except Exception:
        return True