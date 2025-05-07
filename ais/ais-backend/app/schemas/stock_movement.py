from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import MovementType

class StockMovementBase(BaseModel):
    product_id: str
    warehouse_id: str
    quantity: int
    previous_quantity: int
    movement_type: MovementType
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    performed_by: str
    notes: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementInDB(StockMovementBase):
    id: str
    product_name: str
    warehouse_name: str
    movement_date: str

    model_config = ConfigDict(from_attributes=True, frozen=True)


class StockMovementResponse(StockMovementInDB):
    model_config = ConfigDict(from_attributes=True)