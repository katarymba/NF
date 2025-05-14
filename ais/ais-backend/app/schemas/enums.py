from enum import Enum

# ------------------------------
# 1. Роли пользователей
# ------------------------------
<<<<<<< HEAD


=======
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"

<<<<<<< HEAD

# ------------------------------
# 2. Статусы заказов
# ------------------------------


=======
# ------------------------------
# 2. Статусы заказов
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class OrderStatus(str, Enum):
    NEW = "new"
    PROCESSED = "processed"
    SHIPPED = "shipped"
    COMPLETED = "completed"
    PENDING = "pending"
    PROCESSING = "processing"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

<<<<<<< HEAD

# ------------------------------
# 3. Методы оплаты
# ------------------------------


=======
# ------------------------------
# 3. Методы оплаты
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class PaymentMethod(str, Enum):
    CARD = "card"
    CASH = "cash"
    ONLINE_WALLET = "online_wallet"
    ONLINE_CARD = "online_card"
    SBP = "sbp"
    CASH_ON_DELIVERY = "cash_on_delivery"
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"

<<<<<<< HEAD

# ------------------------------
# 4. Статусы оплаты
# ------------------------------


=======
# ------------------------------
# 4. Статусы оплаты
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

<<<<<<< HEAD

# ------------------------------
# 5. Статусы доставки
# ------------------------------


class ShipmentMethod(str, Enum):
    COURIER = "courier"
    PICKUP = "pickup"
    EXPRESS = "express"
    STANDARD = "standard"
    POST = "post"


=======
# ------------------------------
# 5. Статусы доставки
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class ShipmentStatus(str, Enum):
    PREPARING = "preparing"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    RETURNED = "returned"

<<<<<<< HEAD

# ------------------------------
# 6. Статусы доставки (фронтенд)
# ------------------------------

=======
# ------------------------------
# 6. Статусы доставки (фронтенд)
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class DeliveryStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

<<<<<<< HEAD

# ------------------------------
# 7. Методы доставки
# ------------------------------


=======
# ------------------------------
# 7. Методы доставки
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class DeliveryMethod(str, Enum):
    COURIER = "courier"
    PICKUP = "pickup"
    EXPRESS = "express"
    STANDARD = "standard"
    POST = "post"

<<<<<<< HEAD

# ------------------------------
# 8. Статусы складских запасов
# ------------------------------


=======
# ------------------------------
# 8. Статусы складских запасов
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class StockStatus(str, Enum):
    IN_STOCK = "in-stock"
    LOW_STOCK = "low-stock"
    OUT_OF_STOCK = "out-of-stock"
    OVER_STOCK = "over-stock"

<<<<<<< HEAD

# ------------------------------
# 9. Типы движения товаров
# ------------------------------


=======
# ------------------------------
# 9. Типы движения товаров
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class MovementType(str, Enum):
    RECEIPT = "receipt"
    ISSUE = "issue"
    ADJUSTMENT = "adjustment"
    TRANSFER = "transfer"

<<<<<<< HEAD

# ------------------------------
# 10. Типы складов
# ------------------------------


=======
# ------------------------------
# 10. Типы складов
# ------------------------------
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
class WarehouseType(str, Enum):
    GENERAL = "general"
    FRIDGE = "fridge"
    FREEZER = "freezer"
    DISPLAY = "display"
    EXTERNAL = "external"
    WAREHOUSE = "WAREHOUSE"
    STORE = "STORE"
<<<<<<< HEAD


# ------------------------------
# 11. Cтатусы поставок
# ------------------------------


class SupplyStatus(str, Enum):
    PLANNED = "PLANNED"
    IN_TRANSIT = "IN_TRANSIT"
    RECEIVED = "RECEIVED"
    PROCESSED = "PROCESSED"
    CANCELLED = "CANCELLED"
=======
>>>>>>> b1b3b0565179e70862bbd7358ba4a46d0177d1d2
