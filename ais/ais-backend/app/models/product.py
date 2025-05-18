# app/models/product.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Float
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base


# ------------------------------
#       Товары (products)
# ------------------------------
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True,
                server_default="nextval('products_temp_id_seq'::regclass)")
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP", nullable=True)
    image_url = Column(String, nullable=True)
    weight = Column(String(50), nullable=True)

    # Связи
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product")
    stocks = relationship("Stock", back_populates="product", cascade="all, delete")
    stock_movements = relationship("StockMovement", back_populates="product")
    supply_items = relationship("SupplyItem", back_populates="product")
