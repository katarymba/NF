from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Загружаем .env файл
load_dotenv()

# Получаем URL подключения из переменных окружения или используем значение по умолчанию
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db")

# Создаем движок базы данных
engine = create_engine(DATABASE_URL)

# Создаем класс сессии
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаем базовый класс для моделей
Base = declarative_base()

# Функция для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Функция для проверки подключения к базе данных
def test_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("Подключение к базе данных успешно!")
            return True
    except Exception as e:
        print(f"Ошибка подключения к базе данных: {e}")
        return False