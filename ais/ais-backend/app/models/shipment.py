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
#       Доставка (shipments)
# ------------------------------
class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    shipping_address = Column(String(255), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    status = Column(String(50), default="pending")
    estimated_delivery = Column(DateTime, nullable=True)

    # Связь с заказом
    order = relationship("Order", back_populates="shipments")