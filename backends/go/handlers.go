package main

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"
)

func handleToken(w http.ResponseWriter, r *http.Request) {
	cleanupTokens()
	b := make([]byte, 16)
	rand.Read(b)
	token := hex.EncodeToString(b)
	ip := r.RemoteAddr
	expires := time.Now().Unix() + 300
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
	writeJSON(w, 200, ok(map[string]int{"id": id}))
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
