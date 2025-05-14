# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
import logging
import os
import traceback
import uvicorn
from datetime import datetime

from app.routers import auth, products, cart, orders, users
from app.services import ais_integration, discount_service, rabbitmq
from app.config import PORT, HOST, PRODUCTS_IMAGES_DIR, SECRET_KEY, DEBUG, PROJECT_NAME, PROJECT_VERSION, ALLOWED_HOSTS

# Настройка логирования
logging.basicConfig(
    filename="api.log",
    level=logging.INFO if not DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Создание FastAPI приложения
app = FastAPI(
    title=f"{PROJECT_NAME} API",
    description="API для системы управления продажами и запасами морепродуктов",
    version=PROJECT_VERSION,
)

# Настройка CORS
origins = ALLOWED_HOSTS if not DEBUG else [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview
    "http://localhost:3000",  # React dev server
    "http://localhost:8000",  # FastAPI server
    "http://localhost",  # Общий localhost
    "*",  # Разрешаем все в режиме разработки
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Добавляем поддержку сессий
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    max_age=86400,  # 24 часа
)


# Обработчик ошибок для всего приложения
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """Глобальный обработчик исключений"""
    logger.error(f"Необработанная ошибка: {str(exc)}")
    logger.error(traceback.format_exc())

    # В режиме отладки возвращаем полный стек ошибки
    if DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Внутренняя ошибка сервера: {str(exc)}",
                "traceback": traceback.format_exc()
            }
        )
    else:
        # В продакшн возвращаем только общее сообщение
        return JSONResponse(
            status_code=500,
            content={"detail": "Внутренняя ошибка сервера"}
        )


# Регистрация событий приложения
@app.on_event("startup")
async def startup_event():
    """Выполняется при запуске приложения"""
    logger.info(f"Запуск приложения {PROJECT_NAME} v{PROJECT_VERSION}")

    # Проверка интеграции с внешними сервисами
    try:
        # Инициализация RabbitMQ
        await rabbitmq.initialize()
        logger.info("RabbitMQ соединение установлено")

        # Проверка соединения с AIS
        ais_status = await ais_integration.check_connection()
        logger.info(f"Статус соединения с AIS: {'OK' if ais_status else 'Ошибка'}")

        # Инициализация сервиса скидок
        discount_service.initialize()
        logger.info("Сервис скидок инициализирован")
    except Exception as e:
        logger.error(f"Ошибка при инициализации сервисов: {str(e)}")
        logger.error(traceback.format_exc())


@app.on_event("shutdown")
async def shutdown_event():
    """Выполняется при остановке приложения"""
    logger.info("Остановка приложения")

    # Закрытие соединений
    try:
        await rabbitmq.close()
        logger.info("RabbitMQ соединение закрыто")
    except Exception as e:
        logger.error(f"Ошибка при закрытии соединений: {str(e)}")


# Монтирование маршрутов
app.include_router(auth.router, tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])

# Маршруты API для фронтенда с префиксом /api
app.include_router(products.router, prefix="/api/products", tags=["Products API"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart API"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders API"])
app.include_router(users.router, prefix="/api/users", tags=["Users API"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth API"])

# Монтирование статических файлов для изображений продуктов
if os.path.exists(PRODUCTS_IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=PRODUCTS_IMAGES_DIR), name="images")
    logger.info(f"Mounted images directory: {PRODUCTS_IMAGES_DIR}")
else:
    logger.warning(f"Products images directory not found: {PRODUCTS_IMAGES_DIR}")
    # Создаем директорию, если её нет
    os.makedirs(PRODUCTS_IMAGES_DIR, exist_ok=True)
    logger.info(f"Created products images directory: {PRODUCTS_IMAGES_DIR}")
    app.mount("/images", StaticFiles(directory=PRODUCTS_IMAGES_DIR), name="images")


@app.get("/")
async def root():
    """Корневой маршрут API"""
    return {
        "app": PROJECT_NAME,
        "version": PROJECT_VERSION,
        "message": "Добро пожаловать в API Север-Рыба!",
        "status": "online",
        "time": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    """Проверка работоспособности API"""
    return {
        "status": "healthy",
        "version": PROJECT_VERSION,
        "time": datetime.utcnow().isoformat(),
        "environment": "development" if DEBUG else "production"
    }


@app.get("/routes", tags=["API Info"])
async def get_routes():
    """Возвращает все доступные маршруты API для обнаружения фронтендом"""
    routes = [
        {"path": "/api/products", "method": "GET", "description": "Получить все товары"},
        {"path": "/api/products/{product_id}", "method": "GET", "description": "Получить товар по ID"},
        {"path": "/api/products/category/{category_id}", "method": "GET",
         "description": "Получить товары по категории"},
        {"path": "/api/cart", "method": "GET", "description": "Получить содержимое корзины"},
        {"path": "/api/cart", "method": "POST", "description": "Добавить товар в корзину"},
        {"path": "/api/cart/{cart_id}", "method": "PUT", "description": "Обновить количество товара в корзине"},
        {"path": "/api/cart/{cart_id}", "method": "DELETE", "description": "Удалить товар из корзины"},
        {"path": "/api/cart", "method": "DELETE", "description": "Очистить корзину"},
        {"path": "/api/cart/count", "method": "GET", "description": "Получить количество товаров в корзине"},
        {"path": "/api/orders", "method": "GET", "description": "Получить заказы пользователя"},
        {"path": "/api/orders", "method": "POST", "description": "Создать новый заказ"},
        {"path": "/api/orders/{order_id}", "method": "GET", "description": "Получить данные заказа"},
        {"path": "/api/users/me", "method": "GET", "description": "Получить профиль пользователя"},
        {"path": "/api/auth/login", "method": "POST", "description": "Войти в систему"},
        {"path": "/api/auth/register", "method": "POST", "description": "Зарегистрироваться"},
        {"path": "/health", "method": "GET", "description": "Проверка работоспособности API"}
    ]
    return routes


@app.get("/ais-status")
async def ais_integration_status():
    """Проверка статуса интеграции с AIS"""
    try:
        status = await ais_integration.check_connection()
        return {
            "status": "connected" if status else "disconnected",
            "message": "AIS интеграция работает нормально" if status else "Нет соединения с AIS",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Ошибка при проверке соединения с AIS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Ошибка при проверке соединения с AIS: {str(e)}"
        )


# Запуск сервера через функцию для удобства разработки
if __name__ == "__main__":
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)