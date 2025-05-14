# app/models/enums.py
from enum import Enum, auto


class SupplyStatus(str, Enum):
    """Статусы поставок"""
    PLANNED = "planned"
    IN_TRANSIT = "in-transit"
    RECEIVED = "received"
    PROCESSED = "processed"
    CANCELLED = "cancelled"


class StockMovementType(str, Enum):
    """Типы движения запасов"""
    RECEIPT = "receipt"          # Поступление товара
    SALE = "sale"                # Продажа
    ADJUSTMENT = "adjustment"    # Корректировка
    TRANSFER = "transfer"        # Перемещение
    RETURN = "return"            # Возврат
    WRITE_OFF = "write-off"      # Списание
    INVENTORY = "inventory"      # Инвентаризация


class OrderStatus(str, Enum):
    """Статусы заказов"""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    RETURNED = "returned"


class PaymentStatus(str, Enum):
    """Статусы платежей"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class ShipmentStatus(str, Enum):
    """Статусы отправлений"""
    PROCESSING = "processing"
    READY_FOR_PICKUP = "ready-for-pickup"
    IN_TRANSIT = "in-transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class UserRole(str, Enum):
    """Роли пользователей"""
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    CUSTOMER = "customer"


class DeliveryType(str, Enum):
    """Типы доставки"""
    COURIER = "courier"
    PICKUP = "pickup"
    POST = "post"
    EXPRESS = "express"