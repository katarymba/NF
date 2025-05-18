# Скрипт для исправления проблем после удаления RabbitMQ
Write-Host "Исправление проблем с кодом после удаления RabbitMQ..." -ForegroundColor Green

# 1. Исправление файла ais_integration.py в Sever-Fish
$filePath = ".\Sever-Fish\backend\app\services\ais_integration.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $newContent = @()
    $inTryBlock = $false
    $skipBlock = $false
    
    for ($i = 0; $i -lt $content.Count; $i++) {
        $line = $content[$i]
        
        # Пропускаем блок с RabbitMQ
        if ($line -match "rabbitmq_service\.consume_messages") {
            $skipBlock = $true
            $newContent += "                # RabbitMQ функциональность отключена"
            $newContent += "                pass"
            continue
        }
        
        # Если мы в блоке, который нужно пропустить
        if ($skipBlock) {
            # Ищем конец блока (обычно следующий блок except)
            if ($line -match "^\s*except\s+") {
                $skipBlock = $false
                $newContent += $line
            }
            continue
        }
        
        # Обрабатываем блоки try без содержимого
        if ($line -match "^\s*try\s*:") {
            $inTryBlock = $true
            $newContent += $line
            
            # Проверяем, есть ли содержимое в блоке try
            $nextLine = $content[$i + 1]
            if ($nextLine -match "^\s*except\s+") {
                # Если следующая строка - except, то добавляем заглушку
                $newContent += "        # RabbitMQ функциональность отключена"
                $newContent += "        pass"
            }
        }
        else {
            $newContent += $line
        }
    }
    
    Set-Content -Path $filePath -Value $newContent
    Write-Host "Исправлен файл: $filePath" -ForegroundColor Green
}

# 2. Исправление файла integration.py в ais-backend
$filePath = ".\ais\ais-backend\app\routers\integration.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $newContent = @()
    
    # Полностью переписываем файл с правильной индентацией
    $newContent = @'
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

# RabbitMQ imports removed

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
    # RabbitMQ functionality removed
    return {"status": "disabled", "message": "RabbitMQ отключен"}

@router.post("/ais-to-sever-ryba")
async def send_to_sever_ryba(message: Message):
    """
    Отправить сообщение из АИС в Север-Рыба
    """
    try:
        # RabbitMQ functionality removed
        return {"status": "disabled", "message": "Интеграция с RabbitMQ отключена"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке сообщения: {str(e)}")

@router.post("/notification")
async def send_notification(message: Message):
    """
    Отправить уведомление
    """
    try:
        # RabbitMQ functionality removed
        return {"status": "disabled", "message": "Интеграция с RabbitMQ отключена"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при отправке уведомления: {str(e)}")

@router.post("/reconnect")
async def reconnect_rabbitmq():
    """
    Переподключение к RabbitMQ
    """
    # RabbitMQ functionality removed
    return {"status": "disabled", "message": "RabbitMQ отключен"}
'@
    
    Set-Content -Path $filePath -Value $newContent
    Write-Host "Исправлен файл: $filePath" -ForegroundColor Green
}

# 3. Исправление файла integration_service.py в ais-backend
$filePath = ".\ais\ais-backend\app\services\integration_service.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $newContent = @()
    $skipBlock = $false
    
    foreach ($line in $content) {
        # Пропускаем импорты RabbitMQ
        if ($line -match "from app\.services\.rabbitmq import") {
            $newContent += "# RabbitMQ imports removed"
            continue
        }
        
        # Пропускаем блоки с использованием rabbitmq_service
        if ($line -match "rabbitmq_service\.(consume_messages|stop_consuming)") {
            $skipBlock = $true
            $newContent += "        # RabbitMQ функциональность отключена"
            $newContent += "        pass"
            continue
        }
        
        # Если мы в блоке, который нужно пропустить
        if ($skipBlock) {
            # Ищем конец блока (обычно конец функции или метода)
            if ($line -match "^\s*def\s+" -or $line -match "^\s*class\s+" -or $line -eq "") {
                $skipBlock = $false
            } else {
                continue
            }
        }
        
        $newContent += $line
    }
    
    Set-Content -Path $filePath -Value $newContent
    Write-Host "Исправлен файл: $filePath" -ForegroundColor Green
}

Write-Host "Все исправления выполнены." -ForegroundColor Green
Write-Host "Теперь выполните команду для пересборки и запуска контейнеров:" -ForegroundColor Yellow
Write-Host "docker-compose down && docker-compose build && docker-compose up -d" -ForegroundColor Cyan