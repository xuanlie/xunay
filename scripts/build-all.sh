#!/bin/bash
cd "$(dirname "$0")/.."
echo "打包 XuNay 核心..."
cd core && node build.js
echo ""
echo "包体积："
node ../bench/size.js
