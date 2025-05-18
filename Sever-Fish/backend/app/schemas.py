# app/schemas.py
from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum
from datetime import date, datetime


# Базовая схема пользователя
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None and not v.startswith('+'):
            return f"+{v}"
        return v


# Схема для создания пользователя
class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Пароль должен содержать не менее 6 символов")
        return v


# Схема для обновления пользователя
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birthday: Optional[date] = None

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None and not v.startswith('+'):
            return f"+{v}"
        return v

    class Config:
        from_attributes = True  # В новой версии pydantic используется from_attributes вместо orm_mode


# Схема для ответа с профилем пользователя
class UserProfile(BaseModel):
    id: int
    email: EmailStr
    name: str
    phone: Optional[str] = None
    full_name: Optional[str] = None
    birthday: Optional[date] = None
    is_active: bool = True
    is_admin: bool = False

    class Config:
        from_attributes = True


# Сокращенная схема пользователя для ответа
class User(BaseModel):
    id: int
    email: EmailStr
    name: str
    phone: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False

    class Config:
        from_attributes = True


# Схема для аутентификации
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Схемы токенов
class TokenData(BaseModel):
    user_id: Optional[int] = None


class Token(BaseModel):
    access_token: str
    token_type: str


# Схемы для продуктов
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    # Переименовываем stock в stock_quantity для соответствия модели в БД
    stock: Optional[int] = 0  # В API остаётся stock для совместимости
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    weight: Optional[str] = None


class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(gt=0)
    category_id: Optional[int] = None
    stock_quantity: Optional[int] = Field(ge=0)
    weight: Optional[str] = None
    image_url: Optional[str] = None


# Схема для продукта в ответе
class ProductResponse(ProductBase):
    id: int
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: Optional[int] = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Схемы для категорий
class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True


# Схемы для корзины
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0, le=99)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0, le=99)


class CartItemResponse(CartItemBase):
    id: int
    user_id: Optional[int] = None
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


# Схемы для заказов
class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderBase(BaseModel):
    delivery_address: str
    phone: str = Field(min_length=10)
    email: EmailStr
    name: str
    comment: Optional[str] = None
    payment_method: str

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None and not v.startswith('+'):
            return f"+{v}"
        return v


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    delivery_address: Optional[str] = None
    comment: Optional[str] = None


class OrderResponse(OrderBase):
    id: int
    user_id: Optional[int] = None
    status: OrderStatus
    total: float
    created_at: datetime
    items: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0, le=99)
    price: float = Field(gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    order_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


# Схема для изменения пароля
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

    @validator('new_password')
    def validate_new_password(cls, v, values):
        if v == values.get('current_password'):
            raise ValueError("Новый пароль не должен совпадать с текущим")
        if len(v) < 6:
            raise ValueError("Пароль должен содержать не менее 6 символов")
        return v


# Схема для API-ответов
class ApiResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None