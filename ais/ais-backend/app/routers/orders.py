from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import pandas as pd
import json
from io import BytesIO
import logging

from ..database import get_db
from ..models import Order, OrderItem, Payment, User, Product
from ..schemas import OrderWithPayment, OrderUpdate
from ..auth import get_current_user
from ..utils.excel import create_excel

# Настройка логирования
logger = logging.getLogger("orders-service")
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

router = APIRouter(tags=["orders"])


@router.get("", response_model=List[OrderWithPayment])
def get_orders_with_payments(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user),
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None
):
    """
    Получение списка заказов с информацией о платежах
    """
    query = db.query(
        Order,
        Payment.payment_method,
        Payment.payment_status,
        Payment.transaction_id,
        Payment.created_at.label("payment_created_at"),
        User.full_name,
        User.email,
        User.phone
    ).join(
        Payment,
        Order.id == Payment.order_id,
        isouter=True
    ).join(
        User,
        Order.user_id == User.id,
        isouter=True
    )

    if status:
        query = query.filter(Order.status == status)

    # Добавление пагинации
    result = query.offset(skip).limit(limit).all()

    # Преобразование результатов
    orders_with_payments = []
    for row in result:
        order_dict = row[0].__dict__
        order_dict.pop('_sa_instance_state', None)

        # Добавление информации о платеже
        order_dict['payment_method'] = row.payment_method
        order_dict['payment_status'] = row.payment_status
        order_dict['transaction_id'] = row.transaction_id
        order_dict['payment_created_at'] = row.payment_created_at

        # Добавление информации о пользователе, если клиента нет в заказе
        if not order_dict.get('client_name') and row.full_name:
            order_dict['client_name'] = row.full_name

        order_dict['email'] = row.email
        order_dict['phone'] = row.phone

        # Обработка order_items и добавление имен продуктов
        if order_dict.get('order_items'):
            try:
                order_items = json.loads(order_dict['order_items'])
                for item in order_items:
                    product_id = item.get('product_id')
                    if product_id:
                        product = db.query(Product).filter(Product.id == product_id).first()
                        if product:
                            item['product_name'] = product.name
                order_dict['order_items'] = order_items
            except (json.JSONDecodeError, TypeError):
                order_dict['order_items'] = []

        orders_with_payments.append(order_dict)

    return orders_with_payments


@router.get("/{order_id}", response_model=OrderWithPayment)
def get_order_with_payment(
        order_id: int,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Получение информации о конкретном заказе с данными платежа
    """
    result = db.query(
        Order,
        Payment.payment_method,
        Payment.payment_status,
        Payment.transaction_id,
        Payment.created_at.label("payment_created_at"),
        User.full_name,
        User.email,
        User.phone
    ).join(
        Payment,
        Order.id == Payment.order_id,
        isouter=True
    ).join(
        User,
        Order.user_id == User.id,
        isouter=True
    ).filter(Order.id == order_id).first()
    
    if not result:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    order_dict = result[0].__dict__
    order_dict.pop('_sa_instance_state', None)
    
    # Добавление информации о платеже
    order_dict['payment_method'] = result.payment_method
    order_dict['payment_status'] = result.payment_status
    order_dict['transaction_id'] = result.transaction_id
    order_dict['payment_created_at'] = result.payment_created_at
    
    # Добавление информации о пользователе
    if not order_dict.get('client_name') and result.full_name:
        order_dict['client_name'] = result.full_name
    
    order_dict['email'] = result.email
    order_dict['phone'] = result.phone
    
    # Обработка order_items и добавление имен продуктов
    if order_dict.get('order_items'):
        try:
            order_items = json.loads(order_dict['order_items'])
            for item in order_items:
                product_id = item.get('product_id')
                if product_id:
                    product = db.query(Product).filter(Product.id == product_id).first()
                    if product:
                        item['product_name'] = product.name
            order_dict['order_items'] = order_items
        except (json.JSONDecodeError, TypeError):
            order_dict['order_items'] = []
    
    return order_dict


@router.patch("/{order_id}", response_model=OrderWithPayment)
def update_order_partial(
        order_id: int,
        order_data: OrderUpdate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Частичное обновление заказа (PATCH)
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    # Обновляем только указанные поля
    order_data_dict = order_data.dict(exclude_unset=True)
    
    # Логирование изменений с указанием пользователя
    username = getattr(current_user, 'username', 'system')
    logger.info(f"Пользователь {username} обновляет заказ #{order_id}: {order_data_dict}")
    
    for key, value in order_data_dict.items():
        if hasattr(db_order, key):
            setattr(db_order, key, value)
    
    try:
        db.commit()
        db.refresh(db_order)
        logger.info(f"Заказ #{order_id} успешно обновлен пользователем {username}")
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении заказа #{order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")
    
    # Получаем обновленные данные заказа с платежной информацией
    return get_order_with_payment(order_id, db, current_user)


@router.put("/{order_id}", response_model=OrderWithPayment)
def update_order_full(
        order_id: int,
        order_data: OrderUpdate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Полное обновление заказа (PUT)
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail=f"Заказ #{order_id} не найден")
    
    # Обновляем все поля заказа
    order_data_dict = order_data.dict(exclude_unset=False)
    
    # Логирование изменений с указанием пользователя
    username = getattr(current_user, 'username', 'system')
    logger.info(f"Пользователь {username} полностью обновляет заказ #{order_id}")
    
    for key, value in order_data_dict.items():
        if hasattr(db_order, key):
            setattr(db_order, key, value)
    
    try:
        db.commit()
        db.refresh(db_order)
        logger.info(f"Заказ #{order_id} успешно обновлен пользователем {username}")
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении заказа #{order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка базы данных: {str(e)}")
    
    # Получаем обновленные данные заказа с платежной информацией
    return get_order_with_payment(order_id, db, current_user)