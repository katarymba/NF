from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.schemas.order import OrderCreate, OrderUpdate, OrderWithPayment, OrderResponse
from app.crud.orders import (
    get_orders,
    get_user_orders,
    get_order_detail,
    create_order,
    update_order_status,
    update_order,
    get_orders_by_status,
    get_orders_stats
)
from app.services.logging_service import logger


class OrderService:
    @staticmethod
    def get_all_orders(db: Session):
        orders = get_orders(db)
        if orders is None:
            raise HTTPException(status_code=500, detail="Ошибка при получении заказов")
        return orders

    @staticmethod
    def get_orders_for_user(user_id: int, db: Session):
        orders = get_user_orders(user_id, db)
        if orders is None:
            raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов пользователя {user_id}")
        return orders

    @staticmethod
    def get_order(order_id: int, db: Session):
        order = get_order_detail(order_id, db)
        if order is None:
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        return order

    @staticmethod
    def create_new_order(order_data: OrderCreate, db: Session):
        order = create_order(order_data, db)
        if order is None:
            raise HTTPException(status_code=500, detail="Не удалось создать заказ")
        return order

    @staticmethod
    def update_order_status(order_id: int, status: str, db: Session):
        order = update_order_status(order_id, status, db)
        if order is None:
            raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа {order_id}")
        return order

    @staticmethod
    def update_order_details(order_id: int, data: dict, db: Session):
        order = update_order(order_id, data, db)
        if order is None:
            raise HTTPException(status_code=500, detail=f"Ошибка при обновлении данных заказа {order_id}")
        return order

    @staticmethod
    def get_orders_with_status(status: str, db: Session):
        orders = get_orders_by_status(status, db)
        if orders is None:
            raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов со статусом {status}")
        return orders

    @staticmethod
    def get_orders_statistics(db: Session):
        stats = get_orders_stats(db)
        if stats is None:
            raise HTTPException(status_code=500, detail="Ошибка при получении статистики заказов")
        return stats