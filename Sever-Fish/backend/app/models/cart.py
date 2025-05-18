# app/models/cart.py
from sqlalchemy import Column, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

'''
class Cart(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")
'''