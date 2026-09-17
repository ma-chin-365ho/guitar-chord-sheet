#!/usr/bin/env bash
set -e

CONTAINER_NAME="chordcraft-dev"
IMAGE_NAME="mcr.microsoft.com/devcontainers/javascript-node:20-bookworm"
WORKSPACE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
  run|dev)
    echo "Starting Vite dev server in container..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker run --rm -it \
      --name "$CONTAINER_NAME" \
      -p 5173:5173 \
      -u 1000:1000 \
      -v "$WORKSPACE_DIR:/workspace" \
      -w /workspace \
      "$IMAGE_NAME" \
      npm run dev
    ;;
  bash|shell)
    echo "Entering devcontainer bash shell..."
    # If container is already running, exec into it; otherwise run a new one
    if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
      docker exec -it -u 1000:1000 -w /workspace "$CONTAINER_NAME" bash
    else
      docker run --rm -it \
        -p 5173:5173 \
        -u 1000:1000 \
        -v "$WORKSPACE_DIR:/workspace" \
        -w /workspace \
        "$IMAGE_NAME" \
        bash
    fi
    ;;
  build)
    echo "Building application in container..."
    docker run --rm \
      -u 1000:1000 \
      -v "$WORKSPACE_DIR:/workspace" \
      -w /workspace \
      "$IMAGE_NAME" \
      npm run build
    ;;
  npm)
    shift
    docker run --rm -it \
      -u 1000:1000 \
      -v "$WORKSPACE_DIR:/workspace" \
      -w /workspace \
      "$IMAGE_NAME" \
      npm "$@"
    ;;
  stop)
    echo "Stopping dev container..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    ;;
  *)
    echo "ChordCraft DevContainer Helper"
    echo "Usage:"
    echo "  ./dev.sh dev       - Start Vite dev server on http://localhost:5173"
    echo "  ./dev.sh bash      - Open interactive bash shell inside devcontainer"
    echo "  ./dev.sh build     - Build production bundle in container"
    echo "  ./dev.sh npm <cmd> - Run npm command in container (e.g. ./dev.sh npm install <pkg>)"
    echo "  ./dev.sh stop      - Stop background dev server"
    ;;
esac
