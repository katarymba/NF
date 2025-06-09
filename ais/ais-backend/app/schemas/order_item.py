from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.schemas.product import ProductResponse


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: float = Field(..., ge=0)
    product_name: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemUpdate(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)


class OrderItemInDB(OrderItemBase):
    id: int
    order_id: int

    model_config = ConfigDict(from_attributes=True, frozen=True)


class OrderItemResponse(OrderItemInDB):
    product: Optional[ProductResponse] = None
