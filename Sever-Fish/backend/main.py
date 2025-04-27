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

# Создаем модели данных для ответа API
class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    
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
    version="1.0.0"
)

# Настройка CORS для разрешения запросов с фронтенда
# Добавляем все возможные комбинации хостов и портов
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
        query = """
        SELECT 
            id, name, description, price, image_url, category_id, 
            stock_quantity, created_at, updated_at
        FROM products
        ORDER BY id
        LIMIT %s OFFSET %s
        """
        cursor.execute(query, (limit, skip))
        products = cursor.fetchall()
        logger.info(f"Успешно получено {len(products)} товаров")
        return products
    except Exception as e:
        logger.error(f"Ошибка при получении товаров: {str(e)}")
        logger.error(traceback.format_exc())
        if "does not exist" in str(e):
            raise HTTPException(status_code=500, detail="Ошибка в структуре базы данных: таблица products не существует")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товаров: {str(e)}")

# Получить список категорий
@products_router.get("/categories/", response_model=List[CategoryResponse])
async def get_categories(db = Depends(get_db)):
    try:
        logger.info("Запрос всех категорий")
        cursor = db.cursor()
        query = "SELECT id, name, slug, description FROM categories ORDER BY id"
        cursor.execute(query)
        categories = cursor.fetchall()
        logger.info(f"Успешно получено {len(categories)} категорий")
        return categories
    except Exception as e:
        logger.error(f"Ошибка при получении категорий: {str(e)}")
        logger.error(traceback.format_exc())
        if "does not exist" in str(e):
            raise HTTPException(status_code=500, detail="Ошибка в структуре базы данных: таблица categories не существует")
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении категорий: {str(e)}")

# Получить товары по категории
@products_router.get("/category/{category_slug}", response_model=List[ProductResponse])
async def get_products_by_category(
    category_slug: str,
    skip: int = 0,
    limit: int = 100,
    db = Depends(get_db)
):
    try:
        logger.info(f"Запрос товаров по категории {category_slug}")
        cursor = db.cursor()
        
        # Сначала находим категорию по slug
        category_query = "SELECT id FROM categories WHERE slug = %s"
        cursor.execute(category_query, (category_slug,))
        category = cursor.fetchone()
        
        if not category:
            logger.warning(f"Категория с slug={category_slug} не найдена")
            raise HTTPException(status_code=404, detail="Категория не найдена")
        
        # Затем получаем товары из этой категории
        products_query = """
        SELECT 
            id, name, description, price, image_url, category_id, 
            stock_quantity, created_at, updated_at
        FROM products
        WHERE category_id = %s
        ORDER BY id
        LIMIT %s OFFSET %s
        """
        cursor.execute(products_query, (category['id'], limit, skip))
        products = cursor.fetchall()
        logger.info(f"Успешно получено {len(products)} товаров для категории {category_slug}")
        
        return products
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении товаров по категории {category_slug}: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Ошибка сервера при получении товаров по категории: {str(e)}")

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
        product = cursor.fetchone()
        
        if not product:
            logger.warning(f"Товар с ID={product_id} не найден")
            raise HTTPException(status_code=404, detail="Товар не найден")
        
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
        
        new_product = cursor.fetchone()
        logger.info(f"Успешно создан новый товар с ID {new_product['id']}")
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
        {"path": "/products/categories/", "description": "Получение списка всех категорий"},
        {"path": "/products/{product_id}", "description": "Получение информации о конкретном товаре"},
        {"path": "/products/category/{category_slug}", "description": "Получение товаров по категории"},
        {"path": "/cart/", "description": "Работа с корзиной"},
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