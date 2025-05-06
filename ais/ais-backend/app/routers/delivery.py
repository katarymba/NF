"""
Router for delivery management.
Created by: katarymba
Date: 2025-05-06 16:31:44
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.database import get_db
from app.models import Order, OrderItem, Product, User, Shipment, Payment
from app.schemas import (
    DeliveryUpdate, 
    DeliveryResponse, 
    CourierInfo,
    DeliveryStats,
    OrderDeliveryUpdate
)

# Настройка логирования
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/delivery",
    tags=["Delivery Management"],
)

@router.get("/orders", response_model=List[Dict[str, Any]])
async def get_delivery_orders(
    status: Optional[str] = Query(None, description="Фильтр по статусу заказа"),
    courier_name: Optional[str] = Query(None, description="Фильтр по имени курьера"),
    from_date: Optional[datetime] = Query(None, description="Дата с (YYYY-MM-DD)"),
    to_date: Optional[datetime] = Query(None, description="Дата по (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0, description="Пропустить записей"),
    limit: int = Query(100, ge=1, le=1000, description="Лимит записей"),
    db: Session = Depends(get_db)
):
    """
    Получение списка заказов для управления доставками с возможностью фильтрации
    """
    try:
        # Формируем запрос
        query = db.query(Order)
        
        # Применяем фильтры
        if status:
            query = query.filter(Order.status == status)
        
        if courier_name:
            query = query.filter(Order.courier_name == courier_name)
        
        if from_date:
            query = query.filter(Order.created_at >= from_date)
        
        if to_date:
            query = query.filter(Order.created_at <= to_date)
        
        # Получаем общее количество записей (для пагинации)
        total_count = query.count()
        
        # Применяем пагинацию и сортировку
        orders = query.order_by(desc(Order.created_at)).offset(skip).limit(limit).all()
        
        # Формируем расширенный ответ с дополнительной информацией
        result = []
        for order in orders:
            # Базовая информация о заказе
            order_data = {
                "id": order.id,
                "client_name": order.client_name or "Неизвестный клиент",
                "status": order.status,
                "total_price": order.total_price,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                
                # Информация о доставке
                "tracking_number": order.tracking_number,
                "courier_name": order.courier_name,
                "delivery_address": order.delivery_address,
                "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None,
                "delivery_notes": order.delivery_notes,
                "contact_phone": order.contact_phone,
                "payment_method": order.payment_method,
            }
            
            # Получаем элементы заказа
            order_items = []
            if order.order_items:  # Если используется JSON поле
                if isinstance(order.order_items, list):
                    order_items = order.order_items
                else:
                    # Если это строка или другой формат данных
                    try:
                        # Попытка преобразовать данные, если они не в формате списка
                        # Может потребоваться дополнительная обработка в зависимости от хранения данных
                        order_items = order.order_items
                    except Exception as e:
                        logger.warning(f"Ошибка при обработке order_items для заказа {order.id}: {e}")
            else:
                # Если используется отношение к таблице order_items
                order_items_from_db = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
                for item in order_items_from_db:
                    # Получаем название продукта для каждого элемента заказа
                    product = db.query(Product).filter(Product.id == item.product_id).first()
                    product_name = product.name if product else f"Продукт #{item.product_id}"
                    
                    order_items.append({
                        "product_id": item.product_id,
                        "product_name": product_name,
                        "quantity": item.quantity,
                        "price": item.price,
                        "subtotal": item.price * item.quantity
                    })
            
            order_data["order_items"] = order_items
            
            # Получаем пользователя, если есть
            if order.user_id:
                user = db.query(User).filter(User.id == order.user_id).first()
                if user:
                    order_data["user_info"] = {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "full_name": user.full_name,
                        "phone": user.phone
                    }
            
            result.append(order_data)
        
        # Возвращаем результат с мета-информацией для пагинации
        return {
            "items": result,
            "total": total_count,
            "page": skip // limit + 1 if limit > 0 else 1,
            "pages": (total_count + limit - 1) // limit if limit > 0 else 1,
            "limit": limit
        }
    
    except Exception as e:
        logger.error(f"Ошибка при получении списка заказов для доставки: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )


@router.get("/orders/{order_id}", response_model=Dict[str, Any])
async def get_delivery_order(
    order_id: int = Path(..., ge=1, description="ID заказа"),
    db: Session = Depends(get_db)
):
    """
    Получение детальной информации о заказе и его доставке
    """
    try:
        # Получаем заказ
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Заказ с ID {order_id} не найден"
            )
        
        # Формируем базовую информацию о заказе
        order_data = {
            "id": order.id,
            "client_name": order.client_name or "Неизвестный клиент",
            "status": order.status,
            "total_price": order.total_price,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            
            # Информация о доставке
            "tracking_number": order.tracking_number,
            "courier_name": order.courier_name,
            "delivery_address": order.delivery_address,
            "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None,
            "delivery_notes": order.delivery_notes,
            "contact_phone": order.contact_phone,
            "payment_method": order.payment_method,
        }
        
        # Получаем элементы заказа
        order_items = []
        if order.order_items:  # Если используется JSON поле
            if isinstance(order.order_items, list):
                order_items = order.order_items
            else:
                # Если это строка или другой формат данных
                try:
                    # Попытка преобразовать данные, если они не в формате списка
                    order_items = order.order_items
                except Exception as e:
                    logger.warning(f"Ошибка при обработке order_items для заказа {order.id}: {e}")
        else:
            # Если используется отношение к таблице order_items
            order_items_from_db = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            for item in order_items_from_db:
                # Получаем название продукта для каждого элемента заказа
                product = db.query(Product).filter(Product.id == item.product_id).first()
                product_name = product.name if product else f"Продукт #{item.product_id}"
                
                order_items.append({
                    "product_id": item.product_id,
                    "product_name": product_name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "subtotal": item.price * item.quantity
                })
        
        order_data["order_items"] = order_items
        
        # Получаем пользователя, если есть
        if order.user_id:
            user = db.query(User).filter(User.id == order.user_id).first()
            if user:
                order_data["user_info"] = {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "full_name": user.full_name,
                    "phone": user.phone
                }
        
        # Получаем информацию о доставке из Shipment, если есть
        shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
        if shipment:
            order_data["shipment"] = {
                "id": shipment.id,
                "status": shipment.status,
                "tracking_number": shipment.tracking_number,
                "estimated_delivery": shipment.estimated_delivery.isoformat() if shipment.estimated_delivery else None,
                "shipping_address": shipment.shipping_address
            }
        
        # Получаем информацию о платеже
        payment = db.query(Payment).filter(Payment.order_id == order_id).first()
        if payment:
            order_data["payment"] = {
                "id": payment.id,
                "payment_method": payment.payment_method,
                "payment_status": payment.payment_status,
                "transaction_id": payment.transaction_id,
                "created_at": payment.created_at.isoformat() if payment.created_at else None
            }
        
        return order_data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении информации о заказе {order_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )


@router.put("/orders/{order_id}", response_model=Dict[str, Any])
async def update_delivery_order(
    order_id: int = Path(..., ge=1, description="ID заказа"),
    delivery_update: OrderDeliveryUpdate = Body(...),
    db: Session = Depends(get_db)
):
    """
    Обновление информации о доставке заказа
    """
    try:
        # Получаем заказ
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Заказ с ID {order_id} не найден"
            )
        
        # Обновляем поля заказа, если они есть в запросе
        for key, value in delivery_update.dict(exclude_unset=True).items():
            if hasattr(order, key) and value is not None:
                setattr(order, key, value)
        
        # Обновляем информацию о доставке в таблице Shipment, если она есть
        shipment = db.query(Shipment).filter(Shipment.order_id == order_id).first()
        if shipment:
            # Синхронизируем поля между Order и Shipment
            if delivery_update.tracking_number is not None:
                shipment.tracking_number = delivery_update.tracking_number
            
            if delivery_update.status is not None:
                shipment.status = delivery_update.status
            
            if delivery_update.delivery_address is not None:
                shipment.shipping_address = delivery_update.delivery_address
            
            if delivery_update.estimated_delivery is not None:
                shipment.estimated_delivery = delivery_update.estimated_delivery
        else:
            # Создаем новую запись о доставке, если её нет
            new_shipment_data = {
                "order_id": order_id,
                "status": delivery_update.status or order.status,
                "tracking_number": delivery_update.tracking_number,
                "shipping_address": delivery_update.delivery_address,
                "estimated_delivery": delivery_update.estimated_delivery
            }
            # Убираем None значения
            new_shipment_data = {k: v for k, v in new_shipment_data.items() if v is not None}
            
            if new_shipment_data.get("tracking_number") or new_shipment_data.get("shipping_address"):
                new_shipment = Shipment(**new_shipment_data)
                db.add(new_shipment)
        
        # Сохраняем изменения
        db.commit()
        
        # Получаем обновленный заказ и формируем ответ
        db.refresh(order)
        
        # Базовая информация о заказе
        order_data = {
            "id": order.id,
            "client_name": order.client_name or "Неизвестный клиент",
            "status": order.status,
            "total_price": order.total_price,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            
            # Информация о доставке
            "tracking_number": order.tracking_number,
            "courier_name": order.courier_name,
            "delivery_address": order.delivery_address,
            "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None,
            "delivery_notes": order.delivery_notes,
            "contact_phone": order.contact_phone,
            "payment_method": order.payment_method,
        }
        
        return {
            "message": "Информация о доставке успешно обновлена",
            "order": order_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обновлении информации о доставке заказа {order_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )


@router.get("/stats", response_model=DeliveryStats)
async def get_delivery_stats(
    from_date: Optional[datetime] = Query(None, description="Дата с (YYYY-MM-DD)"),
    to_date: Optional[datetime] = Query(None, description="Дата по (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Получение статистики по доставкам
    """
    try:
        # Устанавливаем период по умолчанию (последние 30 дней)
        if not to_date:
            to_date = datetime.now()
        
        if not from_date:
            from_date = to_date - timedelta(days=30)
        
        # Запросы для статистики по статусам
        status_stats = db.query(
            Order.status,
            func.count(Order.id).label('count')
        ).filter(
            Order.created_at.between(from_date, to_date)
        ).group_by(Order.status).all()
        
        # Запрос для общего количества заказов
        total_orders = db.query(func.count(Order.id)).filter(
            Order.created_at.between(from_date, to_date)
        ).scalar()
        
        # Запрос для общего оборота
        total_revenue = db.query(func.sum(Order.total_price)).filter(
            Order.created_at.between(from_date, to_date)
        ).scalar() or 0
        
        # Запрос для средней стоимости заказа
        avg_order_value = db.query(func.avg(Order.total_price)).filter(
            Order.created_at.between(from_date, to_date)
        ).scalar() or 0
        
        # Статистика по курьерам
        courier_stats = db.query(
            Order.courier_name,
            func.count(Order.id).label('orders_count')
        ).filter(
            Order.created_at.between(from_date, to_date),
            Order.courier_name.isnot(None)
        ).group_by(Order.courier_name).all()
        
        # Формирование результата
        status_counts = {status: count for status, count in status_stats}
        courier_data = [
            {"name": name, "orders_count": count}
            for name, count in courier_stats if name
        ]
        
        return {
            "period": {
                "from_date": from_date.isoformat(),
                "to_date": to_date.isoformat()
            },
            "status_counts": status_counts,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "avg_order_value": float(avg_order_value),
            "courier_stats": courier_data
        }
    
    except Exception as e:
        logger.error(f"Ошибка при получении статистики по доставкам: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )


@router.get("/couriers", response_model=List[CourierInfo])
async def get_couriers(db: Session = Depends(get_db)):
    """
    Получение списка курьеров
    """
    try:
        # Получаем уникальных курьеров из базы данных
        courier_names = db.query(Order.courier_name).filter(
            Order.courier_name.isnot(None),
            Order.courier_name != ""
        ).distinct().all()
        
        # Формируем список курьеров
        couriers = []
        for name_tuple in courier_names:
            name = name_tuple[0]
            if name:  # Проверяем, что имя не пустое
                # Получаем количество заказов для этого курьера
                orders_count = db.query(func.count(Order.id)).filter(Order.courier_name == name).scalar()
                
                # Получаем последний заказ курьера
                last_order = db.query(Order).filter(Order.courier_name == name).order_by(desc(Order.created_at)).first()
                
                couriers.append({
                    "name": name,
                    "orders_count": orders_count,
                    "last_active": last_order.created_at if last_order else None
                })
        
        # Если в базе нет курьеров, добавляем дефолтный список
        if not couriers:
            default_couriers = [
                {"name": "Иванов И.И.", "orders_count": 0, "last_active": None},
                {"name": "Петров П.П.", "orders_count": 0, "last_active": None},
                {"name": "Сидоров С.С.", "orders_count": 0, "last_active": None},
                {"name": "Кузнецов К.К.", "orders_count": 0, "last_active": None},
                {"name": "Смирнов А.Н.", "orders_count": 0, "last_active": None}
            ]
            couriers.extend(default_couriers)
        
        return couriers
    
    except Exception as e:
        logger.error(f"Ошибка при получении списка курьеров: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Внутренняя ошибка сервера: {str(e)}"
        )