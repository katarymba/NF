from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.middleware.sessions import SessionMiddleware  # Добавляем для поддержки сессий
# Fix the import to use your local auth functions from utils/auth
from utils.auth import verify_password, create_access_token, get_password_hash
import uvicorn
import logging
import sys
import os
import traceback
from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from database import get_db, get_db_connection  # Импортируем обе функции
import psycopg2.pool
from contextlib import asynccontextmanager

# Настройка путей для корректного импорта
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log"),  # Добавляем логирование в файл
    ]
)
logger = logging.getLogger(__name__)

# Создаем пул соединений с БД
db_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=10,
    host="localhost",
    port="5432",
    dbname="sever_ryba_db",  # Изменено на существующую БД
    user="katarymba",
    password="root"
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # При запуске приложения
    app.state.db_pool = db_pool
    yield
    # При остановке приложения
    db_pool.closeall()

# Создаем модели данных для ответа API
# Обновляем модель CategoryResponse, делая поле description необязательным
class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: Optional[str] = ""  # Делаем поле необязательным и инициализируем пустой строкой
    description: Optional[str] = None  # Это поле может отсутствовать в базе данных
    
class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_id: int
    image_url: Optional[str] = None
    weight: Optional[float] = None
    stock_quantity: Optional[int] = 0

# Классы для работы с корзиной
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    user_id: Optional[int] = None
    product: Optional[ProductResponse] = None

# Создание приложения
app = FastAPI(
    title="Север-Рыба API",
    description="API для интернет-магазина Север-Рыба",
    version="1.0.0",
    lifespan=lifespan
)

# Настройка CORS для разрешения запросов с фронтенда
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    # Добавляем стандартные порты разработки React и без порта
    "http://localhost",
    "http://127.0.0.1",
]

# Добавляем middleware для сессий
app.add_middleware(
    SessionMiddleware,
    secret_key="0bde95d7a26d5fd30374db066e45d53fe7a9fbc886b099a14f37b830f6c6b12c",
    max_age=1800  # 30 минут
)

# Первым middleware устанавливаем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Увеличиваем время кэширования предзапросов CORS до 24 часов
)

# Функция для преобразования словаря в модель
def dict_to_model(data_dict, model_class):
    """Преобразует словарь в Pydantic модель, обрабатывая отсутствующие поля"""
    if not data_dict:
        return None
    
    # Очищаем от лишних полей, которых нет в модели
    model_fields = model_class.__fields__.keys()
    filtered_dict = {k: v for k, v in data_dict.items() if k in model_fields}
    
    # Для CategoryResponse добавляем slug, если его нет
    if model_class == CategoryResponse and 'slug' not in filtered_dict:
        filtered_dict['slug'] = filtered_dict.get('name', '').lower().replace(' ', '-')
    
    return model_class(**filtered_dict)

# Функция для верификации JWT токена
def verify_token(token: str) -> Dict[str, Any]:
    try:
        from jose import jwt
        
        # Секретный ключ для проверки токена (должен совпадать с ключом при создании)
        SECRET_KEY = "0bde95d7a26d5fd30374db066e45d53fe7a9fbc886b099a14f37b830f6c6b12c"
        ALGORITHM = "HS256"
        
        # Декодируем токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Проверяем истечение срока действия
        if 'exp' in payload and datetime.fromtimestamp(payload['exp']) < datetime.now():
            logger.warning("Токен истек")
            return None
        
        # Проверяем наличие имени пользователя
        if 'sub' not in payload:
            logger.warning("Токен не содержит информацию о пользователе")
            return None
        
        return {
            "username": payload.get("sub"),
            "user_id": payload.get("user_id")
        }
    except Exception as e:
        logger.error(f"Ошибка проверки токена: {e}")
        return None

# Импортируем роутеры
try:
    from routers import auth as auth_router
    logger.info("Роутер auth импортирован успешно")
except ImportError as e:
    logger.error(f"Ошибка импорта роутера auth: {e}")
    
    # Создаем заглушку для роутера auth
    auth_router_stub = APIRouter()
    
    @auth_router_stub.post("/register")
    async def register_stub():
        return {"message": "Регистрация недоступна, ошибка импорта модуля auth"}
    
    @auth_router_stub.post("/login")
    async def login_stub():
        return {"message": "Вход недоступен, ошибка импорта модуля auth"}
    
    auth_router = type('AuthRouter', (), {'router': auth_router_stub})

# Маршруты для работы с товарами
products_router = APIRouter(prefix="/products", tags=["Products"])

# Получить все товары
@products_router.get("/", response_model=List[ProductResponse])
async def get_all_products(
    skip: int = 0,
    limit: int = 100,
    db = Depends(get_db)
):
    try:
        logger.info(f"Запрос всех товаров (skip={skip}, limit={limit})")
        cursor = db.cursor()
        
        # Проверяем структуру таблицы products
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products'
        """)
        columns = [row['column_name'] for row in cursor.fetchall()]
        logger.info(f"Структура таблицы products: {columns}")
        
        query = """
        SELECT 
            id, name, description, price, image_url, category_id, 
            stock_quantity, created_at, updated_at
        FROM products
        ORDER BY id
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (limit, skip))
        products_raw = cursor.fetchall()
        
        # Преобразуем словари в модели
        products = []
        for product_data in products_raw:
            # Убедимся, что все необходимые поля присутствуют
            for field in ['description', 'image_url', 'category_id', 'stock_quantity', 'created_at', 'updated_at']:
                if field not in product_data:
                    product_data[field] = None if field != 'stock_quantity' else 0
            
            product = ProductResponse(
                id=product_data['id'],
                name=product_data['name'],
                description=product_data.get('description'),
                price=product_data['price'],
                image_url=product_data.get('image_url'),
                category_id=product_data.get('category_id'),
                stock_quantity=product_data.get('stock_quantity', 0),
                created_at=product_data.get('created_at'),
                updated_at=product_data.get('updated_at')
            )
            products.append(product)
        
        logger.info(f"Успешно получено {len(products)} товаров")
        return products
    except Exception as e:
        logger.error(f"Ошибка при получении товаров: {str(e)}")
        logger.error(traceback.format_exc())
        if "does not exist" in str(e):
            raise HTTPException(status_code=500, detail="Ошибка в структуре базы данных: таблица products не существует")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товаров: {str(e)}")

# Исправленная версия маршрута для получения категорий
@products_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(db = Depends(get_db)):
    try:
        logger.info("Запрос всех категорий")
        cursor = db.cursor()
        
        # Проверим структуру таблицы categories
        try:
            cursor.execute("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'categories'
            """)
            columns = [row['column_name'] for row in cursor.fetchall()]
            logger.info(f"Структура таблицы categories: {columns}")
            
            # Используем только те столбцы, которые фактически существуют
            if 'description' in columns:
                query = "SELECT id, name, description FROM categories ORDER BY id"
            else:
                query = "SELECT id, name FROM categories ORDER BY id"
                
            cursor.execute(query)
            categories_raw = cursor.fetchall()
            
            # Преобразуем результаты в список моделей CategoryResponse
            categories = []
            for cat_data in categories_raw:
                # Если description нет в данных, добавляем пустое значение
                if 'description' not in cat_data:
                    cat_data['description'] = None
                
                # Если slug нет в данных, создаем его из имени
                if 'slug' not in cat_data:
                    cat_data['slug'] = cat_data['name'].lower().replace(' ', '-')
                
                # Создаем модель напрямую
                category = CategoryResponse(
                    id=cat_data['id'],
                    name=cat_data['name'],
                    description=cat_data.get('description'),
                    slug=cat_data.get('slug', cat_data['name'].lower().replace(' ', '-'))
                )
                categories.append(category)
            
            logger.info(f"Успешно получено {len(categories)} категорий")
            return categories
        except Exception as schema_error:
            logger.error(f"Ошибка при проверке структуры таблицы: {str(schema_error)}")
            # Пробуем более простой запрос
            cursor.execute("SELECT id, name FROM categories ORDER BY id")
            categories_raw = cursor.fetchall()
            
            # Преобразуем результаты в список моделей CategoryResponse
            categories = []
            for cat_data in categories_raw:
                # Добавляем отсутствующие поля для соответствия модели
                # Создаем модель напрямую
                category = CategoryResponse(
                    id=cat_data['id'],
                    name=cat_data['name'],
                    description=None,
                    slug=cat_data['name'].lower().replace(' ', '-')
                )
                categories.append(category)
            
            logger.info(f"Успешно получено {len(categories)} категорий (упрощенный запрос)")
            return categories
            
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        logger.error(traceback.format_exc())
        if "does not exist" in str(e):
            raise HTTPException(status_code=500, detail="Ошибка в структуре базы данных: таблица categories не существует")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении категорий: {str(e)}")
    
# ДОБАВЛЯЕМ альтернативный маршрут для категорий без слеша в конце
@products_router.get("/categories/", include_in_schema=False)
async def get_categories_alt(db = Depends(get_db)):
    """Альтернативный маршрут для совместимости"""
    return await get_categories(db)

# ОБНОВЛЯЕМ маршрут для товаров через /api/products
@app.get("/api/products", response_model=List[ProductResponse], tags=["Products"])
async def get_api_products(
    skip: int = 0,
    limit: int = 100,
    db = Depends(get_db)
):
    """API маршрут для продуктов"""
    try:
        logger.info(f"Запрос API продуктов (skip={skip}, limit={limit})")
        cursor = db.cursor()
        
        # Проверяем структуру таблицы products
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products'
        """)
        columns = [row['column_name'] for row in cursor.fetchall()]
        logger.info(f"Структура таблицы products в API: {columns}")
        
        # Формируем запрос с учетом имеющихся столбцов
        select_columns = ["id", "name", "price"]
        for column in ["description", "image_url", "category_id", "stock_quantity", "created_at", "updated_at"]:
            if column in columns:
                select_columns.append(column)
                
        query = f"""
        SELECT {', '.join(select_columns)}
        FROM products
        ORDER BY id
        LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, (limit, skip))
        products_raw = cursor.fetchall()
        
        # Преобразуем словари в модели
        products = []
        for product_data in products_raw:
            # Создаем объект с обязательными полями
            product_obj = {
                "id": product_data['id'],
                "name": product_data['name'],
                "price": product_data['price'],
                "stock_quantity": product_data.get('stock_quantity', 0)
            }
            
            # Добавляем опциональные поля, если они есть
            optional_fields = ['description', 'image_url', 'category_id', 'created_at', 'updated_at']
            for field in optional_fields:
                if field in product_data:
                    product_obj[field] = product_data[field]
            
            # Создаем модель
            product = ProductResponse(**product_obj)
            products.append(product)
        
        logger.info(f"Успешно получено {len(products)} API продуктов")
        return products
    except Exception as e:
        logger.error(f"Ошибка при получении API продуктов: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении API продуктов: {str(e)}")

# ДОБАВЛЯЕМ новый маршрут для категорий через /api/categories
@app.get("/api/categories", response_model=List[CategoryResponse], tags=["Categories"])
async def get_api_categories(db = Depends(get_db)):
    """API маршрут для категорий"""
    return await get_categories(db)

# Добавляем маршрут для категорий без префикса
@app.get("/categories", tags=["Categories"])
async def get_all_categories_no_prefix(db = Depends(get_db)):
    return await get_categories(db)

# Получить товар по ID
@products_router.get("/{product_id}", response_model=ProductResponse)
async def get_product_by_id(product_id: int, db = Depends(get_db)):
    try:
        logger.info(f"Запрос товара с ID {product_id}")
        cursor = db.cursor()
        query = """
        SELECT 
            id, name, description, price, image_url, category_id, 
            stock_quantity, created_at, updated_at
        FROM products
        WHERE id = %s
        """
        cursor.execute(query, (product_id,))
        product_raw = cursor.fetchone()
        
        if not product_raw:
            logger.warning(f"Товар с ID={product_id} не найден")
            raise HTTPException(status_code=404, detail="Товар не найден")
        
        # Преобразуем словарь в модель
        product = dict_to_model(product_raw, ProductResponse)
        
        logger.info(f"Успешно получен товар с ID {product_id}")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товара с ID {product_id}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товара: {str(e)}")

# Создать новый товар (для админов)
@products_router.post("/", response_model=ProductResponse)
async def create_product(product: ProductCreate, db = Depends(get_db)):
    try:
        logger.info(f"Запрос на создание нового товара: {product.name}")
        cursor = db.cursor()
        
        # Проверяем, существует ли категория
        category_query = "SELECT id FROM categories WHERE id = %s"
        cursor.execute(category_query, (product.category_id,))
        category = cursor.fetchone()
        
        if not category:
            logger.warning(f"Категория с ID={product.category_id} не найдена")
            raise HTTPException(status_code=404, detail="Категория не найдена")
        
        # Создаем новый товар
        insert_query = """
        INSERT INTO products (
            name, description, price, image_url, category_id, 
            stock_quantity, created_at, updated_at
        ) VALUES (
            %s, %s, %s, %s, %s, %s, NOW(), NOW()
        ) RETURNING id, name, description, price, image_url, category_id, 
                   stock_quantity, created_at, updated_at
        """
        cursor.execute(
            insert_query,
            (
                product.name,
                product.description,
                product.price,
                product.image_url,
                product.category_id,
                product.stock_quantity
            )
        )
        db.commit()  # Важно: фиксируем транзакцию
        
        new_product_raw = cursor.fetchone()
        # Преобразуем словарь в модель
        new_product = dict_to_model(new_product_raw, ProductResponse)
        
        logger.info(f"Успешно создан новый товар с ID {new_product.id}")
        return new_product
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()  # В случае ошибки откатываем транзакцию
        logger.error(f"Ошибка при создании товара: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при создании товара: {str(e)}")

# Подключаем маршруты products
app.include_router(products_router)

# Подключаем маршруты auth
try:
    app.include_router(auth_router.router, prefix="/auth", tags=["Authentication"])
    logger.info("Маршруты аутентификации успешно подключены")
except Exception as e:
    logger.error(f"Ошибка при подключении маршрутов аутентификации: {e}")

# Маршруты для работы с корзиной
cart_router = APIRouter(prefix="/cart", tags=["Cart"])

# Максимальное количество товара в корзине
MAX_QUANTITY = 99

@cart_router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate, 
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
        
        # Проверка существования продукта
        cursor = db.cursor()
        query = """
        SELECT id, name, description, price, image_url, category_id, stock_quantity
        FROM products 
        WHERE id = %s
        """
        cursor.execute(query, (cart_item.product_id,))
        product_raw = cursor.fetchone()
        
        if not product_raw:
            raise HTTPException(status_code=404, detail="Товар не найден")
        
        # Преобразуем product_raw в ProductResponse
        product = ProductResponse(
            id=product_raw['id'],
            name=product_raw['name'],
            description=product_raw.get('description'),
            price=product_raw['price'],
            image_url=product_raw.get('image_url'),
            category_id=product_raw.get('category_id'),
            stock_quantity=product_raw.get('stock_quantity', 0)
        )
        
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
        
        # Возвращаем добавленный товар с информацией о продукте
        return {
            'id': len(cart) - 1,  # Индекс последнего элемента
            'product_id': cart_item.product_id,
            'quantity': cart_item.quantity,
            'user_id': user_id,
            'product': product
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при добавлении товара в корзину: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при добавлении товара в корзину: {str(e)}")

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
            query = """
            SELECT id, name, description, price, image_url, category_id, stock_quantity
            FROM products 
            WHERE id = %s
            """
            cursor.execute(query, (item['product_id'],))
            product_raw = cursor.fetchone()
            
            if product_raw:  # Проверяем, что продукт существует
                # Преобразуем product_raw в ProductResponse
                product = ProductResponse(
                    id=product_raw['id'],
                    name=product_raw['name'],
                    description=product_raw.get('description'),
                    price=product_raw['price'],
                    image_url=product_raw.get('image_url'),
                    category_id=product_raw.get('category_id'),
                    stock_quantity=product_raw.get('stock_quantity', 0)
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
        query = """
        SELECT id, name, description, price, image_url, category_id, stock_quantity
        FROM products 
        WHERE id = %s
        """
        cursor.execute(query, (cart[cart_id]['product_id'],))
        product_raw = cursor.fetchone()
        
        # Преобразуем product_raw в ProductResponse
        product = ProductResponse(
            id=product_raw['id'],
            name=product_raw['name'],
            description=product_raw.get('description'),
            price=product_raw['price'],
            image_url=product_raw.get('image_url'),
            category_id=product_raw.get('category_id'),
            stock_quantity=product_raw.get('stock_quantity', 0)
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

# Добавляем маршрут для API корзины
@app.get("/api/cart", tags=["Cart"])
async def get_api_cart(request: Request, db = Depends(get_db)):
    """API маршрут для корзины"""
    return await get_cart(request, db)

@app.post("/api/cart", tags=["Cart"])
async def add_to_api_cart(cart_item: CartItemCreate, request: Request, db = Depends(get_db)):
    """API маршрут для добавления в корзину"""
    return await add_to_cart(cart_item, request, db)

# Подключаем маршруты корзины
app.include_router(cart_router)

# Маршрут для профиля пользователя
@app.get("/auth/profile", tags=["Authentication"])
async def get_user_profile(request: Request):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        
        if not authorization:
            raise HTTPException(status_code=401, detail="Не предоставлены учетные данные")
        
        # Проверяем авторизацию пользователя
        try:
            auth_parts = authorization.split()
            if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
                raise HTTPException(status_code=401, detail="Неверный формат токена")
            
            token = auth_parts[1]
            # Проверяем токен и получаем данные пользователя
            user_data = verify_token(token)
            
            if not user_data:
                raise HTTPException(status_code=401, detail="Недействительный токен")
            
            # Получаем данные пользователя из БД
            conn = app.state.db_pool.getconn()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, username, email, phone, full_name, birthday
                    FROM users
                    WHERE id = %s
                """, (user_data.get('user_id'),))
                
                db_user = cursor.fetchone()
                
                if not db_user:
                    raise HTTPException(status_code=404, detail="Пользователь не найден")
                
                return {
                    "id": db_user['id'],
                    "username": db_user['username'],
                    "email": db_user.get('email'),
                    "phone": db_user.get('phone'),
                    "full_name": db_user.get('full_name'),
                    "birthday": db_user.get('birthday').isoformat() if db_user.get('birthday') else None
                }
            finally:
                app.state.db_pool.putconn(conn)
                
        except Exception as e:
            logger.error(f"Ошибка проверки токена: {e}")
            raise HTTPException(status_code=401, detail="Ошибка авторизации")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении профиля пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении профиля: {str(e)}")

# Маршрут для обновления профиля пользователя
@app.put("/auth/profile", tags=["Authentication"])
async def update_user_profile(
    request: Request,
    profile_data: dict
):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        
        if not authorization:
            raise HTTPException(status_code=401, detail="Не предоставлены учетные данные")
        
        # Проверяем авторизацию пользователя
        try:
            auth_parts = authorization.split()
            if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
                raise HTTPException(status_code=401, detail="Неверный формат токена")
            
            token = auth_parts[1]
            # Проверяем токен и получаем данные пользователя
            user_data = verify_token(token)
            
            if not user_data:
                raise HTTPException(status_code=401, detail="Недействительный токен")
            
            # Обновляем данные пользователя в БД
            conn = app.state.db_pool.getconn()
            try:
                cursor = conn.cursor()
                
                # Собираем поля для обновления
                update_fields = []
                update_values = []
                
                if 'full_name' in profile_data:
                    update_fields.append("full_name = %s")
                    update_values.append(profile_data['full_name'])
                
                if 'email' in profile_data:
                    update_fields.append("email = %s")
                    update_values.append(profile_data['email'])
                
                if 'phone' in profile_data:
                    update_fields.append("phone = %s")
                    update_values.append(profile_data['phone'])
                
                if 'birthday' in profile_data and profile_data['birthday']:
                    update_fields.append("birthday = %s")
                    update_values.append(profile_data['birthday'])
                
                if not update_fields:
                    raise HTTPException(status_code=400, detail="Не указаны поля для обновления")
                
                # Добавляем ID пользователя в значения
                update_values.append(user_data.get('user_id'))
                
                # Формируем SQL запрос
                sql = f"""
                    UPDATE users
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                    RETURNING id, username, email, phone, full_name, birthday
                """
                
                cursor.execute(sql, update_values)
                conn.commit()
                
                updated_user = cursor.fetchone()
                
                if not updated_user:
                    raise HTTPException(status_code=404, detail="Пользователь не найден")
                
                return {
                    "id": updated_user['id'],
                    "username": updated_user['username'],
                    "email": updated_user.get('email'),
                    "phone": updated_user.get('phone'),
                    "full_name": updated_user.get('full_name'),
                    "birthday": updated_user.get('birthday').isoformat() if updated_user.get('birthday') else None
                }
                
            finally:
                app.state.db_pool.putconn(conn)
                
        except Exception as e:
            logger.error(f"Ошибка обновления профиля: {e}")
            raise HTTPException(status_code=401, detail=f"Ошибка обновления профиля: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении профиля пользователя: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при обновлении профиля: {str(e)}")

# Маршрут для смены пароля
@app.post("/auth/change-password", tags=["Authentication"])
async def change_password(
    request: Request,
    password_data: dict
):
    try:
        # Получаем авторизационный заголовок
        authorization = request.headers.get("Authorization")
        
        if not authorization:
            raise HTTPException(status_code=401, detail="Не предоставлены учетные данные")
        
        # Проверяем наличие необходимых полей
        if 'current_password' not in password_data or 'new_password' not in password_data:
            raise HTTPException(status_code=400, detail="Необходимо указать текущий и новый пароль")
        
        # Проверяем авторизацию пользователя
        try:
            auth_parts = authorization.split()
            if len(auth_parts) != 2 or auth_parts[0].lower() != 'bearer':
                raise HTTPException(status_code=401, detail="Неверный формат токена")
            
            token = auth_parts[1]
            # Проверяем токен и получаем данные пользователя
            user_data = verify_token(token)
            
            if not user_data:
                raise HTTPException(status_code=401, detail="Недействительный токен")
            
            # Меняем пароль пользователя
            conn = app.state.db_pool.getconn()
            try:
                from passlib.context import CryptContext
                # Контекст для хеширования паролей
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                
                cursor = conn.cursor()
                
                # Проверяем текущий пароль
                cursor.execute("""
                    SELECT password_hash FROM users WHERE id = %s
                """, (user_data.get('user_id'),))
                
                user_password = cursor.fetchone()
                
                if not user_password:
                    raise HTTPException(status_code=404, detail="Пользователь не найден")
                
                # Проверяем совпадение текущего пароля
                if not pwd_context.verify(password_data['current_password'], user_password['password_hash']):
                    raise HTTPException(status_code=400, detail="Неверный текущий пароль")
                
                # Хешируем новый пароль
                hashed_password = pwd_context.hash(password_data['new_password'])
                
                # Обновляем пароль в БД
                cursor.execute("""
                    UPDATE users SET password_hash = %s WHERE id = %s
                """, (hashed_password, user_data.get('user_id')))
                
                conn.commit()
                
                return {"message": "Пароль успешно изменен"}
                
            finally:
                app.state.db_pool.putconn(conn)
                
        except Exception as e:
            logger.error(f"Ошибка смены пароля: {e}")
            raise HTTPException(status_code=401, detail=f"Ошибка смены пароля: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при смене пароля: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при смене пароля: {str(e)}")

# Маршрут для отображения всех зарегистрированных маршрутов в API
@app.get("/routes", tags=["System"])
async def list_routes():
    """
    Отображает все доступные маршруты API.
    """
    routes = []
    for route in app.routes:
        methods = [method for method in route.methods] if hasattr(route, "methods") else ["GET"]
        routes.append({
            "path": route.path,
            "name": route.name,
            "methods": methods
        })
    
    return {
        "total_routes": len(routes),
        "routes": routes
    }

# Корневой маршрут с информацией об API и доступных маршрутах
@app.get("/", tags=["Root"])
async def root():
    """
    Корневой маршрут API, возвращает информацию о доступных маршрутах.
    """
    routes_info = [
        {"path": "/products/", "description": "Получение списка всех товаров"},
        {"path": "/products/categories", "description": "Получение списка всех категорий"},
        {"path": "/api/products", "description": "API для получения списка всех товаров"},
        {"path": "/api/categories", "description": "API для получения списка всех категорий"},
        {"path": "/products/{product_id}", "description": "Получение информации о конкретном товаре"},
        {"path": "/products/category/{category_slug}", "description": "Получение товаров по категории"},
        {"path": "/cart/", "description": "Работа с корзиной"},
        {"path": "/api/cart", "description": "API для работы с корзиной"},
        {"path": "/auth/register", "description": "Регистрация нового пользователя"},
        {"path": "/auth/login", "description": "Вход пользователя"},
        {"path": "/auth/profile", "description": "Получение и обновление профиля пользователя"},
        {"path": "/auth/change-password", "description": "Смена пароля пользователя"},
        {"path": "/docs", "description": "Документация API"},
    ]
    
    return {
        "message": "Добро пожаловать в API Север-Рыба",
        "version": "1.0.0",
        "documentation": "/docs",
        "available_routes": routes_info
    }

# Обработчик ошибок для всего приложения
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Глобальный обработчик исключений для перехвата и логирования ошибок.
    """
    error_msg = f"Необработанная ошибка при обработке запроса {request.url}: {str(exc)}"
    logger.error(error_msg, exc_info=True)
    
    # Возвращаем клиенту понятное сообщение об ошибке
    return JSONResponse(
        status_code=500,
        content={"detail": "Произошла внутренняя ошибка сервера. Пожалуйста, попробуйте позже."}
    )

# Проверка здоровья API
@app.get("/health", tags=["System"])
async def health_check():
    """
    Маршрут для проверки работоспособности API.
    """
    # Проверка подключения к БД
    try:
        # Используем get_db_connection напрямую
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        
        # Проверяем доступные таблицы
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = [row['table_name'] for row in cursor.fetchall()]
        
        conn.close()
        db_status = "connected"
        
        return {
            "status": "healthy", 
            "api_version": "1.0.0",
            "database": db_status,
            "tables": tables  # Возвращаем список таблиц для отладки
        }
    except Exception as e:
        logger.error(f"Ошибка при проверке соединения с БД: {str(e)}")
        return {
            "status": "error", 
            "api_version": "1.0.0",
            "database": f"error: {str(e)}"
        }

# Диагностический маршрут для проверки CORS
@app.get("/cors-test", tags=["System"])
async def cors_test(request: Request):
    """
    Маршрут для проверки настроек CORS.
    """
    origin = request.headers.get("Origin", "Unknown")
    
    return {
        "message": "CORS test successful",
        "your_origin": origin,
        "allowed_origins": origins
    }

# Маршрут для проверки CORS
@app.options("/{full_path:path}")
async def options_route(request: Request, full_path: str):
    """
    Обработчик OPTIONS запросов для проверки CORS.
    """
    # Извлекаем запрошенные заголовки
    requested_origin = request.headers.get("Origin", "")
    
    # Для отладки логируем информацию о запросе
    logger.info(f"OPTIONS запрос от {requested_origin} к пути: {full_path}")
    logger.info(f"Заголовки запроса: {dict(request.headers)}")
    
    # Собираем ответные заголовки
    headers = {
        "Access-Control-Allow-Origin": requested_origin if requested_origin in origins else origins[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",  # кэш на 24 часа
    }
    
    # Логируем отправляемые заголовки
    logger.info(f"Ответные CORS заголовки: {headers}")
    
    return PlainTextResponse("", status_code=200, headers=headers)

if __name__ == "__main__":
    # Информация о запуске сервера
    host = "0.0.0.0"
    port = 8000
    logger.info(f"Запуск сервера Север-Рыба API на http://{host}:{port}")
    
    # Запуск сервера с более подробными логами
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="debug"  # Повышаем уровень логирования для отладки
    )