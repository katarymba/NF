from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, date

# Константа для максимального количества товара
MAX_QUANTITY = 99

# Схема пользователя
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Имя пользователя")
    email: EmailStr = Field(..., description="Email пользователя")
    phone: str = Field(..., min_length=10, max_length=15, description="Номер телефона")
    full_name: str = Field(..., min_length=2, max_length=100, description="Полное имя пользователя")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Пароль пользователя")
    password_confirm: str = Field(..., min_length=6, description="Подтверждение пароля")
    birthday: Optional[date] = Field(None, description="Дата рождения")

class UserLogin(BaseModel):
    phone: str = Field(..., description="Номер телефона")
    password: str = Field(..., description="Пароль пользователя")

class UserResponse(UserBase):
    id: int
    birthday: Optional[date] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=15)

# Новая схема для обновления даты рождения
class UserBirthdayUpdate(BaseModel):
    birthday: Optional[date] = None

# Схема токена
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# Схема категории
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    
    model_config = ConfigDict(from_attributes=True)

# Схема продукта
class ProductBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: float = Field(..., gt=0, description="Цена должна быть положительной")
    image_url: Optional[str] = None
    weight: Optional[str] = None

class ProductCreate(ProductBase):
    category_id: int

class ProductResponse(ProductBase):
    id: int
    category_id: int
    
    model_config = ConfigDict(from_attributes=True)

# Схема элемента корзины
class CartItemBase(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0, le=MAX_QUANTITY, description=f"Количество товара (от 1 до {MAX_QUANTITY})")

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    product: Optional[ProductResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# Схема заказа
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderBase(BaseModel):
    total_price: float = Field(..., gt=0)
    user_id: int

class OrderCreate(OrderBase):
    items: List[OrderItemBase]

# Расширенные модели для заказа
class CustomerInfo(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str

class DeliveryAddress(BaseModel):
    city: str
    street_address: str
    postal_code: str

class DeliveryInfo(BaseModel):
    method: str
    address: Optional[DeliveryAddress] = None

class ExtendedOrderCreate(BaseModel):
    items: List[OrderItemBase]
    customer: CustomerInfo
    delivery: DeliveryInfo
    payment_method: str
    comment: Optional[str] = None
    total_price: float

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_price: float
    status: str
    created_at: datetime
    customer_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    delivery_method: Optional[str] = None
    delivery_address: Optional[str] = None
    #delivery_city: Optional[str] = None
    #delivery_postal_code: Optional[str] = None
    payment_method: Optional[str] = None
    comment: Optional[str] = None
    order_items: Optional[List[OrderItemResponse]] = None
    
    model_config = ConfigDict(from_attributes=True)

# Дополнительные вспомогательные схемы
class ProductSearchParams(BaseModel):
    name: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    category_id: Optional[int] = None

class ErrorResponse(BaseModel):
    detail: str