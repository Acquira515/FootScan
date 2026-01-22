# Windows build script for Football Prediction Desktop App

@echo off
echo Building Football Prediction Desktop App...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
cd electron\renderer
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install npm dependencies
    pause
    exit /b 1
)

echo.
echo Building React app...
call npm run react-build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build React app
    pause
    exit /b 1
)

cd ..\..

echo.
echo Installing Python dependencies...
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo Building PyInstaller executable...
pip install pyinstaller
cd backend\app
pyinstaller --onefile --windowed ^
    --name "football-backend" ^
    --icon=..\..\electron\public\icon.ico ^
    main.py
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build Python executable
    pause
    exit /b 1
)

cd ..\..

echo.
echo Building Electron app...
cd electron
call npm run build-win
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build Electron app
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo Installer location: electron\dist\Football Prediction Setup.exe
pause
