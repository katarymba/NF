from pydantic import ConfigDict, BaseModel, ConfigDict
from typing import Optional
from app.schemas.enums import MovementType
from datetime import datetime

class StockMovementBase(BaseModel):
    product_id: int
    quantity: float  # Изменено с int на float
    movement_type: str  # Изменено с MovementType enum на str
    source_warehouse_id: Optional[int] = None  # Заменяем warehouse_id
    target_warehouse_id: Optional[int] = None
    reference_id: Optional[int] = None
    notes: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementInDB(StockMovementBase):
    id: int
    movement_date: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, frozen=True)


class StockMovementResponse(StockMovementInDB):
    product_name: Optional[str] = None
    source_warehouse_name: Optional[str] = None
    target_warehouse_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)