# ais/ais-backend/app/services/integration_service.py
import json
import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from threading import Thread

from app.services.rabbitmq import rabbitmq_service, SEVER_RYBA_TO_AIS_QUEUE, send_to_sever_ryba

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Глобальное хранилище для обработчиков сообщений
message_handlers = {}


def register_handler(message_type: str, handler_func):
    """
    Регистрация обработчика для определенного типа сообщений
    
    Args:
        message_type: Тип сообщения
        handler_func: Функция-обработчик
    """
    global message_handlers
    message_handlers[message_type] = handler_func
    logger.info(f"Зарегистрирован обработчик для типа сообщений: {message_type}")


def handle_message(ch, method, properties, body):
    """
    Обработка входящего сообщения из RabbitMQ
    
    Args:
        ch: Канал RabbitMQ
        method: Информация о методе
        properties: Свойства сообщения
        body: Тело сообщения
    """
    try:
        # Декодирование сообщения из JSON
        message = json.loads(body.decode('utf-8'))
        message_type = message.get('type')
        
        if not message_type:
            logger.warning("Получено сообщение без указания типа")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
            
        logger.info(f"Получено сообщение типа: {message_type}")
        
        # Поиск обработчика для данного типа сообщений
        if message_type in message_handlers:
            try:
                handler = message_handlers[message_type]
                result = handler(message)
                logger.info(f"Сообщение типа {message_type} успешно обработано")
                
                # Если есть ID корреляции, отправляем ответ
                if properties.correlation_id:
                    response = {
                        'type': f"{message_type}_response",
                        'status': 'success',
                        'data': result,
                        'request_id': properties.correlation_id
                    }
                    send_to_sever_ryba(response, properties.correlation_id)
            except Exception as e:
                logger.error(f"Ошибка при обработке сообщения типа {message_type}: {e}")
                # Отправка сообщения об ошибке, если есть ID корреляции
                if properties.correlation_id:
                    error_response = {
                        'type': f"{message_type}_response",
                        'status': 'error',
                        'error': str(e),
                        'request_id': properties.correlation_id
                    }
                    send_to_sever_ryba(error_response, properties.correlation_id)
        else:
            logger.warning(f"Не найден обработчик для типа сообщений: {message_type}")
            
        # Подтверждаем обработку сообщения
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except json.JSONDecodeError:
        logger.error("Ошибка декодирования JSON из сообщения")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Необработанная ошибка при обработке сообщения: {e}")
        ch.basic_ack(delivery_tag=method.delivery_tag)


class MessageListener(Thread):
    """Поток для прослушивания сообщений RabbitMQ"""
    
    def __init__(self):
        Thread.__init__(self, daemon=True)
        self.is_running = False
        
    def run(self):
        """Запуск прослушивания очереди"""
        self.is_running = True
        while self.is_running:
            try:
                rabbitmq_service.consume_messages(SEVER_RYBA_TO_AIS_QUEUE, handle_message)
            except Exception as e:
                logger.error(f"Ошибка в процессе прослушивания очереди: {e}")
                time.sleep(5)  # Пауза перед повторной попыткой
                
    def stop(self):
        """Остановка прослушивания"""
        self.is_running = False
        rabbitmq_service.stop_consuming()


# Функции для отправки типизированных сообщений в систему Север-Рыба

def send_order_info(order_data: Dict[str, Any]) -> bool:
    """
    Отправка информации о заказе в систему Север-Рыба
    
    Args:
        order_data: Данные заказа
        
    Returns:
        bool: Успешность отправки сообщения
    """
    message = {
        'type': 'order_info',
        'timestamp': int(time.time()),
        'data': order_data
    }
    return send_to_sever_ryba(message, str(uuid.uuid4()))


def send_product_stock_request(product_ids: List[int]) -> bool:
    """
    Запрос информации о наличии товаров на складе Север-Рыба
    
    Args:
        product_ids: Список ID товаров
        
    Returns:
        bool: Успешность отправки сообщения
    """
    message = {
        'type': 'stock_request',
        'timestamp': int(time.time()),
        'data': {
            'product_ids': product_ids
        }
    }
    return send_to_sever_ryba(message, str(uuid.uuid4()))


def send_payment_status(payment_data: Dict[str, Any]) -> bool:
    """
    Отправка статуса платежа в систему Север-Рыба
    
    Args:
        payment_data: Данные о платеже
        
    Returns:
        bool: Успешность отправки сообщения
    """
    message = {
        'type': 'payment_status',
        'timestamp': int(time.time()),
        'data': payment_data
    }
    return send_to_sever_ryba(message, str(uuid.uuid4()))


# Запуск прослушивания при импорте модуля
message_listener = MessageListener()
message_listener.start()