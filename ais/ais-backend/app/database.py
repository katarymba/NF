import os
import logging
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Проверка и установка значения по умолчанию для DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ais.db")

logger.info(f"Connecting to database: {DATABASE_URL}")

try:
    # Настройка подключения к БД для SQLite
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL, connect_args={"check_same_thread": False}
        )
    else:
        # Для PostgreSQL и других типов БД
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,  # Проверка соединения перед использованием
            pool_recycle=3600,   # Пересоздание соединения через час
            pool_size=10,        # Размер пула соединений
            max_overflow=20      # Максимальное превышение размера пула
        )
        
    # Проверка подключения к БД
    connection = engine.connect()
    connection.close()
    logger.info("Database connection successful")
    
except SQLAlchemyError as e:
    logger.error(f"Database connection error: {str(e)}")
    # Создаем SQLite как запасной вариант, если подключение к PostgreSQL не удалось
    fallback_url = "sqlite:///./ais_fallback.db"
    logger.warning(f"Falling back to SQLite database: {fallback_url}")
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()