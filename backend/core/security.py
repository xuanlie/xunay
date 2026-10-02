import secrets
import time
from ..db import get_conn
from ..config import TOKEN_TTL


def create_token(ip: str) -> str:
    token = secrets.token_hex(16)
    now = time.time()
    conn = get_conn()
    conn.execute(
        'INSERT INTO tokens (token, ip, created_at, expires_at, used) VALUES (?, ?, ?, ?, 0)',
        (token, ip, now, now + TOKEN_TTL)
    )
    conn.commit()
    conn.close()
    return token


def verify_token(token: str, ip: str) -> bool:
    if not token:
        return False
    conn = get_conn()
    row = conn.execute(
        'SELECT 1 FROM tokens WHERE token = ? AND expires_at > ? AND used = 0',
        (token, time.time())
    ).fetchone()
    conn.close()
    return row is not None


def cleanup_tokens():
    conn = get_conn()
    conn.execute('DELETE FROM tokens WHERE expires_at < ?', (time.time(),))
    conn.commit()
    conn.close()
