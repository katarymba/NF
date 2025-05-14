@echo off
echo =========================================================
echo    Starting NorthFish Infrastructure   
echo =========================================================

REM Starting API Gateway
start run-api-gateway.bat

REM Short pause to allow API Gateway to start
timeout /t 3 /nobreak

REM Starting backends
start run-sever-ryba-backend.bat
start run-ais-backend.bat

REM Pause before starting frontends to ensure backends are running
timeout /t 2 /nobreak

REM Starting frontends
start run-sever-ryba-frontend.bat
start run-ais-frontend.bat

echo All components started:
echo - API Gateway:         http://localhost:8080
echo - Sever-Ryba backend:  http://localhost:8000
echo - AIS backend:         http://localhost:8001
echo - Sever-Ryba frontend: http://localhost:5173
echo - AIS frontend:        http://localhost:5174

echo To stop processes, close command prompt windows
echo or run stop-all.bat