# app/models/stock_movement.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Numeric
)
from sqlalchemy.orm import relationship
from app.database import Base


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    target_warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    quantity = Column('quantity', Numeric, nullable=False)  # Используем Numeric вместо Integer
    movement_type = Column(String(20), nullable=False)
    reference_id = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    movement_date = Column(DateTime, nullable=False, server_default="now()")
    updated_at = Column(DateTime, nullable=False, server_default="now()")
    created_at = Column(DateTime, nullable=False, server_default="now()")

    # Связи
    product = relationship("Product", back_populates="stock_movements")
    source_warehouse = relationship("Warehouse",
                                   foreign_keys=[source_warehouse_id],
                                   back_populates="source_movements")
    target_warehouse = relationship("Warehouse",
                                   foreign_keys=[target_warehouse_id],
                                   back_populates="target_movements")
