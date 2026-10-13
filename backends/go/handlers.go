package main

import (
	"encoding/json"
	"net/http"
	"time"
)

const tokenTTLMs = 300 * 1000

func handleToken(w http.ResponseWriter, r *http.Request) {
	cleanupTokens()
	token := hex16()
	ip := r.RemoteAddr
	expires := time.Now().UnixMilli() + tokenTTLMs
	if err := saveToken(token, ip, expires); err != nil {
		writeJSON(w, 500, fail("保存 token 失败"))
		return
	}
	writeJSON(w, 200, ok(map[string]string{"token": token}))
}

func handleGetTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := listTodos()
	if err != nil {
		writeJSON(w, 500, fail("查询失败"))
		return
	}
	if todos == nil {
		todos = []Todo{}
	}
	writeJSON(w, 200, ok(todos))
}

func handleAddTodo(w http.ResponseWriter, r *http.Request) {
	var t Todo
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		writeJSON(w, 400, fail("请求格式错误"))
		return
	}
	if err := t.Validate(); err != nil {
		writeJSON(w, 400, fail(err.Error()))
		return
	}
	id, err := insertTodo(&t)
	if err != nil {
		writeJSON(w, 500, fail("保存失败"))
		return
	}
	writeJSON(w, 200, ok(map[string]string{"id": id}))
}

func handleToggleTodo(w http.ResponseWriter, r *http.Request) {
	var in TodoIn
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeJSON(w, 400, fail("请求格式错误"))
		return
	}
	if err := in.ValidateID(); err != nil {
		writeJSON(w, 400, fail(err.Error()))
		return
	}
	if err := toggleTodo(in.ID); err != nil {
		writeJSON(w, 500, fail("更新失败"))
		return
	}
	writeJSON(w, 200, ok(nil))
}

func handleDeleteTodo(w http.ResponseWriter, r *http.Request) {
	var in TodoIn
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeJSON(w, 400, fail("请求格式错误"))
		return
	}
	if err := in.ValidateID(); err != nil {
		writeJSON(w, 400, fail(err.Error()))
		return
	}
	if err := deleteTodo(in.ID); err != nil {
		writeJSON(w, 500, fail("删除失败"))
		return
	}
	writeJSON(w, 200, ok(nil))
}

func handleUpdateTodo(w http.ResponseWriter, r *http.Request) {
	// TODO: 实现
	writeJSON(w, 500, fail("未实现"))
}

// ============ 动态 handler 注册 ============
// 每个 handler 在 init 里自我注册，main.go 不再硬编码 map

var handlerRegistry = map[string]http.HandlerFunc{}

func register(name string, fn http.HandlerFunc) {
	handlerRegistry[name] = fn
}

// registerAll 注册所有 handler
// 新加 handler 时，在 check-routes --fix 补完 stub 后，
// 在这里加一行： register("handleXxx", handleXxx)
func registerAll() {
	register("handleToken", handleToken)
	register("handleGetTodos", handleGetTodos)
	register("handleAddTodo", handleAddTodo)
	register("handleToggleTodo", handleToggleTodo)
	register("handleDeleteTodo", handleDeleteTodo)
	register("handleUpdateTodo", handleUpdateTodo)
}
