import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
_cfg = json.loads((ROOT / "xunay.config.json").read_text())
DB_PATH = ROOT / _cfg["database"]["sqlite"]["path"]
SCHEMA_SQL = (ROOT / "shared" / "schema.sql").read_text()


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    conn.close()


def list_todos():
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "title": r["title"],
            "done": bool(r["done"]),
            "created_at": r["created_at"],
        }
        for r in rows
    ]


def insert_todo(t):
    conn = get_conn()
    conn.execute(
        "INSERT INTO todos (id, title, done, created_at) VALUES (?, ?, 0, ?)",
        (t["id"], t["title"], t["created_at"]),
    )
    conn.commit()
    conn.close()
    return t["id"]


def toggle_todo(tid: str):
    conn = get_conn()
    row = conn.execute("SELECT done FROM todos WHERE id = ?", (tid,)).fetchone()
    if row:
        conn.execute("UPDATE todos SET done = ? WHERE id = ?", (0 if row["done"] else 1, tid))
        conn.commit()
    conn.close()


def delete_todo(tid: str):
    conn = get_conn()
    conn.execute("DELETE FROM todos WHERE id = ?", (tid,))
    conn.commit()
    conn.close()


def save_token(token: str, ip: str, expires_at: int):
    conn = get_conn()
    conn.execute(
        "INSERT INTO tokens (token, ip, created_at, expires_at) VALUES (?, ?, ?, ?)",
        (token, ip, int(__import__("time").time() * 1000), int(expires_at)),
    )
    conn.commit()
    conn.close()


def check_token(token: str) -> bool:
    conn = get_conn()
    row = conn.execute(
        "SELECT 1 FROM tokens WHERE token = ? AND expires_at > ?",
        (token, int(__import__("time").time() * 1000)),
    ).fetchone()
    conn.close()
    return row is not None


def cleanup_tokens():
    conn = get_conn()
    conn.execute("DELETE FROM tokens WHERE expires_at < ?", (int(__import__("time").time() * 1000),))
    conn.commit()
    conn.close()
