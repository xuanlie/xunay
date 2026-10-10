#!/bin/bash
set -e
cd "$(dirname "$0")/../core"

echo "构建..."
node build.js

echo "包体积："
node ../bench/size.js

echo ""
echo "登录 npm..."
npm whoami || npm login

echo ""
echo "发布..."
npm publish

echo ""
echo "✔ 发布完成"
