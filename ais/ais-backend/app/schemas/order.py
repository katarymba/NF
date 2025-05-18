from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from app.schemas.order_item import OrderItemCreate, OrderItemResponse
from app.schemas.user import UserResponse

class OrderBase(BaseModel):
    user_id: Optional[int] = None
    client_name: Optional[str] = None
    total_price: float = Field(..., ge=0)
    status: str = "pending"
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    payment_method: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None


class OrderInDB(OrderBase):
    id: int
    created_at: datetime
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None
    order_items: Optional[str] = None
    model_config = ConfigDict(from_attributes=True, frozen=True)


class OrderResponse(OrderInDB):
    items: Optional[List[OrderItemResponse]] = None
    user: Optional[UserResponse] = None
    order_items: Optional[List[Dict[str, Any]]] = None  # Обработанная версия JSON строки


class OrderWithPayment(BaseModel):
    id: int
    user_id: Optional[int] = None
    client_name: Optional[str] = None
    total_price: float
    created_at: datetime
    status: str
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    payment_method: Optional[str] = None
    # Поля доставки
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_created_at: Optional[datetime] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    order_items: Optional[List[dict]] = None
    items: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)