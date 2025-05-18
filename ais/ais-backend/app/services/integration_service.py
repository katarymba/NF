"""
Модуль для интеграции с другими системами
"""

import logging
import requests
import json
from typing import Dict, Any, Callable, Optional
import threading
from app.config import settings

logger = logging.getLogger(__name__)

# Заглушки для совместимости
SEVER_RYBA_TO_AIS_QUEUE = "sever_ryba_to_ais"

def send_to_sever_ryba(data: Dict[str, Any]) -> bool:
    """
    Отправка данных в Север-Рыба через HTTP вместо RabbitMQ
    
    Args:
        data: Данные для отправки
        
    Returns:
        bool: Успешность отправки
    """
    try:
        # Отправка через HTTP API
        base_url = settings.SEVER_FISH_API_URL
        if not base_url:
            base_url = "http://sever-fish-backend:8000"
            
        response = requests.post(
            f"{base_url}/api/integration/receive",
            json=data,
            timeout=5
        )
        if response.status_code == 200:
            logger.info(f"Данные успешно отправлены в Север-Рыба: {data}")
            return True
        else:
            logger.error(f"Ошибка при отправке данных в Север-Рыба: {response.status_code}, {response.text}")
            return False
    except Exception as e:
        logger.error(f"Ошибка при отправке данных в Север-Рыба: {e}")
        return False

def handle_message(channel, method, properties, body) -> None:
    """
    Заглушка для обработки входящего сообщения (для совместимости)
    """
    logger.info("Функциональность RabbitMQ отключена")
    return None

def register_handler(message_type: str, handler_func: Callable) -> None:
    """
    Заглушка для регистрации обработчика сообщений (для совместимости)
    """
    logger.info(f"Регистрация обработчика для {message_type} пропущена, RabbitMQ отключен")
    return None

def start_listening() -> None:
    """
    Заглушка для запуска прослушивания (для совместимости)
    """
    logger.info("Функциональность RabbitMQ отключена")
    return None

def stop_listening() -> None:
    """
    Заглушка для остановки прослушивания (для совместимости)
    """
    logger.info("Функциональность RabbitMQ отключена")
    return None
