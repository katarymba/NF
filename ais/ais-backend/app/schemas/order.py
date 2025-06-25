from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.order_item import OrderItemCreate, OrderItemResponse
from app.schemas.user import UserResponse


class OrderBase(BaseModel):
    user_id: Optional[int] = None
    status: Optional[str] = "pending"
    total_amount: Optional[float] = Field(0.0, ge=0)
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = "cash"


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None


class OrderInDB(OrderBase):
    id: int
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(OrderInDB):
    items: Optional[List[OrderItemResponse]] = None
    user: Optional[UserResponse] = None


class OrderWithPayment(BaseModel):
    id: int
    user_id: Optional[int] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    total_amount: Optional[float] = None

    # Контактная информация
    delivery_address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    comment: Optional[str] = None
    payment_method: Optional[str] = None

    # Данные о платеже
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_created_at: Optional[datetime] = None

    # Элементы заказа
    items: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)
