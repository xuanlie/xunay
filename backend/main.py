from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import init_db
from .api import token, todos, ws
from . import static

BASE = Path(__file__).parent.parent

app = FastAPI(title='XuNay API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)

init_db()

app.include_router(token.router)
app.include_router(todos.router)
app.include_router(ws.router)
app.include_router(static.router)
