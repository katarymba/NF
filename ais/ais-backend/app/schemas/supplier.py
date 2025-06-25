# app/schemas/supplier.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class SupplierBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    contact_person: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    is_active: bool = Field(default=True)


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    contact_person: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierInDB(SupplierBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, frozen=True)


class SupplierResponse(SupplierInDB):
    model_config = ConfigDict(from_attributes=True)


# Используется для маршрутизатора
Supplier = SupplierResponse