@echo off
REM Startup Script for SAP Supplier Decision Intelligence Platform POC
echo =========================================================================
echo Starting SAP Supplier Decision Intelligence Platform (Enterprise POC)
echo =========================================================================

REM Validate Mock Data
echo [1/3] Validating 22 mock datasets...
python "%~dp0validate_mock_data.py"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Mock data validation failed! Regenerating data...
    python "%~dp0generate_mock_data.py"
)

REM Start Backend
echo [2/3] Starting FastAPI Backend on http://localhost:8000...
start "SDI-Backend" cmd /k "cd /d %~dp0..\backend && set PYTHONPATH=. && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM Start Frontend
echo [3/3] Starting Vite Frontend on http://localhost:5173...
start "SDI-Frontend" cmd /k "cd /d %~dp0..\frontend && npm.cmd run dev"

echo =========================================================================
echo Platform services launched!
echo - Frontend Workspace: http://localhost:5173
echo - Backend API Docs:   http://localhost:8000/docs
echo =========================================================================
pause
