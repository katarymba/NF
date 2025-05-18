from fastapi import APIRouter, HTTPException, Depends, Path, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.services.logging_service import logger
from app.services.orders_service import OrderService
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderWithPayment, OrderInDB
from app.routers.auth import get_current_user, get_current_user_optional

# Создаем роутер для заказов
router = APIRouter(tags=["Orders"])

router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
    responses={404: {"description": "Заказ не найден"}},
)


# Получить все заказы
@router.get("/", response_model=List[OrderWithPayment])
def get_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получить все заказы в системе"""
    try:
        return OrderService.get_all_orders(db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении всех заказов: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов: {str(e)}")


# Получить все заказы пользователя
@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получить заказы конкретного пользователя"""
    try:
        return OrderService.get_orders_for_user(user_id, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении заказов пользователя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов пользователя: {str(e)}")


# Получить детали заказа
@router.get("/{order_id}", response_model=OrderWithPayment)
def get_order_detail(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получить подробную информацию о заказе по его ID"""
    try:
        return OrderService.get_order(order_id, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказа: {str(e)}")


# Получить детали заказа (для совместимости)
@router.get("/detail/{order_id}", response_model=OrderWithPayment)
def get_order_detail_compat(order_id: int, db: Session = Depends(get_db),
                            current_user=Depends(get_current_user_optional)):
    """Альтернативный эндпоинт для получения информации о заказе (для совместимости)"""
    return get_order_detail(order_id, db, current_user)


# Создать новый заказ
@router.post("/", response_model=OrderResponse)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db),
                 current_user=Depends(get_current_user_optional)):
    """Создать новый заказ"""
    try:
        return OrderService.create_new_order(order_data, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при создании заказа: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при создании заказа: {str(e)}")


# Обновление статуса заказа
@router.patch("/{order_id}/status", response_model=OrderWithPayment)
def update_order_status(
        data: dict,
        order_id: int = Path(...),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user_optional)
):
    """Обновить статус заказа"""
    try:
        status = data.get("status")
        if not status:
            raise HTTPException(status_code=400, detail="Статус не указан")

        return OrderService.update_order_status(order_id, status, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обновлении статуса заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа: {str(e)}")


# Обновление данных заказа
@router.patch("/{order_id}", response_model=OrderWithPayment)
def update_order(
        order_id: int,
        data: dict,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user_optional)
):
    """Обновить детали заказа"""
    try:
        return OrderService.update_order_details(order_id, data, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обновлении данных заказа {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении данных заказа: {str(e)}")


# Получение заказов по статусу
@router.get("/status/{status}", response_model=List[OrderWithPayment])
def get_orders_by_status(
        status: str = Path(...),
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user_optional)
):
    """Получить все заказы с указанным статусом"""
    try:
        return OrderService.get_orders_with_status(status, db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении заказов со статусом {status}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов по статусу: {str(e)}")


# Получить статистику по заказам
@router.get("/stats", response_model=Dict[str, Dict[str, Any]])
def get_orders_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    """Получение статистики по заказам в разрезе статусов"""
    try:
        return OrderService.get_orders_statistics(db)
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Неожиданная ошибка при получении статистики заказов: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")