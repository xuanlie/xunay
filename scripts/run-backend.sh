#!/bin/bash
set -e
cd "$(dirname "$0")/.."

VENV_DIR=".venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "创建虚拟环境..."
  python3 -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

if ! python -c "import uvicorn" 2>/dev/null; then
  echo "安装依赖..."
  pip install --upgrade pip -q
  pip install -r backend/requirements.txt -q
fi

exec python -m uvicorn backend.main:app --host 0.0.0.0 --port 12342
