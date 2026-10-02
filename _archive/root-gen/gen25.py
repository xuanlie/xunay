import json, os

T = """import {{ div, h1, h2, h3, p, ul, li, pre, code, blockquote, table, thead, tbody, tr, th, td }} from 'xunay'

export function Doc() {{
  return div({{ class: 'doc' }},
{body}
  )
}}
"""

def R(blocks):
    out = []
    for b in blocks:
        t = b[0]
        if t in ('h1','h2','h3','p'):
            out.append(f"    {t}(null, {json.dumps(b[1], ensure_ascii=False)}),")
        elif t == 'q':
            out.append(f"    blockquote(null, {json.dumps(b[1], ensure_ascii=False)}),")
        elif t == 'ul':
            out.append("    ul(null,")
            for it in b[1]:
                out.append(f"      li(null, {json.dumps(it, ensure_ascii=False)}),")
            out.append("    ),")
        elif t == 'code':
            out.append(f"    pre(null, code(null, {json.dumps(b[1], ensure_ascii=False)})),")
        elif t == 'table':
            head, rows = b[1], b[2]
            out.append("    table(null,")
            out.append("      thead(null, tr(null," + ",".join(f"th(null, {json.dumps(h, ensure_ascii=False)})" for h in head) + ")),")
            out.append("      tbody(null,")
            for r in rows:
                out.append("        tr(null," + ",".join(f"td(null, {json.dumps(c, ensure_ascii=False)})" for c in r) + "),")
            out.append("      )")
            out.append("    ),")
    return '\n'.join(out)

D = {}
def add(name, blocks): D[name] = blocks

add('101-编译器原理', [
    ('h1','编译器原理'), ('p','.xuy 怎么变成 JS。'),
    ('h2','三个步骤'), ('ul',['词法分析：字符串切成 token','语法分析：token 变成 AST','代码生成：AST 变成 JS']),
    ('h2','词法'), ('code','const TAGS = new Set(["div","span","button"])\n// 扫描源码，识别标签函数调用'),
    ('h2','语法'), ('code','{ type: "tag", name: "div", props: [...], children: [...] }'),
    ('h2','代码生成'), ('code','// div({ class: "box" }, "hi")\n// 变成\nconst _div = document.createElement("div")\n_div.className = "box"\n_div.appendChild(document.createTextNode("hi"))'),
    ('h2','优化'), ('p','静态元素直接 createElement，动态值才包 effect。'),
])
add('102-构建工具', [
    ('h1','构建工具 xuyc'),
    ('h2','用法'), ('code','node bin/xuyc.js build app.xuy --out dist'),
    ('h2','输出'), ('code','dist/\n  index.html\n  app.js\n  xunay.js'),
    ('h2','流程'), ('ul',['读 .xuy','替换 import 路径','递归处理依赖','复制 xunay.js','esbuild 打包','生成 index.html']),
    ('h2','自动复制'), ('ul',['CSS 文件','docs 目录','图片资源']),
    ('h2','部署'), ('p','dist/ 丢到任何静态服务器就能跑。'),
])
add('103-项目结构', [
    ('h1','大项目结构'),
    ('h2','推荐'), ('code','myapp/\n  app.xuy\n  package.json\n  src/\n    router.xuy\n    components/\n    pages/\n    store/\n    api/\n    style.css'),
    ('h2','职责'), ('ul',['app.xuy 入口','router.xuy 路由','components/ 通用组件','pages/ 页面','store/ 状态','api/ 接口']),
    ('h2','规则'), ('ul',['一个文件一个职责','单向依赖：pages → components','不写 index.xuy 聚合','大页面用 lazy']),
])
add('104-模块化', [
    ('h1','模块化'),
    ('h2','导出'), ('code','export function Button({ text }) {\n  return button(null, text)\n}'),
    ('h2','导入'), ('code','import { Button } from "./components/Button.xuy"'),
    ('h2','默认导出'), ('code','export default function App() {}\n// 导入\nimport App from "./App.xuy"'),
    ('h2','别名'), ('code','import { Button as Btn } from "./Button.xuy"'),
])
add('105-测试', [
    ('h1','测试'),
    ('h2','单元测试'), ('code','import { signal } from "xunay"\n\nconst n = signal(0)\nn(1)\nconsole.assert(n() === 1, "应该为 1")'),
    ('h2','DOM 测试'), ('code','import { render, div } from "xunay"\n\nconst dom = render(div(null, "hi"))\nconsole.assert(dom.tagName === "DIV")'),
    ('h2','组件测试'), ('code','const { mount, div } = await import("xunay")\nmount(() => div(null, "hello"), "#test")\nconst el = document.querySelector("#test")\nconsole.assert(el.textContent === "hello")'),
    ('h2','推荐'), ('p','Vitest + jsdom，或 Playwright 做端到端。'),
])
add('106-调试', [
    ('h1','调试'),
    ('h2','console 大法'), ('code','effect(() => console.log("n =", n()))'),
    ('h2','组件执行追踪'), ('code','mount(() => {\n  console.log("组件执行")\n  return div(null, () => { console.log("文本更新"); return n() })\n}, "#app")'),
    ('h2','devtool'), ('code','import { enableDevtool, getEvents } from "xunay"\nenableDevtool()\nsetInterval(() => console.log(getEvents()), 5000)'),
    ('h2','Chrome DevTools'), ('ul',['Elements 面板看 DOM','Performance 面板测性能','Memory 面板测内存']),
])
add('107-错误处理', [
    ('h1','错误处理'),
    ('h2','同步错误'), ('code','err(\n  () => risky(),\n  e => div(null, "出错：" + e.message)\n)'),
    ('h2','异步错误'), ('code','try {\n  await load()\n} catch (e) {\n  error(e.message)\n}'),
    ('h2','全局捕获'), ('code','window.addEventListener("error", e => console.error(e))\nwindow.addEventListener("unhandledrejection", e => console.error(e))'),
    ('h2','显示给用户'), ('code','show(() => error(), () => div({ class: "error" }, () => error()))'),
])
add('108-性能监控', [
    ('h1','性能监控'),
    ('h2','测时间'), ('code','const t0 = performance.now()\n// 操作\nconsole.log(performance.now() - t0, "ms")'),
    ('h2','测内存'), ('code','if (performance.memory) {\n  console.log(performance.memory.usedJSHeapSize / 1048576, "MB")\n}'),
    ('h2','PerformanceObserver'), ('code','new PerformanceObserver(list => {\n  for (const entry of list.getEntries()) {\n    console.log(entry.name, entry.duration)\n  }\n}).observe({ entryTypes: ["measure"] })'),
])
add('109-安全', [
    ('h1','安全'),
    ('h2','XSS'), ('ul',['不用 innerHTML 渲染用户输入','用 textContent 或文本节点','需要 HTML 时先过滤']),
    ('h2','过滤'), ('code','function sanitize(html) {\n  return html.replace(/<script[^>]*>.*?<\\/script>/gi, "")\n}'),
    ('h2','CSRF'), ('ul',['用 SameSite cookie','重要操作带 token','校验 Origin']),
    ('h2','密钥'), ('ul',['API 密钥不进前端','用后端代理','环境变量注入']),
])
add('110-部署到Nginx', [
    ('h1','部署到 Nginx'),
    ('h2','构建'), ('code','node bin/xuyc.js build app.xuy --out dist'),
    ('h2','上传'), ('code','rsync -av dist/ user@server:/var/www/myapp/'),
    ('h2','Nginx 配置'), ('code','server {\n  listen 80;\n  server_name example.com;\n  root /var/www/myapp;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}'),
    ('h2','HTTPS'), ('code','certbot --nginx -d example.com'),
])
add('111-部署到Vercel', [
    ('h1','部署到 Vercel'),
    ('h2','构建'), ('code','node bin/xuyc.js build app.xuy --out dist'),
    ('h2','vercel.json'), ('code','{\n  "version": 2,\n  "builds": [{ "src": "dist/**", "use": "@vercel/static" }],\n  "routes": [{ "src": "/(.*)", "dest": "/dist/$1" }]\n}'),
    ('h2','部署'), ('code','npx vercel --prod'),
])
add('112-部署到Docker', [
    ('h1','部署到 Docker'),
    ('h2','Dockerfile'), ('code','FROM nginx:alpine\nCOPY dist/ /usr/share/nginx/html/\nEXPOSE 80\nCMD ["nginx", "-g", "daemon off;"]'),
    ('h2','构建镜像'), ('code','docker build -t myapp .\ndocker run -p 80:80 myapp'),
    ('h2','docker-compose'), ('code','services:\n  app:\n    build: .\n    ports:\n      - "80:80"'),
])
add('113-后端集成', [
    ('h1','后端集成'),
    ('h2','启动后端'), ('code','bash scripts/run-backend.sh'),
    ('h2','前端调用'), ('code','const r = await fetch("/rpc/getTodos")\nconst d = await r.json()\nif (d.ok) todos(d.data)'),
    ('h2','带 token'), ('code','fetch("/rpc/addTodo", {\n  method: "POST",\n  headers: { "X-Token": token(), "Content-Type": "application/json" },\n  body: JSON.stringify({ title })\n})'),
    ('h2','WebSocket'), ('code','const ws = new WebSocket(`ws://${location.host}/ws`)\nws.onmessage = e => handle(JSON.parse(e.data))'),
])
add('114-数据库', [
    ('h1','数据库'),
    ('h2','SQLite'), ('code','import sqlite3\nconn = sqlite3.connect("data.db")\nconn.execute("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, title TEXT)")'),
    ('h2','PostgreSQL'), ('code','pip install asyncpg'),
    ('h2','ORM'), ('p','SQLAlchemy 或 SQLModel。'),
    ('h2','迁移'), ('p','Alembic 管理 schema 变更。'),
])
add('115-认证', [
    ('h1','认证'),
    ('h2','密码哈希'), ('code','from passlib.hash import bcrypt\nhashed = bcrypt.hash(password)\nbcrypt.verify(password, hashed)'),
    ('h2','JWT'), ('code','from jose import jwt\ntoken = jwt.encode({"sub": user_id}, SECRET, algorithm="HS256")'),
    ('h2','前端存储'), ('code','localStorage.setItem("token", token)'),
    ('h2','请求带 token'), ('code','headers: { "Authorization": "Bearer " + token }'),
    ('h2','登出'), ('code','localStorage.removeItem("token")'),
])
add('116-文件上传', [
    ('h1','文件上传'),
    ('h2','后端'), ('code','@app.post("/upload")\nasync def upload(file: UploadFile):\n    content = await file.read()\n    with open(f"uploads/{file.filename}", "wb") as f:\n        f.write(content)\n    return {"ok": True}'),
    ('h2','前端'), ('code','const form = new FormData()\nform.append("file", file)\nfetch("/upload", { method: "POST", body: form })'),
    ('h2','进度'), ('code','xhr.upload.onprogress = e => progress(e.loaded / e.total)'),
    ('h2','限制'), ('ul',['大小限制','类型限制','存储路径安全']),
])
add('117-邮件发送', [
    ('h1','邮件发送'),
    ('h2','SMTP'), ('code','import smtplib\nfrom email.mime.text import MIMEText\n\nmsg = MIMEText("内容")\nmsg["Subject"] = "标题"\nmsg["From"] = "noreply@example.com"\nmsg["To"] = "user@example.com"\n\nwith smtplib.SMTP("smtp.example.com", 587) as s:\n    s.starttls()\n    s.login(USER, PASSWORD)\n    s.send_message(msg)'),
    ('h2','异步'), ('p','用 aiosmtplib 或 Celery 队列。'),
])
add('118-定时任务', [
    ('h1','定时任务'),
    ('h2','简单'), ('code','import asyncio\nasync def task():\n    while True:\n        do_work()\n        await asyncio.sleep(60)'),
    ('h2','APScheduler'), ('code','from apscheduler.schedulers.asyncio import AsyncIOScheduler\nscheduler = AsyncIOScheduler()\nscheduler.add_job(task, "interval", minutes=1)\nscheduler.start()'),
    ('h2','Cron'), ('code','# 每天 3 点\n0 3 * * * /path/to/script.sh'),
])
add('119-缓存', [
    ('h1','缓存'),
    ('h2','内存'), ('code','cache = {}\ndef get(key):\n    if key in cache:\n        return cache[key]\n    val = compute(key)\n    cache[key] = val\n    return val'),
    ('h2','Redis'), ('code','import redis\nr = redis.Redis()\nr.set("key", "value", ex=60)\nr.get("key")'),
    ('h2','HTTP 缓存'), ('code','Cache-Control: max-age=3600\nETag: "abc123"'),
    ('h2','前端缓存'), ('code','localStorage.setItem("cache", JSON.stringify(data))'),
])
add('120-日志', [
    ('h1','日志'),
    ('h2','Python'), ('code','import logging\nlogging.basicConfig(level=logging.INFO)\nlogger = logging.getLogger(__name__)\nlogger.info("用户登录", extra={"user_id": 123})'),
    ('h2','前端'), ('code','console.log("[INFO]", msg)\nconsole.error("[ERROR]", err)'),
    ('h2','结构化'), ('code','logger.info(json.dumps({"event": "login", "user": 123}))'),
    ('h2','上报'), ('code','fetch("/log", { method: "POST", body: JSON.stringify({ level: "error", msg }) })'),
])
add('121-错误追踪', [
    ('h1','错误追踪'),
    ('h2','前端捕获'), ('code','window.addEventListener("error", e => {\n  fetch("/log", {\n    method: "POST",\n    body: JSON.stringify({ msg: e.message, stack: e.error?.stack })\n  })\n})'),
    ('h2','未处理 Promise'), ('code','window.addEventListener("unhandledrejection", e => report(e.reason))'),
    ('h2','后端'), ('code','@app.exception_handler(Exception)\nasync def handler(req, exc):\n    logger.error(exc, exc_info=True)\n    return {"ok": False, "error": str(exc)}'),
])
add('122-监控告警', [
    ('h1','监控告警'),
    ('h2','健康检查'), ('code','@app.get("/health")\ndef health():\n    return {"status": "ok"}'),
    ('h2','指标'), ('code','@app.middleware("http")\nasync def metrics(req, call_next):\n    t0 = time.time()\n    resp = await call_next(req)\n    log_metric("latency", time.time() - t0)\n    return resp'),
    ('h2','告警'), ('ul',['错误率 > 1%','响应时间 > 1s','内存 > 80%','磁盘满']),
])
add('123-压力测试', [
    ('h1','压力测试'),
    ('h2','前端'), ('code','for (let i = 0; i < 1000; i++) {\n  const t0 = performance.now()\n  createRows(1000)\n  console.log(i, performance.now() - t0)\n}'),
    ('h2','后端'), ('code','ab -n 1000 -c 10 http://localhost:12342/rpc/getTodos'),
    ('h2','wrk'), ('code','wrk -t4 -c100 -d30s http://localhost:12342/'),
    ('h2','看什么'), ('ul',['QPS','P99 延迟','错误率','内存增长']),
])
add('124-常见坑', [
    ('h1','常见坑'),
    ('h2','忘写函数'), ('q','span(null, `n = ${n()}`) 不更新。要写 span(null, () => `n = ${n()}`)。'),
    ('h2','key 重复'), ('q','list 的 key 必须唯一，否则 DOM 复用错乱。'),
    ('h2','数组 push'), ('q','items().push(x) 不触发。要 items([...items(), x])。'),
    ('h2','onMount 位置'), ('q','onMount 必须在 mount 回调内调用，否则没 scope。'),
    ('h2','事件名'), ('q','on: { click } 小写，不是 onClick。'),
    ('h2','ref 是函数'), ('q','inputEl() 读值，不是 inputEl.current。'),
])
add('125-总结', [
    ('h1','总结'),
    ('p','你已经读完了 XuNay 的全部文档。'),
    ('h2','你学会了'), ('ul',['信号和响应式','元素和渲染','事件和生命周期','列表和精确更新','状态管理和派生','SSR 和构建工具','大项目组织']),
    ('h2','下一步'), ('ul',['写一个自己的小应用','看 examples/ 的示例','贡献代码或文档','上 GitHub 讨论']),
    ('h2','核心心智'), ('ul',['组件只执行一次','动态值用函数包','Signal 自动追踪','内存自动清理']),
    ('h2','数字回顾'), ('table',['指标','数值'],[['gzip','4.5KB'],['create 1000','22ms'],['update 10th','13ms'],['内存','9.5MB']]),
    ('q','XuNay —— 内存最少、速度最快的前端框架。'),
])

os.makedirs('site/src/docs', exist_ok=True)
for name, blocks in D.items():
    code = T.format(body=R(blocks))
    open(f'site/src/docs/{name}.xuy', 'w').write(code)
print(f'生成 {len(D)} 篇')
