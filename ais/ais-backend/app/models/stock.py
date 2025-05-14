<<<<<<< HEAD
# app/models/stock.py
=======
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
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

<<<<<<< HEAD
    id = Column(Integer, primary_key=True, index=True,
                server_default="nextval('stocks_id_seq'::regclass)")
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, server_default="CURRENT_TIMESTAMP",
                       onupdate=datetime.utcnow)
=======
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2

    # Связи
    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")