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
# 12. Движение товаров (stock_movements)
# ------------------------------
class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    movement_type = Column(String(50), nullable=False)  # receipt, shipment, transfer, adjustment
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    target_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)

    # Связи
    product = relationship("Product", back_populates="stock_movements")
    warehouse = relationship("Warehouse", foreign_keys=[warehouse_id])
    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id], back_populates="source_movements")
    target_warehouse = relationship("Warehouse", foreign_keys=[target_warehouse_id], back_populates="target_movements")