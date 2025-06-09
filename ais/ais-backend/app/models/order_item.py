from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Float
)
from sqlalchemy.orm import relationship
from app.database import Base


# ------------------------------
#   Элементы заказа (order_items)
# ------------------------------
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price = Column(Float)
    product_name = Column(String)

    # Связи
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
