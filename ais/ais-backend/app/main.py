import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text 

from app.database import engine, Base, get_db, SessionLocal
from app.api.orders_api import router as orders_router
from app.routers import users, administrators, products, categories, orders, payments, shipments, auth, integration, warehouse
from app.admin import create_default_admin
from app.services.message_handlers import register_message_handlers

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Создание таблиц в базе данных
Base.metadata.create_all(bind=engine)

try:
    # Проверка подключения к базе данных
    db = SessionLocal()
    db.execute(text("SELECT 1"))
    logger.info("Подключение к базе данных установлено!")
except Exception as e:
    logger.error(f"Ошибка подключения к базе данных: {e}")
    raise e
finally:
    if 'db' in locals():
        db.close()


# Создаем администратора
create_default_admin()

load_dotenv()

AIS_API = os.getenv("AIS_API", "http://localhost:8001")

app = FastAPI(
    title="AIS Backend API",
    description="Автоматизированная информационная система предприятия",
    version="1.0.0",
    docs_url="/docs",  # Явно указываем URL для документации
    redoc_url="/redoc"  # Явно указываем URL для ReDoc
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.157:5173",
    "http://192.168.0.157:8000",
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:8080",
    "http://0.0.0.0:8001"  # Добавляем этот адрес
    # Добавьте здесь ваши production домены, когда перейдете в production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Важно для передачи куки
    allow_methods=["*"],     # Разрешаем все методы
    allow_headers=["*"],     # Разрешаем все заголовки
)
logger.info("✅ CORS middleware подключен!")

# роутеры
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(administrators.router, prefix="/administrators", tags=["Administrators"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(warehouse.router, prefix="/api/warehouse", tags=["warehouse"])
app.include_router(orders_router, tags=["orders"])
app.include_router(orders_router, prefix="/orders", tags=["orders"])
app.include_router(shipments.router, prefix="/shipments", tags=["Shipments"])
app.include_router(integration.router, prefix="/api/integration", tags=["Integration"])



@app.get("/")
def read_root():
    return {"message": "AIS Backend is running"}

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    return {"user_id": user_id, "name": "John Doe"}

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": str(datetime.now())}


@app.api_route("/ais/administrators/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def ais_admin_proxy(path: str, request: Request):
    """Проксирование запросов к AIS Administrators API"""
    return await proxy_request(f"{AIS_API}/administrators/{path}", request)


async def proxy_request(target_url: str, request: Request):
    # Ваш код проксирования запроса здесь
    pass


@app.on_event("startup")
async def startup_event():
    """
    Действия при запуске приложения
    """
    logger.info("Запуск АИС Backend...")
    # Регистрация обработчиков сообщений
    register_message_handlers()
    logger.info("АИС Backend успешно запущен!")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Действия при остановке приложения
    """
    from app.services.rabbitmq import rabbitmq_service
    logger.info("Остановка АИС Backend...")
    # Закрытие соединения с RabbitMQ
    rabbitmq_service.close()
    logger.info("АИС Backend успешно остановлен!")