# Development startup script for Windows

@echo off
echo Starting Football Prediction Desktop App (Development Mode)...

REM Install backend dependencies
echo Installing Python dependencies...
python -m pip install -r backend\requirements.txt

REM Install frontend dependencies
echo Installing Node dependencies...
cd electron\renderer
call npm install
cd ..\..

REM Start backend
echo Starting backend server...
start python backend\app\main.py

REM Wait for backend to start
timeout /t 3

REM Start frontend in development mode
echo Starting frontend...
cd electron\renderer
call npm start
