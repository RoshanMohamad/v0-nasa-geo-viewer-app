#!/bin/bash

# 🚀 Start Both Frontend and Backend

echo "🌌 Starting NASA Geo Viewer - Full Stack"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install it first."
    exit 1
fi

# Start backend in background
echo ""
echo "🐍 Starting Python backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Start Flask backend
python app.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"

# Go back to root
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Start frontend
echo ""
echo "⚛️  Starting Next.js frontend..."
pnpm dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"

# Display info
echo ""
echo "=========================================="
echo "🎉 Both servers are running!"
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "🐍 Backend:  http://localhost:5000"
echo "📖 API Docs: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=========================================="

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait
