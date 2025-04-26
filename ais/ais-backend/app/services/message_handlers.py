# ais/ais-backend/app/services/message_handlers.py
import logging
from typing import Any, Dict, List
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.services.integration_service import register_handler

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def handle_stock_update(message: Dict[str, Any]) -> Dict[str, Any]:
    """
    Обработка обновления данных о наличии товаров на складе
    
    Args:
        message: Сообщение с данными об остатках
        
    Returns:
        Dict: Результат обработки
    """
    db = next(get_db())
    try:
        data = message.get('data', {})
        stock_data = data.get('stock_data', [])
        
        updated_products = []
        
        for item in stock_data:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 0)
            
            # Проверяем существование товара
            product = db.query(models.Product).filter(models.Product.id == product_id).first()
            if product:
                # Обновляем количество товара на складе
                product.stock_quantity = quantity
                updated_products.append({
                    'id': product.id,
                    'name': product.name,
                    'updated_quantity': quantity
                })
            else:
                logger.warning(f"Товар с ID {product_id} не найден в базе данных")
                
        db.commit()
        
        return {
            'updated_count': len(updated_products),
            'updated_products': updated_products
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обработке обновления остатков: {e}")
        raise
    finally:
        db.close()


def handle_order_status_update(message: Dict[str, Any]) -> Dict[str, Any]:
    """
    Обработка обновления статуса заказа от Север-Рыба
    
    Args:
        message: Сообщение с данными об обновлении статуса заказа
        
    Returns:
        Dict: Результат обработки
    """
    db = next(get_db())
    try:
        data = message.get('data', {})
        order_id = data.get('order_id')
        new_status = data.get('status')
        
        if not order_id or not new_status:
            raise ValueError("В сообщении отсутствует ID заказа или новый статус")
            
        # Проверяем существование заказа
        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if not order:
            raise ValueError(f"Заказ с ID {order_id} не найден")
            
        # Обновляем статус заказа
        old_status = order.status
        order.status = new_status
        db.commit()
        
        return {
            'order_id': order.id,
            'old_status': old_status,
            'new_status': new_status,
            'updated_at': order.updated_at.isoformat() if hasattr(order, 'updated_at') else None
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обновлении статуса заказа: {e}")
        raise
    finally:
        db.close()


def handle_delivery_info(message: Dict[str, Any]) -> Dict[str, Any]:
    """
    Обработка информации о доставке от Север-Рыба
    
    Args:
        message: Сообщение с данными о доставке
        
    Returns:
        Dict: Результат обработки
    """
    db = next(get_db())
    try:
        data = message.get('data', {})
        order_id = data.get('order_id')
        delivery_data = data.get('delivery_info', {})
        
        if not order_id or not delivery_data:
            raise ValueError("В сообщении отсутствует ID заказа или информация о доставке")
            
        # Проверяем существование заказа
        order = db.query(models.Order).filter(models.Order.id == order_id).first()
        if not order:
            raise ValueError(f"Заказ с ID {order_id} не найден")
            
        # Создаем или обновляем информацию о доставке
        delivery = db.query(models.Shipment).filter(models.Shipment.order_id == order_id).first()
        
        if not delivery:
            # Создаем новую запись о доставке
            delivery = models.Shipment(
                order_id=order_id,
                carrier=delivery_data.get('carrier'),
                tracking_number=delivery_data.get('tracking_number'),
                status=delivery_data.get('status', 'created'),
                estimated_delivery=delivery_data.get('estimated_delivery')
            )
            db.add(delivery)
        else:
            # Обновляем существующую запись
            delivery.carrier = delivery_data.get('carrier', delivery.carrier)
            delivery.tracking_number = delivery_data.get('tracking_number', delivery.tracking_number)
            delivery.status = delivery_data.get('status', delivery.status)
            delivery.estimated_delivery = delivery_data.get('estimated_delivery', delivery.estimated_delivery)
            
        db.commit()
        
        return {
            'order_id': order.id,
            'delivery_id': delivery.id,
            'status': delivery.status,
            'tracking_number': delivery.tracking_number
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при обработке информации о доставке: {e}")
        raise
    finally:
        db.close()


# Регистрация обработчиков сообщений
def register_message_handlers():
    """Регистрация всех обработчиков сообщений"""
    register_handler('stock_update', handle_stock_update)
    register_handler('order_status_update', handle_order_status_update)
    register_handler('delivery_info', handle_delivery_info)
    logger.info("Все обработчики сообщений зарегистрированы")