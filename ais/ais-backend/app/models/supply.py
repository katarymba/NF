# app/models/supply.py
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


class Supply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    order_date = Column(DateTime, nullable=False, server_default="now()")
    expected_delivery = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=False, default="pending")
    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default="now()")
    updated_at = Column(DateTime, nullable=False, server_default="now()")
    created_by = Column(String(100), nullable=False, index=True, server_default="system")

    # Связи
    supplier = relationship("Supplier", back_populates="supplies")
    warehouse = relationship("Warehouse", back_populates="supplies")
    items = relationship("SupplyItem", back_populates="supply", cascade="all, delete-orphan")


class SupplyItem(Base):
    __tablename__ = "supply_items"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity_ordered = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    is_received = Column(String(1), nullable=False, default="false")
    received_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    # Связи
    supply = relationship("Supply", back_populates="items")
    product = relationship("Product", back_populates="supply_items")
    warehouse = relationship("Warehouse")
