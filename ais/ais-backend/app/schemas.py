from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, date
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
    phone: str = Field(..., min_length=5, max_length=20)


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
    # Добавляем статусы соответствующие фронтенду
    PENDING = "pending"
    PROCESSING = "processing"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# ------------------------------
# 3. Методы оплаты (если в БД хранятся на английском)
# ------------------------------
class PaymentMethod(str, Enum):
    CARD = "card"
    CASH = "cash"
    ONLINE_WALLET = "online_wallet"
    ONLINE_CARD = "online_card"
    SBP = "sbp"
    CASH_ON_DELIVERY = "cash_on_delivery"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"


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
# 6. Статусы доставки (соответствуют фронтенду)
# ------------------------------
class DeliveryStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing" 
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# ------------------------------
# 7. Методы доставки
# ------------------------------
class DeliveryMethod(str, Enum):
    COURIER = "courier"
    PICKUP = "pickup"
    EXPRESS = "express"
    STANDARD = "standard"
    POST = "post"


# ------------------------------
# 8. Статусы складских запасов
# ------------------------------
class StockStatus(str, Enum):
    IN_STOCK = "in-stock"
    LOW_STOCK = "low-stock"
    OUT_OF_STOCK = "out-of-stock"
    OVER_STOCK = "over-stock"


# ------------------------------
# 9. Типы движения товаров
# ------------------------------
class MovementType(str, Enum):
    RECEIPT = "receipt"
    ISSUE = "issue"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"


# ------------------------------
# 10. Типы складов
# ------------------------------
class WarehouseType(str, Enum):
    GENERAL = "general"
    FRIDGE = "fridge"
    FREEZER = "freezer"
    DISPLAY = "display"
    EXTERNAL = "external"


# ------------------------------
# Схемы для модели User
# ------------------------------
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=20)  # Добавлено обязательное поле phone
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)  # Добавлено опциональное поле full_name


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
    is_active: bool = True  # Добавлено поле is_active

    model_config = ConfigDict(from_attributes=True, frozen=True)


class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime
    is_active: bool  # Добавлено поле is_active

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
    sku: Optional[str] = None
    unit: Optional[str] = "кг"
    supplier: Optional[str] = None
    image_url: Optional[str] = None
    sr_sync: Optional[bool] = False
    sr_stock_quantity: Optional[int] = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    category_id: Optional[int] = None
    price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    supplier: Optional[str] = None
    sr_sync: Optional[bool] = None
    sr_stock_quantity: Optional[int] = None


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
    sr_stock_quantity: Optional[int] = None
    category_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ------------------------------
# Схемы для модели Warehouse
# ------------------------------
class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    address: Optional[str] = None
    type: Optional[WarehouseType] = WarehouseType.GENERAL
    capacity: Optional[int] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    address: Optional[str] = None
    type: Optional[WarehouseType] = None
    capacity: Optional[int] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None


class WarehouseInDB(WarehouseBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


class WarehouseResponse(WarehouseInDB):
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)


# ------------------------------
# Схемы для модели Stock
# ------------------------------
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


# ------------------------------
# Схемы для модели StockMovement
# ------------------------------
class StockMovementBase(BaseModel):
    product_id: str
    warehouse_id: str
    quantity: int
    previous_quantity: int
    movement_type: MovementType
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    performed_by: str
    notes: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementInDB(StockMovementBase):
    id: str
    product_name: str
    warehouse_name: str
    movement_date: str

    model_config = ConfigDict(from_attributes=True, frozen=True)


class StockMovementResponse(StockMovementInDB):
    model_config = ConfigDict(from_attributes=True)


# ------------------------------
# Схемы для модели ShipmentItem
# ------------------------------
class ShipmentItemBase(BaseModel):
    shipment_id: str
    product_id: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    warehouse_id: str
    is_received: bool = False


class ShipmentItemCreate(BaseModel):
    product_id: str
    quantity_ordered: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    warehouse_id: str


class ShipmentItemPatch(BaseModel):
    quantity_received: Optional[int] = None
    is_received: Optional[bool] = None
    received_date: Optional[str] = None
    notes: Optional[str] = None


class ShipmentItemInDB(ShipmentItemBase):
    id: str
    product_name: str
    quantity_received: Optional[int] = None
    received_date: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, frozen=True)


class ShipmentItemResponse(ShipmentItemInDB):
    model_config = ConfigDict(from_attributes=True)


# ------------------------------
# Обновленные схемы для модели Shipment
# ------------------------------
class ShipmentBase(BaseModel):
    supplier: str
    shipment_date: str
    expected_arrival_date: Optional[str] = None
    status: str = "planned"
    reference_number: Optional[str] = None
    created_by: str
    notes: Optional[str] = None


class ShipmentCreate(ShipmentBase):
    items: List[ShipmentItemCreate]


class ShipmentPatch(BaseModel):
    status: Optional[str] = None
    actual_arrival_date: Optional[str] = None
    updated_at: Optional[str] = None
    notes: Optional[str] = None


class ShipmentInDB(ShipmentBase):
    id: str
    created_at: str
    updated_at: str
    actual_arrival_date: Optional[str] = None
    items: List[ShipmentItemInDB]

    model_config = ConfigDict(from_attributes=True, frozen=True)


class ShipmentResponse(ShipmentInDB):
    model_config = ConfigDict(from_attributes=True)


# ------------------------------
# Схемы для модели OrderItem
# ------------------------------
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    price: float = Field(..., ge=0)
    product_name: Optional[str] = None  # Добавлено для названия товара


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
    user_id: Optional[int] = None
    client_name: Optional[str] = None
    total_price: float = Field(..., ge=0)
    status: str = "pending"  # По умолчанию "pending" для совместимости с фронтендом
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    payment_method: Optional[str] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


# Обновленная схема для обновления заказа с полями доставки
class OrderUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None


class OrderInDB(OrderBase):
    id: int
    created_at: datetime
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None
    order_items: Optional[str] = None  # JSON строка для хранения элементов заказа

    model_config = ConfigDict(from_attributes=True, frozen=True)


class OrderResponse(OrderInDB):
    items: Optional[List[OrderItemResponse]] = None
    user: Optional[UserResponse] = None
    order_items: Optional[List[Dict[str, Any]]] = None  # Обработанная версия JSON строки


# ------------------------------
# Схемы для управления доставками заказов
# ------------------------------
class OrderDeliveryUpdate(BaseModel):
    """Схема для обновления информации о доставке заказа"""
    status: Optional[str] = Field(None, description="Статус заказа")
    tracking_number: Optional[str] = Field(None, description="Трек-номер")
    courier_name: Optional[str] = Field(None, description="Имя курьера")
    delivery_address: Optional[str] = Field(None, description="Адрес доставки")
    contact_phone: Optional[str] = Field(None, description="Контактный телефон")
    delivery_notes: Optional[str] = Field(None, description="Примечания к доставке")
    estimated_delivery: Optional[date] = Field(None, description="Предполагаемая дата доставки")


class DeliveryUpdate(BaseModel):
    """Схема для обновления информации о доставке"""
    tracking_number: Optional[str] = Field(None, description="Трек-номер отправления")
    courier_name: Optional[str] = Field(None, description="Имя курьера")
    status: Optional[str] = Field(None, description="Статус доставки")
    estimated_delivery: Optional[Union[datetime, date]] = Field(None, description="Предполагаемая дата доставки")
    actual_delivery: Optional[Union[datetime, date]] = Field(None, description="Фактическая дата доставки")
    delivery_notes: Optional[str] = Field(None, description="Примечания к доставке")
    delivery_cost: Optional[float] = Field(None, description="Стоимость доставки")


class DeliveryResponse(BaseModel):
    """Схема для ответа с информацией о доставке"""
    id: int
    order_id: int
    status: str
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    delivery_notes: Optional[str] = None
    delivery_cost: Optional[float] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CourierInfo(BaseModel):
    """Информация о курьере"""
    name: str
    orders_count: int
    last_active: Optional[datetime] = None


class DeliveryStats(BaseModel):
    """Статистика по доставкам"""
    period: Dict[str, str]
    status_counts: Dict[str, int]
    total_orders: int
    total_revenue: float
    avg_order_value: float
    courier_stats: List[Dict[str, Any]]


# ------------------------------
# Схемы для модели Payment
# ------------------------------
class PaymentBase(BaseModel):
    order_id: int
    payment_method: str  # Используем строковое поле вместо enum для совместимости
    payment_status: str = "pending"  # По умолчанию "pending"
    transaction_id: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None


class PaymentInDB(PaymentBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, frozen=True)


class PaymentResponse(PaymentInDB):
    order: Optional[OrderResponse] = None


class PaymentListResponse(PaymentInDB):
    pass


# ------------------------------
# Схема для объединенных данных заказа и платежа
# ------------------------------
class OrderWithPayment(BaseModel):
    id: int
    user_id: Optional[int] = None
    client_name: Optional[str] = None
    total_price: float
    created_at: datetime
    status: str
    delivery_address: Optional[str] = None
    contact_phone: Optional[str] = None
    payment_method: Optional[str] = None
    # Добавляем поля доставки
    tracking_number: Optional[str] = None
    courier_name: Optional[str] = None
    delivery_notes: Optional[str] = None
    estimated_delivery: Optional[date] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_created_at: Optional[datetime] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    order_items: Optional[List[dict]] = None
    items: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(from_attributes=True)