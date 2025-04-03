@echo off
rem Скрипт для запуска только API Gateway
rem Создаем директорию для логов
if not exist "logs" mkdir logs

echo =========================================================
echo    Запуск AIS   
echo =========================================================

cd ais/ais-backend
.venv\Scripts\activate
echo Запуск AIS на порту 8001...
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

rem Добавляем паузу, чтобы окно не закрылось сразу
pause