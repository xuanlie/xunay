#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "安装 systemd 服务..."
cp deploy/xunay.service /etc/systemd/system/xunay.service
systemctl daemon-reload
systemctl enable xunay
systemctl restart xunay

echo "✔ 服务已安装"
echo "查看状态: systemctl status xunay"
echo "查看日志: journalctl -u xunay -f"
