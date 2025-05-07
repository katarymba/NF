@echo off
echo =========================================================
echo    Starting Sever-Ryba Backend on port 8000    
echo =========================================================

cd Sever-Fish\backend

rem Check for virtual environment
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

echo Starting Sever-Ryba backend on port 8000...
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

rem Add pause to keep window open in case of error
pause