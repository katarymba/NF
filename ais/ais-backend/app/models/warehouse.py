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
#       Склады (warehouses)
# ------------------------------
class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    type = Column(String(50), nullable=True)
    capacity = Column(Integer, nullable=True)
    manager_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    # Связи
    stocks = relationship("Stock", back_populates="warehouse")
    source_movements = relationship("StockMovement", foreign_keys="StockMovement.source_warehouse_id",
                                    back_populates="source_warehouse")
    target_movements = relationship("StockMovement", foreign_keys="StockMovement.target_warehouse_id",
                                    back_populates="target_warehouse")

