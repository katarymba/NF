from enum import Enum

# ------------------------------
# 1. Роли пользователей
# ------------------------------
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

# ------------------------------
# 2. Статусы заказов
# ------------------------------
class OrderStatus(str, Enum):
    NEW = "new"
    PROCESSED = "processed"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    PENDING = "pending"
    PROCESSING = "processing"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# ------------------------------
# 3. Методы оплаты
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
# 4. Статусы оплаты
# ------------------------------
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

# ------------------------------
# 5. Статусы доставки
# ------------------------------
class ShipmentStatus(str, Enum):
    PREPARING = "preparing"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    RETURNED = "returned"

# ------------------------------
# 6. Статусы доставки (фронтенд)
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
    WAREHOUSE = "WAREHOUSE"
    STORE = "STORE"
