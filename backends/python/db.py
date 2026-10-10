import sqlite3
import time
from pathlib import Path

DB_PATH = Path(__file__).parent / "data.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            done INTEGER DEFAULT 0,
            created_at REAL
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS tokens (
            token TEXT PRIMARY KEY,
            ip TEXT,
            created_at REAL,
            expires_at REAL
        )
    """)
    conn.commit()
    conn.close()


def list_todos():
    conn = get_conn()
    rows = conn.execute("SELECT id, title, done, created_at FROM todos ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def insert_todo(title: str) -> int:
    conn = get_conn()
    cur = conn.execute("INSERT INTO todos (title, done, created_at) VALUES (?, 0, ?)", (title, time.time()))
    conn.commit()
    rid = cur.lastrowid
    conn.close()
    return rid


def toggle_todo(tid: int):
    conn = get_conn()
    conn.execute("UPDATE todos SET done = 1 - done WHERE id = ?", (tid,))
    conn.commit()
    conn.close()


def delete_todo(tid: int):
    conn = get_conn()
    conn.execute("DELETE FROM todos WHERE id = ?", (tid,))
    conn.commit()
    conn.close()


def save_token(token: str, ip: str, expires_at: float):
    conn = get_conn()
    conn.execute(
        "INSERT INTO tokens (token, ip, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, ip, time.time(), expires_at),
    )
    conn.commit()
    conn.close()


def check_token(token: str) -> bool:
    conn = get_conn()
    row = conn.execute(
        "SELECT 1 FROM tokens WHERE token = ? AND expires_at > ?",
        (token, time.time()),
    ).fetchone()
    conn.close()
    return row is not None


def cleanup_tokens():
    conn = get_conn()
    conn.execute("DELETE FROM tokens WHERE expires_at < ?", (time.time(),))
    conn.commit()
    conn.close()
