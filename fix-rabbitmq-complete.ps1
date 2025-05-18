# Скрипт для полной перезаписи проблемных файлов
Write-Host "Полная перезапись проблемных файлов после удаления RabbitMQ..." -ForegroundColor Green

# 1. Перезапись ais_integration.py в Sever-Fish
$filePath = ".\Sever-Fish\backend\app\services\ais_integration.py"
if (Test-Path $filePath) {
    Write-Host "Перезапись файла: $filePath" -ForegroundColor Cyan
    
    $newContent = @'
"""
Модуль для интеграции с АИС Северная рыба
"""

import logging
import requests
from typing import Dict, Any, Optional
import json
from app.config import settings

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
'@
    
    Set-Content -Path $filePath -Value $newContent
    Write-Host "Файл перезаписан: $filePath" -ForegroundColor Green
}

# 2. Перезапись integration_service.py в ais-backend
$filePath = ".\ais\ais-backend\app\services\integration_service.py"
if (Test-Path $filePath) {
    Write-Host "Перезапись файла: $filePath" -ForegroundColor Cyan
    
    $newContent = @'
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
'@
    
    Set-Content -Path $filePath -Value $newContent
    Write-Host "Файл перезаписан: $filePath" -ForegroundColor Green
}

# 3. Перезапись integration.py в ais-backend
$filePath = ".\ais\ais-backend\app\routers\integration.py"
if (Test-Path $filePath) {
    Write-Host "Перезапись файла: $filePath" -ForegroundColor Cyan
    
    $newContent = @'
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/integration",
    tags=["integration"],
    responses={404: {"description": "Not found"}},
)

class Message(BaseModel):
    type: str
    payload: Dict[str, Any]

@router.get("/status")
async def get_status():
    """
    Проверить статус соединения с очередями сообщений
    """
    logger.info("Запрос статуса интеграции - RabbitMQ отключен")
    return {"status": "disabled", "message": "RabbitMQ отключен"}

@router.post("/ais-to-sever-ryba")
async def send_to_sever_ryba(message: Message):
    """
    Отправить сообщение из АИС в Север-Рыба
    """
    try:
        logger.info(f"Попытка отправки сообщения в Север-Рыба: {message.type}")
        # Используем HTTP вместо RabbitMQ
        # Можно реализовать здесь HTTP запрос к Север-Рыба API
        return {"status": "disabled", "message": "Интеграция с RabbitMQ отключена"}
    except Exception as e:
        logger.error(f"Ошибка при отправке сообщения: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке сообщения: {str(e)}")

@router.post("/notification")
async def send_notification(message: Message):
    """
    Отправить уведомление
    """
    try:
        logger.info(f"Попытка отправки уведомления: {message.type}")
        return {"status": "disabled", "message": "Интеграция с RabbitMQ отключена"}
    except Exception as e:
        logger.error(f"Ошибка при отправке уведомления: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке уведомления: {str(e)}")

@router.post("/reconnect")
async def reconnect_rabbitmq():
    """
    Переподключение к RabbitMQ (заглушка)
    """
    logger.info("Попытка переподключения к RabbitMQ (отключено)")
    return {"status": "disabled", "message": "RabbitMQ отключен"}

@router.post("/receive")
async def receive_message(message: Message):
    """
    Конечная точка для приема сообщений через HTTP
    """
    try:
        logger.info(f"Получено сообщение через HTTP: {message.type}")
        # Здесь можно обработать сообщение как будто оно пришло через RabbitMQ
        return {"status": "success", "message": "Сообщение получено"}
    except Exception as e:
        logger.error(f"Ошибка при обработке входящего сообщения: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обработке сообщения: {str(e)}")
'@
    
    Set-Content -Path $filePath -Value $newContent
    Write-Host "Файл перезаписан: $filePath" -ForegroundColor Green
}

Write-Host "Все файлы перезаписаны." -ForegroundColor Green
Write-Host "Теперь выполните команду для пересборки и запуска контейнеров:" -ForegroundColor Yellow
Write-Host "docker-compose down && docker-compose build && docker-compose up -d" -ForegroundColor Cyan