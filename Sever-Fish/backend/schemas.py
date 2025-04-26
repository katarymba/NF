from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Category schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

# Product schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    weight: Optional[str] = None
    category_id: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True

# Cart schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse

    class Config:
        orm_mode = True
        from_attributes = True

# Order item schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    product: ProductResponse

    class Config:
        orm_mode = True
        from_attributes = True

# Order schemas
class OrderBase(BaseModel):
    status: str = "pending"
    total_amount: float

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class ExtendedOrderCreate(OrderBase):
    items: List[OrderItemCreate]
    user_id: Optional[int] = None
    shipping_address: Optional[str] = None
    payment_method: Optional[str] = None
    comment: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        orm_mode = True
        from_attributes = True

# User schemas
class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None