from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    Text,
    DateTime,
    Float,
    Enum,
    Date,
    Boolean,
    JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


# ------------------------------
# 1. Пользователи (users)
# ------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime)
    role = Column(String(20), default="user", nullable=False)
    phone = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    birthday = Column(DateTime, nullable=True)

    # Связи
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")


class Administrator(Base):
    __tablename__ = "administrators"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="admin", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    permissions = Column(String(255), nullable=True)
    position = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)


# ------------------------------
# 2. Товары (products)
# ------------------------------
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    # Связи
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product")
    stocks = relationship("Stock", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")


# ------------------------------
# 3. Категории (categories)
# ------------------------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    parent_category_id = Column(Integer, nullable=True)

    # Связи
    products = relationship("Product", back_populates="category")


# ------------------------------
# 4. Заказы (orders) - Объединено из обоих файлов
# ------------------------------
class Order(Base):
    """
    Модель заказа в системе
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    client_name = Column(String(255), nullable=True)
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="pending")
    delivery_address = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    payment_method = Column(String(50), nullable=True)  
    
    # Поля для доставки
    tracking_number = Column(String(50), nullable=True)
    courier_name = Column(String(100), nullable=True)
    delivery_notes = Column(Text, nullable=True)
    estimated_delivery = Column(Date, nullable=True)

    # Отношение к элементам заказа - может быть JSONField
    order_items = Column(JSON, nullable=True)

    # Связи
    user = relationship("User", back_populates="orders")
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )
    payments = relationship("Payment", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")


# ------------------------------
# 5. Элементы заказа (order_items)
# ------------------------------
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    # Связи
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


# ------------------------------
# 6. Платежи (payments)
# ------------------------------
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_status = Column(String(50), default="pending")
    transaction_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь с заказом
    order = relationship("Order", back_populates="payments")


# ------------------------------
# 7. Доставка (shipments)
# ------------------------------
class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    shipping_address = Column(String(255), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    status = Column(String(50), default="pending")
    estimated_delivery = Column(DateTime, nullable=True)

    # Связь с заказом
    order = relationship("Order", back_populates="shipments")


# ------------------------------
# 8. Корзина покупок (cart_items)
# ------------------------------
class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)

    # Связи
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


# ------------------------------
# 9. История цен (price_history)
# ------------------------------
class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    price = Column(Float, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    changed_by_id = Column(Integer, nullable=True)

    # Связь с товаром
    product = relationship("Product", back_populates="price_history")


# ------------------------------
# 10. Склады (warehouses)
# ------------------------------
class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=True)
    type = Column(String(50), nullable=True)
    capacity = Column(Integer, nullable=True)
    manager_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    # Связи
    stocks = relationship("Stock", back_populates="warehouse")
    source_movements = relationship("StockMovement", foreign_keys="StockMovement.source_warehouse_id",
                                    back_populates="source_warehouse")
    target_movements = relationship("StockMovement", foreign_keys="StockMovement.target_warehouse_id",
                                    back_populates="target_warehouse")


# ------------------------------
# 11. Склады товаров (stocks)
# ------------------------------
class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Связи
    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")


# ------------------------------
# 12. Движение товаров (stock_movements)
# ------------------------------
class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    movement_type = Column(String(50), nullable=False)  # receipt, shipment, transfer, adjustment
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    target_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)

    # Связи
    product = relationship("Product", back_populates="stock_movements")
    warehouse = relationship("Warehouse", foreign_keys=[warehouse_id])
    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id], back_populates="source_movements")
    target_warehouse = relationship("Warehouse", foreign_keys=[target_warehouse_id], back_populates="target_movements")