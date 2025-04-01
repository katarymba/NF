@echo off
rem Скрипт для запуска только API Gateway

rem Создаем директорию для логов
if not exist "logs" mkdir logs

echo =========================================================
echo    Запуск API Gateway    
echo =========================================================

cd api-gateway
echo Запуск API Gateway на порту 8080...
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload

rem Команда выше не вернется, пока пользователь не нажмет Ctrl+C
echo API Gateway остановлен.