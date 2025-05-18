# app/models/stock.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Float,
    Enum,
    Date,
    Boolean,
    JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


# ------------------------------
#   Склады товаров (stocks)
# ------------------------------
class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True,
                server_default="nextval('stocks_id_seq'::regclass)")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, server_default="CURRENT_TIMESTAMP",
                       onupdate=datetime.utcnow)

    # Связи
    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")