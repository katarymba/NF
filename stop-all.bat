@echo off
setlocal enabledelayedexpansion

echo ====================================
echo = Stopping all components         =
echo ====================================
echo Current time: %date% %time%
echo User: %username%

:: Define commonly used ports
set PORTS=8000 8001 8080 5173 5174

:: Clean up ports that might be in use
echo [%time%] Checking for processes using our ports...
for %%p in (%PORTS%) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Terminating process with PID %%a using port %%p...
        taskkill /F /PID %%a >nul 2>&1
        if !errorlevel! equ 0 (
            echo [SUCCESS] Process PID %%a terminated
        ) else (
            echo [WARNING] Could not terminate process PID %%a
        )
    )
)

:: Check for PID directory
if not exist "pids" (
    echo PID directory not found. Components may not be running.
    goto check_processes
)

:: Process all PID files and terminate corresponding processes
for %%f in (pids\*.pid) do (
    set "component=%%~nf"
    set /p pid=<%%f
    
    echo [%time%] Stopping !component! (PID: !pid!)...
    
    :: Check if process exists
    tasklist /FI "PID eq !pid!" 2>nul | find /i "!pid!" >nul
    if not errorlevel 1 (
        :: Process exists, terminate it
        taskkill /F /PID !pid! >nul 2>&1
        if errorlevel 1 (
            echo [ERROR] Failed to terminate process !component! (PID: !pid!)
        ) else (
            echo [%time%] Process !component! successfully stopped
        )
    ) else (
        echo [SKIPPED] Process !component! (PID: !pid!) not found
    )
    
    :: Delete PID file
    del %%f >nul 2>&1
)

:check_processes
:: Additional search for processes by name that might not be in PID files
echo [%time%] Additional process check...

:: Search and terminate Node.js processes (frontends)
tasklist /FI "IMAGENAME eq node.exe" 2>nul | find /i "node.exe" >nul
if not errorlevel 1 (
    echo [%time%] Terminating Node.js processes...
    taskkill /F /IM node.exe >nul 2>&1
)

:: Search and terminate Python processes (backends)
echo [%time%] Checking for Python processes...
for /f "tokens=1,2" %%a in ('tasklist /FI "IMAGENAME eq python.exe" ^| findstr /i "python"') do (
    echo Found Python process: PID %%b
    
    :: Only kill python processes that are running uvicorn
    for /f "tokens=1,*" %%c in ('wmic process where "ProcessID=%%b" get CommandLine 2^>nul ^| findstr /i "uvicorn"') do (
        echo Terminating Python process PID %%b (uvicorn)
        taskkill /F /PID %%b >nul 2>&1
    )
)

:: Search for specific Python processes running uvicorn
echo [%time%] Looking for specific uvicorn processes...
wmic process where "CommandLine like '%%uvicorn%%'" get ProcessId 2>nul | findstr /r "[0-9]" > temp_pids.txt
if exist temp_pids.txt (
    for /f "skip=1" %%p in (temp_pids.txt) do (
        if not "%%p"=="" (
            echo Terminating uvicorn process with PID %%p
            taskkill /F /PID %%p >nul 2>&1
        )
    )
    del temp_pids.txt >nul 2>&1
)

:: Find and close command windows opened by run-all.bat
echo [%time%] Closing command windows opened by run-all.bat...

:: Find command windows with specific titles
:: For API Gateway window
for /f "tokens=2" %%w in ('tasklist /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq *API Gateway*" /v /fo list ^| findstr "PID:"') do (
    echo Closing API Gateway command window (PID: %%w)
    taskkill /F /PID %%w >nul 2>&1
)

:: For backend windows
for /f "tokens=2" %%w in ('tasklist /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq *backend*" /v /fo list ^| findstr "PID:"') do (
    echo Closing backend command window (PID: %%w)
    taskkill /F /PID %%w >nul 2>&1
)

:: For frontend windows
for /f "tokens=2" %%w in ('tasklist /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq *frontend*" /v /fo list ^| findstr "PID:"') do (
    echo Closing frontend command window (PID: %%w)
    taskkill /F /PID %%w >nul 2>&1
)

:: Close any remaining command windows with our bat file names in the title
for %%b in (run-api-gateway run-ais-backend run-sever-ryba-backend run-ais-frontend run-sever-ryba-frontend) do (
    for /f "tokens=2" %%w in ('tasklist /FI "IMAGENAME eq cmd.exe" /FI "WINDOWTITLE eq *%%b*" /v /fo list ^| findstr "PID:"') do (
        echo Closing %%b command window (PID: %%w)
        taskkill /F /PID %%w >nul 2>&1
    )
)

:: Close any remaining command prompts running npm or python
echo [%time%] Checking for remaining command windows running npm or python...
for /f "tokens=2" %%w in ('tasklist /FI "IMAGENAME eq cmd.exe" /v /fo list ^| findstr "PID:"') do (
    wmic process where "ProcessID=%%w" get CommandLine 2>nul | findstr /i "npm python uvicorn" >nul
    if not errorlevel 1 (
        echo Closing command window running npm/python (PID: %%w)
        taskkill /F /PID %%w >nul 2>&1
    )
)

:: Remove PID directory
if exist "pids" rmdir /s /q pids 2>nul

echo.
echo ====================================
echo = All components stopped          =
echo ====================================
echo.
echo Stop completed at %date% %time%
echo If you still have issues with ports being in use,
echo you may need to restart your computer or manually
echo check running processes with Task Manager.

:end
endlocal
pause