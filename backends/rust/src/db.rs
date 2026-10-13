use rusqlite::Connection;
use std::sync::Mutex;

pub struct Db {
    pub conn: Mutex<Connection>,
}

pub fn init(root: &str) -> Db {
    let cfg_text = std::fs::read_to_string(format!("{}/xunay.config.json", root)).unwrap();
    let cfg: serde_json::Value = serde_json::from_str(&cfg_text).unwrap();
    let db_path = format!(
        "{}/{}",
        root,
        cfg["database"]["sqlite"]["path"].as_str().unwrap()
    );

    let conn = Connection::open(&db_path).expect("打开数据库失败");
    let schema = std::fs::read_to_string(format!("{}/shared/schema.sql", root)).unwrap();
    conn.execute_batch(&schema).expect("执行 schema 失败");
    Db { conn: Mutex::new(conn) }
}
