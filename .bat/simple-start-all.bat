@echo off
rem Скрипт для запуска всех компонентов без цветового оформления

rem Директории проектов
set "SEVER_RYBA_BACKEND=.\Sever-Fish\backend"
set "SEVER_RYBA_FRONTEND=.\Sever-Fish\frontend"
set "AIS_BACKEND=.\ais\ais-backend"
set "AIS_FRONTEND=.\ais\ais-frontend"
set "API_GATEWAY=.\api-gateway"

rem Порты для проверки
set "SEVER_RYBA_BACKEND_PORT=8000"
set "AIS_BACKEND_PORT=8001"
set "API_GATEWAY_PORT=8080"
set "SEVER_RYBA_FRONTEND_PORT=5173"
set "AIS_FRONTEND_PORT=3000"

rem Создаем директории для логов и PID-файлов
if not exist "logs" mkdir logs
if not exist "pids" mkdir pids

echo =========================================================
echo    Запуск всех компонентов Север-Рыба и АИС    
echo =========================================================

rem Проверка занятых портов с помощью netstat
set "ports_in_use=false"
for %%p in (%SEVER_RYBA_BACKEND_PORT% %AIS_BACKEND_PORT% %API_GATEWAY_PORT% %SEVER_RYBA_FRONTEND_PORT% %AIS_FRONTEND_PORT%) do (
    netstat -ano | findstr ":%%p " > nul
    if not errorlevel 1 (
        echo Порт %%p уже используется. Остановите процесс и попробуйте снова.
        set "ports_in_use=true"
    )
)

if "%ports_in_use%"=="true" (
    echo Некоторые порты уже заняты. Выполните simple-stop-all.bat чтобы остановить все процессы.
    exit /b 1
)

rem Запуск Север-Рыба Backend
echo.
echo [1/5] Sever-Ryba Backend
cd %SEVER_RYBA_BACKEND%
start "Sever-Ryba Backend" cmd /c "python -m uvicorn main:app --host 0.0.0.0 --port %SEVER_RYBA_BACKEND_PORT% --reload > ..\..\logs\sever-ryba-backend.log 2>&1"
cd ..\..
timeout /t 2 > nul

rem Запуск АИС Backend
echo.
echo [2/5] AIS Backend
cd %AIS_BACKEND%
start "AIS Backend" cmd /c "python -m uvicorn app.main:app --host 0.0.0.0 --port %AIS_BACKEND_PORT% --reload > ..\..\logs\ais-backend.log 2>&1"
cd ..\..
timeout /t 2 > nul

rem Запуск API Gateway
echo.
echo [3/5] API Gateway
cd %API_GATEWAY%
start "API Gateway" cmd /c "python -m uvicorn main:app --host 0.0.0.0 --port %API_GATEWAY_PORT% --reload > ..\logs\api-gateway.log 2>&1"
cd ..
timeout /t 5 > nul

rem Запуск Север-Рыба Frontend
echo.
echo [4/5] Sever-Ryba Frontend
cd %SEVER_RYBA_FRONTEND%
start "Sever-Ryba Frontend" cmd /c "npm run dev -- --host 0.0.0.0 > ..\..\logs\sever-ryba-frontend.log 2>&1"
cd ..\..
timeout /t 2 > nul

rem Запуск АИС Frontend
echo.
echo [5/5] AIS Frontend
cd %AIS_FRONTEND%
start "AIS Frontend" cmd /c "npm run dev -- --host 0.0.0.0 --port %AIS_FRONTEND_PORT% > ..\..\logs\ais-frontend.log 2>&1"
cd ..\..

echo.
echo ============================================
echo    Все компоненты успешно запущены!    
echo ============================================
echo Доступные URL:
echo   - API Gateway:           http://localhost:%API_GATEWAY_PORT%
echo   - Sever-Ryba Backend:    http://localhost:%SEVER_RYBA_BACKEND_PORT%
echo   - AIS Backend:           http://localhost:%AIS_BACKEND_PORT%
echo   - Sever-Ryba Frontend:   http://localhost:%SEVER_RYBA_FRONTEND_PORT%
echo   - AIS Frontend:          http://localhost:%AIS_FRONTEND_PORT%
echo.
echo Логи записываются в директорию .\logs\
echo Чтобы остановить все компоненты, выполните команду: simple-stop-all.bat