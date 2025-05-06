from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging
from app.database import get_db
from app.models import Order, OrderItem, Product, User, Stock, StockMovement, MovementType
from app.services.notifications import send_email_notification, send_sms_notification
from app.schemas import OrderStatus, OrderPriority, ShippingMethod

router = APIRouter()
logger = logging.getLogger("order-automation")

@router.post("/process-new-orders")
def process_new_orders(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Автоматическая обработка новых заказов:
    - Проверка наличия товаров
    - Распределение по складам
    - Подготовка документов для упаковки/отгрузки
    """
    # Получаем все новые заказы
    new_orders = db.query(Order).filter(
        Order.status == OrderStatus.NEW
    ).all()
    
    processed_count = 0
    failed_count = 0
    
    for order in new_orders:
        try:
            # Проверяем наличие всех товаров
            can_fulfill = True
            missing_items = []
            
            for item in order.items:
                # Проверяем общее наличие товара на всех складах
                total_available = db.query(
                    db.func.sum(Stock.quantity)
                ).filter(
                    Stock.product_id == item.product_id
                ).scalar() or 0
                
                if total_available < item.quantity:
                    can_fulfill = False
                    missing_items.append({
                        "product_id": item.product_id,
                        "name": item.product.name,
                        "requested": item.quantity,
                        "available": total_available
                    })
            
            if not can_fulfill:
                # Не можем выполнить заказ из-за нехватки товаров
                order.status = OrderStatus.PENDING
                order.notes = f"Недостаточно товаров на складе: {', '.join([f'{item['name']} (нужно: {item['requested']}, доступно: {item['available']})' for item in missing_items])}"
                
                # Отправляем уведомление менеджеру по закупкам
                background_tasks.add_task(
                    send_email_notification,
                    subject=f"Требуется пополнение запасов для заказа #{order.id}",
                    body=f"Для выполнения заказа #{order.id} требуется дополнительное количество следующих товаров:\n\n" +
                         "\n".join([f"- {item['name']}: нужно еще {item['requested'] - item['available']} шт." for item in missing_items]),
                    recipients=["procurement@sever-ryba.ru"]
                )
                
                failed_count += 1
                continue
            
            # Автоматически распределяем товары по ближайшим к клиенту складам
            # (В реальной системе здесь был бы алгоритм для определения оптимального склада)
            # Для примера используем простой подход - берем со склада с наибольшим количеством
            
            for item in order.items:
                # Находим склад с наибольшим количеством этого товара
                best_stock = db.query(Stock).filter(
                    Stock.product_id == item.product_id,
                    Stock.quantity >= item.quantity
                ).order_by(Stock.quantity.desc()).first()
                
                if best_stock:
                    # Резервируем товар на этом складе
                    best_stock.quantity -= item.quantity
                    
                    # Создаем запись о движении товара
                    movement = StockMovement(
                        product_id=item.product_id,
                        warehouse_id=best_stock.warehouse_id,
                        quantity=item.quantity,
                        movement_type=MovementType.SALE,
                        note=f"Списание по заказу #{order.id}"
                    )
                    db.add(movement)
                    
                    # Обновляем информацию об источнике товара для заказа
                    item.source_warehouse_id = best_stock.warehouse_id
            
            # Обновляем статус заказа
            order.status = OrderStatus.PROCESSING
            order.updated_at = datetime.now()
            
            # Определяем приоритет заказа
            if order.total_price > 50000:  # Крупные заказы - высокий приоритет
                order.priority = OrderPriority.HIGH
            elif order.created_at < (datetime.now() - timedelta(days=3)):  # Старые заказы - средний
                order.priority = OrderPriority.MEDIUM
            else:
                order.priority = OrderPriority.NORMAL
            
            # Подготавливаем документы
            # (здесь была бы логика генерации накладных, счетов и т.д.)
            
            # Отправляем уведомление клиенту
            if order.user and order.user.email:
                background_tasks.add_task(
                    send_email_notification,
                    subject=f"Ваш заказ #{order.id} в обработке",
                    body=f"Уважаемый {order.user.name}!\n\nВаш заказ #{order.id} на сумму {order.total_price} руб. принят в обработку. Ожидаемая дата отправки: {datetime.now() + timedelta(days=1)}.\n\nСпасибо за покупку!\nКоманда Север-Рыба",
                    recipients=[order.user.email]
                )
            
            if order.user and order.user.phone:
                background_tasks.add_task(
                    send_sms_notification,
                    phone=order.user.phone,
                    message=f"Ваш заказ #{order.id} на сумму {order.total_price} руб. принят в обработку. Север-Рыба."
                )
            
            processed_count += 1
            
        except Exception as e:
            logger.error(f"Ошибка при обработке заказа #{order.id}: {str(e)}")
            failed_count += 1
    
    # Сохраняем все изменения
    db.commit()
    
    return {
        "message": "Автоматическая обработка заказов завершена",
        "processed_count": processed_count,
        "failed_count": failed_count
    }

@router.post("/prepare-shipping-documents/{order_id}")
def prepare_shipping_documents(
    order_id: int,
    db: Session = Depends(get_db)
):
    """
    Автоматическая подготовка документов для отгрузки
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # Проверяем статус заказа
    if order.status not in [OrderStatus.PROCESSING, OrderStatus.READY]:
        raise HTTPException(status_code=400, detail=f"Невозможно подготовить документы для заказа в статусе {order.status}")
    
    # Генерируем документы (здесь была бы логика генерации PDF)
    documents = {
        "invoice": f"INV-{order.id}-{datetime.now().strftime('%Y%m%d')}",
        "packing_list": f"PCK-{order.id}-{datetime.now().strftime('%Y%m%d')}",
        "shipping_label": f"SHP-{order.id}-{datetime.now().strftime('%Y%m%d')}"
    }
    
    # В реальной системе здесь бы сохранялись ссылки на созданные документы
    order.documents = documents
    order.status = OrderStatus.READY
    order.updated_at = datetime.now()
    
    # Сохраняем изменения
    db.commit()
    
    return {
        "message": "Документы для отгрузки подготовлены",
        "order_id": order.id,
        "documents": documents
    }

@router.post("/schedule-deliveries")
def schedule_deliveries(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Автоматическое планирование доставок и группировка заказов
    """
    # Получаем все заказы готовые к отправке
    ready_orders = db.query(Order).filter(
        Order.status == OrderStatus.READY,
        Order.shipping_method.in_([ShippingMethod.COURIER, ShippingMethod.COMPANY_DELIVERY])
    ).all()
    
    # Группируем заказы по районам доставки
    delivery_groups = {}
    
    for order in ready_orders:
        # Получаем район доставки из адреса
        # В реальной системе здесь был бы более сложный алгоритм геокодирования
        delivery_area = order.shipping_address.split(",")[-2].strip() if order.shipping_address else "Unknown"
        
        if delivery_area not in delivery_groups:
            delivery_groups[delivery_area] = []
        
        delivery_groups[delivery_area].append(order)
    
    # Планируем маршруты доставки
    delivery_routes = []
    
    for area, orders in delivery_groups.items():
        # Сортируем заказы по приоритету и времени создания
        sorted_orders = sorted(
            orders,
            key=lambda o: (
                -1 if o.priority == OrderPriority.HIGH else 0 if o.priority == OrderPriority.MEDIUM else 1,
                o.created_at
            )
        )
        
        # В реальной системе здесь был бы алгоритм оптимизации маршрута
        # Для примера просто создаем последовательный маршрут
        
        route = {
            "delivery_area": area,
            "order_count": len(sorted_orders),
            "orders": [{"id": o.id, "address": o.shipping_address} for o in sorted_orders],
            "estimated_start": datetime.now() + timedelta(days=1),  # Планируем на завтра
            "estimated_end": datetime.now() + timedelta(days=1, hours=len(sorted_orders))  # Примерно 1 час на заказ
        }
        
        delivery_routes.append(route)
        
        # Обновляем статусы заказов
        for order in sorted_orders:
            order.status = OrderStatus.SHIPPING
            order.updated_at = datetime.now()
            order.shipping_date = route["estimated_start"]
            order.estimated_delivery = route["estimated_end"]
            
            # Отправляем уведомления клиентам
            if order.user and order.user.email:
                background_tasks.add_task(
                    send_email_notification,
                    subject=f"Ваш заказ #{order.id} готов к доставке",
                    body=f"Уважаемый {order.user.name}!\n\nВаш заказ #{order.id} готовится к отправке. Ожидаемая дата доставки: {order.estimated_delivery.strftime('%d.%m.%Y')}.\n\nСпасибо за покупку!\nКоманда Север-Рыба",
                    recipients=[order.user.email]
                )
    
    # Сохраняем изменения
    db.commit()
    
    return {
        "message": "Маршруты доставки запланированы",
        "delivery_routes": delivery_routes,
        "total_orders": sum(len(route["orders"]) for route in delivery_routes)
    }