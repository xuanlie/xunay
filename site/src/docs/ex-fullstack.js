// 全栈应用
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("全栈应用"),
    P("前端 + 后端 + RPC + WebSocket + 持久化——完整示例。"),
    H2("项目结构"),
    Code("myapp/\n├── app.xuy                 前端入口\n├── src/\n│   ├── api/client.xuy      RPC 客户端\n│   ├── store/todos.xuy     状态\n│   ├── pages/\n│   └── components/\n├── backend/                Python 后端\n│   ├── main.py\n│   ├── api/todos.py\n│   └── db.py\n└── shared/routes.json      路由表", "txt"),
    H2("路由表"),
    Code("// shared/routes.json\n{\n  \"routes\": [\n    { \"name\": \"token\", \"method\": \"GET\", \"path\": \"/rpc/token\", \"auth\": false },\n    { \"name\": \"getTodos\", \"method\": \"GET\", \"path\": \"/rpc/getTodos\", \"auth\": true },\n    { \"name\": \"addTodo\", \"method\": \"POST\", \"path\": \"/rpc/addTodo\", \"auth\": true },\n    { \"name\": \"toggleTodo\", \"method\": \"POST\", \"path\": \"/rpc/toggleTodo\", \"auth\": true },\n    { \"name\": \"deleteTodo\", \"method\": \"POST\", \"path\": \"/rpc/deleteTodo\", \"auth\": true }\n  ]\n}", "json"),
    H2("RPC 客户端"),
    Code("// src/api/client.xuy\nimport { signal } from 'xunay'\n\nconst _token = signal('')\n\nasync function ensureToken() {\n  if (_token()) return _token()\n  const r = await fetch('/rpc/token')\n  const j = await r.json()\n  _token(j.data.token)\n  return _token()\n}\n\nexport const api = {\n  async get(path) {\n    const t = await ensureToken()\n    const r = await fetch(path, { headers: { Authorization: 'Bearer ' + t } })\n    const j = await r.json()\n    if (!j.ok) throw new Error(j.error)\n    return j.data\n  },\n  async post(path, body) {\n    const t = await ensureToken()\n    const r = await fetch(path, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },\n      body: JSON.stringify(body)\n    })\n    const j = await r.json()\n    if (!j.ok) throw new Error(j.error)\n    return j.data\n  }\n}", "xuy"),
    H2("状态层"),
    Code("// src/store/todos.xuy\nimport { signal } from 'xunay'\nimport { api } from '../api/client.js'\n\nexport const todos = signal([])\nexport const loading = signal(false)\nexport const error = signal(null)\n\nexport async function load() {\n  loading(true)\n  error(null)\n  try {\n    todos(await api.get('/rpc/getTodos'))\n  } catch (e) {\n    error(e.message)\n  } finally {\n    loading(false)\n  }\n}\n\nexport async function add(title) {\n  const t = await api.post('/rpc/addTodo', { title })\n  todos(l => [...l, t])\n}\n\nexport async function toggle(id) {\n  const t = await api.post('/rpc/toggleTodo', { id })\n  todos(l => l.map(x => x.id === id ? t : x))\n}\n\nexport async function remove(id) {\n  await api.post('/rpc/deleteTodo', { id })\n  todos(l => l.filter(x => x.id !== id))\n}", "xuy"),
    H2("后端"),
    Code("# backend/main.py\nfrom fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom .api import token, todos\n\napp = FastAPI()\napp.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])\n\napp.include_router(token.router)\napp.include_router(todos.router)\n\n# backend/db.py\nimport sqlite3\nconn = sqlite3.connect('data.db')\nconn.execute('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)')\n\ndef get_todos():\n    return [dict(id=r[0], title=r[1], done=bool(r[2])) for r in conn.execute('SELECT * FROM todos')]\n\ndef add_todo(title):\n    cur = conn.execute('INSERT INTO todos (title, done) VALUES (?, 0)', (title,))\n    conn.commit()\n    return {'id': cur.lastrowid, 'title': title, 'done': False}", "py"),
    H2("启动"),
    Code("# 后端\ncd backend && uvicorn main:app --port 12342\n\n# 前端构建\ncd myapp && npm run build", "bash"),
    H2("学习点"),
    Ul("shared/routes.json 统一路由","RPC 客户端封装认证","signal 做全局状态","前后端同源部署"),
  )
}
