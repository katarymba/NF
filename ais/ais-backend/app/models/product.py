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

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    # Связи
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product")
    stocks = relationship("Stock", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")