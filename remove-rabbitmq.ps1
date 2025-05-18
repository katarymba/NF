# Скрипт для удаления RabbitMQ из проекта NorthFish
Write-Host "Удаление RabbitMQ из проекта..." -ForegroundColor Green

# 1. Удаляем pika из всех файлов requirements.txt
Write-Host "Удаление зависимостей из requirements.txt..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "requirements.txt" -Recurse | ForEach-Object {
    Write-Host "Обработка файла: $($_.FullName)" -ForegroundColor Cyan
    $content = Get-Content $_.FullName | Where-Object { $_ -notmatch "pika" }
    Set-Content -Path $_.FullName -Value $content
}

# 2. Удаление файлов rabbitmq.py (но не создаем их заново пока)
Write-Host "Удаление файлов rabbitmq.py..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "rabbitmq.py" -Recurse | ForEach-Object {
    Write-Host "Удаление файла: $($_.FullName)" -ForegroundColor Cyan
    Remove-Item -Path $_.FullName -Force
}

# 3. Модификация файлов с импортами и использованием RabbitMQ
Write-Host "Модификация файлов, использующих RabbitMQ..." -ForegroundColor Yellow

# Редактируем файл main.py в ais-backend
$filePath = ".\ais\ais-backend\app\main.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $content = $content | Where-Object { $_ -notmatch "# Закрытие соединения с RabbitMQ" }
    Set-Content -Path $filePath -Value $content
}

# Редактируем файл integration.py в ais-backend
$filePath = ".\ais\ais-backend\app\routers\integration.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $content = $content -replace 'from app\.services\.rabbitmq import.*', '# RabbitMQ imports removed'
    $content = $content | ForEach-Object {
        if ($_ -match "rabbitmq_service") {
            "    # RabbitMQ functionality removed"
        } else {
            $_
        }
    }
    Set-Content -Path $filePath -Value $content
}

# Редактируем файл integration_service.py в ais-backend
$filePath = ".\ais\ais-backend\app\services\integration_service.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $content = $content -replace 'from app\.services\.rabbitmq import.*', '# RabbitMQ imports removed'
    $content = $content | ForEach-Object {
        if ($_ -match "rabbitmq_service") {
            "    # RabbitMQ functionality removed"
        } else {
            $_
        }
    }
    Set-Content -Path $filePath -Value $content
}

# Редактируем файл log_setup.py в ais-backend
$filePath = ".\ais\ais-backend\app\services\log_setup.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $newContent = @()
    $skipLines = $false
    foreach ($line in $content) {
        if ($line -match "# Отдельный логгер для RabbitMQ") {
            $skipLines = $true
            continue
        }
        if ($skipLines -and $line -match "rabbitmq_logger\.addHandler") {
            $skipLines = $false
            continue
        }
        if ($skipLines) {
            continue
        }
        $newContent += $line
    }
    Set-Content -Path $filePath -Value $newContent
}

# Редактируем файл config.py в Sever-Fish
$filePath = ".\Sever-Fish\backend\app\config.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $newContent = @()
    $skipRabbitMQConfig = $false
    foreach ($line in $content) {
        if ($line -match "# Настройки RabbitMQ") {
            $skipRabbitMQConfig = $true
            $newContent += "# Настройки RabbitMQ удалены"
            continue
        }
        if ($skipRabbitMQConfig -and $line -match "^#") {
            $skipRabbitMQConfig = $false
        }
        if ($skipRabbitMQConfig -and ($line -match "^RABBITMQ_" -or $line -match "^USE_RABBITMQ")) {
            continue
        }
        $newContent += $line
    }
    Set-Content -Path $filePath -Value $newContent
}

# Редактируем файл ais_integration.py в Sever-Fish
$filePath = ".\Sever-Fish\backend\app\services\ais_integration.py"
if (Test-Path $filePath) {
    Write-Host "Обработка файла: $filePath" -ForegroundColor Cyan
    $content = Get-Content $filePath
    $content = $content -replace 'from app\.services\.rabbitmq import.*', '# RabbitMQ imports removed'
    $content = $content | ForEach-Object {
        if ($_ -match "rabbitmq_service") {
            "    # RabbitMQ functionality removed"
        } else {
            $_
        }
    }
    Set-Content -Path $filePath -Value $content
}

# 4. Создаем заглушки для rabbitmq.py
Write-Host "Создание заглушек для RabbitMQ..." -ForegroundColor Yellow

# Создаем заглушку для rabbitmq.py в ais-backend
$stubPath = ".\ais\ais-backend\app\services\rabbitmq.py"
$stubContent = @"
# Заглушка для удаленной функциональности RabbitMQ
import logging

logger = logging.getLogger(__name__)

class RabbitMQServiceStub:
    """Заглушка для RabbitMQ сервиса"""
    def __init__(self):
        self.connected = False
        logger.info("RabbitMQ функциональность отключена")
    
    def connect(self):
        logger.info("RabbitMQ connect вызван, но функциональность отключена")
        return False
    
    def reconnect(self):
        logger.info("RabbitMQ reconnect вызван, но функциональность отключена")
        return False
    
    def publish_message(self, *args, **kwargs):
        logger.info("RabbitMQ publish_message вызван, но функциональность отключена")
        return False
    
    def consume_messages(self, *args, **kwargs):
        logger.info("RabbitMQ consume_messages вызван, но функциональность отключена")
        return False
    
    def stop_consuming(self):
        logger.info("RabbitMQ stop_consuming вызван, но функциональность отключена")
        return False

# Создаем экземпляр сервиса-заглушки
rabbitmq_service = RabbitMQServiceStub()

# Константы для совместимости
EXCHANGE_NAME = "northfish_exchange"
AIS_TO_SEVER_RYBA_QUEUE = "ais_to_sever_ryba"
SEVER_RYBA_TO_AIS_QUEUE = "sever_ryba_to_ais"

def send_to_sever_ryba(message):
    """Заглушка для отправки сообщения в Север-Рыба"""
    logger.info("send_to_sever_ryba вызван, но функциональность отключена")
    return False
"@
Write-Host "Создание файла: $stubPath" -ForegroundColor Cyan
Set-Content -Path $stubPath -Value $stubContent

# Создаем заглушку для rabbitmq.py в Sever-Fish
$stubPath = ".\Sever-Fish\backend\app\services\rabbitmq.py"
$stubContent = @"
# Заглушка для удаленной функциональности RabbitMQ
import logging

logger = logging.getLogger(__name__)

class RabbitMQServiceStub:
    """Заглушка для RabbitMQ сервиса"""
    def __init__(self):
        self.connected = False
        logger.info("RabbitMQ функциональность отключена")
    
    def connect(self):
        logger.info("RabbitMQ connect вызван, но функциональность отключена")
        return False
    
    def reconnect(self):
        logger.info("RabbitMQ reconnect вызван, но функциональность отключена")
        return False
    
    def publish_message(self, *args, **kwargs):
        logger.info("RabbitMQ publish_message вызван, но функциональность отключена")
        return False
    
    def consume_messages(self, *args, **kwargs):
        logger.info("RabbitMQ consume_messages вызван, но функциональность отключена")
        return False
    
    def stop_consuming(self):
        logger.info("RabbitMQ stop_consuming вызван, но функциональность отключена")
        return False

# Создаем экземпляр сервиса-заглушки
rabbitmq_service = RabbitMQServiceStub()

# Константы для совместимости
EXCHANGE_NAME = "northfish_exchange"
AIS_TO_SEVER_RYBA_QUEUE = "ais_to_sever_ryba"
SEVER_RYBA_TO_AIS_QUEUE = "sever_ryba_to_ais"

def send_to_ais(message):
    """Заглушка для отправки сообщения в АИС"""
    logger.info("send_to_ais вызван, но функциональность отключена")
    return False
"@
Write-Host "Создание файла: $stubPath" -ForegroundColor Cyan
Set-Content -Path $stubPath -Value $stubContent

Write-Host "Скрипт завершен." -ForegroundColor Green
Write-Host "Теперь выполните команду для пересборки и запуска контейнеров:" -ForegroundColor Yellow
Write-Host "docker-compose down && docker-compose build && docker-compose up -d" -ForegroundColor Cyan