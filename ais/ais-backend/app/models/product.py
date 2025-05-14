<<<<<<< HEAD
# app/models/product.py
=======
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
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

<<<<<<< HEAD
    id = Column(Integer, primary_key=True, index=True,
                server_default="nextval('products_temp_id_seq'::regclass)")
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP", nullable=True)
    image_url = Column(String, nullable=True)
    weight = Column(String(50), nullable=True)
=======
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2

    # Связи
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product")
<<<<<<< HEAD
    stocks = relationship("Stock", back_populates="product", cascade="all, delete")
    stock_movements = relationship("StockMovement", back_populates="product")
    supply_items = relationship("SupplyItem", back_populates="product")
=======
    stocks = relationship("Stock", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
