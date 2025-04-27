from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta
import hashlib
import logging
import json

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Настройка JWT
SECRET_KEY = "your_secret_key"  # В реальном приложении используйте безопасный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Функция создания JWT-токена
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Функция хеширования пароля
def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Функция проверки пароля
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

# Регистрация пользователя
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(request: Request):
    try:
        # Получаем данные из тела запроса
        user_data = await request.json()
        logger.info(f"Получен запрос на регистрацию: {user_data.get('username')}, {user_data.get('email')}")
        
        # Проверка совпадения паролей
        if user_data.get("password") != user_data.get("password_confirm"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пароли не совпадают"
            )
        
        # Получаем соединение с БД из пула соединений
        db = request.app.state.db_pool.getconn()
        try:
            # Устанавливаем автокоммит в False для управления транзакциями
            db.autocommit = False
            
            # Создаем курсор для выполнения запросов
            cursor = db.cursor()
            
            # Проверим существование таблицы users
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                );
            """)
            table_exists = cursor.fetchone()[0]  # Используем индекс вместо ключа
            
            if not table_exists:
                # Создаем таблицу users если её нет
                logger.info("Таблица users не существует. Создаем...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(100) UNIQUE NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        phone VARCHAR(20),
                        full_name VARCHAR(200),
                        hashed_password VARCHAR(200) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                db.commit()
                logger.info("Таблица users создана успешно")
            
            # Проверяем, существует ли пользователь с таким username или email
            cursor.execute("""
                SELECT id FROM users WHERE username = %s OR email = %s
            """, (user_data.get("username"), user_data.get("email")))
            existing_user = cursor.fetchone()
            
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Пользователь с таким именем или email уже существует"
                )
            
            # Хешируем пароль
            hashed_password = get_password_hash(user_data.get("password"))
            
            # Вставляем пользователя
            logger.info("Добавляем нового пользователя...")
            cursor.execute("""
                INSERT INTO users (username, email, phone, full_name, hashed_password)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, username, email
            """, (
                user_data.get("username"),
                user_data.get("email"),
                user_data.get("phone"),
                user_data.get("full_name"),
                hashed_password
            ))
            
            db.commit()
            new_user = cursor.fetchone()
            logger.info(f"Пользователь успешно создан: {new_user[1]}")  # Используем индекс для username
            
            # Создаем токен для нового пользователя
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": new_user[1]},  # Используем индекс для username
                expires_delta=access_token_expires
            )
            
            return {
                "id": new_user[0],  # id
                "username": new_user[1],  # username
                "email": new_user[2],  # email
                "access_token": access_token,
                "token_type": "bearer"
            }
        except Exception as e:
            # В случае ошибки откатываем транзакцию
            db.rollback()
            logger.error(f"Ошибка при выполнении запроса к БД: {str(e)}", exc_info=True)
            raise
        finally:
            # Возвращаем соединение в пул
            request.app.state.db_pool.putconn(db)
    
    except HTTPException as e:
        logger.error(f"HTTPException: {e.detail}")
        raise e
    except json.JSONDecodeError:
        logger.error("Ошибка при декодировании JSON")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат JSON"
        )
    except Exception as e:
        logger.error(f"Ошибка при регистрации: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при создании пользователя: {str(e)}"
        )

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
                SELECT id, username, email, hashed_password
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
            
            if not verify_password(password, user[3]):  # Индекс 3 для hashed_password
                logger.warning("Неверный пароль")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Неверные учетные данные",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Создаем токен
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user[1]},  # Индекс 1 для username
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