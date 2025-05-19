@echo off
setlocal enabledelayedexpansion

echo ====================================
echo = Инициализация баз данных проекта =
echo ====================================
echo.

:: Функция для инициализации БД компонента
:init_db_component
set component_name=%~1
set component_path=%~2
set init_command=%~3

echo [%time%] Инициализация БД для %component_name%...
cd %component_path%

:: Запускаем инициализацию БД
%init_command%
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось инициализировать БД для %component_name%
    pause
    exit /b %errorlevel%
)

echo [%time%] БД для %component_name% успешно инициализирована
echo.
cd ..\..\
exit /b 0

:: ========= Инициализация БД для всех компонентов =========

:: 1. Sever-Fish Backend
call :init_db_component "Sever-Fish Backend" "Sever-Fish\backend" ".venv\Scripts\activate.bat && alembic upgrade head"

:: 2. AIS Backend
call :init_db_component "AIS Backend" "ais\ais-backend" ".venv\Scripts\activate.bat && alembic upgrade head"

:: 3. Создание администратора AIS
echo [%time%] Создание администратора для AIS...
cd ais\ais-backend
call .venv\Scripts\activate.bat && python init_admin.py
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось создать администратора для AIS
    pause
    exit /b %errorlevel%
)
echo [%time%] Администратор для AIS успешно создан
echo.
cd ..\..\

echo.
echo ====================================
echo = Инициализация БД завершена      =
echo ====================================
echo.
echo Учетные данные административного пользователя:
echo Логин: main_admin
echo Пароль: qwerty123
echo.
echo Теперь вы можете запустить проект командой:
echo start-all.bat
echo.

pause
endlocal