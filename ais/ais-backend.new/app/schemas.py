from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ------------------------------
# 1. Роли пользователей
# ------------------------------
class UserRole(str, Enum):
  ADMIN = "admin"
  USER = "user"

# ------------------------------
# Схемы для модели Administrator
# ------------------------------
class AdministratorBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="admin")
    is_active: bool = Field(default=True)
    permissions: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None

class AdministratorCreate(AdministratorBase):
    password: str = Field(..., min_length=8)


class AdministratorLogin(BaseModel):
  email: str
  password: str

class AdministratorUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    permissions: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None


class AdministratorResponse(AdministratorBase):
  id: int
  is_active: bool
  created_at: datetime
  token: str

  model_config = ConfigDict(from_attributes=True)
    
# ------------------------------
# 2. Статусы заказов (на английском)
# ------------------------------
class OrderStatus(str, Enum):
  NEW = "new"
  PROCESSED = "processed"
  SHIPPED = "shipped"
  COMPLETED = "completed"


# ------------------------------
# 3. Методы оплаты (если в БД хранятся на английском)
# ------------------------------
class PaymentMethod(str, Enum):
  CARD = "card"
  CASH = "cash"
  ONLINE_WALLET = "online_wallet"


# ------------------------------
# 4. Статусы оплаты (по умолчанию в БД "pending")
# ------------------------------
class PaymentStatus(str, Enum):
  PENDING = "pending"
  COMPLETED = "completed"
  FAILED = "failed"
  REFUNDED = "refunded"


# ------------------------------
# 5. Статусы доставки (на английском)
# ------------------------------
class ShipmentStatus(str, Enum):
  PREPARING = "preparing"
  IN_TRANSIT = "in_transit"
  DELIVERED = "delivered"
  RETURNED = "returned"


# ------------------------------
# Схемы для модели User
# ------------------------------
class UserBase(BaseModel):
  username: str = Field(..., min_length=3, max_length=50)
  email: EmailStr


class UserCreate(UserBase):
  password: str = Field(..., min_length=6)

  @field_validator('password')
  def password_complexity(cls, v: str) -> str:
    if not any(char.isdigit() for char in v):
      raise ValueError('Пароль должен содержать хотя бы одну цифру')
    if not any(char.isupper() for char in v):
      raise ValueError('Пароль должен содержать хотя бы одну заглавную букву')
    return v


class UserInDB(UserBase):
  id: int
  role: UserRole
  password_hash: str = Field(...)
  created_at: datetime

  model_config = ConfigDict(from_attributes=True, frozen=True)


class UserResponse(UserBase):
  id: int
  role: UserRole
  created_at: datetime

  model_config = ConfigDict(from_attributes=True, frozen=True)


# ------------------------------
# Схемы для модели Category
# ------------------------------
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


# ------------------------------
# Схемы для модели Product
# ------------------------------
class ProductBase(BaseModel):
  name: str = Field(..., min_length=3, max_length=200)
  category_id: int
  price: float = Field(..., ge=0)
  stock_quantity: int = Field(..., ge=0)
  description: Optional[str] = None


class ProductCreate(ProductBase):
  pass


class ProductUpdate(BaseModel):
  name: Optional[str] = Field(None, min_length=3, max_length=200)
  category_id: Optional[int] = None
  price: Optional[float] = Field(None, ge=0)
  stock_quantity: Optional[int] = Field(None, ge=0)
  description: Optional[str] = None


class ProductInDB(ProductBase):
  id: int
  created_at: datetime

  model_config = ConfigDict(from_attributes=True, frozen=True)


class ProductResponse(ProductInDB):
  category: Optional[CategoryResponse] = None
  model_config = ConfigDict(from_attributes=True)


# ------------------------------
# Схемы для модели OrderItem
# ------------------------------
class OrderItemBase(BaseModel):
  product_id: int
  quantity: int = Field(..., gt=0)
  price: float = Field(..., ge=0)


class OrderItemCreate(OrderItemBase):
  pass


class OrderItemUpdate(BaseModel):
  quantity: Optional[int] = Field(None, gt=0)


class OrderItemInDB(OrderItemBase):
  id: int
  order_id: int

  model_config = ConfigDict(from_attributes=True, frozen=True)


class OrderItemResponse(OrderItemInDB):
  product: Optional[ProductResponse] = None


# ------------------------------
# Схемы для модели Order
# ------------------------------
class OrderBase(BaseModel):
  user_id: int
  total_price: float = Field(..., ge=0)
  status: OrderStatus = OrderStatus.NEW  # По умолчанию "new"


class OrderCreate(BaseModel):
  user_id: int
  items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
  status: Optional[OrderStatus] = None


class OrderInDB(OrderBase):
  id: int
  created_at: datetime

  model_config = ConfigDict(from_attributes=True, frozen=True)


class OrderResponse(OrderInDB):
  items: List[OrderItemResponse] = []
  user: Optional[UserResponse] = None


# ------------------------------
# Схемы для модели Shipment
# ------------------------------
class ShipmentBase(BaseModel):
  order_id: int
  status: ShipmentStatus = ShipmentStatus.IN_TRANSIT  # По умолчанию "in_transit"
  tracking_number: Optional[str] = None
  carrier: Optional[str] = None


class ShipmentCreate(ShipmentBase):
  pass


class ShipmentUpdate(BaseModel):
  status: Optional[ShipmentStatus] = None
  tracking_number: Optional[str] = None
  carrier: Optional[str] = None


class ShipmentInDB(ShipmentBase):
  id: int
  created_at: datetime

  model_config = ConfigDict(from_attributes=True, frozen=True)


class ShipmentResponse(ShipmentInDB):
  order: Optional[OrderResponse] = None


# ------------------------------
# Схемы для модели Payment
# ------------------------------
class PaymentBase(BaseModel):
  order_id: int
  payment_method: PaymentMethod
  payment_status: PaymentStatus = PaymentStatus.PENDING
  transaction_id: Optional[str] = None


class PaymentCreate(PaymentBase):
  pass


class PaymentUpdate(BaseModel):
  payment_status: Optional[PaymentStatus] = None
  transaction_id: Optional[str] = None


class PaymentInDB(PaymentBase):
  id: int
  created_at: datetime

  model_config = ConfigDict(from_attributes=True, frozen=True)


class PaymentResponse(PaymentInDB):
  order: Optional[OrderResponse] = None


class PaymentListResponse(PaymentInDB):
  pass

# Схемы для Warehouse
class WarehouseType(str, Enum):
    WAREHOUSE = "warehouse"
    STORE = "store"

class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: str = Field(..., min_length=1, max_length=255)
    type: WarehouseType = Field(default=WarehouseType.WAREHOUSE)
    capacity: Optional[int] = Field(None, ge=0)
    manager_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(WarehouseBase):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    address: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[WarehouseType] = None

class WarehouseResponse(WarehouseBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Схемы для Stock
class StockBase(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = Field(..., ge=0)

class StockCreate(StockBase):
    pass

class StockUpdate(BaseModel):
    quantity: int = Field(..., ge=0)

class StockResponse(StockBase):
    id: int
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Схема для получения информации о количестве товара на складах
class WarehouseStockInfo(BaseModel):
    warehouse_id: int
    warehouse_name: str
    warehouse_type: WarehouseType
    warehouse_address: str
    quantity: int
    
    model_config = ConfigDict(from_attributes=True)

class ProductStockInfo(BaseModel):
    product_id: int
    total_quantity: int
    warehouses: List[WarehouseStockInfo]
    
    model_config = ConfigDict(from_attributes=True)

# Схемы для PriceHistory
class PriceHistoryBase(BaseModel):
    product_id: int
    price: float = Field(..., gt=0)

class PriceHistoryCreate(PriceHistoryBase):
    changed_by_id: Optional[int] = None

class PriceHistoryResponse(PriceHistoryBase):
    id: int
    changed_at: datetime
    changed_by_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# Схемы для StockMovement
class MovementType(str, Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"
    TRANSFER = "transfer"

class StockMovementBase(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = Field(..., gt=0)
    movement_type: MovementType
    source_warehouse_id: Optional[int] = None
    target_warehouse_id: Optional[int] = None
    note: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    created_by_id: Optional[int] = None

class StockMovementResponse(StockMovementBase):
    id: int
    created_at: datetime
    created_by_id: Optional[int] = None
    warehouse_name: Optional[str] = None
    source_warehouse_name: Optional[str] = None
    target_warehouse_name: Optional[str] = None
    created_by: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# Схемы для запросов на перемещение товаров между складами
class TransferRequest(BaseModel):
    product_id: int
    source_warehouse_id: int
    target_warehouse_id: int
    quantity: int = Field(..., gt=0)
    note: Optional[str] = None

# Схемы для обновления запасов товара на складе
class StockUpdateRequest(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int = Field(..., ge=0)