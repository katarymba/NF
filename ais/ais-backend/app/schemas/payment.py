from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.order import OrderResponse

class PaymentBase(BaseModel):
    order_id: int
    payment_method: str
    payment_status: str = "pending"
    transaction_id: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None


class PaymentInDB(PaymentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, frozen=True)


class PaymentResponse(PaymentInDB):
    order: Optional[OrderResponse] = None


class PaymentListResponse(PaymentInDB):
    pass