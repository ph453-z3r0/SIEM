#!/bin/bash
echo "Stopping existing services..."
pkill -f "uvicorn app.main:app"
pkill -f "vite"
pkill -f "python3 live_demo.py"

echo "Clearing database..."
rm -f sentinel.db
rm -f backend/sentinel.db
rm -f sentinel.db-journal
rm -f backend/sentinel.db-journal

echo "Data cleared."

echo "Starting Backend..."
cd backend
# Run in background, redirect output to log
nohup python3 -m uvicorn app.main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

cd ../frontend
echo "Starting Frontend..."
# Run in background
nohup npm run dev -- --port 5173 --host > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

echo "Waiting for services to initialize..."
sleep 5

echo "Setup complete. Logs are in backend.log and frontend.log"
