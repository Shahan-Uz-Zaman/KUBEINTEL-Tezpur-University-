#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building backend image..."
docker build -t kubeintel-backend:latest "$ROOT/backend"

echo "Building frontend image..."
docker build -t kubeintel-frontend:latest "$ROOT/frontend"

echo "Done."
docker images | grep kubeintel
