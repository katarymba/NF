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
    UniqueConstraint  # добавить этот импорт для ограничения уникальности
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum  # добавить импорт модуля enum
from app.database import Base


# ------------------------------
# 1. Пользователи (users)
# ------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Пример связи с заказами (один пользователь - много заказов)
    orders = relationship("Order", back_populates="user")


class Administrator(Base):
    __tablename__ = "administrators"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    full_name = Column(String(100), nullable=False)
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
    stock_quantity = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь с категорией (многие товары -> одна категория)
    category = relationship("Category", back_populates="products")
    # Пример связи с позициями заказа
    order_items = relationship("OrderItem", back_populates="product")
    
    # Добавляем новые отношения внутрь класса
    stocks = relationship("Stock", back_populates="product", cascade="all, delete-orphan")
    price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")
    movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")


# ------------------------------
# 3. Категории (categories)
# ------------------------------
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    parent_category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    # Связь на родительскую категорию (self-relationship)
    parent_category = relationship(
        "Category",
        remote_side=[id],
        backref="subcategories"
    )

    # Связь с товарами
    products = relationship("Product", back_populates="category")


# ------------------------------
# 4. Заказы (orders)
# ------------------------------
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_price = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), default="новый")  # (новый, обработан, отправлен, завершен и т.д.)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Связь с пользователем (много заказов -> один пользователь)
    user = relationship("User", back_populates="orders")

    # Связь с элементами заказа; добавляем каскадное удаление
    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )

    # Связь с платежами
    payments = relationship("Payment", back_populates="order")

    # Связь с доставками
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

    # Связь с заказом
    order = relationship("Order", back_populates="items")

    # Связь с товаром
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
    shipping_address = Column(String(255), nullable=False)
    tracking_number = Column(String(100), nullable=True)
    status = Column(String(50), default="в пути")  # (в пути, доставлено, отменено и т.д.)
    estimated_delivery = Column(DateTime, nullable=True)

    # Связь с заказом
    order = relationship("Order", back_populates="shipments")



class WarehouseType(str, enum.Enum):
    WAREHOUSE = "warehouse"
    STORE = "store"

class MovementType(str, enum.Enum):
    INCOMING = "incoming"
    OUTGOING = "outgoing"
    TRANSFER = "transfer"

class Warehouse(Base):
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    type = Column(Enum(WarehouseType), default=WarehouseType.WAREHOUSE, nullable=False)
    capacity = Column(Integer, nullable=True)
    manager_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Отношения
    stocks = relationship("Stock", back_populates="warehouse", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Warehouse {self.name}>"

class Stock(Base):
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Отношения
    product = relationship("Product", back_populates="stocks")
    warehouse = relationship("Warehouse", back_populates="stocks")
    
    # Уникальный индекс по комбинации товар-склад
    __table_args__ = (
        UniqueConstraint('product_id', 'warehouse_id', name='uix_product_warehouse'),
    )
    
    def __repr__(self):
        return f"<Stock product_id={self.product_id} warehouse_id={self.warehouse_id} quantity={self.quantity}>"

class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    price = Column(Float, nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Отношения
    product = relationship("Product", back_populates="price_history")
    changed_by = relationship("User")
    
    def __repr__(self):
        return f"<PriceHistory product_id={self.product_id} price={self.price}>"

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    target_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    note = Column(Text, nullable=True)
    
    # Отношения
    product = relationship("Product", back_populates="movements")
    warehouse = relationship("Warehouse", foreign_keys=[warehouse_id])
    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    target_warehouse = relationship("Warehouse", foreign_keys=[target_warehouse_id])
    created_by = relationship("User")
    
    def __repr__(self):
        return f"<StockMovement product_id={self.product_id} type={self.movement_type} quantity={self.quantity}>"

# Обновляем существующие модели, добавляя отношения

# Добавляем в класс Product
stocks = relationship("Stock", back_populates="product", cascade="all, delete-orphan")
price_history = relationship("PriceHistory", back_populates="product", cascade="all, delete-orphan")
movements = relationship("StockMovement", back_populates="product", cascade="all, delete-orphan")
