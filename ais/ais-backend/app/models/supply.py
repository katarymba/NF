# app/models/supply.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Float,
    Boolean,
    Numeric,
    Enum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class SupplyStatusEnum(str, enum.Enum):
    PLANNED = "PLANNED"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED = "RECEIVED"
    PROCESSED = "PROCESSED"
    CANCELLED = "CANCELLED"


class Supply(Base):
    __tablename__ = "supplies"

    id = Column(Integer, primary_key=True, index=True,
                server_default="nextval('supplies_id_seq'::regclass)")
    supplier = Column(String(100), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    status = Column(
        Enum(SupplyStatusEnum, name="supplystatus", create_constraint=False, native_enum=True),
        nullable=False,
        default=SupplyStatusEnum.PLANNED,  # Используем enum, определенный выше
        index=True
    )
    shipment_date = Column(DateTime, nullable=False)
    expected_arrival_date = Column(DateTime, nullable=True)
    actual_arrival_date = Column(DateTime, nullable=True)
    reference_number = Column(String(100), nullable=True)
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(DateTime, nullable=False, server_default="CURRENT_TIMESTAMP",
                        onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)

    # Связи
    warehouse = relationship("Warehouse", back_populates="supplies")
    items = relationship("SupplyItem", back_populates="supply", cascade="all, delete-orphan")


class SupplyItem(Base):
    __tablename__ = "supply_items"

    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey("supplies.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    quantity_ordered = Column(Integer, nullable=False)
    quantity_received = Column(Integer, nullable=True)
    unit_price = Column(Numeric(10, 2), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    is_received = Column(Boolean, nullable=False, default=False)
    received_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    # Связи
    supply = relationship("Supply", back_populates="items")
    product = relationship("Product")
    warehouse = relationship("Warehouse")
