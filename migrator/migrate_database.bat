@echo off
echo =========================================================
echo    Миграция базы данных Sever-Ryba в North-Fish
echo =========================================================

cd Sever-Fish\backend
python migrate_database.py

echo.
echo Проверьте успешность миграции, подключившись к новой базе данных.
echo.
pause