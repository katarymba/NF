"""
Скрипт для создания всех таблиц в базе данных.
Запустите этот скрипт отдельно, чтобы создать все необходимые таблицы.
"""

import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

# Получаем URL базы данных
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Используется DATABASE_URL: {DATABASE_URL}")

# Создаем движок SQLAlchemy
engine = create_engine(DATABASE_URL)

# Импортируем модели
from models import Base

# Создаем все таблицы
Base.metadata.create_all(bind=engine)
print("Все таблицы успешно созданы или обновлены!")