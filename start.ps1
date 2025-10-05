# 🚀 Start Both Frontend and Backend (PowerShell)

Write-Host "🌌 Starting NASA Geo Viewer - Full Stack" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pnpm is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Start backend in background
Write-Host ""
Write-Host "🐍 Starting Python backend..." -ForegroundColor Yellow
Push-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies if needed
if (-not (Test-Path "venv\.installed")) {
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
    pip install -r requirements.txt
    New-Item -Path "venv\.installed" -ItemType File -Force | Out-Null
}

# Start Flask backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    .\venv\Scripts\Activate.ps1
    python app.py
}

Write-Host "✅ Backend started (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Go back to root
Pop-Location

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start frontend
Write-Host ""
Write-Host "⚛️  Starting Next.js frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    pnpm dev
}

Write-Host "✅ Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Display info
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🎉 Both servers are running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "🐍 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "📖 API Docs: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to view output or stop servers" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# Monitor jobs
try {
    while ($true) {
        # Check if jobs are still running
        if ($backendJob.State -ne "Running") {
            Write-Host "❌ Backend stopped unexpectedly" -ForegroundColor Red
            Receive-Job -Job $backendJob
            break
        }
        
        if ($frontendJob.State -ne "Running") {
            Write-Host "❌ Frontend stopped unexpectedly" -ForegroundColor Red
            Receive-Job -Job $frontendJob
            break
        }
        
        Start-Sleep -Seconds 2
    }
}
finally {
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob, $frontendJob
    Remove-Job -Job $backendJob, $frontendJob
    Write-Host "✅ Servers stopped" -ForegroundColor Green
}
