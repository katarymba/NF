from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Float,
)
from sqlalchemy.orm import relationship
from app.database import Base


# ------------------------------
#       Заказы (orders)
# ------------------------------
class Order(Base):

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String)
    created_at = Column(DateTime)
    total_amount = Column(Float)

    # Поля для доставки и контактной информации
    delivery_address = Column(String(255))
    phone = Column(String(20))
    email = Column(String(100))
    name = Column(String(100))
    comment = Column(Text)
    payment_method = Column(String(50), server_default='cash')

    # Связи
    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )
    payments = relationship("Payment", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")