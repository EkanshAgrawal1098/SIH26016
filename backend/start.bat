@echo off
cd /d %~dp0
echo Starting FastAPI Backend Server...
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
