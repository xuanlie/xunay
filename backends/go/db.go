package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

var (
	db   *sql.DB
	dbMu sync.Mutex
)

type xunayConfig struct {
	Database struct {
		Driver   string `json:"driver"`
		SQLite   struct{ Path string `json:"path"` }  `json:"sqlite"`
		Postgres struct{ URL  string `json:"url"`  }  `json:"postgres"`
		MySQL    struct{ URL  string `json:"url"`  }  `json:"mysql"`
	} `json:"database"`
}

func findRoot() string {
	// 1) 环境变量优先
	if env := os.Getenv("XUNAY_ROOT"); env != "" {
		return env
	}
	// 2) 从 cwd 往上找
	dir, _ := os.Getwd()
	for {
		if _, err := os.Stat(filepath.Join(dir, "xunay.config.json")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	// 3) 从可执行文件位置往上找
	if exe, err := os.Executable(); err == nil {
		dir := filepath.Dir(exe)
		for {
			if _, err := os.Stat(filepath.Join(dir, "xunay.config.json")); err == nil {
				return dir
			}
			parent := filepath.Dir(dir)
			if parent == dir {
				break
			}
			dir = parent
		}
	}
	return ""
}

func initDB() error {
	root := findRoot()

	cfgData, err := os.ReadFile(filepath.Join(root, "xunay.config.json"))
	if err != nil {
		return err
	}
	var cfg xunayConfig
	if err := json.Unmarshal(cfgData, &cfg); err != nil {
		return err
	}

	driver := os.Getenv("XUNAY_DB")
	if driver == "" {
		driver = cfg.Database.Driver
	}
	if driver == "" {
		driver = "sqlite"
	}

	var (
		driverName string
		dsn        string
		schemaFile string
	)

	switch driver {
	case "sqlite":
		driverName = "sqlite"
		dsn = filepath.Join(root, cfg.Database.SQLite.Path)
		schemaFile = filepath.Join(root, "shared", "schema.sql")
	case "postgres", "postgresql":
		driverName = "postgres"
		dsn = cfg.Database.Postgres.URL
		schemaFile = filepath.Join(root, "shared", "schema.postgres.sql")
	case "mysql":
		driverName = "mysql"
		dsn = cfg.Database.MySQL.URL
		schemaFile = filepath.Join(root, "shared", "schema.mysql.sql")
	default:
		return fmt.Errorf("未知 driver: %s（可选 sqlite / postgres / mysql）", driver)
	}

	schema, err := os.ReadFile(schemaFile)
	if err != nil {
		return err
	}

	db, err = sql.Open(driverName, dsn)
	if err != nil {
		return err
	}

	// 逐条执行 schema（分号切分，避免驱动不支持多语句）
	for _, stmt := range strings.Split(string(schema), ";") {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		if _, err := db.Exec(stmt); err != nil {
			return fmt.Errorf("执行 schema 失败: %w\n语句: %s", err, stmt)
		}
	}
	return nil
}

func listTodos() ([]Todo, error) {
	dbMu.Lock()
	defer dbMu.Unlock()
	rows, err := db.Query("SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Todo
	for rows.Next() {
		var t Todo
		var done int
		if err := rows.Scan(&t.ID, &t.Title, &done, &t.CreatedAt); err != nil {
			return nil, err
		}
		t.Done = done == 1
		out = append(out, t)
	}
	return out, nil
}

func insertTodo(t *Todo) (string, error) {
	dbMu.Lock()
	defer dbMu.Unlock()
	_, err := db.Exec(
		"INSERT INTO todos (id, title, done, created_at) VALUES (?, ?, 0, ?)",
		t.ID, t.Title, t.CreatedAt,
	)
	if err != nil {
		return "", err
	}
	return t.ID, nil
}

func toggleTodo(id string) error {
	dbMu.Lock()
	defer dbMu.Unlock()
	var done int
	if err := db.QueryRow("SELECT done FROM todos WHERE id = ?", id).Scan(&done); err != nil {
		return err
	}
	nv := 1
	if done == 1 {
		nv = 0
	}
	_, err := db.Exec("UPDATE todos SET done = ? WHERE id = ?", nv, id)
	return err
}

func deleteTodo(id string) error {
	dbMu.Lock()
	defer dbMu.Unlock()
	_, err := db.Exec("DELETE FROM todos WHERE id = ?", id)
	return err
}

func saveToken(token, ip string, expiresAt int64) error {
	dbMu.Lock()
	defer dbMu.Unlock()
	_, err := db.Exec(
		"INSERT INTO tokens (token, ip, created_at, expires_at) VALUES (?, ?, ?, ?)",
		token, ip, nowMs(), expiresAt,
	)
	return err
}

func checkToken(token string) bool {
	dbMu.Lock()
	defer dbMu.Unlock()
	var n int
	db.QueryRow("SELECT COUNT(*) FROM tokens WHERE token = ? AND expires_at > ?",
		token, nowMs()).Scan(&n)
	return n > 0
}

func cleanupTokens() {
	dbMu.Lock()
	defer dbMu.Unlock()
	db.Exec("DELETE FROM tokens WHERE expires_at < ?", nowMs())
}
