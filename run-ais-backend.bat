@echo off
rem Скрипт для запуска только API Gateway
rem Создаем директорию для логов
if not exist "logs" mkdir logs

echo =========================================================
echo    Проверка доступности RabbitMQ   
echo =========================================================
echo Убедитесь, что RabbitMQ запущен и доступен.
echo Если RabbitMQ не установлен, скачайте его с https://www.rabbitmq.com/download.html

ping -n 1 localhost > nul
if %errorlevel% neq 0 (
    echo Ошибка: Не удается подключиться к localhost. Проверьте, запущен ли RabbitMQ.
    pause
    exit /b 1
)

echo =========================================================
echo    Запуск AIS с интеграцией через RabbitMQ   
echo =========================================================

cd ais/ais-backend
.venv\Scripts\activate
echo Запуск AIS на порту 8001...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

rem Добавляем паузу, чтобы окно не закрылось сразу
pause