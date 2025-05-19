@echo off
setlocal enabledelayedexpansion

echo ============================================
echo = Установка зависимостей для всех компонентов =
echo ============================================
echo.

:: Функция для установки компонента
:install_component
set component_name=%~1
set install_command=%~2
echo [%time%] Установка зависимостей для %component_name%...
echo.

:: Запускаем установку
cd %~3
%install_command%
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить зависимости для %component_name%
    pause
    exit /b %errorlevel%
)

echo [%time%] Зависимости для %component_name% успешно установлены
echo.
cd ..\..\
exit /b 0

:: ========= Установка для всех компонентов =========

:: 1. API Gateway
call :install_component "API Gateway" "python -m venv .venv && .venv\Scripts\activate.bat && pip install -r requirements.txt" "api-gateway"

:: 2. Sever-Fish Backend
call :install_component "Sever-Fish Backend" "python -m venv .venv && .venv\Scripts\activate.bat && pip install -r requirements.txt" "Sever-Fish\backend"

:: 3. AIS Backend
call :install_component "AIS Backend" "python -m venv .venv && .venv\Scripts\activate.bat && pip install -r requirements.txt" "ais\ais-backend"

:: 4. Sever-Fish Frontend
call :install_component "Sever-Fish Frontend" "npm install" "Sever-Fish\frontend"

:: 5. AIS Frontend
call :install_component "AIS Frontend" "npm install" "ais\ais-frontend"

echo.
echo ============================================
echo = Все зависимости успешно установлены     =
echo ============================================
echo.
echo Теперь вы можете запустить проект командой:
echo start-all.bat
echo.

pause
endlocal