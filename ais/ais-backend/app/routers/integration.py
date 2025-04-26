# ais/ais-backend/app/routers/integration.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import logging

from app.database import get_db
from app import models
from app.services.rabbitmq import rabbitmq_service
from app.services.integration_service import send_order_info, send_product_stock_request, send_payment_status

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/status")
def get_integration_status():
    """
    Проверка статуса интеграции с Север-Рыба
    """
    if rabbitmq_service.connected:
        return {"status": "connected", "message": "Соединение с RabbitMQ установлено"}
    else:
        return {"status": "disconnected", "message": "Соединение с RabbitMQ отсутствует"}


@router.post("/orders/{order_id}/send")
def send_order_to_sever_ryba(order_id: int, db: Session = Depends(get_db)):
    """
    Отправка данных заказа в систему Север-Рыба
    """
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    # Получение данных заказа
    order_data = {
        "order_id": order.id,
        "total_price": float(order.total_price),
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "user_id": order.user_id
    }
    
    # Получение данных о товарах в заказе
    order_items = db.query(models.OrderItem).filter(models.OrderItem.order_id == order.id).all()
    order_data["items"] = [
        {
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": float(item.price)
        } for item in order_items
    ]
    
    # Отправка в RabbitMQ
    result = send_order_info(order_data)
    
    if result:
        return {"status": "success", "message": "Заказ успешно отправлен в систему Север-Рыба"}
    else:
        raise HTTPException(status_code=500, detail="Ошибка при отправке заказа")


@router.post("/products/stock-request")
def request_product_stock(product_ids: List[int] = Body(...)):
    """
    Запрос информации о наличии товаров в системе Север-Рыба
    """
    if not product_ids:
        raise HTTPException(status_code=400, detail="Не указаны ID товаров")
    
    # Отправка запроса в RabbitMQ
    result = send_product_stock_request(product_ids)
    
    if result:
        return {"status": "success", "message": "Запрос на получение данных о наличии товаров отправлен"}
    else:
        raise HTTPException(status_code=500, detail="Ошибка при отправке запроса")


@router.post("/payments/{payment_id}/send")
def send_payment_to_sever_ryba(payment_id: int, db: Session = Depends(get_db)):
    """
    Отправка информации о платеже в систему Север-Рыба
    """
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    
    # Формирование данных о платеже
    payment_data = {
        "payment_id": payment.id,
        "order_id": payment.order_id,
        "payment_method": payment.payment_method,
        "payment_status": payment.payment_status,
        "transaction_id": payment.transaction_id,
        "created_at": payment.created_at.isoformat()
    }
    
    # Отправка в RabbitMQ
    result = send_payment_status(payment_data)
    
    if result:
        return {"status": "success", "message": "Данные о платеже успешно отправлены в систему Север-Рыба"}
    else:
        raise HTTPException(status_code=500, detail="Ошибка при отправке данных о платеже")


@router.post("/reconnect")
def reconnect_rabbitmq():
    """
    Переподключение к RabbitMQ
    """
    rabbitmq_service.reconnect()
    
    if rabbitmq_service.connected:
        return {"status": "success", "message": "Переподключение к RabbitMQ выполнено успешно"}
    else:
        raise HTTPException(status_code=500, detail="Не удалось переподключиться к RabbitMQ")