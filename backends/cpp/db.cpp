#include "db.h"
#include <sqlite3.h>
#include <mutex>

static sqlite3* db = nullptr;
static std::mutex dbMutex;

bool initDB() {
    if (sqlite3_open("data.db", &db) != SQLITE_OK) {
        return false;
    }
    const char* sql = R"SQL(
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
    )SQL";
    char* err = nullptr;
    int rc = sqlite3_exec(db, sql, nullptr, nullptr, &err);
    if (rc != SQLITE_OK) {
        sqlite3_free(err);
        return false;
    }
    return true;
}

void closeDB() {
    if (db) {
        sqlite3_close(db);
        db = nullptr;
    }
}

std::vector<Todo> listTodos() {
    std::lock_guard<std::mutex> lock(dbMutex);
    std::vector<Todo> out;
    const char* sql = "SELECT id, title, done, created_at FROM todos ORDER BY id DESC";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return out;
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Todo t;
        t.id = sqlite3_column_int(stmt, 0);
        const unsigned char* title = sqlite3_column_text(stmt, 1);
        t.title = title ? (const char*)title : "";
        t.done = sqlite3_column_int(stmt, 2) == 1;
        t.created_at = sqlite3_column_int64(stmt, 3);
        out.push_back(t);
    }
    sqlite3_finalize(stmt);
    return out;
}

int insertTodo(Todo& t) {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "INSERT INTO todos (title, done, created_at) VALUES (?, 0, ?)";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return 0;
    sqlite3_bind_text(stmt, 1, t.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 2, t.created_at);
    int rc = sqlite3_step(stmt);
    int id = 0;
    if (rc == SQLITE_DONE) {
        id = (int)sqlite3_last_insert_rowid(db);
    }
    sqlite3_finalize(stmt);
    return id;
}

bool toggleTodo(int id) {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "UPDATE todos SET done = 1 - done WHERE id = ?";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;
    sqlite3_bind_int(stmt, 1, id);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool deleteTodo(int id) {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "DELETE FROM todos WHERE id = ?";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;
    sqlite3_bind_int(stmt, 1, id);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool saveToken(const std::string& token, const std::string& ip, long long expiresAt) {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "INSERT INTO tokens (token, ip, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;
    sqlite3_bind_text(stmt, 1, token.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, ip.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 3, expiresAt - 300);
    sqlite3_bind_int64(stmt, 4, expiresAt);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool checkToken(const std::string& token) {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "SELECT COUNT(*) FROM tokens WHERE token = ? AND expires_at > ? AND used = 0";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return false;
    sqlite3_bind_text(stmt, 1, token.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 2, (long long)std::time(nullptr));
    bool found = false;
    if (sqlite3_step(stmt) == SQLITE_ROW) {
        found = sqlite3_column_int(stmt, 0) > 0;
    }
    sqlite3_finalize(stmt);
    return found;
}

void cleanupTokens() {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "DELETE FROM tokens WHERE expires_at < ?";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return;
    sqlite3_bind_int64(stmt, 1, (long long)std::time(nullptr));
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);
}
