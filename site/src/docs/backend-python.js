// Python 后端
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Python 后端"),
    P("基于 FastAPI + granian——功能最完整的后端。"),
    H2("启动"),
    Code("bash scripts/run-backend.sh\n# 或\nsource .venv/bin/activate\npython -m uvicorn backend.main:app --port 12342", "bash"),
    H2("默认端口"),
    Code("12342", "txt"),
    H2("目录"),
    Code("backend/\n├── main.py          FastAPI 应用\n├── api/\n│   ├── token.py     token 接口\n│   ├── todos.py     todos 接口\n│   └── ws.py        WebSocket\n├── core/\n│   ├── security.py  认证\n│   └── errors.py    错误处理\n├── db.py            SQLite\n├── schemas.py       Pydantic 模型\n└── static.py        静态文件托管", "txt"),
    H2("FastAPI 路由"),
    Code("# api/todos.py\nfrom fastapi import APIRouter, Depends\nfrom ..core.security import require_token\n\nrouter = APIRouter()\n\n@router.get('/rpc/getTodos')\nasync def get_todos(user = Depends(require_token)):\n    return { 'ok': True, 'data': db.get_todos() }\n\n@router.post('/rpc/addTodo')\nasync def add_todo(body: AddTodoReq, user = Depends(require_token)):\n    todo = db.add_todo(body.title)\n    return { 'ok': True, 'data': todo }", "py"),
    H2("Pydantic 校验"),
    Code("# schemas.py\nfrom pydantic import BaseModel\n\nclass AddTodoReq(BaseModel):\n    title: str\n\nclass Todo(BaseModel):\n    id: int\n    title: str\n    done: bool", "py"),
    H2("SQLite 持久化"),
    Code("# db.py\nimport sqlite3\n\nconn = sqlite3.connect('data.db')\nconn.execute('''\n  CREATE TABLE IF NOT EXISTS todos (\n    id INTEGER PRIMARY KEY,\n    title TEXT,\n    done INTEGER DEFAULT 0\n  )\n''')\n\ndef get_todos():\n    rows = conn.execute('SELECT * FROM todos').fetchall()\n    return [dict(id=r[0], title=r[1], done=bool(r[2])) for r in rows]", "py"),
    H2("静态文件托管"),
    P("Python 后端同时托管前端——不用单独起静态服务器。"),
    Code("# static.py\n@router.get('/myapp/{path:path}')\ndef myapp(path: str = ''):\n    return serve(BASE / 'myapp', path)\n\n@router.get('/site/{path:path}')\ndef site(path: str = ''):\n    return serve(BASE / 'site/dist', path)", "py"),
    H2("CORS"),
    Code("app.add_middleware(\n    CORSMiddleware,\n    allow_origins=['*'],\n    allow_methods=['*'],\n    allow_headers=['*'],\n)", "py"),
    H2("优点"),
    Ul("Pydantic 自动校验","SQLite / PostgreSQL 支持","自动生成 OpenAPI 文档","WebSocket 内建","同时托管前端"),
    H2("缺点"),
    Ul("依赖较多（fastapi / uvicorn / pydantic）","启动较慢（~1s）","内存占用较大"),
  )
}
