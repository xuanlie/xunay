package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
)

type RouteSpec struct {
	Name    string `json:"name"`
	Method  string `json:"method"`
	Path    string `json:"path"`
	Auth    bool   `json:"auth"`
	Handler string `json:"handler"`
}

type RoutesFile struct {
	Routes []RouteSpec `json:"routes"`
}

type Config struct {
	Backend string         `json:"backend"`
	Ports   map[string]int `json:"ports"`
}

var handlerMap = map[string]http.HandlerFunc{
	"handleToken":      handleToken,
	"handleGetTodos":   handleGetTodos,
	"handleAddTodo":    handleAddTodo,
	"handleToggleTodo": handleToggleTodo,
	"handleDeleteTodo": handleDeleteTodo,
}

func wrapAuth(fn http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("X-Token")
		if token == "" || !checkToken(token) {
			writeJSON(w, 403, fail("无效 token"))
			return
		}
		fn(w, r)
	}
}

func main() {
	if err := initDB(); err != nil {
		log.Fatal("数据库初始化失败:", err)
	}
	defer db.Close()

	root := filepath.Join("..", "..")

	cfgData, err := os.ReadFile(filepath.Join(root, "xunay.config.json"))
	if err != nil {
		log.Fatal("读 xunay.config.json 失败:", err)
	}
	var cfg Config
	if err := json.Unmarshal(cfgData, &cfg); err != nil {
		log.Fatal("解析配置失败:", err)
	}
	port := cfg.Ports["go"]
	addr := ":" + strconv.Itoa(port)

	routesData, err := os.ReadFile(filepath.Join(root, "shared", "routes.json"))
	if err != nil {
		log.Fatal("读 routes.json 失败:", err)
	}
	var rf RoutesFile
	if err := json.Unmarshal(routesData, &rf); err != nil {
		log.Fatal("解析 routes.json 失败:", err)
	}

	for _, r := range rf.Routes {
		fn, ok := handlerMap[r.Handler]
		if !ok {
			log.Fatal("缺 handler: " + r.Handler)
		}
		h := fn
		if r.Auth {
			h = wrapAuth(fn)
		}
		http.HandleFunc(r.Path, corsMiddleware(h))
	}

	log.Printf("加载 %d 个路由", len(rf.Routes))
	log.Printf("XuNay Go 后端 %s", addr)
	log.Fatal(http.ListenAndServe(addr, nil))
}
