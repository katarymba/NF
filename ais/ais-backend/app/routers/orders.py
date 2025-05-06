from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import pandas as pd
from io import BytesIO

from ..database import get_db
from ..models import Order, OrderItem, Payment, User
from ..schemas import OrderWithPayment
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

    return order_dict


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
    # Построение базового запроса
    query = db.query(
        Order.id,
        Order.user_id,
        Order.status,
        Order.total_price,
        Order.created_at,
        Order.status,
        Payment.payment_method,
        Payment.payment_status,
        Payment.transaction_id,
        Payment.created_at.label("payment_created_at"),
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

    # Применение фильтров
    if start_date:
        query = query.filter(Order.created_at >= start_date)
    if end_date:
        query = query.filter(Order.created_at <= end_date)
    if status:
        query = query.filter(Order.status == status)

    # Получение результатов
    result = query.all()

    # Создание DataFrame
    df = pd.DataFrame(result, columns=[
        'ID заказа', 'ID пользователя', 'Клиент', 'Сумма', 'Дата создания', 'Статус',
        'Способ оплаты', 'Статус оплаты', 'ID транзакции',
        'Дата оплаты', 'Email', 'Телефон'
    ])

    # Форматирование данных
    df['Дата создания'] = df['Дата создания'].dt.strftime('%d.%m.%Y %H:%M')
    df['Дата оплаты'] = df['Дата оплаты'].dt.strftime('%d.%m.%Y %H:%M')

    # Замена статусов на русскоязычные
    status_map = {
        'pending': 'Ожидает обработки',
        'processing': 'В обработке',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен',
        'новый': 'Новый'
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