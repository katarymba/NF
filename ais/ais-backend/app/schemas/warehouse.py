# app/schemas/warehouse.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.enums import WarehouseType


class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None
    type: Optional[WarehouseType] = WarehouseType.WAREHOUSE
    capacity: Optional[int] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = None
    type: Optional[WarehouseType] = None
    capacity: Optional[int] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None


class WarehouseInDB(WarehouseBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


class WarehouseResponse(WarehouseInDB):
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)
