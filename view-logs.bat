@echo off
setlocal

:: Проверка наличия директории с логами
if not exist "logs" (
    echo Папка logs не найдена. Логи отсутствуют.
    goto end
)

:: Вывод списка доступных лог-файлов
echo ====================================
echo = Доступные логи компонентов      =
echo ====================================
echo.

set /a i=0
for %%f in (logs\*.log) do (
    set /a i+=1
    set "file[!i!]=%%f"
    echo !i!. %%~nf
)

if %i%==0 (
    echo Лог-файлы не найдены.
    goto end
)

:: Запрос у пользователя, какой лог открыть
echo.
set /p choice="Выберите номер лог-файла для просмотра (или 'q' для выхода): "

if /i "%choice%"=="q" goto end

:: Проверка на корректный ввод
set /a choice_num=choice 2>nul
if %choice_num% LEQ 0 goto invalid_input
if %choice_num% GTR %i% goto invalid_input

:: Открытие выбранного лог-файла
start notepad.exe "!file[%choice_num%]!"
goto end

:invalid_input
echo Некорректный ввод. Пожалуйста, введите число от 1 до %i%.
goto end

:end
endlocal