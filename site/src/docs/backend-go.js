// Go 后端
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Go 后端"),
    P("单文件二进制——编译完直接丢到服务器跑，零依赖。"),
    H2("启动"),
    Code("cd backends/go\ngo run .\n# 或\ncd backends/go && go build -o server && ./server", "bash"),
    H2("默认端口"),
    Code("12343", "txt"),
    H2("目录"),
    Code("backends/go/\n├── main.go        HTTP 服务器\n├── handlers.go    业务逻辑\n├── db.go          数据\n├── schemas.go     结构体\n└── go.mod         模块定义", "txt"),
    H2("handler"),
    Code("// handlers.go\nfunc HandleGetTodos(w http.ResponseWriter, r *http.Request) {\n    todos := GetTodos()\n    writeJSON(w, 200, Response{\n        Ok: true,\n        Data: todos,\n    })\n}\n\nfunc HandleAddTodo(w http.ResponseWriter, r *http.Request) {\n    var req AddTodoReq\n    json.NewDecoder(r.Body).Decode(&req)\n    todo := AddTodo(req.Title)\n    writeJSON(w, 200, Response{Ok: true, Data: todo})\n}", "go"),
    H2("路由"),
    Code("// main.go\nfunc main() {\n    http.HandleFunc(\"/rpc/token\", HandleToken)\n    http.HandleFunc(\"/rpc/getTodos\", WithAuth(HandleGetTodos))\n    http.HandleFunc(\"/rpc/addTodo\", WithAuth(HandleAddTodo))\n\n    fmt.Println(\"XuNay Go 后端 :12343\")\n    http.ListenAndServe(\":12343\", nil)\n}", "go"),
    H2("struct + JSON"),
    Code("// schemas.go\ntype Todo struct {\n    ID    int64  `json:\"id\"`\n    Title string `json:\"title\"`\n    Done  bool   `json:\"done\"`\n}\n\ntype Response struct {\n    Ok    bool        `json:\"ok\"`\n    Data  interface{} `json:\"data\"`\n    Error string      `json:\"error\"`\n}", "go"),
    H2("并发模型"),
    P("每个请求一个 goroutine——天然支持高并发。"),
    Code("// 例子：批量请求不互相阻塞\nfunc Handler(w http.ResponseWriter, r *http.Request) {\n    var wg sync.WaitGroup\n    wg.Add(2)\n    go fetchA(&wg)\n    go fetchB(&wg)\n    wg.Wait()\n}", "go"),
    H2("优点"),
    Ul("编译成单文件——拷贝即部署","启动快（~10ms）","内存小（~10MB）","并发强","跨平台交叉编译"),
    H2("缺点"),
    Ul("生态不如 Node / Python","没有 ORM（用 sqlx 或原生）","开发迭代慢（要重编译）"),
    H2("部署"),
    Code("# 本地编译（Mac → Linux）\nGOOS=linux GOARCH=amd64 go build -o server main.go\n\n# 上传 + 运行\nscp server server:/opt/xunay/\nssh server 'nohup /opt/xunay/server &'", "bash"),
  )
}
