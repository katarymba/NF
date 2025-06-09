# app/schemas/supply.py
from pydantic import Field, ConfigDict, BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.enums import SupplyStatus


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


class SupplyItemInDB(BaseModel):
    id: int
    supply_id: int
    product_id: int
    quantity_ordered: int
    unit_price: float
    warehouse_id: int
    quantity_received: Optional[int] = None
    is_received: bool = False
    received_date: Optional[datetime] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


# Схема для ответа с product_name
class SupplyItemResponse(BaseModel):
    id: int
    supply_id: int
    product_id: int
    product_name: str
    quantity_ordered: int
    unit_price: float
    warehouse_id: int
    quantity_received: Optional[int] = None
    is_received: bool = False
    received_date: Optional[datetime] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Для обратной совместимости
SupplyItem = SupplyItemInDB


class SupplyBase(BaseModel):
    supplier_id: int
    supplier: Optional[str] = Field(None, min_length=2, max_length=100)
    warehouse_id: int
    status: SupplyStatus = Field(default=SupplyStatus.PLANNED)
    shipment_date: datetime
    expected_arrival_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


class SupplyCreate(SupplyBase):
    items: List[SupplyItemCreate]


class SupplyUpdate(BaseModel):
    supplier_id: Optional[int] = None
    supplier: Optional[str] = Field(None, min_length=2, max_length=100)
    warehouse_id: Optional[int] = None
    status: Optional[SupplyStatus] = None
    shipment_date: Optional[datetime] = None
    expected_arrival_date: Optional[datetime] = None
    actual_arrival_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None


# Схема для ответа API - используем поля БД напрямую
class SupplyResponse(BaseModel):
    id: int
    supplier_id: int
    supplier: str  # Имя поставщика
    warehouse_id: int
    warehouse_name: Optional[str] = None
    status: str
    order_date: datetime  # Поле из БД
    expected_delivery: Optional[datetime] = None  # Поле из БД
    actual_arrival_date: Optional[datetime] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    total_amount: float
    created_by: str
    created_at: datetime
    updated_at: datetime
    items: List[SupplyItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


# Используется для маршрутизатора
Supply = SupplyResponse
