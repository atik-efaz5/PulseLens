#!/bin/bash
set -e

echo "🚀 Starting PulseLens Local Development Environment"
echo ""

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Backend .env
if [ ! -f "$ROOT/backend/.env" ]; then
  echo "Creating backend/.env from .env.example..."
  cp "$ROOT/.env.example" "$ROOT/backend/.env"
  echo "⚠️  Edit backend/.env with your API keys (DEMO_MODE=true works without keys)"
fi

# Dashboard .env
if [ ! -f "$ROOT/pulselens-dashboard/.env.local" ]; then
  echo "API_URL=http://localhost:3001" > "$ROOT/pulselens-dashboard/.env.local"
fi

# Install deps
if [ ! -d "$ROOT/backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  (cd "$ROOT/backend" && npm install)
fi

if [ ! -d "$ROOT/pulselens-dashboard/node_modules" ]; then
  echo "📦 Installing dashboard dependencies..."
  (cd "$ROOT/pulselens-dashboard" && npm install)
fi

export DEMO_MODE=true
export NODE_ENV=development

# Pick a free dashboard port (default 3000)
DASHBOARD_PORT=3000
if lsof -ti :"$DASHBOARD_PORT" >/dev/null 2>&1; then
  for p in 3002 3003 3004 3005; do
    if ! lsof -ti :"$p" >/dev/null 2>&1; then
      DASHBOARD_PORT=$p
      break
    fi
  done
fi

echo ""
echo "Starting services:"
echo "  Backend:   http://localhost:3001"
echo "  Dashboard: http://localhost:${DASHBOARD_PORT}"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

trap 'kill 0' EXIT

(cd "$ROOT/backend" && DEMO_MODE=true npm run dev) &
(cd "$ROOT/pulselens-dashboard" && npx next dev -p "$DASHBOARD_PORT") &

wait
