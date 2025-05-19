@echo off
setlocal enabledelayedexpansion

echo ====================================
echo = Статус компонентов проекта      =
echo ====================================
echo.

:: Проверка статуса запущенных компонентов
set components=api-gateway sever-fish-backend ais-backend sever-fish-frontend ais-frontend

for %%c in (%components%) do (
    echo [%%c]
    if exist "pids\%%c.pid" (
        set /p pid=<pids\%%c.pid
        tasklist /FI "PID eq !pid!" 2>nul | find /i "!pid!" >nul
        if not errorlevel 1 (
            echo    Статус: ЗАПУЩЕН
            echo    PID: !pid!
            
            :: Определяем порт для бэкенд-компонентов
            if "%%c"=="api-gateway" (
                set "port=8080"
                set "url=http://localhost:!port!"
            ) else if "%%c"=="sever-fish-backend" (
                set "port=8000"
                set "url=http://localhost:!port!"
            ) else if "%%c"=="ais-backend" (
                set "port=8001"
                set "url=http://localhost:!port!"
            ) else (
                set "port="
                set "url="
            )
            
            :: Проверка доступности URL для бэкенд-компонентов
            if defined port (
                ping -n 1 localhost:!port! >nul 2>&1
                if not errorlevel 1 (
                    echo    URL: !url! (доступен)
                ) else (
                    echo    URL: !url! (недоступен)
                )
            )
        ) else (
            echo    Статус: ОСТАНОВЛЕН (процесс не найден)
            echo    PID файл будет удален
            del "pids\%%c.pid" >nul 2>&1
        )
    ) else (
        echo    Статус: НЕ ЗАПУЩЕН
    )
    echo.
)

:: Проверка состояния PostgreSQL
echo [PostgreSQL]
sc query postgresql-x64-15 | find "RUNNING" >nul 2>&1
if not errorlevel 1 (
    echo    Статус: ЗАПУЩЕН
    echo    Тип: Служба Windows
) else (
    echo    Статус: ОСТАНОВЛЕН
)
echo.

echo ====================================
echo Доступные действия:
echo 1. Запустить все компоненты (start-all.bat)
echo 2. Остановить все компоненты (stop-all.bat)
echo 3. Просмотреть логи (view-logs.bat)
echo.
set /p choice="Выберите действие (1-3) или нажмите Enter для выхода: "

if "%choice%"=="1" (
    call start-all.bat
) else if "%choice%"=="2" (
    call stop-all.bat
) else if "%choice%"=="3" (
    call view-logs.bat
)

endlocal