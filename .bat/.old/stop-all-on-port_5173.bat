@echo off
set PORT=8001

echo Поиск процесса, использующего порт %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo Завершение процесса с PID %%a, использующего порт %PORT%...
    taskkill /F /PID %%a
)

echo Готово.
pause
