# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import psycopg2
import psycopg2.extras
from decimal import Decimal
from typing import Dict, Any
import logging

from app.config import DATABASE_URL

logger = logging.getLogger(__name__)

# Создание SQLAlchemy engine для ORM
try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,  # Проверка соединения перед запросом
        echo=False  # Установите True для вывода SQL-запросов в лог
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    logger.info("SQLAlchemy connection established successfully")
except Exception as e:
    logger.error(f"Error creating SQLAlchemy engine: {e}")
    raise


def get_db():
    """
    Dependency для получения сессии БД.
    Используется с Depends(get_db) в FastAPI функциях.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_psycopg_db():
    """
    Dependency для получения psycopg2 соединения (для обратной совместимости)
    """
    try:
        # Используем те же настройки, что и в DATABASE_URL
        conn_params = DATABASE_URL.replace('postgresql+psycopg2://', '').split('@')
        user_pass = conn_params[0].split(':')
        host_db = conn_params[1].split('/')

        connection = psycopg2.connect(
            host=host_db[0].split(':')[0],
            port=host_db[0].split(':')[1] if ':' in host_db[0] else 5432,
            user=user_pass[0],
            password=user_pass[1],
            dbname=host_db[1]
        )
        connection.autocommit = True
        yield connection
    except Exception as e:
        logger.error(f"Error connecting to database with psycopg2: {str(e)}")
        raise
    finally:
        if 'connection' in locals():
            connection.close()


def row_to_dict(row, cursor_description) -> Dict[str, Any]:
    """
    Конвертирует строку результата psycopg2 в словарь
    """
    if isinstance(row, dict) or hasattr(row, 'keys'):
        return {k: float(v) if isinstance(v, Decimal) else v for k, v in dict(row).items()}

    result = {}
    for i, column in enumerate(cursor_description):
        result[column.name] = float(row[i]) if isinstance(row[i], Decimal) else row[i]
    return result


def init_db():
    """
    Создает все таблицы в базе данных
    """
    from app.models import Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")