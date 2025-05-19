from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None


class CategoryInDB(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True, frozen=True)


class CategoryResponse(CategoryInDB):
    pass


class Category(CategoryBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True