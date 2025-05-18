# app/models/warehouse.py
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
import enum
from app.database import Base

# Определение ENUM типа для PostgreSQL
class WarehouseTypeEnum(str, enum.Enum):
    WAREHOUSE = "WAREHOUSE"
    STORE = "STORE"


# ------------------------------
#       Склады (warehouses)
# ------------------------------
class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True,
                server_default="nextval('warehouses_id_seq'::regclass)")
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    type = Column(Enum(WarehouseTypeEnum, name="warehousetype",
                     create_constraint=False, native_enum=True),
                 nullable=True)
    capacity = Column(Integer, nullable=True)
    manager_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP", nullable=True)

    # Связи
    stocks = relationship("Stock", back_populates="warehouse")
    source_movements = relationship("StockMovement", foreign_keys="StockMovement.source_warehouse_id",
                                  back_populates="source_warehouse")
    target_movements = relationship("StockMovement", foreign_keys="StockMovement.target_warehouse_id",
                                  back_populates="target_warehouse")
    supplies = relationship("Supply", back_populates="warehouse")

