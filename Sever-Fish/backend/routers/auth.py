from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import json
import logging
from database import get_db
from models import User
from schemas import UserCreate, UserProfile, UserUpdate, PasswordChangeRequest
from typing import Optional, Dict, Any
from auth import verify_password, get_password_hash, create_access_token, get_current_user

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создаем роутер
router = APIRouter(prefix="/auth", tags=["Authentication"])

# Константы для JWT
SECRET_KEY = "0bde95d7a26d5fd30374db066e45d53fe7a9fbc886b099a14f37b830f6c6b12c"  # Замените на реальный секретный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 часа

# Схема OAuth2 для извлечения Bearer-токена
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Вход пользователя
@router.post("/login")
async def login(request: Request):
    try:
        # Получаем данные из тела запроса
        login_data = await request.json()
        phone = login_data.get("phone")
        password = login_data.get("password")
        
        logger.info(f"Попытка входа с номером телефона: {phone}")
        
        if not phone or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Необходимо указать телефон и пароль"
            )
        
        # Получаем соединение с БД из пула соединений
        db = request.app.state.db_pool.getconn()
        try:
            # Создаем курсор для выполнения запросов
            cursor = db.cursor()
            
            # Проверяем, существует ли таблица users
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                );
            """)
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Система аутентификации не настроена",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Ищем пользователя по телефону
            cursor.execute("""
                SELECT id, username, email, password_hash
                FROM users
                WHERE phone = %s
            """, (phone,))
            
            user = cursor.fetchone()
            
            if not user:
                logger.warning(f"Пользователь с телефоном {phone} не найден")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Неверные учетные данные",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            if not verify_password(password, user[3]):  # Индекс 3 для password_hash
                logger.warning("Неверный пароль")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Неверные учетные данные",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Создаем токен
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user[1], "user_id": user[0]},  # Индекс 1 для username, 0 для id
                expires_delta=access_token_expires
            )
            
            logger.info(f"Успешный вход: {user[1]}")  # Индекс 1 для username
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": user[0],  # Индекс 0 для id
                "username": user[1]  # Индекс 1 для username
            }
        finally:
            # Возвращаем соединение в пул
            request.app.state.db_pool.putconn(db)
    
    except HTTPException:
        raise
    except json.JSONDecodeError:
        logger.error("Ошибка при декодировании JSON")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат JSON"
        )
    except Exception as e:
        logger.error(f"Ошибка при входе: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при входе: {str(e)}"
        )

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    request: Request,
    token_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Получение профиля текущего пользователя.
    """
    try:
        db = request.app.state.db_pool.getconn()
        try:
            cursor = db.cursor()
            
            # Получаем информацию о пользователе
            cursor.execute("""
                SELECT id, username, email, phone, full_name, birthday
                FROM users
                WHERE id = %s
            """, (token_data.user_id,))
            
            user_data = cursor.fetchone()
            
            if not user_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Пользователь не найден"
                )
            
            # Создаем словарь с данными пользователя
            user_profile = {
                "id": user_data[0],
                "username": user_data[1],
                "email": user_data[2],
                "phone": user_data[3],
                "full_name": user_data[4],
                "birthday": user_data[5].isoformat() if user_data[5] else None
            }
            
            return user_profile
        finally:
            request.app.state.db_pool.putconn(db)
    except Exception as e:
        logger.error(f"Ошибка при получении профиля пользователя: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при получении профиля пользователя"
        )

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    request: Request,
    profile_update: UserUpdate,
    token_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Обновление профиля текущего пользователя.
    """
    try:
        db = request.app.state.db_pool.getconn()
        try:
            cursor = db.cursor()
            
            # Проверяем, существует ли пользователь
            cursor.execute("""
                SELECT id FROM users WHERE id = %s
            """, (token_data.user_id,))
            
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Пользователь не найден"
                )
            
            # Собираем поля для обновления
            update_fields = []
            update_values = []
            
            if profile_update.full_name is not None:
                update_fields.append("full_name = %s")
                update_values.append(profile_update.full_name)
            
            if profile_update.email is not None:
                # Проверяем, не занят ли email другим пользователем
                cursor.execute("""
                    SELECT id FROM users WHERE email = %s AND id != %s
                """, (profile_update.email, token_data.user_id))
                
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Этот email уже используется"
                    )
                
                update_fields.append("email = %s")
                update_values.append(profile_update.email)
            
            if profile_update.phone is not None:
                # Проверяем, не занят ли телефон другим пользователем
                cursor.execute("""
                    SELECT id FROM users WHERE phone = %s AND id != %s
                """, (profile_update.phone, token_data.user_id))
                
                if cursor.fetchone():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Этот номер телефона уже используется"
                    )
                
                update_fields.append("phone = %s")
                update_values.append(profile_update.phone)
            
            if profile_update.birthday is not None:
                update_fields.append("birthday = %s")
                update_values.append(profile_update.birthday)
            
            # Если есть что обновлять
            if update_fields:
                # Формируем SQL запрос на обновление
                sql = f"""
                    UPDATE users 
                    SET {", ".join(update_fields)}
                    WHERE id = %s
                    RETURNING id, username, email, phone, full_name, birthday
                """
                
                # Добавляем ID пользователя к значениям для обновления
                update_values.append(token_data.user_id)
                
                # Выполняем запрос
                cursor.execute(sql, update_values)
                db.commit()
                
                # Получаем обновленные данные
                updated_user = cursor.fetchone()
                
                # Возвращаем обновленный профиль
                return {
                    "id": updated_user[0],
                    "username": updated_user[1],
                    "email": updated_user[2],
                    "phone": updated_user[3],
                    "full_name": updated_user[4],
                    "birthday": updated_user[5].isoformat() if updated_user[5] else None
                }
            
            # Если нет полей для обновления, возвращаем текущий профиль
            cursor.execute("""
                SELECT id, username, email, phone, full_name, birthday
                FROM users
                WHERE id = %s
            """, (token_data.user_id,))
            
            user_data = cursor.fetchone()
            
            return {
                "id": user_data[0],
                "username": user_data[1],
                "email": user_data[2],
                "phone": user_data[3],
                "full_name": user_data[4],
                "birthday": user_data[5].isoformat() if user_data[5] else None
            }
        finally:
            request.app.state.db_pool.putconn(db)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении профиля пользователя: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при обновлении профиля пользователя: {str(e)}"
        )

@router.post("/change-password")
async def change_password(
    request: Request,
    password_change: PasswordChangeRequest,
    token_data: Dict[str, Any] = Depends(get_current_user)
):
    """
    Изменение пароля текущего пользователя.
    """
    try:
        db = request.app.state.db_pool.getconn()
        try:
            cursor = db.cursor()
            
            # Получаем текущий хеш пароля пользователя
            cursor.execute("""
                SELECT password_hash FROM users WHERE id = %s
            """, (token_data.user_id,))
            
            user_data = cursor.fetchone()
            
            if not user_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Пользователь не найден"
                )
            
            # Проверяем текущий пароль
            if not verify_password(password_change.current_password, user_data[0]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Неверный текущий пароль"
                )
            
            # Хешируем новый пароль
            hashed_password = get_password_hash(password_change.new_password)
            
            # Обновляем пароль в базе данных
            cursor.execute("""
                UPDATE users SET password_hash = %s WHERE id = %s
            """, (hashed_password, token_data.user_id))
            
            db.commit()
            
            return {"message": "Пароль успешно изменен"}
        finally:
            request.app.state.db_pool.putconn(db)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при изменении пароля: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при изменении пароля: {str(e)}"
        )