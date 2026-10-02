XuNay Go 后端

标准库 + SQLite，无框架。

运行

    cd backends/go
    go mod tidy
    go run .

端口 12343。

接口

    GET  /rpc/token
    GET  /rpc/getTodos
    POST /rpc/addTodo
    POST /rpc/toggleTodo
    POST /rpc/deleteTodo

返回格式

    { "ok": true, "data": {}, "error": null }

校验

在 schemas.go 里，每个 struct 有 Validate 方法。跟 Pydantic 一样。
