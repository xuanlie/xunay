CREATE TABLE IF NOT EXISTS todos (
  id         VARCHAR(64) PRIMARY KEY,
  title      VARCHAR(255) NOT NULL,
  done       TINYINT DEFAULT 0,
  created_at BIGINT NOT NULL,
  INDEX idx_todos_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tokens (
  token      VARCHAR(64) PRIMARY KEY,
  ip         VARCHAR(64),
  created_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL,
  INDEX idx_tokens_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
