"""
Модуль для интеграции с АИС Северная рыба
"""

import logging
import requests
from typing import Dict, Any, Optional
import json
from app.utils.config import settings

logger = logging.getLogger(__name__)

# Заглушки для совместимости
AIS_TO_SEVER_RYBA_QUEUE = "ais_to_sever_ryba"

def send_to_ais(data: Dict[str, Any]) -> bool:
    """
    Отправка данных в АИС через HTTP вместо RabbitMQ
    
    Args:
        data: Данные для отправки
        
    Returns:
        bool: Успешность отправки
    """
    try:
        # Отправка через HTTP API
        response = requests.post(
            f"{settings.AIS_BASE_URL}/api/integration/receive",
            json=data,
            timeout=5
        )
        if response.status_code == 200:
            logger.info(f"Данные успешно отправлены в АИС: {data}")
            return True
        else:
            logger.error(f"Ошибка при отправке данных в АИС: {response.status_code}, {response.text}")
            return False
    except Exception as e:
        logger.error(f"Ошибка при отправке данных в АИС: {e}")
        return False

def handle_message(channel, method, properties, body) -> None:
    """
    Заглушка для обработки входящего сообщения (для совместимости)
    """
    logger.info("Функциональность RabbitMQ отключена")
    return None

def start_listening() -> None:
    """
    Заглушка для запуска прослушивания (для совместимости)
    """
    logger.info("Функциональность RabbitMQ отключена")
    return None
