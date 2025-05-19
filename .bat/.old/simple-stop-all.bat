@echo off
rem Скрипт для остановки всех компонентов без цветового оформления

rem Список портов для остановки процессов
set "PORTS=8000 8001 8080 5173 3000"
set "PROCESS_NAMES=Sever-Ryba Backend AIS Backend API Gateway Sever-Ryba Frontend AIS Frontend"

echo =========================================================
echo    Остановка всех компонентов Север-Рыба и АИС    
echo =========================================================

rem Остановка процессов по портам
for %%p in (%PORTS%) do (
    echo Остановка процессов на порту: %%p
    
    rem Находим PID процесса, слушающего порт
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        set pid=%%a
        
        rem Проверяем, что PID действительно является числом
        echo !pid! | findstr /r "^[0-9][0-9]*$" > nul
        if not errorlevel 1 (
            echo Завершение процесса с PID: !pid!
            taskkill /F /PID !pid! > nul 2>&1
            if not errorlevel 1 (
                echo Процесс на порту %%p успешно остановлен
            ) else (
                echo Не удалось остановить процесс на порту %%p
            )
        )
    )
)

rem Остановка всех cmd.exe окон с нашими процессами
echo Остановка всех окон с процессами...
taskkill /F /FI "WINDOWTITLE eq Sever-Ryba Backend*" > nul 2>&1
taskkill /F /FI "WINDOWTITLE eq AIS Backend*" > nul 2>&1
taskkill /F /FI "WINDOWTITLE eq API Gateway*" > nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Sever-Ryba Frontend*" > nul 2>&1
taskkill /F /FI "WINDOWTITLE eq AIS Frontend*" > nul 2>&1

echo.
echo ============================================
echo    Все компоненты остановлены!    
echo ============================================