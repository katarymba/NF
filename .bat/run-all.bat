@echo off
echo =========================================================
echo    Запуск всей инфраструктуры NF   
echo =========================================================

REM Запуск API Gateway
start run-api-gateway.bat

REM Небольшая пауза для запуска API Gateway
timeout /t 3 /nobreak

REM Запуск бэкендов (если требуется)
REM start run-sever-ryba-backend.bat
REM start run-ais-backend.bat

REM Запуск фронтендов
start run-sever-ryba-frontend.bat
start run-ais-frontend.bat

echo Все компоненты запущены:
echo - API Gateway: http://localhost:8080
echo - Север-Рыба фронтенд: http://localhost:5173
echo - АИС фронтенд: http://localhost:5174

echo Для остановки процессов закройте открытые окна командной строки