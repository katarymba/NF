from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime

# Базовая схема пользователя
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Схема для создания пользователя
class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    
    @validator('phone')
    def validate_phone(cls, v):
        if v is not None and not v.startswith('+'):
            return f"+{v}"
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
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    birthday: Optional[date] = None

    class Config:
        from_attributes = True

# Схема для продукта в ответе
class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    weight: Optional[str] = None
    category_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Схема для создания элемента корзины
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, gt=0, le=99)

# Схема для ответа с элементом корзины
class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    user_id: Optional[int] = None
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

# Схема для изменения пароля
class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str