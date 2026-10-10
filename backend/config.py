from pathlib import Path

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / 'data.db'
TOKEN_TTL = 300  # 5 分钟
