from fastapi import APIRouter, Depends, HTTPException, status, Request, Form, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Dict, Optional, Union
from datetime import datetime, timedelta
import logging
from database import get_db
import psycopg2.extras
import traceback
from pydantic import BaseModel, EmailStr  # Добавляем EmailStr для валидации email

# Fix import to use your local auth functions
from utils.auth import verify_password, create_access_token, get_password_hash  # Use absolute imports

# Настройка логирования
logger = logging.getLogger(__name__)

# Создаем роутер
router = APIRouter()

# Настройка OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Новая модель для входа через JSON 
class LoginRequest(BaseModel):
    username: str
    password: str

# Модель для регистрации пользователя
class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str  # Используем EmailStr для автоматической валидации
    full_name: Optional[str] = None
    phone: Optional[str] = None

# Маршрут для регистрации пользователя
@router.post("/register")
async def register(
    user_data: RegisterRequest,
    db = Depends(get_db)
):
    try:
        # Проверяем уникальность email и телефона
        cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Проверка email
        cursor.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
        existing_email = cursor.fetchone()
        
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже существует"
            )
        
        # Проверка телефона, если он указан
        if user_data.phone:
            cursor.execute("SELECT id FROM users WHERE phone = %s", (user_data.phone,))
            existing_phone = cursor.fetchone()
            
            if existing_phone:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Пользователь с таким номером телефона уже существует"
                )
        
        # Проверка на наличие email
        if not user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email обязателен для регистрации"
            )
        
        # Хешируем пароль перед сохранением
        hashed_password = get_password_hash(user_data.password)
        
        # Создаем пользователя
        insert_query = """
        INSERT INTO users (username, password_hash, full_name, email, phone, created_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        RETURNING id, username, full_name, email, phone
        """
        cursor.execute(
            insert_query,
            (user_data.username, hashed_password, user_data.full_name, user_data.email, user_data.phone)
        )
        db.commit()
        
        new_user = cursor.fetchone()
        
        # Создаем JWT токен для нового пользователя
        token_data = {"sub": user_data.username, "user_id": new_user['id']}
        access_token = create_access_token(token_data)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": new_user['id'],
                "username": new_user['username'],
                "full_name": new_user.get('full_name'),
                "email": new_user.get('email'),
                "phone": new_user.get('phone')
            }
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при регистрации пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при регистрации пользователя: {str(e)}"
        )

# Создаем специальный эндпоинт для формы OAuth2
@router.post("/oauth/token")
async def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    username = form_data.username
    password = form_data.password
    
    # Ищем пользователя в базе данных
    cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(
        "SELECT id, username, password_hash, full_name, email, phone FROM users WHERE username = %s",
        (username,)
    )
    user = cursor.fetchone()
    
    if not user or not verify_password(password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Создаем JWT токен
    token_data = {"sub": user['username'], "user_id": user['id']}
    access_token = create_access_token(token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# Маршрут для входа через JSON
@router.post("/login")
async def login_json(
    login_data: LoginRequest,
    db = Depends(get_db)
):
    try:
        logger.info(f"Попытка входа для пользователя: {login_data.username}")
        
        # Вначале ищем по номеру телефона
        cursor = db.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Проверяем, может быть это номер телефона
        cursor.execute(
            "SELECT id, username, password_hash, full_name, email, phone FROM users WHERE phone = %s",
            (login_data.username,)
        )
        user = cursor.fetchone()
        
        # Если пользователь не найден по телефону, ищем по username
        if not user:
            cursor.execute(
                "SELECT id, username, password_hash, full_name, email, phone FROM users WHERE username = %s",
                (login_data.username,)
            )
            user = cursor.fetchone()
            
        # Если пользователь не найден ни по телефону, ни по username, ищем по email
        if not user:
            cursor.execute(
                "SELECT id, username, password_hash, full_name, email, phone FROM users WHERE email = %s",
                (login_data.username,)
            )
            user = cursor.fetchone()
        
        if not user:
            logger.warning(f"Пользователь не найден: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверное имя пользователя или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Проверяем пароль
        if not verify_password(login_data.password, user['password_hash']):
            logger.warning(f"Неверный пароль для пользователя: {login_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверное имя пользователя или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Создаем JWT токен
        token_data = {"sub": user['username'], "user_id": user['id']}
        access_token = create_access_token(token_data)
        
        logger.info(f"Успешный вход для пользователя: {login_data.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user['id'],
                "username": user['username'],
                "full_name": user.get('full_name'),
                "email": user.get('email'),
                "phone": user.get('phone')
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при входе пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при входе пользователя: {str(e)}"
        )