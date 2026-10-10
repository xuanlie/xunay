package main

import (
	"database/sql"
	"sync"

	_ "modernc.org/sqlite"
)

var (
	db   *sql.DB
	dbMu sync.Mutex
)

func initDB() error {
	var err error
	db, err = sql.Open("sqlite", "data.db")
	if err != nil {
		return err
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS todos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			done INTEGER DEFAULT 0,
			created_at INTEGER
		);
		CREATE TABLE IF NOT EXISTS tokens (
			token TEXT PRIMARY KEY,
			ip TEXT,
			created_at INTEGER,
			expires_at INTEGER,
			used INTEGER DEFAULT 0
		);
	`)
	return err
}

func listTodos() ([]Todo, error) {
	dbMu.Lock()
	defer dbMu.Unlock()
	rows, err := db.Query("SELECT id, title, done, created_at FROM todos ORDER BY id DESC")
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

func insertTodo(t *Todo) (int, error) {
	dbMu.Lock()
	defer dbMu.Unlock()
	res, err := db.Exec("INSERT INTO todos (title, done, created_at) VALUES (?, 0, ?)", t.Title, t.CreatedAt)
	if err != nil {
		return 0, err
	}
	id, _ := res.LastInsertId()
	return int(id), nil
}

func toggleTodo(id int) error {
	dbMu.Lock()
	defer dbMu.Unlock()
	_, err := db.Exec("UPDATE todos SET done = 1 - done WHERE id = ?", id)
	return err
}

func deleteTodo(id int) error {
	dbMu.Lock()
	defer dbMu.Unlock()
	_, err := db.Exec("DELETE FROM todos WHERE id = ?", id)
	return err
}

func saveToken(token, ip string, expiresAt int64) error {
	dbMu.Lock()
	defer dbMu.Unlock()
	_, err := db.Exec("INSERT INTO tokens (token, ip, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)",
		token, ip, expiresAt-300, expiresAt)
	return err
}

func checkToken(token string) bool {
	dbMu.Lock()
	defer dbMu.Unlock()
	var n int
	db.QueryRow("SELECT COUNT(*) FROM tokens WHERE token = ? AND expires_at > strftime('%s','now') AND used = 0", token).Scan(&n)
	return n > 0
}

func cleanupTokens() {
	dbMu.Lock()
	defer dbMu.Unlock()
	db.Exec("DELETE FROM tokens WHERE expires_at < strftime('%s','now')")
}
