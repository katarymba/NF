from .base import (
    UserRole, AdministratorBase, AdministratorCreate, AdministratorLogin,
    AdministratorUpdate, AdministratorResponse, OrderStatus, PaymentMethod,
    PaymentStatus, ShipmentStatus, UserBase, UserCreate, UserInDB,
    UserResponse, CategoryBase, CategoryCreate, CategoryUpdate, CategoryInDB,
    CategoryResponse, ProductBase, ProductCreate, ProductUpdate, ProductInDB,
    ProductResponse, OrderItemBase, OrderItemCreate, OrderItemUpdate,
    OrderItemInDB, OrderItemResponse, OrderBase, OrderCreate, OrderUpdate,
    OrderInDB, OrderResponse, ShipmentBase, ShipmentCreate, ShipmentUpdate,
    ShipmentInDB, ShipmentResponse, PaymentBase, PaymentCreate, PaymentUpdate,
    PaymentInDB, PaymentResponse, PaymentListResponse
)

# Добавляем также вашу новую схему OrderWithPayment
from .orders import OrderWithPayment