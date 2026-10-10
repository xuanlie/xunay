#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "==================== 完整基准测试 ===================="
echo ""

echo "[1/4] 包体积"
node bench/size.js
echo ""

echo "[2/4] SSR 性能"
node bench/ssr.js
echo ""

echo "[3/4] 单元测试"
cd core/test && node run.js
cd ../..
echo ""

echo "[4/4] 核心包 gzip 复查"
gzip -9 -c core/dist/xunay.min.js | wc -c
echo ""

echo "==================== 全部完成 ===================="
