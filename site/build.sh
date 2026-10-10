#!/bin/bash
set -e
cd "$(dirname "$0")"
OUT_DIR=dist

echo "[1/3] 生成文档..."
python3 gen-docs.py

echo "[2/3] 编译 app.xuy..."
node ../bin/xuyc.js build app.xuy --out dist --splitting


# 自动加 hash，避免浏览器缓存
echo "[3.5/3] 加 hash 版本号..."
APPJS="$OUT_DIR/app.js"
if [ -f "$APPJS" ]; then
  HASH=$(md5sum "$APPJS" | cut -c1-8)
  mv "$APPJS" "$OUT_DIR/app.$HASH.js"
  # xuyc 生成时引用 ./app.js；兼容 ./app.xxx.js 重跑
  sed -i -E "s|src=\"\./app(\.[a-z0-9]+)?\.js[^\"]*\"|src=\"./app.$HASH.js\"|g" "$OUT_DIR/index.html"
  echo "  app.js → app.$HASH.js"
fi

echo "[3/3] 移除 ui.css / tw.css 引用..."
sed -i 's|<link rel="stylesheet" href="./tw.css">||g' dist/index.html
sed -i 's|<link rel="stylesheet" href="./ui.css">||g' dist/index.html

echo "完成: $(pwd)/dist"
