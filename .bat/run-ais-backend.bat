@echo off
rem Script for starting AIS backend
rem Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

echo =========================================================
echo    Starting AIS Backend on port 8001    
echo =========================================================

cd ais\ais-backend

rem Check for virtual environment
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

echo Starting AIS backend on port 8001...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

rem Add pause to keep window open
pause