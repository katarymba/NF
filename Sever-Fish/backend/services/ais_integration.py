# sever_ryba/services/ais_integration.py
import json
import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from threading import Thread

from sever_ryba.services.rabbitmq import rabbitmq_service, AIS_TO_SEVER_RYBA_QUEUE, send_to_ais

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
                    send_to_ais(response, properties.correlation_id)
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
                    send_to_ais(error_response, properties.correlation_id)
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
                rabbitmq_service.consume_messages(AIS_TO_SEVER_RYBA_QUEUE, handle_message)
            except Exception as e:
                logger.error(f"Ошибка в процессе прослушивания очереди: {e}")
                time.sleep(5)  # Пауза перед повторной попыткой
                
    def stop(self):
        """Остановка прослушивания"""
        self.is_running = False
        rabbitmq_service.stop_consuming()


# Функции для отправки типизированных сообщений в АИС

def send_stock_update(stock_data: List[Dict[str, Any]]) -> bool:
    """
    Отправка обновления данных о наличии товаров на складе в АИС
    
    Args:
        stock_data: Данные о товарах (id, количество)
        
    Returns:
        bool: Успешность отправки сообщения
    """
    message = {
        'type': 'stock_update',
        'timestamp': int(time.time()),
        'data': {
            'stock_data': stock_data
        }
    }
    return send_to_ais(message, str(uuid.uuid4()))


def send_order_status_update(order_id: int, status: str) -> bool:
    """
    Отправка обновления статуса заказа в АИС
    
    Args:
        order_id: ID заказа
        status: Новый статус заказа
        
    Returns:
        bool: Успешность отправки сообщения
    """
    message = {
        'type': 'order_status_update',
        'timestamp': int(time.time()),
        'data': {
            'order_id': order_id,
            'status': status
        }
    }
    return send_to_ais(message, str(uuid.uuid4()))


def send_delivery_info(order_id: int, delivery_info: Dict[str, Any]) -> bool:
    """
    Отправка информации о доставке в АИС
    
    Args:
        order_id: ID заказа
        delivery_info: Информация о доставке
        
    Returns:
        bool: Успешность отправки сообщения
    """
    message = {
        'type': 'delivery_info',
        'timestamp': int(time.time()),
        'data': {
            'order_id': order_id,
            'delivery_info': delivery_info
        }
    }
    return send_to_ais(message, str(uuid.uuid4()))


# Запуск прослушивания при импорте модуля
message_listener = MessageListener()
message_listener.start()