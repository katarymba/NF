@echo off
rem Скрипт для запуска API Gateway
rem Создаем директорию для логов
if not exist "logs" mkdir logs

echo =========================================================
echo    Запуск API Gateway   
echo =========================================================

cd api-gateway

rem Проверяем наличие виртуального окружения
if not exist ".venv" (
    echo Создание виртуального окружения...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

echo Запуск API Gateway на порту 8080...
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload

rem Добавляем паузу, чтобы окно не закрылось сразу
pause