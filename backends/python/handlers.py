import secrets
import time
from . import db
from .schemas import Todo, TodoIn

TOKEN_TTL = 300


def handleToken(ctx):
    db.cleanup_tokens()
    token = secrets.token_hex(16)
    db.save_token(token, ctx.get("ip", ""), time.time() + TOKEN_TTL)
    ctx["ok"]({"token": token})


def handleGetTodos(ctx):
    ctx["ok"](db.list_todos())


def handleAddTodo(ctx):
    body = ctx["body"]
    t = Todo(**body)
    rid = db.insert_todo(t.title)
    ctx["ok"]({"id": rid})


def handleToggleTodo(ctx):
    body = ctx["body"]
    t = TodoIn(**body)
    t.check_id()
    db.toggle_todo(t.id)
    ctx["ok"](None)


def handleDeleteTodo(ctx):
    body = ctx["body"]
    t = TodoIn(**body)
    t.check_id()
    db.delete_todo(t.id)
    ctx["ok"](None)
