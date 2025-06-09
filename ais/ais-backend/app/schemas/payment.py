from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# Базовая модель для общих полей
class PaymentBase(BaseModel):
    order_id: int
    payment_method: str
    payment_status: Optional[str] = "pending"
    transaction_id: Optional[str] = None

# Модель для создания платежа
class PaymentCreate(PaymentBase):
    pass

# Модель для обновления платежа
class PaymentUpdate(BaseModel):
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None

# Модель для ответов API
class PaymentResponse(PaymentBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Модель для представления платежа в базе данных
class PaymentInDB(PaymentResponse):
    """Модель для представления платежа в базе данных."""
    pass

# Список платежей для ответа API
class PaymentListResponse(BaseModel):
    """Модель для ответа со списком платежей."""
    payments: List[PaymentResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)