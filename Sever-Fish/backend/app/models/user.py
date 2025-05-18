# app/models/user.py
from sqlalchemy import Boolean, Column, Date, DateTime, String, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=False, unique=True, index=True)
    birthday = Column(Date, nullable=True)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(DateTime, default=func.now())

    # Связи с другими таблицами
    cart_items = relationship("CartItem", back_populates="user")
    orders = relationship("Order", back_populates="user")