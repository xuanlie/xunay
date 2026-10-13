import secrets
import time

import db
from schemas import Todo, TodoIn

TOKEN_TTL_MS = 300 * 1000

def handle_token(ctx):
    db.cleanup_tokens()
    token = secrets.token_hex(16)
    db.save_token(token, ctx.get("ip", ""), int(time.time() * 1000) + TOKEN_TTL_MS)
    ctx["ok"]({"token": token})

def handle_get_todos(ctx):
    ctx["ok"](db.list_todos())

def handle_add_todo(ctx):
    t = Todo(**ctx["body"]).ensure()
    rid = db.insert_todo(t.model_dump())
    ctx["ok"]({"id": rid})

def handle_toggle_todo(ctx):
    t = TodoIn(**ctx["body"]).check_id()
    db.toggle_todo(t.id)
    ctx["ok"](None)

def handle_delete_todo(ctx):
    t = TodoIn(**ctx["body"]).check_id()
    db.delete_todo(t.id)
    ctx["ok"](None)



def handle_update_todo(ctx):
    # TODO: 实现
    ctx["fail"]("未实现")
