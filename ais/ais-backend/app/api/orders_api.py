from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session

# Импортируем правильные модули в соответствии с вашей структурой проекта
from ..database import get_db  # Корректируем путь к вашей функции get_db
from ..services.logging_service import logger  # Корректируем путь к вашему логгеру

# Создаем роутер для заказов
router = APIRouter()

# Модели данных
class OrderItem(BaseModel):
    id: int
    name: str
    quantity: int
    price: float

class OrderUpdate(BaseModel):
    status: str

class Order(BaseModel):
    id: int
    customer_name: str
    status: str
    total_amount: float
    created_at: datetime
    tracking_number: Optional[str] = None
    delivery_address: Optional[str] = None
    estimated_delivery: Optional[str] = None
    contact_phone: Optional[str] = None
    payment_method: Optional[str] = None
    delivery_notes: Optional[str] = None
    courier_name: Optional[str] = None
    items: Optional[List[OrderItem]] = None

# Получение всех заказов
@router.get("/orders", response_model=List[Order])
def get_orders(db: Session = Depends(get_db)):
    try:
        logger.info("Запрос на получение всех заказов")
        # SQL запрос для получения заказов с дополнительной информацией
        query = text("""
        SELECT 
            o.id, 
            u.fullname as customer_name, 
            o.status, 
            o.total_amount, 
            o.created_at,
            s.tracking_number,
            s.delivery_address,
            s.estimated_delivery_date as estimated_delivery,
            u.phone as contact_phone,
            p.payment_method,
            s.delivery_notes,
            s.courier_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN shipments s ON o.id = s.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        ORDER BY o.created_at DESC
        """)
        
        orders_result = db.execute(query).fetchall()
        
        if not orders_result:
            logger.info("Заказы не найдены")
            return []
        
        orders = []
        for order_row in orders_result:
            # Преобразуем результат SQL в словарь
            order_dict = {
                "id": order_row.id,
                "customer_name": order_row.customer_name if order_row.customer_name else "Неизвестный клиент",
                "status": order_row.status,
                "total_amount": float(order_row.total_amount),
                "created_at": order_row.created_at,
                "tracking_number": order_row.tracking_number,
                "delivery_address": order_row.delivery_address,
                "estimated_delivery": order_row.estimated_delivery.isoformat() if order_row.estimated_delivery else None,
                "contact_phone": order_row.contact_phone,
                "payment_method": order_row.payment_method,
                "delivery_notes": order_row.delivery_notes,
                "courier_name": order_row.courier_name
            }
            
            # Получение товаров заказа
            items_query = text("""
            SELECT 
                oi.id,
                p.name,
                oi.quantity,
                oi.price
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = :order_id
            """)
            
            items_result = db.execute(items_query, {"order_id": order_row.id}).fetchall()
            
            items = []
            for item_row in items_result:
                items.append({
                    "id": item_row.id,
                    "name": item_row.name,
                    "quantity": item_row.quantity,
                    "price": float(item_row.price)
                })
            
            order_dict["items"] = items
            orders.append(Order(**order_dict))
        
        logger.info(f"Найдено {len(orders)} заказов")
        return orders
    
    except Exception as e:
        logger.error(f"Ошибка при получении данных из базы: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении данных из базы: {str(e)}")

# Получение одного заказа по ID
@router.get("/orders/{order_id}", response_model=Order)
def get_order(order_id: int = Path(...), db: Session = Depends(get_db)):
    try:
        logger.info(f"Запрос на получение заказа с ID {order_id}")
        query = text("""
        SELECT 
            o.id, 
            u.fullname as customer_name, 
            o.status, 
            o.total_amount, 
            o.created_at,
            s.tracking_number,
            s.delivery_address,
            s.estimated_delivery_date as estimated_delivery,
            u.phone as contact_phone,
            p.payment_method,
            s.delivery_notes,
            s.courier_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN shipments s ON o.id = s.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = :order_id
        """)
        
        order_row = db.execute(query, {"order_id": order_id}).fetchone()
        
        if not order_row:
            logger.warning(f"Заказ с ID {order_id} не найден")
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        
        # Преобразуем результат SQL в словарь
        order_dict = {
            "id": order_row.id,
            "customer_name": order_row.customer_name if order_row.customer_name else "Неизвестный клиент",
            "status": order_row.status,
            "total_amount": float(order_row.total_amount),
            "created_at": order_row.created_at,
            "tracking_number": order_row.tracking_number,
            "delivery_address": order_row.delivery_address,
            "estimated_delivery": order_row.estimated_delivery.isoformat() if order_row.estimated_delivery else None,
            "contact_phone": order_row.contact_phone,
            "payment_method": order_row.payment_method,
            "delivery_notes": order_row.delivery_notes,
            "courier_name": order_row.courier_name
        }
        
        # Получение товаров заказа
        items_query = text("""
        SELECT 
            oi.id,
            p.name,
            oi.quantity,
            oi.price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = :order_id
        """)
        
        items_result = db.execute(items_query, {"order_id": order_id}).fetchall()
        
        items = []
        for item_row in items_result:
            items.append({
                "id": item_row.id,
                "name": item_row.name,
                "quantity": item_row.quantity,
                "price": float(item_row.price)
            })
        
        order_dict["items"] = items
        
        logger.info(f"Заказ с ID {order_id} успешно получен")
        return Order(**order_dict)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при получении данных из базы: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении данных из базы: {str(e)}")

# Обновление статуса заказа
@router.patch("/orders/{order_id}/status", response_model=Order)
def update_order_status(order_update: OrderUpdate, order_id: int = Path(...), db: Session = Depends(get_db)):
    try:
        logger.info(f"Запрос на изменение статуса заказа {order_id} на {order_update.status}")
        # Проверка наличия заказа
        check_query = text("SELECT id FROM orders WHERE id = :order_id")
        order_exists = db.execute(check_query, {"order_id": order_id}).fetchone()
        
        if not order_exists:
            logger.warning(f"Заказ с ID {order_id} не найден при попытке изменения статуса")
            raise HTTPException(status_code=404, detail=f"Заказ с ID {order_id} не найден")
        
        # Валидация статуса
        valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
        if order_update.status not in valid_statuses:
            logger.warning(f"Неверный статус '{order_update.status}' при попытке изменения заказа {order_id}")
            raise HTTPException(status_code=400, detail=f"Неверный статус. Допустимые значения: {', '.join(valid_statuses)}")
        
        # Обновление статуса заказа
        update_query = text("""
        UPDATE orders
        SET status = :status, 
            updated_at = NOW()
        WHERE id = :order_id
        """)
        
        db.execute(update_query, {"status": order_update.status, "order_id": order_id})
        db.commit()
        
        logger.info(f"Статус заказа {order_id} успешно изменен на {order_update.status}")
        # Возвращаем обновленный заказ
        return get_order(order_id, db)
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении статуса заказа: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа: {str(e)}")

# Статистика по заказам
@router.get("/orders/stats")
def get_orders_stats(db: Session = Depends(get_db)):
    try:
        logger.info("Запрос на получение статистики по заказам")
        query = text("""
        SELECT 
            status,
            COUNT(*) as count,
            SUM(total_amount) as total_amount
        FROM orders
        GROUP BY status
        """)
        
        stats_result = db.execute(query).fetchall()
        
        stats = {}
        for row in stats_result:
            stats[row.status] = {
                "count": row.count,
                "total_amount": float(row.total_amount)
            }
        
        logger.info(f"Статистика по заказам успешно получена")
        return stats
    
    except Exception as e:
        logger.error(f"Ошибка при получении статистики: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")