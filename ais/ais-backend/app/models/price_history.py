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
#   История цен (price_history)
# ------------------------------
class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    price = Column(Float, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    changed_by_id = Column(Integer, nullable=True)

    # Связь с товаром
    product = relationship("Product", back_populates="price_history")