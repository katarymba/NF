from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
import uvicorn
import logging
import sys
import os
import traceback
from pathlib import Path
from typing import List, Optional
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

@cart_router.get("/", response_model=dict)
async def get_cart():
    # Здесь будет логика получения корзины из БД
    # Пока возвращаем заглушку
    return {
        "items": [],
        "total": 0
    }

@cart_router.post("/add/", response_model=dict)
async def add_to_cart():
    # Здесь будет логика добавления в корзину в БД
    # Пока возвращаем заглушку
    return {
        "success": True,
        "message": "Товар добавлен в корзину"
    }

# Добавляем маршрут для совместимости - /api/cart
@app.get("/api/cart", response_model=dict, tags=["Cart"])
async def get_api_cart():
    """API маршрут для корзины"""
    return await get_cart()

@app.post("/api/cart", response_model=dict, tags=["Cart"])
async def add_to_api_cart():
    """API маршрут для добавления в корзину"""
    return await add_to_cart()

# Подключаем маршруты корзины
app.include_router(cart_router)

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