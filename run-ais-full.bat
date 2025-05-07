@echo off
echo =========================================================
echo    Starting AIS System (backend + frontend)
echo =========================================================

REM Starting AIS backend
start run-ais-backend.bat

REM Pause before starting frontend to ensure backend is up
timeout /t 3 /nobreak

REM Starting AIS frontend
start run-ais-frontend.bat

echo AIS components started:
echo - AIS backend:   http://localhost:8001
echo - AIS frontend:  http://localhost:5174