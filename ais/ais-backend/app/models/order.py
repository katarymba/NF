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
#       Заказы (orders)
# ------------------------------
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
    contact_phone = Column(String(50), nullable=True)
    payment_method = Column(String(50), nullable=True)

    # Поля для доставки
    tracking_number = Column(String(50), nullable=True)
    courier_name = Column(String(100), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    estimated_delivery = Column(Date, nullable=True)

    # Отношение к элементам заказа - может быть JSONField
    order_items = Column(JSON, nullable=True)

    # Связи
    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )
    payments = relationship("Payment", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")