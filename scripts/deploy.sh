#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "构建前端..."
cd core && node build.js && cd ..

echo "重启后端..."
pkill -f granian || true
sleep 1
nohup bash scripts/run-backend.sh > /tmp/xunay.log 2>&1 &
sleep 2

echo "✔ 部署完成"
echo "查看日志: tail -f /tmp/xunay.log"
