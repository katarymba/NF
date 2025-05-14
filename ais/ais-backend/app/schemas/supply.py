# app/schemas/supply.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, ForwardRef
from datetime import datetime
from app.schemas.enums import SupplyStatus

# Создаем forward reference для SupplyItem, чтобы использовать его до определения
SupplyItemRef = ForwardRef('SupplyItem')

class SupplyItemBase(BaseModel):
    product_id: int
    product_name: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)
    warehouse_id: int
    notes: Optional[str] = None


class SupplyItemCreate(SupplyItemBase):
    pass


class SupplyItemUpdate(BaseModel):
    quantity_received: Optional[int] = Field(None, ge=0)
    is_received: Optional[bool] = None
    received_date: Optional[datetime] = None
    notes: Optional[str] = None


class SupplyItemInDB(SupplyItemBase):
    id: int
    supply_id: int
    quantity_received: Optional[int] = None
    is_received: bool = False
    received_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


class SupplyItem(SupplyItemInDB):
    model_config = ConfigDict(from_attributes=True)


class SupplyBase(BaseModel):
    supplier: str = Field(..., min_length=2, max_length=100)
    warehouse_id: int
    status: SupplyStatus = Field(default=SupplyStatus.PLANNED)
    shipment_date: datetime
    expected_arrival_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class SupplyCreate(SupplyBase):
    items: List[SupplyItemCreate]


class SupplyUpdate(BaseModel):
    supplier: Optional[str] = Field(None, min_length=2, max_length=100)
    warehouse_id: Optional[int] = None
    status: Optional[SupplyStatus] = None
    shipment_date: Optional[datetime] = None
    expected_arrival_date: Optional[datetime] = None
    actual_arrival_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class SupplyInDB(SupplyBase):
    id: int
    created_by: str
    created_at: datetime
    updated_at: datetime
    actual_arrival_date: Optional[datetime] = None
    items: List[SupplyItem] = []

    model_config = ConfigDict(from_attributes=True, frozen=True)


class SupplyResponse(SupplyInDB):
    warehouse_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Используется для маршрутизатора, чтобы соответствовать импорту Supply из роутера
Supply = SupplyResponse

# Разрешение циклической ссылки
SupplyItem.update_forward_refs()