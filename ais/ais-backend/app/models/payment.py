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
# Платежи (payments)
# ------------------------------
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(50), default="pending")
    transaction_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь с заказом
    order = relationship("Order", back_populates="payments")