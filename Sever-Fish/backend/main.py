import logging
import traceback
import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Union

from fastapi import FastAPI, Depends, HTTPException, Request, Form, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from starlette.middleware.sessions import SessionMiddleware
import psycopg2
import psycopg2.extras
import re
import uuid
import shutil
from enum import Enum
from decimal import Decimal

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Константы
SECRET_KEY = "your-secret-key"  # В реальном проекте используйте другой секретный ключ
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MAX_QUANTITY = 10

# Создание подключения к базе данных
def get_db():
    try:
        connection = psycopg2.connect(
            host='localhost',
            user='katarymba',
            password='root',
            dbname='sever_ryba_db'
        )
        connection.autocommit = True
        yield connection
    except Exception as e:
        logger.error(f"Error connecting to database: {str(e)}")
        raise
    finally:
        if 'connection' in locals():
            connection.close()

# Создание приложения FastAPI
app = FastAPI(title="Северная рыба API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене укажите конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Добавление middleware для сессий
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Обработчик ошибок для всего приложения
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Необработанная ошибка: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Внутренняя ошибка сервера: {str(exc)}"}
    )

# Модели данных
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    id: int
    email: str
    name: str
    phone: str
    is_active: bool = True
    is_admin: bool = False

class TokenData(BaseModel):
    user_id: Optional[int] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = 0
    image_url: Optional[str] = None  # We'll set a default value in the code
    weight: Optional[str] = None     # We'll set a default value in the code

class CategoryCreate(BaseModel):
    name: str
    
class CategoryResponse(BaseModel):
    id: int
    name: str

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    user_id: Optional[int] = None
    product: ProductResponse

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderCreate(BaseModel):
    delivery_address: str
    phone: str
    email: str
    name: str
    comment: Optional[str] = None
    payment_method: str

class OrderResponse(BaseModel):
    id: int
    user_id: Optional[int]
    status: OrderStatus
    total: float
    delivery_address: str
    phone: str
    email: str
    name: str
    comment: Optional[str]
    payment_method: str
    created_at: str
    items: List[Dict[str, Any]]

# Создание экземпляров маршрутизаторов
from fastapi import APIRouter

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
product_router = APIRouter(prefix="/products", tags=["Products"])
category_router = APIRouter(prefix="/categories", tags=["Categories"])
cart_router = APIRouter(prefix="/cart", tags=["Cart"])
order_router = APIRouter(prefix="/orders", tags=["Orders"])

# Функции безопасности
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

# Эндпоинты аутентификации
@auth_router.post("/register", response_model=User)
async def register(user: UserCreate, db = Depends(get_db)):
    try:
        # Проверка, что email уникален
        cursor = db.cursor()
        cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email уже зарегистрирован")
        
        # Проверка формата email
        if not re.match(r"[^@]+@[^@]+\.[^@]+", user.email):
            raise HTTPException(status_code=400, detail="Неверный формат email")
        
        # Проверка длины пароля
        if len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Пароль должен содержать не менее 6 символов")
        
        # Хеширование пароля
        hashed_password = get_password_hash(user.password)
        
        # Создание пользователя
        cursor.execute(
            "INSERT INTO users (email, password, name, phone) VALUES (%s, %s, %s, %s) RETURNING id",
            (user.email, hashed_password, user.name, user.phone)
        )
        user_id = cursor.fetchone()[0]
        
        # Получение созданного пользователя
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user_data = cursor.fetchone()
        column_names = [desc[0] for desc in cursor.description]
        user_dict = {column_names[i]: user_data[i] for i in range(len(column_names))}
        
        return {
            "id": user_dict["id"],
            "email": user_dict["email"],
            "name": user_dict["name"],
            "phone": user_dict["phone"],
            "is_active": True,
            "is_admin": False
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при регистрации пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@auth_router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db = Depends(get_db)):
    try:
        # Поиск пользователя по email
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (user_credentials.email,))
        user_data = cursor.fetchone()
        
        if not user_data:
            raise HTTPException(
                status_code=401,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        column_names = [desc[0] for desc in cursor.description]
        user = {column_names[i]: user_data[i] for i in range(len(column_names))}
        
        if not verify_password(user_credentials.password, user["password"]):
            raise HTTPException(
                status_code=401,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Создание токена
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"user_id": user["id"]}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "Bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при входе пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@auth_router.get("/profile", response_model=User)
async def get_profile(request: Request, db = Depends(get_db)):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        if not authorization:
            raise HTTPException(
                status_code=401,
                detail="Не авторизован",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        try:
            auth_parts = authorization.split()
            if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
                raise HTTPException(
                    status_code=401,
                    detail="Неверный формат токена",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            token = auth_parts[1]
            payload = verify_token(token)
            if not payload:
                raise HTTPException(
                    status_code=401,
                    detail="Токен недействителен или истек срок его действия",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(
                    status_code=401,
                    detail="Невозможно идентифицировать пользователя",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Получаем пользователя из базы данных
            cursor = db.cursor()
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user_data = cursor.fetchone()
            
            if not user_data:
                raise HTTPException(status_code=404, detail="Пользователь не найден")
            
            column_names = [desc[0] for desc in cursor.description]
            user = {column_names[i]: user_data[i] for i in range(len(column_names))}
            
            return {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "phone": user["phone"],
                "is_active": True,
                "is_admin": False
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Ошибка при проверке токена: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Ошибка аутентификации",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении профиля: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

# Эндпоинты для продуктов
@product_router.get("/", response_model=List[ProductResponse])
async def get_products(db = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, name, description, price, category_id, stock_quantity
            FROM products
        """)
        products_raw = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description]
        
        # Convert the results to the expected format
        products = []
        for product in products_raw:
            product_dict = {}
            for i, col_name in enumerate(column_names):
                value = product[i]
                # Convert Decimal to float for JSON serialization
                if isinstance(value, Decimal):
                    product_dict[col_name] = float(value)
                else:
                    product_dict[col_name] = value
            
            # Add missing fields with default values
            product_dict['image_url'] = None  # default value
            product_dict['weight'] = None     # default value
            
            # Ensure required fields have values
            if product_dict.get('stock_quantity') is None:
                product_dict['stock_quantity'] = 0
            
            products.append(product_dict)
        
        return products
    except Exception as e:
        logger.error(f"Ошибка при получении списка продуктов: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

@product_router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, name, description, price, category_id, stock_quantity
            FROM products
            WHERE id = %s
        """, (product_id,))
        product_data = cursor.fetchone()
        
        if not product_data:
            raise HTTPException(status_code=404, detail="Товар не найден")
        
        column_names = [desc[0] for desc in cursor.description]
        product_dict = {}
        
        for i, col_name in enumerate(column_names):
            value = product_data[i]
            # Convert Decimal to float for JSON serialization
            if isinstance(value, Decimal):
                product_dict[col_name] = float(value)
            else:
                product_dict[col_name] = value
        
        # Add missing fields with default values
        product_dict['image_url'] = None  # default value
        product_dict['weight'] = None     # default value
        
        # Ensure required fields have values
        if product_dict.get('stock_quantity') is None:
            product_dict['stock_quantity'] = 0
        
        return product_dict
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товара: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

# Эндпоинты для категорий
@category_router.get("/", response_model=List[CategoryResponse])
async def get_categories(db = Depends(get_db)):
    try:
        cursor = db.cursor()
        cursor.execute("SELECT id, name FROM categories")
        categories_raw = cursor.fetchall()
        
        # Convert the result to the expected format with dictionaries
        categories = []
        for category in categories_raw:
            category_dict = {
                'id': category[0],
                'name': category[1]
            }
            categories.append(category_dict)
        
        return categories
    except Exception as e:
        logger.error(f"Ошибка при получении списка категорий: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

# Эндпоинты для корзины
@cart_router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate,
    request: Request,
    db = Depends(get_db)
):
    try:
        # Проверка количества
        if cart_item.quantity < 1 or cart_item.quantity > MAX_QUANTITY:
            raise HTTPException(
                status_code=400, 
                detail=f"Количество должно быть от 1 до {MAX_QUANTITY}"
            )
        
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        user_id = None
        
        # Проверяем авторизацию пользователя
        if authorization:
            try:
                auth_parts = authorization.split()
                if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                    token = auth_parts[1]
                    # Проверяем токен и получаем user_id
                    user_data = verify_token(token)
                    if user_data:
                        user_id = user_data.get('user_id')
            except Exception as e:
                logger.error(f"Ошибка проверки токена: {e}")
        
        # Проверяем, существует ли продукт
        cursor = db.cursor()
        query = "SELECT id, stock_quantity FROM products WHERE id = %s"
        cursor.execute(query, (cart_item.product_id,))
        product_data = cursor.fetchone()
        
        if not product_data:
            raise HTTPException(status_code=404, detail="Товар не найден")
        
        product_id = product_data[0]
        stock_quantity = product_data[1] or 0
        
        # Проверяем наличие товара
        if stock_quantity < cart_item.quantity:
            raise HTTPException(status_code=400, detail="Недостаточно товара на складе")
        
        # Получаем корзину из сессии с учетом аутентификации
        cart_key = f'cart_{user_id}' if user_id else 'cart'
        cart = request.session.get(cart_key, [])
        
        # Проверяем, есть ли уже такой товар в корзине
        found = False
        for item in cart:
            if item['product_id'] == cart_item.product_id:
                # Обновляем количество
                new_quantity = item['quantity'] + cart_item.quantity
                if new_quantity > MAX_QUANTITY:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Максимальное количество товара - {MAX_QUANTITY}"
                    )
                item['quantity'] = new_quantity
                found = True
                break
        
        # Если товара нет, добавляем новый
        if not found:
            cart.append({
                'product_id': cart_item.product_id,
                'quantity': cart_item.quantity
            })
        
        # Сохраняем корзину в сессии
        request.session[cart_key] = cart
        
        # Получаем информацию о продукте для ответа
        cursor.execute("""
            SELECT id, name, description, price, category_id, stock_quantity
            FROM products 
            WHERE id = %s
        """, (cart_item.product_id,))
        product_data = cursor.fetchone()
        column_names = [desc[0] for desc in cursor.description]
        
        product_dict = {}
        for i, col_name in enumerate(column_names):
            value = product_data[i]
            if isinstance(value, Decimal):
                product_dict[col_name] = float(value)
            else:
                product_dict[col_name] = value
        
        # Add missing fields with default values
        product_dict['image_url'] = None  # default value
        product_dict['weight'] = None     # default value
        
        # Ensure required fields have values
        if product_dict.get('stock_quantity') is None:
            product_dict['stock_quantity'] = 0
        
        # Находим индекс товара в корзине для id
        item_id = None
        for i, item in enumerate(cart):
            if item['product_id'] == cart_item.product_id:
                item_id = i
                break
        
        # Создаем ProductResponse для ответа
        product = ProductResponse(
            id=product_dict['id'],
            name=product_dict['name'],
            description=product_dict.get('description'),
            price=product_dict['price'],
            image_url=product_dict.get('image_url'),
            category_id=product_dict.get('category_id'),
            stock_quantity=product_dict.get('stock_quantity', 0),
            weight=product_dict.get('weight')
        )
        
        return {
            'id': item_id,
            'product_id': cart_item.product_id,
            'quantity': cart[item_id]['quantity'] if item_id is not None else cart_item.quantity,
            'user_id': user_id,
            'product': product
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при добавлении товара в корзину: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при добавлении товара: {str(e)}")

@cart_router.get("/", response_model=List[CartItemResponse])
async def get_cart(
    request: Request,
    db = Depends(get_db)
):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        user_id = None
        
        # Проверяем авторизацию пользователя
        if authorization:
            try:
                auth_parts = authorization.split()
                if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                    token = auth_parts[1]
                    # Проверяем токен и получаем user_id
                    user_data = verify_token(token)
                    if user_data:
                        user_id = user_data.get('user_id')
            except Exception as e:
                logger.error(f"Ошибка проверки токена: {e}")
        
        # Получаем корзину из сессии с учетом аутентификации
        cart_key = f'cart_{user_id}' if user_id else 'cart'
        cart = request.session.get(cart_key, [])
        
        # Загружаем полную информацию о продуктах
        cursor = db.cursor()
        cart_with_products = []
        
        for index, item in enumerate(cart):
            cursor.execute("""
                SELECT id, name, description, price, category_id, stock_quantity
                FROM products 
                WHERE id = %s
            """, (item['product_id'],))
            product_data = cursor.fetchone()
            
            if product_data:  # Проверяем, что продукт существует
                column_names = [desc[0] for desc in cursor.description]
                
                product_dict = {}
                for i, col_name in enumerate(column_names):
                    value = product_data[i]
                    if isinstance(value, Decimal):
                        product_dict[col_name] = float(value)
                    else:
                        product_dict[col_name] = value
                
                # Add missing fields with default values
                product_dict['image_url'] = None  # default value
                product_dict['weight'] = None     # default value
                
                # Ensure required fields have values
                if product_dict.get('stock_quantity') is None:
                    product_dict['stock_quantity'] = 0
                
                # Создаем ProductResponse для ответа
                product = ProductResponse(
                    id=product_dict['id'],
                    name=product_dict['name'],
                    description=product_dict.get('description'),
                    price=product_dict['price'],
                    image_url=product_dict.get('image_url'),
                    category_id=product_dict.get('category_id'),
                    stock_quantity=product_dict.get('stock_quantity', 0),
                    weight=product_dict.get('weight')
                )
                
                cart_with_products.append({
                    'id': index,
                    'product_id': item['product_id'],
                    'quantity': item['quantity'],
                    'user_id': user_id,
                    'product': product
                })
        
        return cart_with_products
    except Exception as e:
        logger.error(f"Ошибка при получении корзины: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении корзины: {str(e)}")

@cart_router.put("/{cart_id}", response_model=CartItemResponse)
async def update_cart_quantity(
    cart_id: int, 
    quantity: int, 
    request: Request,
    db = Depends(get_db)
):
    try:
        # Проверка количества
        if quantity < 1 or quantity > MAX_QUANTITY:
            raise HTTPException(
                status_code=400, 
                detail=f"Количество должно быть от 1 до {MAX_QUANTITY}"
            )
        
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        user_id = None
        
        # Проверяем авторизацию пользователя
        if authorization:
            try:
                auth_parts = authorization.split()
                if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                    token = auth_parts[1]
                    # Проверяем токен и получаем user_id
                    user_data = verify_token(token)
                    if user_data:
                        user_id = user_data.get('user_id')
            except Exception as e:
                logger.error(f"Ошибка проверки токена: {e}")
        
        # Получаем корзину из сессии с учетом аутентификации
        cart_key = f'cart_{user_id}' if user_id else 'cart'
        cart = request.session.get(cart_key, [])
        
        # Проверяем, что cart_id корректный
        if cart_id < 0 or cart_id >= len(cart):
            raise HTTPException(status_code=404, detail="Товар в корзине не найден")
        
        # Обновляем количество
        cart[cart_id]['quantity'] = quantity
        request.session[cart_key] = cart
        
        # Загружаем информацию о продукте
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, name, description, price, category_id, stock_quantity
            FROM products 
            WHERE id = %s
        """, (cart[cart_id]['product_id'],))
        product_data = cursor.fetchone()
        column_names = [desc[0] for desc in cursor.description]
        
        product_dict = {}
        for i, col_name in enumerate(column_names):
            value = product_data[i]
            if isinstance(value, Decimal):
                product_dict[col_name] = float(value)
            else:
                product_dict[col_name] = value
        
        # Add missing fields with default values
        product_dict['image_url'] = None  # default value
        product_dict['weight'] = None     # default value
        
        # Ensure required fields have values
        if product_dict.get('stock_quantity') is None:
            product_dict['stock_quantity'] = 0
        
        # Создаем ProductResponse для ответа
        product = ProductResponse(
            id=product_dict['id'],
            name=product_dict['name'],
            description=product_dict.get('description'),
            price=product_dict['price'],
            image_url=product_dict.get('image_url'),
            category_id=product_dict.get('category_id'),
            stock_quantity=product_dict.get('stock_quantity', 0),
            weight=product_dict.get('weight')
        )
        
        return {
            'id': cart_id,
            'product_id': cart[cart_id]['product_id'],
            'quantity': quantity,
            'user_id': user_id,
            'product': product
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении количества товара в корзине: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при обновлении количества товара: {str(e)}")

@cart_router.delete("/{cart_id}")
async def remove_from_cart(
    cart_id: int, 
    request: Request
):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        user_id = None
        
        # Проверяем авторизацию пользователя
        if authorization:
            try:
                auth_parts = authorization.split()
                if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                    token = auth_parts[1]
                    # Проверяем токен и получаем user_id
                    user_data = verify_token(token)
                    if user_data:
                        user_id = user_data.get('user_id')
            except Exception as e:
                logger.error(f"Ошибка проверки токена: {e}")
        
        # Получаем корзину из сессии с учетом аутентификации
        cart_key = f'cart_{user_id}' if user_id else 'cart'
        cart = request.session.get(cart_key, [])
        
        # Проверяем, что cart_id корректный
        if cart_id < 0 or cart_id >= len(cart):
            raise HTTPException(status_code=404, detail="Товар в корзине не найден")
        
        # Удаляем товар
        del cart[cart_id]
        request.session[cart_key] = cart
        
        return {"message": "Товар удален из корзины"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при удалении товара из корзины: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при удалении товара из корзины: {str(e)}")

@cart_router.delete("/clear")
async def clear_cart(request: Request):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        user_id = None
        
        # Проверяем авторизацию пользователя
        if authorization:
            try:
                auth_parts = authorization.split()
                if len(auth_parts) == 2 and auth_parts[0].lower() == 'bearer':
                    token = auth_parts[1]
                    # Проверяем токен и получаем user_id
                    user_data = verify_token(token)
                    if user_data:
                        user_id = user_data.get('user_id')
            except Exception as e:
                logger.error(f"Ошибка проверки токена: {e}")
        
        # Получаем ключ корзины с учетом аутентификации
        cart_key = f'cart_{user_id}' if user_id else 'cart'
        
        # Очищаем корзину
        request.session[cart_key] = []
        
        return {"message": "Корзина очищена"}
    except Exception as e:
        logger.error(f"Ошибка при очистке корзины: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при очистке корзины: {str(e)}")

# API routes for frontend
@app.get("/api/products", tags=["Products API"])
async def get_api_products(db = Depends(get_db)):
    """API маршрут для получения продуктов"""
    try:
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, name, description, price, category_id, stock_quantity
            FROM products
        """)
        products_raw = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description]
        
        # Convert the results to the expected format
        products = []
        for product in products_raw:
            product_dict = {}