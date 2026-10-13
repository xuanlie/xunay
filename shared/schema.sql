-- XuNay 后端统一 schema
-- SQLite / PostgreSQL / MySQL 都能跑
-- 原则：UUID 主键 + INTEGER 布尔 + BIGINT 毫秒时间戳

CREATE TABLE IF NOT EXISTS todos (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  done       INTEGER DEFAULT 0,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS tokens (
  token      TEXT PRIMARY KEY,
  ip         TEXT,
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tokens_expires ON tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_todos_created  ON todos(created_at);
