# Импортируем всё из оригинального файла конфигурации
import os
from pathlib import Path
from dotenv import load_dotenv
import logging
from datetime import datetime
import getpass

# Загружаем переменные окружения из .env
load_dotenv()

# Базовые настройки приложения
PROJECT_NAME = "Север-Рыба"
PROJECT_VERSION = "1.0.0"
PROJECT_DESCRIPTION = "API для системы управления продажами и запасами морепродуктов"
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Настройки базы данных
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db"
)

# Настройки JWT аутентификации
SECRET_KEY = os.getenv("SECRET_KEY", "0bde95d7a26d5fd30374db066e45d53fe7a9fbc886b099a14f37b830f6c6b12c")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Настройки CORS и хостов
ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "http://localhost:5173,http://localhost:4173,http://localhost:3000,http://localhost:8000"
).split(",")

# Настройки API
API_V1_STR = "/api/v1"
API_PREFIX = "/api"

# Настройки интеграции с AIS
AIS_BASE_URL = os.getenv("AIS_BASE_URL", "http://localhost:8080")
AIS_API_KEY = os.getenv("AIS_API_KEY", "default_api_key")

# Настройки сервера
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")

# Пути для файлов
BASE_DIR = Path(__file__).resolve().parent.parent
PRODUCTS_IMAGES_DIR = os.getenv("PRODUCTS_IMAGES_DIR", os.path.join(BASE_DIR, "products_images"))
MEDIA_DIR = os.path.join(BASE_DIR, "media")
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Настройки логирования
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", os.path.join(BASE_DIR, "api.log"))
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_LEVEL_MAP = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL
}
LOG_LEVEL_VALUE = LOG_LEVEL_MAP.get(LOG_LEVEL.upper(), logging.INFO)

# Настройки Redis для кеширования
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
USE_REDIS_CACHE = os.getenv("USE_REDIS_CACHE", "False").lower() == "true"

# Наименования обменника и очередей для RabbitMQ
EXCHANGE_NAME = "ais_sever_ryba_exchange"
AIS_TO_SEVER_RYBA_QUEUE = "ais_to_sever_ryba"
SEVER_RYBA_TO_AIS_QUEUE = "sever_ryba_to_ais"

# Настройки корзины и заказов
MAX_CART_ITEMS = int(os.getenv("MAX_CART_ITEMS", "99"))
MIN_ORDER_VALUE = float(os.getenv("MIN_ORDER_VALUE", "0"))
MAX_ORDER_VALUE = float(os.getenv("MAX_ORDER_VALUE", "1000000"))
SESSION_EXPIRY = int(os.getenv("SESSION_EXPIRY", "86400"))  # 24 часа в секундах

# Настройки API-шлюза
API_GATEWAY_ENABLED = os.getenv("API_GATEWAY_ENABLED", "True").lower() == "true"
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:8001")

# Для обратной совместимости со старым кодом
# Это позволит коду, который импортирует из sever_ryba, продолжать работать
import sys
sys.modules['sever_ryba'] = sys.modules['app']

# Функции для получения динамических данных
def get_current_user():
    """Возвращает имя текущего пользователя системы"""
    try:
        return getpass.getuser()
    except Exception:
        return os.getenv("USER", "unknown")

def get_current_datetime(format="%Y-%m-%d %H:%M:%S"):
    """Возвращает текущие дату и время в указанном формате"""
    return datetime.utcnow().strftime(format)

# Метаданные приложения - динамические значения
APP_METADATA = {
    "name": PROJECT_NAME,
    "version": PROJECT_VERSION,
    "environment": "development" if DEBUG else "production",
    "start_time": get_current_datetime(),
    "user": get_current_user()
}

# Для обратной совместимости с существующим кодом
APP_NAME = PROJECT_NAME + " API"
APP_VERSION = PROJECT_VERSION
APP_DESCRIPTION = PROJECT_DESCRIPTION
ALLOWED_ORIGINS = ALLOWED_HOSTS

# Создаем объект settings для обратной совместимости с кодом
class Settings:
    def __init__(self):
        # Копируем все настройки в текущий объект
        vars_dict = {name: value for name, value in globals().items() 
                     if not name.startswith('_') and name != 'Settings' and name != 'settings'}
        for name, value in vars_dict.items():
            setattr(self, name, value)

# Создаем экземпляр Settings для импорта в других модулях
settings = Settings()