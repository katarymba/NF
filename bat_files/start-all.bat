@echo off
setlocal enabledelayedexpansion

echo ====================================
echo = Запуск всех компонентов проекта =
echo ====================================

:: Создаем директорию для логов, если она не существует
if not exist "logs" mkdir logs

:: Определяем текущую дату и время для имени файла лога
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /format:list') do set datetime=%%I
set log_date=%datetime:~0,8%_%datetime:~8,6%

:: Создаем директорию для хранения ID процессов
if not exist "pids" mkdir pids

:: Функция для запуска компонента
:run_component
set component_name=%~1
set command=%~2
set log_file=logs\%component_name%_%log_date%.log

echo [%time%] Запуск %component_name%...

:: Запускаем процесс и сохраняем ID в файл
start /B cmd /c "%command% > %log_file% 2>&1 & echo %%^!PID%%^! > pids\%component_name%.pid"

:: Получаем PID запущенного процесса
timeout /t 1 > nul
if exist "pids\%component_name%.pid" (
    set /p pid=<pids\%component_name%.pid
    echo [%time%] %component_name% запущен (PID: !pid!)
)

exit /b

:: ========= Запуск всех компонентов =========

:: 1. Запуск PostgreSQL, если он не запущен (если вы используете локальную инсталляцию)
:: Закомментируйте следующие строки, если PostgreSQL запускается отдельно или как служба
:: echo [%time%] Проверка статуса PostgreSQL...
:: sc query postgresql-x64-15 | find "RUNNING" > nul
:: if errorlevel 1 (
::     echo [%time%] Запуск PostgreSQL...
::     net start postgresql-x64-15
:: ) else (
::     echo [%time%] PostgreSQL уже запущен
:: )

:: 2. Запуск API Gateway
call :run_component "api-gateway" "cd api-gateway && .venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8080"

:: 3. Запуск Sever-Fish Backend
call :run_component "sever-fish-backend" "cd Sever-Fish\backend && .venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000"

:: 4. Запуск AIS Backend
call :run_component "ais-backend" "cd ais\ais-backend && .venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 8001"

:: Ждем немного, чтобы бэкенды успели запуститься
echo [%time%] Ожидание запуска бэкендов (10 секунд)...
timeout /t 10 > nul

:: 5. Запуск Sever-Fish Frontend
call :run_component "sever-fish-frontend" "cd Sever-Fish\frontend && npm run dev"

:: 6. Запуск AIS Frontend
call :run_component "ais-frontend" "cd ais\ais-frontend && npm run dev"

:: Выводим информацию о запущенных сервисах
echo.
echo ====================================
echo = Все компоненты запущены         =
echo ====================================
echo.
echo API Gateway:        http://localhost:8080
echo Sever-Fish Backend: http://localhost:8000
echo AIS Backend:        http://localhost:8001
echo.
echo Для остановки всех компонентов запустите stop-all.bat
echo Логи доступны в папке logs\
echo.

endlocal