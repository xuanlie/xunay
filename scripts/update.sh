#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "拉取最新代码..."
git pull

echo "构建核心包..."
cd core && node build.js && cd ..

echo "重启后端..."
if systemctl is-active --quiet xunay; then
  systemctl restart xunay
else
  pkill -f granian || true
  sleep 1
  nohup bash scripts/run-backend.sh > /tmp/xunay.log 2>&1 &
fi

echo "✔ 更新完成"
