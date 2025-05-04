@echo off
setlocal EnableDelayedExpansion

:: Set working directory to the script's folder
cd /d "%~dp0"

echo [INFO] Checking for Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [INFO] Node.js not found. Installing...

    :: Download Node.js silently
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi -OutFile node_installer.msi"
    powershell -Command "Start-Process msiexec.exe -ArgumentList '/i node_installer.msi /qn /norestart' -Wait"
    del node_installer.msi

    :: Update PATH for this session
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

:: Verify Node.js installation
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js installation failed.
    pause
    exit /b
)

echo [INFO] Installing required packages...

:: Install puppeteer-core and node-fetch@2 (quietly)
call npm install puppeteer-core node-fetch@2 >nul 2>&1

:: OPTIONAL: If you want full Puppeteer (with bundled Chromium), uncomment the next line
:: call npm install puppeteer

echo [INFO] Running System_Check.js...
node System_Check.js

echo.
echo [DONE] Script finished. Press any key to exit...
pause >nul
exit /b
