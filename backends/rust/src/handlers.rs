use axum::{extract::State, http::HeaderMap, Json};
use serde_json::{json, Value};
use std::sync::Arc;

use crate::db::Db;

type AppState = Arc<Db>;

fn now_ms() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis() as i64
}

fn rand_token() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    (0..32)
        .map(|_| format!("{:x}", rng.gen_range(0..16)))
        .collect()
}

fn check_auth(db: &Db, headers: &HeaderMap) -> Result<(), String> {
    let token = headers
        .get("x-token")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if token.is_empty() {
        return Err("无效 token".to_string());
    }
    let conn = db.conn.lock().unwrap();
    let count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM tokens WHERE token = ? AND expires_at > ?",
            rusqlite::params![token, now_ms()],
            |r| r.get(0),
        )
        .unwrap_or(0);
    if count == 0 {
        return Err("无效 token".to_string());
    }
    Ok(())
}

pub async fn token(State(db): State<AppState>) -> Json<Value> {
    let result = {
        let conn = db.conn.lock().unwrap();
        conn.execute("DELETE FROM tokens WHERE expires_at < ?", [now_ms()])
            .ok();
        let t = rand_token();
        let expires = now_ms() + 300_000;
        conn.execute(
            "INSERT INTO tokens (token, ip, created_at, expires_at) VALUES (?, '', ?, ?)",
            rusqlite::params![t, now_ms(), expires],
        )
        .ok();
        t
    };
    Json(json!({"ok": true, "data": {"token": result}, "error": null}))
}

pub async fn get_todos(State(db): State<AppState>, headers: HeaderMap) -> Json<Value> {
    if let Err(e) = check_auth(&db, &headers) {
        return Json(json!({"ok": false, "data": null, "error": e}));
    }
    let todos: Vec<Value> = {
        let conn = db.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id, title, done, created_at FROM todos ORDER BY created_at DESC")
            .unwrap();
        let rows = stmt
            .query_map([], |r| {
                Ok(json!({
                    "id": r.get::<_, String>(0)?,
                    "title": r.get::<_, String>(1)?,
                    "done": r.get::<_, i64>(2)? != 0,
                    "created_at": r.get::<_, i64>(3)?,
                }))
            })
            .unwrap();
        rows.filter_map(Result::ok).collect()
    };
    Json(json!({"ok": true, "data": todos, "error": null}))
}

pub async fn add_todo(
    State(db): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Json<Value> {
    if let Err(e) = check_auth(&db, &headers) {
        return Json(json!({"ok": false, "data": null, "error": e}));
    }
    let title = body["title"].as_str().unwrap_or("").trim().to_string();
    if title.is_empty() {
        return Json(json!({"ok": false, "data": null, "error": "title 不能为空"}));
    }
    if title.chars().count() > 200 {
        return Json(json!({"ok": false, "data": null, "error": "title 最多 200 字"}));
    }
    let id = uuid::Uuid::new_v4().to_string();
    let created = now_ms();
    {
        let conn = db.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO todos (id, title, done, created_at) VALUES (?, ?, 0, ?)",
            rusqlite::params![id, title, created],
        )
        .ok();
    }
    Json(json!({"ok": true, "data": {"id": id}, "error": null}))
}

pub async fn toggle_todo(
    State(db): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Json<Value> {
    if let Err(e) = check_auth(&db, &headers) {
        return Json(json!({"ok": false, "data": null, "error": e}));
    }
    let id = body["id"].as_str().unwrap_or("");
    if id.is_empty() {
        return Json(json!({"ok": false, "data": null, "error": "id 必填"}));
    }
    {
        let conn = db.conn.lock().unwrap();
        let done: i64 = conn
            .query_row("SELECT done FROM todos WHERE id = ?", [id], |r| r.get(0))
            .unwrap_or(0);
        conn.execute(
            "UPDATE todos SET done = ? WHERE id = ?",
            rusqlite::params![if done == 0 { 1 } else { 0 }, id],
        )
        .ok();
    }
    Json(json!({"ok": true, "data": null, "error": null}))
}

pub async fn delete_todo(
    State(db): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> Json<Value> {
    if let Err(e) = check_auth(&db, &headers) {
        return Json(json!({"ok": false, "data": null, "error": e}));
    }
    let id = body["id"].as_str().unwrap_or("");
    if id.is_empty() {
        return Json(json!({"ok": false, "data": null, "error": "id 必填"}));
    }
    {
        let conn = db.conn.lock().unwrap();
        conn.execute("DELETE FROM todos WHERE id = ?", [id]).ok();
    }
    Json(json!({"ok": true, "data": null, "error": null}))
}

pub async fn update_todo(State(db): State<AppState>, headers: HeaderMap) -> Json<Value> {
    if let Err(e) = check_auth(&db, &headers) {
        return Json(json!({"ok": false, "data": null, "error": e}));
    }
    Json(json!({"ok": false, "data": null, "error": "未实现"}))
}
