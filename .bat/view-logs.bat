@echo off
rem Скрипт для просмотра логов без цветового оформления

if "%1"=="" (
    echo Необходимо указать название компонента.
    echo Использование: view-logs.bat [компонент]
    echo.
    echo Доступные компоненты:
    echo   sever-ryba-backend
    echo   ais-backend
    echo   api-gateway
    echo   sever-ryba-frontend
    echo   ais-frontend
    exit /b 1
)

set "COMPONENT=%1"
set "LOG_FILE=logs\%COMPONENT%.log"

if not exist "%LOG_FILE%" (
    echo Файл логов %LOG_FILE% не найден.
    exit /b 1
)

echo Просмотр логов компонента: %COMPONENT%
echo.

rem Используем PowerShell для вывода последних строк лога (аналог tail)
powershell -Command "Get-Content -Path '%LOG_FILE%' -Tail 30"

echo.
echo Для просмотра логов в реальном времени используйте:
echo powershell -Command "Get-Content -Path '%LOG_FILE%' -Tail 30 -Wait"