@echo off
setlocal

echo ====================================
echo = Остановка всех компонентов      =
echo ====================================

:: Проверка наличия директории с PID файлами
if not exist "pids" (
    echo Папка pids не найдена. Возможно, компоненты не запущены.
    goto end
)

:: Перебор всех PID файлов и завершение соответствующих процессов
for %%f in (pids\*.pid) do (
    set "component=%%~nf"
    set /p pid=<%%f
    
    echo [%time%] Остановка !component! (PID: !pid!)...
    
    :: Проверка существования процесса
    tasklist /FI "PID eq !pid!" 2>nul | find /i "!pid!" >nul
    if not errorlevel 1 (
        :: Процесс существует, завершаем его
        taskkill /F /PID !pid! >nul 2>&1
        if errorlevel 1 (
            echo [ОШИБКА] Не удалось завершить процесс !component! (PID: !pid!)
        ) else (
            echo [%time%] Процесс !component! успешно остановлен
        )
    ) else (
        echo [ПРОПУЩЕНО] Процесс !component! (PID: !pid!) не найден
    )
    
    :: Удаляем PID файл
    del %%f >nul 2>&1
)

:: Дополнительный поиск процессов по названиям, которые могли не попасть в PID файлы
echo [%time%] Дополнительная проверка процессов...

:: Поиск и завершение процессов Node.js (фронтенды)
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if not errorlevel 1 (
    echo [%time%] Завершение процессов Node.js...
    taskkill /F /IM node.exe >nul 2>&1
)

:: Поиск и завершение процессов Python (бэкенды)
tasklist /FI "IMAGENAME eq python.exe" 2>nul | find /i "python.exe" >nul
if not errorlevel 1 (
    echo [%time%] Завершение процессов Python...
    taskkill /F /IM python.exe >nul 2>&1
)

:: Удаление директории PID файлов
rmdir /s /q pids 2>nul

echo.
echo ====================================
echo = Все компоненты остановлены      =
echo ====================================

:end
endlocal