// 数据库
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("数据库"),
    P("四套后端各自实现数据层——从 JSON 文件到 SQLite 到原生 SQL。"),
    H2("Python：SQLite"),
    Code("# backend/db.py\nimport sqlite3\n\nconn = sqlite3.connect('data.db')\nconn.row_factory = sqlite3.Row\n\nconn.execute('''\n  CREATE TABLE IF NOT EXISTS todos (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    title TEXT NOT NULL,\n    done INTEGER DEFAULT 0,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n  )\n''')\n\ndef get_todos():\n    return [dict(r) for r in conn.execute('SELECT * FROM todos').fetchall()]\n\ndef add_todo(title):\n    cur = conn.execute('INSERT INTO todos (title) VALUES (?)', (title,))\n    conn.commit()\n    return get_todo(cur.lastrowid)\n\ndef toggle_todo(id):\n    conn.execute('UPDATE todos SET done = NOT done WHERE id = ?', (id,))\n    conn.commit()\n    return get_todo(id)", "py"),
    H2("Node：JSON 文件"),
    Code("// backends/node/db.js\nimport fs from 'node:fs'\n\nconst FILE = './data.json'\nfunction read() {\n  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')) }\n  catch { return { todos: [] } }\n}\nfunction write(data) {\n  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))\n}\n\nexport const db = {\n  getTodos() { return read().todos || [] },\n  addTodo({ title }) {\n    const d = read()\n    const todo = { id: Date.now(), title, done: false }\n    d.todos = [...(d.todos || []), todo]\n    write(d)\n    return todo\n  },\n  toggleTodo(id) {\n    const d = read()\n    d.todos = d.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)\n    write(d)\n    return d.todos.find(t => t.id === id)\n  }\n}", "js"),
    H2("Go：内存 + JSON"),
    Code("// backends/go/db.go\nvar (\n    mu    sync.Mutex\n    todos []Todo\n)\n\nfunc init() {\n    data, _ := os.ReadFile(\"data.json\")\n    json.Unmarshal(data, &todos)\n}\n\nfunc GetTodos() []Todo {\n    mu.Lock()\n    defer mu.Unlock()\n    return todos\n}\n\nfunc AddTodo(title string) Todo {\n    mu.Lock()\n    defer mu.Unlock()\n    todo := Todo{ID: time.Now().UnixMilli(), Title: title}\n    todos = append(todos, todo)\n    save()\n    return todo\n}", "go"),
    H2("C++：内存 Map"),
    Code("// backends/cpp/db.cpp\nstd::map<int64_t, Todo> todos;\nstd::mutex mu;\n\nstd::vector<Todo> getTodos() {\n    std::lock_guard<std::mutex> lock(mu);\n    std::vector<Todo> out;\n    for (auto& [id, t] : todos) out.push_back(t);\n    return out;\n}\n\nTodo addTodo(const std::string& title) {\n    std::lock_guard<std::mutex> lock(mu);\n    int64_t id = now_ms();\n    Todo t{id, title, false};\n    todos[id] = t;\n    return t;\n}", "cpp"),
    H2("对比"),
    Table(["后端","持久化","并发安全","扩展性"], [["Node","JSON 文件","无","小项目"],["Python","SQLite","SQLite 锁","中小项目"],["Go","JSON + 互斥锁","是","中项目"],["C++","内存 Map","是","高并发"]]),
    H2("升级路径"),
    Ul("JSON 文件 → SQLite（推荐起点）","SQLite → PostgreSQL（多人协作）","PostgreSQL → 加缓存层（Redis）"),
  )
}
