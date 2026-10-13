#include "db.h"
#include <sqlite3.h>
#include <mutex>
#include <fstream>
#include <sstream>
#include <filesystem>
#include <cstdlib>

namespace fs = std::filesystem;

static sqlite3* db = nullptr;
static std::mutex dbMutex;

// 从 cwd 往上找含 xunay.config.json 的目录
static std::string findRoot() {
    if (const char* env = std::getenv("XUNAY_ROOT")) return env;
    fs::path dir = fs::current_path();
    while (true) {
        if (fs::exists(dir / "xunay.config.json")) return dir.string();
        fs::path parent = dir.parent_path();
        if (parent == dir || parent.empty()) break;
        dir = parent;
    }
    return "";
}

bool initDB() {
    std::string root = findRoot();
    if (root.empty()) return false;

    // 读 xunay.config.json 拿 sqlite 路径
    std::ifstream cfgFile(root + "/xunay.config.json");
    if (!cfgFile.is_open()) return false;
    std::stringstream cfgSs; cfgSs << cfgFile.rdbuf();
    std::string cfg = cfgSs.str();

    // 简单提取 "sqlite" 段的 path
    auto pos = cfg.find("\"sqlite\"");
    if (pos == std::string::npos) return false;
    auto ppos = cfg.find("\"path\"", pos);
    if (ppos == std::string::npos) return false;
    auto q1 = cfg.find('"', cfg.find(':', ppos) + 1);
    auto q2 = cfg.find('"', q1 + 1);
    std::string dbPath = root + "/" + cfg.substr(q1 + 1, q2 - q1 - 1);

    // 读 schema.sql
    std::ifstream schemaFile(root + "/shared/schema.sql");
    if (!schemaFile.is_open()) return false;
    std::stringstream ss; ss << schemaFile.rdbuf();
    std::string schema = ss.str();

    if (sqlite3_open(dbPath.c_str(), &db) != SQLITE_OK) return false;

    char* err = nullptr;
    if (sqlite3_exec(db, schema.c_str(), nullptr, nullptr, &err) != SQLITE_OK) {
        sqlite3_free(err);
        return false;
    }
    return true;
}

void closeDB() {
    if (db) { sqlite3_close(db); db = nullptr; }
}

std::vector<Todo> listTodos() {
    std::lock_guard<std::mutex> lock(dbMutex);
    std::vector<Todo> out;
    const char* sql = "SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return out;
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        Todo t;
        const unsigned char* id = sqlite3_column_text(stmt, 0);
        t.id = id ? (const char*)id : "";
        const unsigned char* title = sqlite3_column_text(stmt, 1);
        t.title = title ? (const char*)title : "";
        t.done = sqlite3_column_int(stmt, 2) == 1;
        t.created_at = sqlite3_column_int64(stmt, 3);
        out.push_back(t);
    }
    sqlite3_finalize(stmt);
    return out;
}

std::string insertTodo(const Todo& t) {
    std::lock_guard<std::mutex> lock(dbMutex);
    const char* sql = "INSERT INTO todos (id, title, done, created_at) VALUES (?, ?, 0, ?)";
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) != SQLITE_OK) return "";
    sqlite3_bind_text(stmt, 1, t.id.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, t.title.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 3, t.created_at);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE ? t.id : "";
}

bool toggleTodo(const std::string& id) {
    std::lock_guard<std::mutex> lock(dbMutex);
    int done = 0;
    {
        sqlite3_stmt* s;
        if (sqlite3_prepare_v2(db, "SELECT done FROM todos WHERE id = ?", -1, &s, nullptr) != SQLITE_OK)
            return false;
        sqlite3_bind_text(s, 1, id.c_str(), -1, SQLITE_TRANSIENT);
        if (sqlite3_step(s) == SQLITE_ROW) done = sqlite3_column_int(s, 0);
        sqlite3_finalize(s);
    }
    sqlite3_stmt* s;
    if (sqlite3_prepare_v2(db, "UPDATE todos SET done = ? WHERE id = ?", -1, &s, nullptr) != SQLITE_OK)
        return false;
    sqlite3_bind_int(s, 1, done ? 0 : 1);
    sqlite3_bind_text(s, 2, id.c_str(), -1, SQLITE_TRANSIENT);
    int rc = sqlite3_step(s);
    sqlite3_finalize(s);
    return rc == SQLITE_DONE;
}

bool deleteTodo(const std::string& id) {
    std::lock_guard<std::mutex> lock(dbMutex);
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, "DELETE FROM todos WHERE id = ?", -1, &stmt, nullptr) != SQLITE_OK)
        return false;
    sqlite3_bind_text(stmt, 1, id.c_str(), -1, SQLITE_TRANSIENT);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool saveToken(const std::string& token, const std::string& ip, long long expiresAt) {
    std::lock_guard<std::mutex> lock(dbMutex);
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db,
        "INSERT INTO tokens (token, ip, created_at, expires_at) VALUES (?, ?, ?, ?)",
        -1, &stmt, nullptr) != SQLITE_OK) return false;
    sqlite3_bind_text(stmt, 1, token.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, ip.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 3, nowMs());
    sqlite3_bind_int64(stmt, 4, expiresAt);
    int rc = sqlite3_step(stmt);
    sqlite3_finalize(stmt);
    return rc == SQLITE_DONE;
}

bool checkToken(const std::string& token) {
    std::lock_guard<std::mutex> lock(dbMutex);
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db,
        "SELECT COUNT(*) FROM tokens WHERE token = ? AND expires_at > ?",
        -1, &stmt, nullptr) != SQLITE_OK) return false;
    sqlite3_bind_text(stmt, 1, token.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_int64(stmt, 2, nowMs());
    bool found = false;
    if (sqlite3_step(stmt) == SQLITE_ROW) found = sqlite3_column_int(stmt, 0) > 0;
    sqlite3_finalize(stmt);
    return found;
}

void cleanupTokens() {
    std::lock_guard<std::mutex> lock(dbMutex);
    sqlite3_stmt* stmt;
    if (sqlite3_prepare_v2(db, "DELETE FROM tokens WHERE expires_at < ?",
        -1, &stmt, nullptr) != SQLITE_OK) return;
    sqlite3_bind_int64(stmt, 1, nowMs());
    sqlite3_step(stmt);
    sqlite3_finalize(stmt);
}
