from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from app.schemas.enums import StockStatus

class StockItemBase(BaseModel):
    product_id: str
    warehouse_id: str
    quantity: int = Field(..., ge=0)
    minimum_quantity: int = Field(..., ge=0)
    maximum_quantity: Optional[int] = None
    reorder_level: int = Field(..., ge=0)
    quantity_reserved: Optional[int] = 0


class StockItemCreate(StockItemBase):
    pass


class StockItemPatch(BaseModel):
    quantity: Optional[int] = None
    minimum_quantity: Optional[int] = None
    maximum_quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    quantity_reserved: Optional[int] = None
    last_count_date: Optional[str] = None
    last_counted_by: Optional[str] = None
    status: Optional[StockStatus] = None


class StockItemInDB(StockItemBase):
    id: str
    product_name: str
    warehouse_name: str
    last_count_date: Optional[str] = None
    last_counted_by: Optional[str] = None
    status: StockStatus = StockStatus.IN_STOCK

    model_config = ConfigDict(from_attributes=True, frozen=True)


class StockItemResponse(StockItemInDB):
    model_config = ConfigDict(from_attributes=True)