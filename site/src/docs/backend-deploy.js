// 部署
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("部署"),
    P("xunay 应用可以部署到任何支持 Node / Python / Go / C++ 的服务器。"),
    H2("前端部署"),
    P("前端是静态文件——丢到 nginx / CDN / 任意静态托管。"),
    Code("# 构建\ncd myapp && npm run build\n\n# 上传\nscp -r dist/* server:/var/www/myapp/\n\n# nginx 配置\ndeploy/nginx.conf", "bash"),
    H2("nginx 配置"),
    Code("server {\n  listen 80;\n  server_name example.com;\n\n  root /var/www/myapp;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location /rpc/ {\n    proxy_pass http://127.0.0.1:12342;\n  }\n\n  location /ws {\n    proxy_pass http://127.0.0.1:12342;\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade $http_upgrade;\n    proxy_set_header Connection \"upgrade\";\n  }\n}", "nginx"),
    H2("后端 systemd"),
    Code("# /etc/systemd/system/xunay.service\n[Unit]\nDescription=XuNay Backend\nAfter=network.target\n\n[Service]\nType=simple\nWorkingDirectory=/opt/xunay\nExecStart=/opt/xunay/.venv/bin/granian --interface asgi backend.main:app --host 0.0.0.0 --port 12342\nRestart=always\n\n[Install]\nWantedBy=multi-user.target", "ini"),
    H2("启动服务"),
    Code("systemctl enable xunay\nsystemctl start xunay\nsystemctl status xunay", "bash"),
    H2("部署脚本"),
    Code("# scripts/deploy.sh\n#!/bin/bash\nset -e\n\ncd myapp && npm run build\nrsync -avz --delete dist/ server:/var/www/myapp/\nssh server 'systemctl restart xunay'\necho '部署完成'", "bash"),
    H2("Docker"),
    Code("# Dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN cd myapp && npm install && npm run build\nEXPOSE 12342\nCMD [\"node\", \"backends/node/server.js\"]", "dockerfile"),
    H2("环境变量"),
    Table(["变量","说明"], [["PORT","监听端口"],["DB_PATH","数据库路径"],["CORS_ORIGIN","允许的源"]]),
    H2("生产建议"),
    Ul("前端走 CDN","后端用反向代理 + HTTPS","日志集中收集","监控进程（systemd / pm2 / k8s）","数据库定期备份"),
  )
}
