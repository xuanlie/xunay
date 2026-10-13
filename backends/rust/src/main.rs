mod db;
mod handlers;

use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;

fn find_root() -> String {
    if let Ok(env) = std::env::var("XUNAY_ROOT") {
        return env;
    }
    let mut dir = std::env::current_dir().unwrap();
    loop {
        if dir.join("xunay.config.json").exists() {
            return dir.to_string_lossy().to_string();
        }
        if !dir.pop() {
            return String::new();
        }
    }
}

#[tokio::main]
async fn main() {
    let root = find_root();
    if root.is_empty() {
        eprintln!("找不到 xunay.config.json");
        std::process::exit(1);
    }

    let cfg_text = std::fs::read_to_string(format!("{}/xunay.config.json", root)).unwrap();
    let cfg: serde_json::Value = serde_json::from_str(&cfg_text).unwrap();
    let port: u16 = std::env::var("XUNAY_PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or_else(|| cfg["ports"]["backend"].as_u64().unwrap_or(12341) as u16);

    let db = Arc::new(db::init(&root));

    let app = Router::new()
        .route("/rpc/token", get(handlers::token))
        .route("/rpc/getTodos", get(handlers::get_todos))
        .route("/rpc/addTodo", post(handlers::add_todo))
        .route("/rpc/toggleTodo", post(handlers::toggle_todo))
        .route("/rpc/deleteTodo", post(handlers::delete_todo))
        .route("/rpc/updateTodo", post(handlers::update_todo))
        .with_state(db);

    let addr = format!("0.0.0.0:{}", port);
    println!("加载 6 个路由");
    println!("XuNay Rust 后端 :{}", port);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
