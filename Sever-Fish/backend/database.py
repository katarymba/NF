import psycopg2
from psycopg2.extras import RealDictCursor
import logging

logger = logging.getLogger(__name__)

# Обновляем параметры подключения к базе данных PostgreSQL
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "sever_ryba_db"   # Исправлено с sever_fish_db на sever_ryba_db
DB_USER = "katarymba"
DB_PASSWORD = "root"

def get_db_connection():
    """
    Создает и возвращает соединение с базой данных
    """
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            cursor_factory=RealDictCursor  # Возвращает результаты как словари
        )
        return conn
    except Exception as e:
        logger.error(f"Ошибка подключения к базе данных: {str(e)}")
        raise e

def get_db():
    """
    Функция-зависимость для создания и закрытия соединения с БД
    """
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()