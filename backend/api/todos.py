import time
from fastapi import APIRouter, Request, Header
from ..db import get_conn
from ..core.security import verify_token
from ..core.errors import forbidden, bad_request
from ..schemas import TodoIn
from .ws import broadcast

router = APIRouter()


def check(request: Request, x_token: str):
    ip = request.client.host if request.client else 'unknown'
    if not verify_token(x_token, ip):
        forbidden()


@router.get('/rpc/getTodos')
def get_todos(request: Request, x_token: str = Header('')):
    check(request, x_token)
    conn = get_conn()
    rows = conn.execute('SELECT id, title, done FROM todos ORDER BY id DESC').fetchall()
    conn.close()
    return {'ok': True, 'data': [dict(r) for r in rows], 'error': None}


@router.post('/rpc/addTodo')
async def add_todo(payload: TodoIn, request: Request, x_token: str = Header('')):
    check(request, x_token)
    if not payload.title or not payload.title.strip():
        bad_request('title 不能为空')
    conn = get_conn()
    cur = conn.execute(
        'INSERT INTO todos (title, done, created_at) VALUES (?, 0, ?)',
        (payload.title.strip(), time.time())
    )
    conn.commit()
    conn.close()
    await broadcast({'type': 'todos_changed'})
    return {'ok': True, 'data': {'id': cur.lastrowid}, 'error': None}


@router.post('/rpc/toggleTodo')
async def toggle_todo(payload: TodoIn, request: Request, x_token: str = Header('')):
    check(request, x_token)
    if not payload.id:
        bad_request('id 必填')
    conn = get_conn()
    conn.execute('UPDATE todos SET done = 1 - done WHERE id = ?', (payload.id,))
    conn.commit()
    conn.close()
    await broadcast({'type': 'todos_changed'})
    return {'ok': True, 'data': None, 'error': None}


@router.post('/rpc/deleteTodo')
async def delete_todo(payload: TodoIn, request: Request, x_token: str = Header('')):
    check(request, x_token)
    if not payload.id:
        bad_request('id 必填')
    conn = get_conn()
    conn.execute('DELETE FROM todos WHERE id = ?', (payload.id,))
    conn.commit()
    conn.close()
    await broadcast({'type': 'todos_changed'})
    return {'ok': True, 'data': None, 'error': None}


@router.post('/rpc/updateTodo')
async def update_todo(payload: TodoIn, request: Request, x_token: str = Header('')):
    check(request, x_token)
    if not payload.id or payload.title is None:
        bad_request('id 和 title 必填')
    conn = get_conn()
    conn.execute('UPDATE todos SET title = ? WHERE id = ?', (payload.title, payload.id))
    conn.commit()
    conn.close()
    await broadcast({'type': 'todos_changed'})
    return {'ok': True, 'data': None, 'error': None}
