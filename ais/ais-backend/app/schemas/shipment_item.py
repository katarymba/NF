from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class ShipmentItemBase(BaseModel):
    shipment_id: str
    product_id: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    warehouse_id: str
    is_received: bool = False


class ShipmentItemCreate(BaseModel):
    product_id: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    warehouse_id: str


class ShipmentItemPatch(BaseModel):
    quantity_received: Optional[int] = None
    is_received: Optional[bool] = None
    received_date: Optional[str] = None
    notes: Optional[str] = None


class ShipmentItemInDB(ShipmentItemBase):
    id: str
    product_name: str
    quantity_received: Optional[int] = None
    received_date: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


class ShipmentItemResponse(ShipmentItemInDB):
    model_config = ConfigDict(from_attributes=True)