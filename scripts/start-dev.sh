#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Checking cluster..."
kubectl get nodes >/dev/null

echo "==> Starting backend on :8080"
cd "$ROOT/backend"
go run ./cmd/server &
BACKEND_PID=$!

cleanup() {
  echo "Stopping backend ($BACKEND_PID)..."
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> Starting frontend on :5173"
cd "$ROOT/frontend"
npm run dev
