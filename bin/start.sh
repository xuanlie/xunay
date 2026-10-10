#!/bin/bash
cd "$(dirname "$0")/.."

BACKEND=$(node -e "console.log(JSON.parse(require('fs').readFileSync('xunay.config.json')).backend)")
PORT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('xunay.config.json')).ports['$BACKEND'])")

echo "启动 $BACKEND 后端，端口 $PORT"
echo ""

case "$BACKEND" in
  python)
    cd backends/python
    if ! python -c "import fastapi" 2>/dev/null; then
      pip install fastapi uvicorn pydantic -q
    fi
    exec python -m uvicorn main:app --host 0.0.0.0 --port "$PORT"
    ;;
  go)
    cd backends/go
    if [ ! -f go.sum ]; then go mod tidy; fi
    exec go run .
    ;;
  cpp)
    cd backends/cpp
    mkdir -p build && cd build
    if [ ! -f Makefile ]; then cmake ..; fi
    make -j 2>/dev/null
    exec ./server
    ;;
  node)
    cd backends/node
    exec node server.js
    ;;
  *)
    echo "未知后端: $BACKEND"
    exit 1
    ;;
esac
