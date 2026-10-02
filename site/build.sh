#!/bin/bash
set -e
cd "$(dirname "$0")"

echo "[1/3] 生成文档..."
python3 gen-docs.py

echo "[2/3] 编译 app.xuy..."
node ../bin/xuyc.js build app.xuy --out dist

echo "[3/3] 移除 ui.css / tw.css 引用..."
sed -i 's|<link rel="stylesheet" href="./tw.css">||g' dist/index.html
sed -i 's|<link rel="stylesheet" href="./ui.css">||g' dist/index.html

echo "完成: $(pwd)/dist"
