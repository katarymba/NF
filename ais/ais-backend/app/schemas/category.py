from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    parent_category_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    parent_category_id: Optional[int] = None


class CategoryInDB(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True, frozen=True)


class CategoryResponse(CategoryInDB):
    pass