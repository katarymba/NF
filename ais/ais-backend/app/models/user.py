from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


# ------------------------------
#       Пользователи (users)
# ------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime)
    role = Column(String(20), default="user", nullable=False)
    phone = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    birthday = Column(DateTime, nullable=True)

    # Связи
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")


class Administrator(Base):
    __tablename__ = "administrators"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="admin", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    permissions = Column(String(255), nullable=True)
    position = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)