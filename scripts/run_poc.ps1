# PowerShell Startup Script for SAP Supplier Decision Intelligence Platform POC
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "Starting SAP Supplier Decision Intelligence Platform (Enterprise POC)" -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# 1. Validate Mock Data
Write-Host "[1/3] Validating 22 mock procurement datasets..." -ForegroundColor Yellow
python "$scriptDir\validate_mock_data.py"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Re-generating mock data with fixed seed..." -ForegroundColor Magenta
    python "$scriptDir\generate_mock_data.py"
}

# 2. Start Backend
Write-Host "[2/3] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendPath = Join-Path $projectRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='.'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -WorkingDirectory $backendPath

# 3. Start Frontend
Write-Host "[3/3] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendPath = Join-Path $projectRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm.cmd run dev" -WorkingDirectory $frontendPath

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "Platform services successfully launched!" -ForegroundColor Cyan
Write-Host " - Frontend Application: http://localhost:5173" -ForegroundColor White
Write-Host " - Backend Swagger API:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan
