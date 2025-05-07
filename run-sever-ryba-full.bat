@echo off
echo =========================================================
echo    Starting Sever-Ryba System (backend + frontend)
echo =========================================================

REM Starting Sever-Ryba backend
start run-sever-ryba-backend.bat

REM Pause before starting frontend to ensure backend is up
timeout /t 2 /nobreak

REM Starting Sever-Ryba frontend
start run-sever-ryba-frontend.bat

echo Sever-Ryba components started:
echo - Sever-Ryba backend:   http://localhost:8000
echo - Sever-Ryba frontend:  http://localhost:5173

echo To stop all processes, close the command prompt windows