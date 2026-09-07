@echo off
echo Starting PulseLens Local Development Environment

set ROOT=%~dp0

if not exist "%ROOT%backend\.env" (
  copy "%ROOT%.env.example" "%ROOT%backend\.env"
  echo Created backend\.env - edit with your API keys
)

if not exist "%ROOT%pulselens-dashboard\.env.local" (
  echo NEXT_PUBLIC_API_URL=http://localhost:3001> "%ROOT%pulselens-dashboard\.env.local"
)

cd /d "%ROOT%backend"
if not exist node_modules call npm install
start "PulseLens Backend" cmd /k "set DEMO_MODE=true && npm run dev"

cd /d "%ROOT%pulselens-dashboard"
if not exist node_modules call npm install
start "PulseLens Dashboard" cmd /k "npm run dev"

echo.
echo Backend:   http://localhost:3001
echo Dashboard: http://localhost:3000
