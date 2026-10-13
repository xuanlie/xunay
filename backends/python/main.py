import json
import os
from pathlib import Path

from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware

import db
import handlers

ROOT = Path(__file__).resolve().parent.parent.parent
cfg = json.loads((ROOT / "xunay.config.json").read_text())
routes = json.loads((ROOT / "shared" / "routes.json").read_text())["routes"]
PORT = int(os.environ.get("XUNAY_PORT", cfg["ports"]["python"]))

app = FastAPI(title="XuNay Python 后端")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

db.init_db()


def make_handler(spec):
    import re
    snake = re.sub(r"(?<!^)(?=[A-Z])", "_", spec["handler"]).lower()
    raw = getattr(handlers, snake)

    async def fn(body: dict = None, x_token: str = Header(None)):
        # 鉴权失败 → 统一格式
        if spec["auth"]:
            if not x_token or not db.check_token(x_token):
                return {"ok": False, "data": None, "error": "无效 token"}

        result = {"ok": None, "data": None, "error": None}
        ctx = {
            "body": body or {},
            "ip": "",
            "ok": lambda data: result.update(ok=True, data=data, error=None),
            "fail": lambda msg: result.update(ok=False, data=None, error=msg),
        }
        try:
            raw(ctx)
        except Exception as e:
            msg = str(e)
            # Pydantic 的 ValidationError 提取干净消息
            if hasattr(e, "errors"):
                errs = e.errors()
                if errs:
                    msg = errs[0].get("msg", msg).replace("Value error, ", "")
            return {"ok": False, "data": None, "error": msg}
        return result

    return fn


for r in routes:
    fn = make_handler(r)
    if r["method"] == "GET":
        app.get(r["path"])(fn)
    else:
        app.post(r["path"])(fn)


@app.on_event("startup")
def startup():
    print(f"加载 {len(routes)} 个路由")
    print(f"XuNay Python 后端 :{PORT}")
