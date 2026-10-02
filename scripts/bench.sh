#!/bin/bash
cd "$(dirname "$0")/.."
echo "=== 包体积 ==="
node bench/size.js
echo ""
echo "=== SSR ==="
node bench/ssr.js
echo ""
echo "=== 单元测试 ==="
cd core/test && node run.js
