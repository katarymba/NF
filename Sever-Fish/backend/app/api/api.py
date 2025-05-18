# app/api/api.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List, Optional

# Импорт всех необходимых роутеров
from app.routers import auth, products, cart, orders, users

# Создание главного APIRouter для API gateway
api_router = APIRouter()

# Подключение всех роутеров
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])


@api_router.get("/", tags=["api"])
async def api_root() -> Dict[str, Any]:
    """
    Корневой эндпоинт API.
    Возвращает информацию о доступных эндпоинтах и статусе API.
    """
    return {
        "status": "online",
        "endpoints": {
            "auth": "/auth",
            "users": "/users",
            "products": "/products",
            "cart": "/cart",
            "orders": "/orders"
        }
    }


@api_router.get("/health", tags=["api"])
async def api_health() -> Dict[str, Any]:
    """
    Проверка работоспособности API.
    Используется API Gateway для проверки доступности сервиса.
    """
    return {
        "status": "healthy",
        "service": "Север-Рыба API"
    }