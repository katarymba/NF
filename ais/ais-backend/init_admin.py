import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from datetime import datetime
import sys

sys.path.append('.')  # Добавляем текущую директорию в путь

from app.models import Administrator, Base
from app.database import get_db, engine

# Создаем контекст для хеширования паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def init_admin():
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Удаляем существующих администраторов (если нужно)
        db.query(Administrator).delete()

        # Создаем нового администратора
        hashed_password = get_password_hash("qwerty123")
        admin = Administrator(
            username="main_admin",
            email="main_admin@severriba.com",
            password_hash=hashed_password,
            full_name="Главный Администратор",
            role="admin",
            is_active=True,
            created_at=datetime.utcnow()
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print(f"Создан новый администратор:")
        print(f"Username: {admin.username}")
        print(f"Email: {admin.email}")
        print(f"Password Hash: {admin.password_hash}")

    except Exception as e:
        db.rollback()
        print(f"Ошибка при создании администратора: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_admin()