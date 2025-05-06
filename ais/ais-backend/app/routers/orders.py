from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import pandas as pd
import json
from io import BytesIO

from ..database import get_db
from ..models import Order, OrderItem, Payment, User, Product
from ..schemas import OrderWithPayment, OrderUpdate
from ..auth import get_current_user
from ..utils.excel import create_excel

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/with-payments", response_model=List[OrderWithPayment])
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


@router.get("/{order_id}/with-payment", response_model=OrderWithPayment)
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
    ).filter(
        Order.id == order_id
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    order_dict = result[0].__dict__
    order_dict.pop('_sa_instance_state', None)

    # Добавление информации о платеже
    order_dict['payment_method'] = result.payment_method
    order_dict['payment_status'] = result.payment_status
    order_dict['transaction_id'] = result.transaction_id
    order_dict['payment_created_at'] = result.payment_created_at

    # Добавление информации о пользователе, если клиента нет в заказе
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


# Добавляем новый эндпоинт для обновления данных доставки
@router.patch("/{order_id}", response_model=OrderWithPayment)
def update_order_delivery(
        order_id: int,
        order_update: OrderUpdate,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Обновление данных заказа, включая информацию о доставке
    """
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Обновляем только предоставленные поля
    update_data = order_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_order, key, value)

    try:
        db.commit()
        db.refresh(db_order)
        
        # Получаем обновленный заказ с информацией о платеже
        updated_order = get_order_with_payment(order_id, db, current_user)
        return updated_order
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при обновлении заказа: {str(e)}"
        )


@router.get("/export")
def export_orders(
        background_tasks: BackgroundTasks,
        format: str = Query("excel", description="Формат экспорта: excel или csv"),
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status: Optional[str] = None,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    """
    Экспорт заказов в Excel или CSV
    """
    # Построение базового запроса с учетом полей доставки
    query = db.query(
        Order.id,
        Order.user_id,
        Order.status,
        Order.total_price,
        Order.created_at,
        Order.delivery_address,
        Order.tracking_number,
        Order.courier_name,
        Order.estimated_delivery,
        Order.delivery_notes,
        Payment.payment_method,
        Payment.payment_status,
        Payment.transaction_id,
        Payment.created_at.label("payment_created_at"),
        User.email,
        User.phone,
        User.full_name.label("client_name")
    ).join(
        Payment,
        Order.id == Payment.order_id,
        isouter=True
    ).join(
        User,
        Order.user_id == User.id,
        isouter=True
    )

    # Применение фильтров
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)
    if status:
        query = query.filter(Order.status == status)

    # Получение результатов
    result = query.all()

    # Создание DataFrame с новыми полями доставки
    df = pd.DataFrame(result, columns=[
        'ID заказа', 'ID пользователя', 'Статус', 'Сумма', 'Дата создания', 
        'Адрес доставки', 'Трек-номер', 'Курьер', 'Ожидаемая дата доставки', 'Комментарий к доставке',
        'Способ оплаты', 'Статус оплаты', 'ID транзакции',
        'Дата оплаты', 'Email', 'Телефон', 'Клиент'
    ])

    # Форматирование данных
    df['Дата создания'] = df['Дата создания'].dt.strftime('%d.%m.%Y %H:%M')
    df['Дата оплаты'] = df['Дата оплаты'].dt.strftime('%d.%m.%Y %H:%M')
    df['Ожидаемая дата доставки'] = df['Ожидаемая дата доставки'].dt.strftime('%d.%m.%Y')

    # Замена статусов на русскоязычные
    status_map = {
        'pending': 'Ожидает обработки',
        'processing': 'В обработке',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен',
        'new': 'Новый',
        'processed': 'Обработан',
        'completed': 'Завершен'
    }
    df['Статус'] = df['Статус'].map(status_map)

    payment_status_map = {
        'pending': 'Ожидает оплаты',
        'processing': 'Обрабатывается',
        'completed': 'Оплачен',
        'failed': 'Ошибка оплаты'
    }
    df['Статус оплаты'] = df['Статус оплаты'].map(payment_status_map)

    # Создание файла нужного формата
    if format.lower() == "excel":
        output = BytesIO()
        df.to_excel(output, index=False, sheet_name='Заказы')
        output.seek(0)
        filename = f"orders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

        return create_excel(
            df,
            filename=filename,
            sheet_name="Заказы"
        )
    else:
        # По умолчанию CSV
        output = BytesIO()
        df.to_csv(output, index=False, encoding='utf-8-sig')
        output.seek(0)
        filename = f"orders_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

        return {
            "file_url": f"/downloads/{filename}",
            "message": "Экспорт успешно выполнен"
        }


# Добавляем эндпоинт API для использования на фронтенде
@router.get("/api/orders", tags=["api"])
def get_api_orders(
        skip: int = 0, 
        limit: int = 100, 
        db: Session = Depends(get_db)
):
    """
    Получение списка заказов для API фронтенда
    """
    orders = db.query(Order).offset(skip).limit(limit).all()
    
    # Подготавливаем ответ
    result = []
    for order in orders:
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "client_name": order.client_name,
            "total_price": order.total_price,
            "created_at": order.created_at.isoformat(),
            "status": order.status,
            "delivery_address": order.delivery_address,
            "contact_phone": order.contact_phone,
            "payment_method": order.payment_method,
            "tracking_number": order.tracking_number,
            "courier_name": order.courier_name,
            "delivery_notes": order.delivery_notes,
            "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None
        }
        
        # Обрабатываем order_items
        if order.order_items:
            try:
                order_items = json.loads(order.order_items)
                # Добавляем названия товаров
                for item in order_items:
                    product_id = item.get('product_id')
                    if product_id:
                        product = db.query(Product).filter(Product.id == product_id).first()
                        if product:
                            item['product_name'] = product.name
                order_dict["order_items"] = order_items
            except (json.JSONDecodeError, TypeError):
                order_dict["order_items"] = []
        else:
            order_dict["order_items"] = []
            
        result.append(order_dict)
    
    return result


@router.get("/api/orders/{order_id}", tags=["api"])
def get_api_order(order_id: int, db: Session = Depends(get_db)):
    """
    Получение заказа по ID для API фронтенда
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # Подготавливаем данные заказа
    order_dict = {
        "id": order.id,
        "user_id": order.user_id,
        "client_name": order.client_name,
        "total_price": order.total_price,
        "created_at": order.created_at.isoformat(),
        "status": order.status,
        "delivery_address": order.delivery_address,
        "contact_phone": order.contact_phone,
        "payment_method": order.payment_method,
        "tracking_number": order.tracking_number,
        "courier_name": order.courier_name,
        "delivery_notes": order.delivery_notes,
        "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None
    }
    
    # Обрабатываем order_items
    if order.order_items:
        try:
            order_items = json.loads(order.order_items)
            # Добавляем названия товаров
            for item in order_items:
                product_id = item.get('product_id')
                if product_id:
                    product = db.query(Product).filter(Product.id == product_id).first()
                    if product:
                        item['product_name'] = product.name
            order_dict["order_items"] = order_items
        except (json.JSONDecodeError, TypeError):
            order_dict["order_items"] = []
    else:
        order_dict["order_items"] = []
        
    return order_dict


@router.patch("/api/orders/{order_id}", tags=["api"])
def update_api_order(
    order_id: int, 
    order_update: OrderUpdate,
    db: Session = Depends(get_db)
):
    """
    Обновление данных заказа для API фронтенда
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # Обновляем только предоставленные поля
    update_data = order_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    
    try:
        db.commit()
        db.refresh(order)
        
        # Возвращаем обновленный заказ
        return get_api_order(order_id, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Произошла ошибка при обновлении заказа: {str(e)}"
        )