#!/usr/bin/env bash
set -e
echo "▶ 视觉 + 无障碍测试（前提：12342 在跑）"
npx playwright test "$@"
echo "▶ 报告：e2e/report/index.html"
