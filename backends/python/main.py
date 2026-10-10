import json
from pathlib import Path
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware

from . import db
from . import handlers

ROOT = Path(__file__).parent.parent.parent
cfg = json.loads((ROOT / "xunay.config.json").read_text())
routes = json.loads((ROOT / "shared" / "routes.json").read_text())["routes"]
PORT = cfg["ports"]["python"]

app = FastAPI(title="XuNay Python 后端")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
db.init_db()


def make_handler(spec):
    raw = getattr(handlers, spec["handler"])

    def fn(body: dict = None, x_token: str = Header(None)):
        if spec["auth"]:
            if not x_token or not db.check_token(x_token):
                raise HTTPException(403, "无效 token")
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
            raise HTTPException(400, str(e))
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
