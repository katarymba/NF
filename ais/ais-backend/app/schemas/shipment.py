from pydantic import ConfigDict, BaseModel, ConfigDict
from typing import Optional, List
from app.schemas.shipment_item import ShipmentItemCreate, ShipmentItemInDB

class ShipmentBase(BaseModel):
    supplier: str
    shipment_date: str
    expected_arrival_date: Optional[str] = None
    status: str = "planned"
    reference_number: Optional[str] = None
    created_by: str
    notes: Optional[str] = None


class ShipmentCreate(ShipmentBase):
    items: List[ShipmentItemCreate]


class ShipmentPatch(BaseModel):
    status: Optional[str] = None
    actual_arrival_date: Optional[str] = None
    updated_at: Optional[str] = None
    notes: Optional[str] = None


class ShipmentInDB(ShipmentBase):
    id: str
    created_at: str
    updated_at: str
    actual_arrival_date: Optional[str] = None
    items: List[ShipmentItemInDB]

    model_config = ConfigDict(from_attributes=True, frozen=True)


class ShipmentResponse(ShipmentInDB):
    model_config = ConfigDict(from_attributes=True)