# app/models/__init__.py

# Импортируем базовые классы
from app.database import Base, engine

# Определим классы моделей
from app.models.user import User
from app.models.product import Product, Category
from app.models.cart import CartItem
from app.models.order import Order, OrderItem

# Теперь определим отношения между моделями
# Это нужно делать после того, как все классы импортированы

# Base.metadata.create_all(bind=engine)