# ais/ais-backend/app/admin.py
import logging
from sqlalchemy.exc import IntegrityError
from app.database import get_db
from app.models import administrator
from passlib.context import CryptContext

# Настройка логирования
logger = logging.getLogger(__name__)

# Инициализация контекста для хеширования
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_default_admin():
    """
    Создает администратора по умолчанию, если он не существует
    """
    try:
        db = next(get_db())
        
        # Проверяем, существует ли уже администратор
        admin_exists = db.query(Administrator).filter(
            Administrator.username == "admin"
        ).first()
        
        if admin_exists:
            logger.info("✅ Администратор по умолчанию уже существует")
            return
        
        # Хешируем пароль для безопасности
        hashed_password = pwd_context.hash("admin123")
        
        # Создаем нового администратора
        new_admin = Administrator(
            username="admin",
            email="admin@example.com",
            password_hash=hashed_password,
            full_name="Администратор системы",
            role="admin",
            is_active=True,
            permissions="all",
            position="Системный администратор",
            phone="+70000000000"
        )
        
        db.add(new_admin)
        db.commit()
        logger.info("✅ Администратор по умолчанию успешно создан")
        
    except IntegrityError:
        logger.warning("Администратор по умолчанию уже существует (перехвачено IntegrityError)")
        db.rollback()
    except Exception as e:
        logger.error(f"❌ Ошибка при создании администратора по умолчанию: {e}")
        db.rollback()
    finally:
        db.close()