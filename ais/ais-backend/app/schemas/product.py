from pydantic import Field, ConfigDict, BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.category import CategoryResponse


class ProductBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    category_id: int
    price: float = Field(..., ge=0)
    description: Optional[str] = None


class ProductCreate(ProductBase):
    sku: Optional[str] = None
    unit: Optional[str] = "кг"
    supplier: Optional[str] = None
    image_url: Optional[str] = None
    sr_sync: Optional[bool] = False


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    category_id: Optional[int] = None
    price: Optional[float] = Field(None, ge=0)
    description: Optional[str] = None
    supplier: Optional[str] = None
    sr_sync: Optional[bool] = None


class ProductInDB(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


class ProductResponse(ProductInDB):
    category: Optional[CategoryResponse] = None
    sku: Optional[str] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    image_url: Optional[str] = None
    sr_sync: Optional[bool] = None
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
