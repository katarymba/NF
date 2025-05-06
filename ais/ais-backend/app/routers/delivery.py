from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
from datetime import datetime

from app.database import get_db
from app.models import Order
from app.schemas import DeliveryStatus, CourierInfo, OrderUpdate

# Настройка логирования
logger = logging.getLogger("delivery-service")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

router = APIRouter(tags=["delivery"])

@router.get("", response_model=List[dict])
def get_all_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[DeliveryStatus] = None
):
    """
    Получить список всех заказов с фильтрацией по статусу доставки
    """
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.offset(skip).limit(limit).all()
    
    # Преобразуем ORM объекты в словари для ответа
    result = []
    for order in orders:
        order_dict = {
            "id": order.id,
            "created_at": order.created_at,
            "status": order.status,
            "client_name": order.client_name,
            "client_address": order.client_address,
            "courier_name": order.courier_name,
            "delivery_date": order.delivery_date,
            "delivery_notes": order.delivery_notes
        }
        result.append(order_dict)
    
    return result

@router.get("/{order_id}", response_model=dict)
def get_order(order_id: int, db: Session = Depends(get_db)):
    """
    Получить информацию о конкретном заказе по ID
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    return {
        "id": order.id,
        "created_at": order.created_at,
        "status": order.status,
        "client_name": order.client_name,
        "client_address": order.client_address,
        "courier_name": order.courier_name,
        "delivery_date": order.delivery_date,
        "delivery_notes": order.delivery_notes
    }

@router.put("/{order_id}", response_model=dict)
def update_order_full(order_id: int, order_data: OrderUpdate, db: Session = Depends(get_db)):
    """
    Полное обновление заказа (PUT)
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    # Обновляем все поля заказа
    for key, value in order_data.dict(exclude_unset=False).items():
        setattr(db_order, key, value)
    
    # Логирование изменений
    logger.info(f"Заказ #{order_id} полностью обновлен")
    
    try:
        db.commit()
        db.refresh(db_order)
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении заказа #{order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")
    
    return {
        "id": db_order.id,
        "created_at": db_order.created_at,
        "status": db_order.status,
        "client_name": db_order.client_name,
        "client_address": db_order.client_address,
        "courier_name": db_order.courier_name,
        "delivery_date": db_order.delivery_date,
        "delivery_notes": db_order.delivery_notes
    }

@router.patch("/{order_id}", response_model=dict)
def update_order_partial(order_id: int, order_data: OrderUpdate, db: Session = Depends(get_db)):
    """
    Частичное обновление заказа (PATCH)
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    # Обновляем только указанные поля
    order_data_dict = order_data.dict(exclude_unset=True)
    
    # Логирование изменений
    logger.info(f"Обновление заказа #{order_id}: {order_data_dict}")
    
    for key, value in order_data_dict.items():
        if hasattr(db_order, key):
            setattr(db_order, key, value)
    
    try:
        db.commit()
        db.refresh(db_order)
        logger.info(f"Заказ #{order_id} успешно обновлен")
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении заказа #{order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")
    
    return {
        "id": db_order.id,
        "created_at": db_order.created_at,
        "status": db_order.status,
        "client_name": db_order.client_name,
        "client_address": db_order.client_address,
        "courier_name": db_order.courier_name,
        "delivery_date": db_order.delivery_date,
        "delivery_notes": db_order.delivery_notes
    }

@router.post("/{order_id}/assign-courier", response_model=dict)
def assign_courier(order_id: int, courier_info: CourierInfo, db: Session = Depends(get_db)):
    """
    Назначить курьера для доставки заказа
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    # Обновляем информацию о курьере
    db_order.courier_name = courier_info.courier_name
    db_order.delivery_notes = courier_info.delivery_notes
    
    # Если заказ в статусе "pending", меняем на "processing"
    if db_order.status == "pending":
        db_order.status = "processing"
    
    try:
        db.commit()
        db.refresh(db_order)
        logger.info(f"Курьер {courier_info.courier_name} назначен для заказа #{order_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при назначении курьера для заказа #{order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")
    
    return {
        "id": db_order.id,
        "status": db_order.status,
        "courier_name": db_order.courier_name,
        "delivery_notes": db_order.delivery_notes
    }

@router.post("/{order_id}/update-status", response_model=dict)
def update_order_status(order_id: int, status_data: dict, db: Session = Depends(get_db)):
    """
    Обновить статус заказа
    """
    if "status" not in status_data:
        raise HTTPException(status_code=400, detail="Поле 'status' обязательно")
    
    new_status = status_data["status"]
    
    # Валидация статуса
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Недопустимый статус. Допустимые значения: {', '.join(valid_statuses)}"
        )
    
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    # Логирование изменения статуса
    logger.info(f"Изменение статуса заказа #{order_id} с '{db_order.status}' на '{new_status}'")
    
    # Обновляем статус
    db_order.status = new_status
    
    # Если статус "delivered", устанавливаем дату доставки
    if new_status == "delivered" and not db_order.delivery_date:
        db_order.delivery_date = datetime.now()
    
    try:
        db.commit()
        db.refresh(db_order)
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении статуса заказа #{order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")
    
    return {
        "id": db_order.id,
        "status": db_order.status,
        "delivery_date": db_order.delivery_date
    }