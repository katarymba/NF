# app/models/product.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy.sql import func

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    # Исправлено с stock на stock_quantity
    stock_quantity = Column(Integer, nullable=True, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String, nullable=True)
    # Добавляем поле weight
    weight = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=func.now())


    category = relationship("Category", back_populates="products")
    # Используем строковые литералы для всех отношений
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")