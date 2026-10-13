[XUNAY-VULN]
ver:1.2.8
kind:vulnerability-registry
update:2026-10-13
note:修复完成后的遗留清单

[V059]
severity:medium
status:open
module:deploy/xunay.service
module2:xunay.config.json
module3:deploy/nginx.conf

symptom:
  三处配置互相不一致：
    systemd service: granian (Python) + 端口 12342
    xunay.config.json: backend=node + 端口 12341
    nginx.conf: 反代 127.0.0.1:12342
  按任一配置部署都连不上

cause:
  service: ExecStart=...granian --port 12342
  config:  { "backend": "node", "ports": { "backend": 12341 } }
  nginx:   proxy_pass http://127.0.0.1:12342

need-decision:
  实际部署用哪个后端？端口统一到哪个？

[V063]
severity:medium
status:open
module:deploy/nginx.conf

symptom:
  1) 只 listen 80，无 443，无 HSTS，无 http→https 重定向
  2) proxy_set_header Connection "upgrade" 硬编码
     普通 HTTP 请求也带 Connection: upgrade 头
     某些后端会误当 WebSocket 处理

cause:
  server {
    listen 80;
    proxy_set_header Connection "upgrade";
  }

fix:
  map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
  }
  server {
    listen 443 ssl;
    listen 80;
    # ...
    proxy_set_header Connection $connection_upgrade;
  }

need-decision:
  有 HTTPS 需求吗？有域名和证书吗？

[V064]
severity:low
status:open
module:deploy/xunay.service

symptom:
  User=root
  后端进程以 root 运行
  任何 RCE 即 root 权限
  且 WorkingDirectory=/root/xunay 硬编码，不可移植

cause:
  [Service]
  User=root
  WorkingDirectory=/root/xunay
  ExecStart=/root/xunay/.venv/bin/granian ...

fix:
  useradd -r -s /sbin/nologin xunay
  chown -R xunay:xunay /opt/xunay
  User=xunay
  WorkingDirectory=/opt/xunay

need-decision:
  可以创建专用系统用户吗？部署路径固定吗？
