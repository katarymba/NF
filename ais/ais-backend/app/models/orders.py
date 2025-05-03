# app/models/orders.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base

class Order(Base):
    """
    Модель заказа в системе
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    client_name = Column(String(255), nullable=True)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="pending")
    delivery_address = Column(Text, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    
    # Отношение к элементам заказа - может быть JSONField
    order_items = Column(JSON, nullable=True)
    
    # Отношения с другими таблицами
    user = relationship("User", back_populates="orders")
    payments = relationship("Payment", back_populates="order")