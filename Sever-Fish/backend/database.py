from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Строка подключения для PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL") or "postgresql+psycopg2://katarymba:root@localhost:5432/sever_ryba_db"

# Создаем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Создаем фабрику сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для моделей
Base = declarative_base()

# Функция-зависимость для получения БД-сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()