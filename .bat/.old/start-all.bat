@echo off
setlocal enabledelayedexpansion

echo ====================================
echo = Starting All Project Components  =
echo ====================================

:: Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

:: Get current date and time for log filename
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set log_date=%datetime:~0,8%_%datetime:~8,6%

:: Create directory for process IDs
if not exist "pids" mkdir pids

:: Function to start a component
:run_component
set component_name=%~1
set command=%~2
set log_file=logs\%component_name%_%log_date%.log

echo [%time%] Starting %component_name%...

:: Start process and save ID to file
start /B cmd /c "%command% > %log_file% 2>&1 & echo %%^!PID%%^! > pids\%component_name%.pid"

:: Get PID of started process
timeout /t 1 > nul
if exist "pids\%component_name%.pid" (
    set /p pid=<pids\%component_name%.pid
    echo [%time%] %component_name% started (PID: !pid!)
)

exit /b

:: ========= Starting all components =========

:: 1. Start API Gateway
call :run_component "api-gateway" "cd api-gateway && .venv\Scripts\activate && python -m uvicorn main:app --host 0.0.0.0 --port 8080"

:: 2. Start Sever-Fish Backend
call :run_component "sever-fish-backend" "cd Sever-Fish\backend && .venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: 3. Start AIS Backend
call :run_component "ais-backend" "cd ais\ais-backend && .venv\Scripts\activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001"

:: Wait for backends to start
echo [%time%] Waiting for backends to start (10 seconds)...
timeout /t 10 > nul

:: 4. Start Sever-Fish Frontend
call :run_component "sever-fish-frontend" "cd Sever-Fish\frontend && npm run dev"

:: 5. Start AIS Frontend
call :run_component "ais-frontend" "cd ais\ais-frontend && npm run dev"

:: Display information about running services
echo.
echo ====================================
echo = All components started          =
echo ====================================
echo.
echo API Gateway:        http://localhost:8080
echo Sever-Fish Backend: http://localhost:8000
echo AIS Backend:        http://localhost:8001
echo Sever-Fish Frontend: http://localhost:5173
echo AIS Frontend:        http://localhost:5174
echo.
echo To stop all components, run stop-all.bat
echo Logs are available in the logs\ folder
echo.

endlocal