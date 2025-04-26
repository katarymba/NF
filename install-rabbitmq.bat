@echo off
echo =========================================================
echo    Установка RabbitMQ для проекта NF   
echo =========================================================

REM Проверяем, установлен ли Chocolatey
where choco > nul 2>&1
if %errorlevel% neq 0 (
    echo Установка Chocolatey...
    @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
) else (
    echo Chocolatey уже установлен.
)

REM Проверяем, установлен ли Erlang
where erl > nul 2>&1
if %errorlevel% neq 0 (
    echo Установка Erlang...
    choco install erlang -y
) else (
    echo Erlang уже установлен.
)

REM Проверяем, установлен ли RabbitMQ
where rabbitmqctl > nul 2>&1
if %errorlevel% neq 0 (
    echo Установка RabbitMQ...
    choco install rabbitmq -y
) else (
    echo RabbitMQ уже установлен.
)

echo.
echo ============================================
echo    Проверка статуса службы RabbitMQ    
echo ============================================

sc query RabbitMQ | find "RUNNING" > nul
if %errorlevel% neq 0 (
    echo Запуск службы RabbitMQ...
    net start RabbitMQ
) else (
    echo Служба RabbitMQ уже запущена.
)

echo.
echo RabbitMQ Management UI доступен по адресу: http://localhost:15672
echo Логин: guest
echo Пароль: guest
echo.
echo Нажмите любую клавишу для завершения...
pause > nul