# app/models/order.py
from sqlalchemy import Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.now)
    total_amount = Column(Float)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)  # Цена на момент заказа

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")