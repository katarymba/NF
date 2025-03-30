import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Получаем текущую директорию
current_dir = os.getcwd()
print(f"Текущая рабочая директория: {current_dir}")

# Путь к .env файлу
env_path = os.path.join(current_dir, '.env')
print(f"Ищем .env файл по пути: {env_path}")
print(f".env файл существует: {os.path.exists(env_path)}")

# Загружаем переменные окружения из .env файла
dotenv_result = load_dotenv(env_path)
print(f"Результат загрузки .env: {dotenv_result}")

# Получаем URL базы данных из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Полученный DATABASE_URL: {DATABASE_URL}")

# Создаем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Создаем сессию
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Создаем базовый класс для моделей
Base = declarative_base()

# Функция получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()