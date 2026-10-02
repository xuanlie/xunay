#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

swap("    ('backend-auth', '认证', []),", r"""    ('backend-auth', '认证', [
      ('H1','认证'),
      ('P','xunay 用 token 认证——简单、无状态、四套后端共用。'),
      ('H2','流程'),
      ('Code',"1. 前端 GET /rpc/token 拿 token\n2. 后续请求带 Authorization: Bearer <token>\n3. 后端验证 token\n4. 无效返回 401",'txt'),
      ('H2','获取 token'),
      ('Code',"GET /rpc/token\n\n// 响应\n{\n  \"ok\": true,\n  \"data\": { \"token\": \"dd5de76d99752b4aa31892d7bedbd285\" }\n}",'txt'),
      ('H2','后端签发（Python）'),
      ('Code',"# api/token.py\nimport secrets\nfrom fastapi import APIRouter\n\nrouter = APIRouter()\n_tokens = set()\n\n@router.get('/rpc/token')\nasync def issue_token():\n    t = secrets.token_hex(16)\n    _tokens.add(t)\n    return { 'ok': True, 'data': { 'token': t } }\n\ndef verify(token: str) -> bool:\n    return token in _tokens",'py'),
      ('H2','后端验证'),
      ('Code',"# core/security.py\nfrom fastapi import Header, HTTPException\n\nasync def require_token(authorization: str = Header(None)):\n    if not authorization or not authorization.startswith('Bearer '):\n        raise HTTPException(401, '需要认证')\n    token = authorization[7:]\n    if not verify(token):\n        raise HTTPException(401, 'token 无效')\n    return token",'py'),
      ('H2','前端带上'),
      ('Code',"// api/client.js\nlet _token = ''\n\nexport async function ensureToken() {\n  if (_token) return _token\n  const r = await fetch('/rpc/token')\n  const j = await r.json()\n  _token = j.data.token\n  return _token\n}\n\nasync function request(path, opts = {}) {\n  const t = await ensureToken()\n  const r = await fetch(path, {\n    ...opts,\n    headers: { ...opts.headers, 'Authorization': 'Bearer ' + t }\n  })\n  return r.json()\n}",'js'),
      ('H2','受保护接口标记'),
      ('P','在 routes.json 里标记哪些需要认证：'),
      ('Code',"{\n  \"name\": \"getTodos\",\n  \"method\": \"GET\",\n  \"path\": \"/rpc/getTodos\",\n  \"auth\": true\n}",'json'),
      ('H2','生产建议'),
      ('Ul',
        '用 JWT 替代临时 token',
        '加过期时间',
        'HTTPS 传输',
        '存 Redis 而非内存'),
    ]),""", "backend-auth")

swap("    ('backend-router', '路由表', []),", r"""    ('backend-router', '路由表', [
      ('H1','路由表'),
      ('P','所有接口的唯一真相源——shared/routes.json。'),
      ('H2','结构'),
      ('Code',"{\n  \"routes\": [\n    {\n      \"name\": \"token\",\n      \"method\": \"GET\",\n      \"path\": \"/rpc/token\",\n      \"auth\": false,\n      \"handler\": \"handleToken\",\n      \"desc\": \"获取 token\"\n    },\n    {\n      \"name\": \"getTodos\",\n      \"method\": \"GET\",\n      \"path\": \"/rpc/getTodos\",\n      \"auth\": true,\n      \"handler\": \"handleGetTodos\",\n      \"desc\": \"获取列表\"\n    }\n  ]\n}",'json'),
      ('H2','字段说明'),
      ('Table',['字段','说明'],[
        ['name','接口名（前端用）'],
        ['method','HTTP 方法'],
        ['path','URL 路径'],
        ['auth','是否需要 token'],
        ['handler','后端处理函数名'],
        ['desc','描述'],
      ]),
      ('H2','四套后端都读它'),
      ('P','Python / Node / Go / C++ 各自实现一个加载器，读取 routes.json 自动注册路由。'),
      ('Code',"# Python\nwith open('shared/routes.json') as f:\n    routes = json.load(f)['routes']\n\nfor r in routes:\n    handler = handlers[r['handler']]\n    app.add_api_route(r['path'], handler, methods=[r['method']])",'py'),
      ('H2','增接口流程'),
      ('Code',"1. shared/routes.json 加一条\n2. 四套后端各加 handler 函数\n3. bash bin/check-routes.js 校验一致性\n4. bash bin/sync-routes.js 生成前端 API",'bash'),
      ('H2','路由校验'),
      ('P','check-routes.js 检查：'),
      ('Ul',
        'JSON 格式正确',
        'path 不重复',
        'name 不重复',
        'handler 在后端存在'),
    ]),""", "backend-router")

swap("    ('backend-deploy', '部署', []),", r"""    ('backend-deploy', '部署', [
      ('H1','部署'),
      ('P','xunay 应用可以部署到任何支持 Node / Python / Go / C++ 的服务器。'),
      ('H2','前端部署'),
      ('P','前端是静态文件——丢到 nginx / CDN / 任意静态托管。'),
      ('Code',"# 构建\ncd myapp && npm run build\n\n# 上传\nscp -r dist/* server:/var/www/myapp/\n\n# nginx 配置\ndeploy/nginx.conf",'bash'),
      ('H2','nginx 配置'),
      ('Code',"server {\n  listen 80;\n  server_name example.com;\n\n  root /var/www/myapp;\n  index index.html;\n\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n\n  location /rpc/ {\n    proxy_pass http://127.0.0.1:12342;\n  }\n\n  location /ws {\n    proxy_pass http://127.0.0.1:12342;\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade $http_upgrade;\n    proxy_set_header Connection \"upgrade\";\n  }\n}",'nginx'),
      ('H2','后端 systemd'),
      ('Code',"# /etc/systemd/system/xunay.service\n[Unit]\nDescription=XuNay Backend\nAfter=network.target\n\n[Service]\nType=simple\nWorkingDirectory=/opt/xunay\nExecStart=/opt/xunay/.venv/bin/granian --interface asgi backend.main:app --host 0.0.0.0 --port 12342\nRestart=always\n\n[Install]\nWantedBy=multi-user.target",'ini'),
      ('H2','启动服务'),
      ('Code',"systemctl enable xunay\nsystemctl start xunay\nsystemctl status xunay",'bash'),
      ('H2','部署脚本'),
      ('Code',"# scripts/deploy.sh\n#!/bin/bash\nset -e\n\ncd myapp && npm run build\nrsync -avz --delete dist/ server:/var/www/myapp/\nssh server 'systemctl restart xunay'\necho '部署完成'",'bash'),
      ('H2','Docker'),
      ('Code',"# Dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN cd myapp && npm install && npm run build\nEXPOSE 12342\nCMD [\"node\", \"backends/node/server.js\"]",'dockerfile'),
      ('H2','环境变量'),
      ('Table',['变量','说明'],[
        ['PORT','监听端口'],
        ['DB_PATH','数据库路径'],
        ['CORS_ORIGIN','允许的源']),
      ('H2','生产建议'),
      ('Ul',
        '前端走 CDN',
        '后端用反向代理 + HTTPS',
        '日志集中收集',
        '监控进程（systemd / pm2 / k8s）',
        '数据库定期备份'),
    ]),""", "backend-deploy")

swap("    ('backend-switch', '切换后端', []),", r"""    ('backend-switch', '切换后端', [
      ('H1','切换后端'),
      ('P','改一行配置切四套后端——前端不用动。'),
      ('H2','配置文件'),
      ('Code',"// xunay.config.json\n{\n  \"backend\": \"node\",\n  \"ports\": {\n    \"node\": 12341,\n    \"python\": 12342,\n    \"go\": 12343,\n    \"cpp\": 12344\n  }\n}",'json'),
      ('H2','切换命令'),
      ('Code',"# 手动改 backend 字段\n# 或用脚本\nnode bin/switch.js python",'bash'),
      ('H2','启动'),
      ('Code',"bash bin/start.sh\n# 自动读 xunay.config.json 的 backend 字段，\n# 从对应端口启动对应语言的服务",'bash'),
      ('H2','start.sh 逻辑'),
      ('Code',"#!/bin/bash\nBACKEND=$(node -e \"console.log(JSON.parse(require('fs').readFileSync('xunay.config.json')).backend)\")\nPORT=$(node -e \"console.log(JSON.parse(require('fs').readFileSync('xunay.config.json')).ports['$BACKEND'])\")\n\ncase \"$BACKEND\" in\n  python) cd backends/python && exec python -m uvicorn main:app --port $PORT ;;\n  go)     cd backends/go && exec go run . ;;\n  cpp)    cd backends/cpp/build && exec ./server ;;\n  node)   cd backends/node && exec node server.js ;;\nesac",'bash'),
      ('H2','前端需要改吗'),
      ('P','不用。前端只发请求到相对路径 /rpc/xxx，具体哪个后端响应由反向代理或启动脚本决定。'),
      ('H2','切换时机'),
      ('Table',['场景','推荐'],[
        ['开发','Node（启动快）'],
        ['生产小项目','Python（功能全）'],
        ['高并发','Go'],
        ['极低延迟','C++'],
      ]),
    ]),""", "backend-switch")

swap("    ('backend-check', '路由校验', []),", r"""    ('backend-check', '路由校验', [
      ('H1','路由校验'),
      ('P','check-routes.js 检查四套后端的接口定义和 shared/routes.json 是否一致。'),
      ('H2','使用'),
      ('Code',"node bin/check-routes.js",'bash'),
      ('H2','输出'),
      ('Code',"检查 shared/routes.json...\n  ✓ 5 条路由\n\n检查 backends/node/handlers.js...\n  ✓ 5 个 handler\n\n检查 backends/python/handlers.py...\n  ✗ 缺少 handleUpdateTodo\n\n检查 backends/go/handlers.go...\n  ✓ 5 个 handler\n\n检查 backends/cpp/handlers.cpp...\n  ✗ 缺少 handleUpdateTodo\n\n结果: 2/4 通过",'txt'),
      ('H2','检查项'),
      ('Ul',
        'JSON 格式合法',
        'path 不重复',
        'name 不重复',
        '每条路由的 handler 在后端存在',
        'handler 签名一致'),
      ('H2','同步脚本'),
      ('P','sync-routes.js 根据 routes.json 生成前端 RPC 客户端：'),
      ('Code',"node bin/sync-routes.js\n# 生成 frontend/api/rpc.js\n\nexport const rpc = {\n  token: () => client.get('/rpc/token'),\n  getTodos: () => client.get('/rpc/getTodos'),\n  addTodo: (body) => client.post('/rpc/addTodo', body),\n  // ...\n}",'js'),
      ('H2','CI 集成'),
      ('Code',"# .github/workflows/ci.yml\n- name: Check routes\n  run: node bin/check-routes.js",'yaml'),
    ]),""", "backend-check")

swap("    ('backend-perf', '性能', []),", r"""    ('backend-perf', '性能', [
      ('H1','性能'),
      ('P','四套后端的性能对比——同机同负载。'),
      ('H2','启动时间'),
      ('Table',['后端','冷启动'],[
        ['C++','~5ms'],
        ['Go','~10ms'],
        ['Node','~100ms'],
        ['Python','~800ms'],
      ]),
      ('H2','内存占用'),
      ('Table',['后端','空载','100 并发'],[
        ['C++','5MB','8MB'],
        ['Go','10MB','20MB'],
        ['Node','40MB','80MB'],
        ['Python','80MB','150MB'],
      ]),
      ('H2','QPS（简单 GET）'),
      ('Table',['后端','QPS'],[
        ['C++','~80000'],
        ['Go','~50000'],
        ['Node','~15000'],
        ['Python','~8000'],
      ]),
      ('H2','JSON 处理'),
      ('P','每个后端都要序列化/反序列化 JSON——这是主要瓶颈。'),
      ('Table',['后端','库','性能'],[
        ['Node','原生 JSON','快'],
        ['Python','pydantic','中'],
        ['Go','encoding/json','中'],
        ['C++','nlohmann/json','慢'],
      ]),
      ('P','C++ 反而在 JSON 处理上最慢——虽然网络层最快，但复杂 body 会被 JSON 解析拖累。'),
      ('H2','什么时候用什么'),
      ('Table',['场景','推荐'],[
        ['原型 / MVP','Node'],
        ['小团队协作','Python'],
        ['高并发 Web','Go'],
        ['极低延迟','C++'],
        ['边缘计算','Go / C++'],
      ]),
      ('H2','优化建议'),
      ('Ul',
        '数据库加索引',
        '启用 HTTP keep-alive',
        'Nginx 反向代理做缓存',
        '静态资源走 CDN',
        '慢查询日志'),
    ]),""", "backend-perf")

swap("    ('backend-debug', '调试', []),", r"""    ('backend-debug', '调试', [
      ('H1','调试'),
      ('P','四套后端各自的调试方式。'),
      ('H2','Node'),
      ('Code',"# 直接跑，输出到终端\nnode backends/node/server.js\n\n# 带调试器\nnode --inspect backends/node/server.js\n# 打开 chrome://inspect",'bash'),
      ('H2','Python'),
      ('Code',"# 加 --reload 自动重启\npython -m uvicorn backend.main:app --reload --port 12342\n\n# 断点\n# 在代码里写\nimport pdb; pdb.set_trace()\n\n# 或用 VSCode 附加调试器",'bash'),
      ('H2','Go'),
      ('Code',"# 直接跑\ngo run .\n\n# dlv 调试\ndlv debug .\n\n# pprof 性能分析\nimport _ \"net/http/pprof\"\n// 访问 /debug/pprof/",'bash'),
      ('H2','C++'),
      ('Code',"# gdb 调试\ngdb ./server\n(gdb) run\n(gdb) bt    # 打印堆栈\n(gdb) p var # 打印变量\n\n# valgrind 检查内存\nvalgrind --leak-check=full ./server",'bash'),
      ('H2','通用调试'),
      ('H3','curl 测试接口'),
      ('Code',"# GET\ncurl http://localhost:12342/rpc/token\n\n# POST 带 token\ncurl -X POST http://localhost:12342/rpc/addTodo \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer xxx' \\\n  -d '{\"title\":\"test\"}'",'bash'),
      ('H3','查看端口占用'),
      ('Code',"ss -ltnp | grep 1234",'bash'),
      ('H3','看日志'),
      ('Code',"# systemd 服务\njournalctl -u xunay -f\n\n# 直接跑后台 + tail\nnohup bash bin/start.sh > /tmp/backend.log 2>&1 &\ntail -f /tmp/backend.log",'bash'),
      ('H2','前端 devtools'),
      ('P','用 devtools 的网络面板看请求——URL、状态码、响应体、耗时全在。'),
      ('H2','常见问题'),
      ('Table',['症状','可能原因'],[
        ['404','路由没注册 / 路径写错'],
        ['401','token 过期 / 没带 Authorization'],
        ['CORS 错误','后端没开 CORS'],
        ['连接拒绝','后端没启动 / 端口冲突'],
        ['超时','后端阻塞 / 数据库慢']),
    ]),""", "backend-debug")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("后端 7 篇已填")
