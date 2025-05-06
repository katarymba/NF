from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import traceback
import logging
from ..database import get_db
from ..models import Order
from ..schemas import OrderUpdate, OrderResponse

# Настраиваем логгер
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/orders",
    tags=["delivery"],
    responses={404: {"description": "Not found"}},
)

@router.get("", response_model=List[OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """
    Получение списка всех заказов для системы доставки
    """
    try:
        logger.info("Получение списка заказов для системы доставки")
        orders = db.query(Order).offset(skip).limit(limit).all()
        return orders
    except Exception as e:
        logger.error(f"Ошибка при получении списка заказов: {str(e)}")
        stack_trace = traceback.format_exc()
        logger.debug(f"Стек вызовов: {stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при получении списка заказов: {str(e)}"
        )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    """
    Получение информации о конкретном заказе по ID
    """
    try:
        logger.info(f"Получение информации о заказе с ID {order_id}")
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            logger.warning(f"Заказ с ID {order_id} не найден")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Заказ с ID {order_id} не найден"
            )
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении информации о заказе: {str(e)}")
        stack_trace = traceback.format_exc()
        logger.debug(f"Стек вызовов: {stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при получении информации о заказе: {str(e)}"
        )

@router.patch("/{order_id}", response_model=OrderResponse)
def update_order_partial(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Частичное обновление данных заказа (PATCH)
    """
    try:
        # Получаем информацию о пользователе (если доступна)
        username = "system"
        if request and hasattr(request.state, "user") and request.state.user:
            username = request.state.user.username
        
        logger.info(f"Пользователь {username} выполняет частичное обновление заказа с ID {order_id}")
        logger.info(f"Данные для обновления: {order_update.dict(exclude_unset=True)}")
        
        # Получаем заказ из базы данных
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            logger.warning(f"Заказ с ID {order_id} не найден при попытке обновления")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Заказ с ID {order_id} не найден"
            )
        
        # Обновляем только предоставленные поля
        update_data = order_update.dict(exclude_unset=True)
        
        # Логируем изменения для аудита
        for field, value in update_data.items():
            old_value = getattr(order, field, None)
            if old_value != value:
                logger.info(f"Обновление поля {field} заказа {order_id}: '{old_value}' -> '{value}'")
            
            # Установка нового значения
            setattr(order, field, value)
        
        # Добавляем timestamp обновления, если такое поле есть
        if hasattr(order, "updated_at"):
            order.updated_at = datetime.now()
        
        # Сохраняем изменения в базе данных
        db.commit()
        db.refresh(order)
        
        logger.info(f"Заказ с ID {order_id} успешно обновлен")
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении заказа: {str(e)}")
        stack_trace = traceback.format_exc()
        logger.debug(f"Стек вызовов: {stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при обновлении заказа: {str(e)}"
        )

@router.put("/{order_id}", response_model=OrderResponse)
def update_order_full(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Полное обновление данных заказа (PUT)
    """
    # Так как логика та же самая, мы используем ту же функцию,
    # что и для PATCH запроса
    return update_order_partial(order_id, order_update, db, request)

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: dict,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Обновление статуса заказа
    """
    try:
        # Создаем объект для обновления с полем status
        if "status" not in status_update:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Поле 'status' должно быть указано в запросе"
            )
        
        order_update = OrderUpdate(status=status_update["status"])
        
        # Используем существующую функцию для обновления
        return update_order_partial(order_id, order_update, db, request)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении статуса заказа: {str(e)}")
        stack_trace = traceback.format_exc()
        logger.debug(f"Стек вызовов: {stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при обновлении статуса заказа: {str(e)}"
        )

@router.patch("/{order_id}/courier", response_model=OrderResponse)
def update_order_courier(
    order_id: int,
    courier_update: dict,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Обновление информации о курьере для заказа
    """
    try:
        # Проверяем наличие необходимого поля
        if "courier_name" not in courier_update:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Поле 'courier_name' должно быть указано в запросе"
            )
        
        order_update = OrderUpdate(courier_name=courier_update["courier_name"])
        
        # Используем существующую функцию для обновления
        return update_order_partial(order_id, order_update, db, request)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении информации о курьере: {str(e)}")
        stack_trace = traceback.format_exc()
        logger.debug(f"Стек вызовов: {stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при обновлении информации о курьере: {str(e)}"
        )

@router.patch("/{order_id}/delivery-address", response_model=OrderResponse)
def update_delivery_address(
    order_id: int,
    address_update: dict,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Обновление адреса доставки заказа
    """
    try:
        # Проверяем наличие необходимого поля
        if "delivery_address" not in address_update:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Поле 'delivery_address' должно быть указано в запросе"
            )
        
        order_update = OrderUpdate(delivery_address=address_update["delivery_address"])
        
        # Используем существующую функцию для обновления
        return update_order_partial(order_id, order_update, db, request)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении адреса доставки: {str(e)}")
        stack_trace = traceback.format_exc()
        logger.debug(f"Стек вызовов: {stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при обновлении адреса доставки: {str(e)}"
        )