from fastapi import APIRouter, Request
from ..core.security import create_token, cleanup_tokens

router = APIRouter()


@router.get('/rpc/token')
def get_token(request: Request):
    cleanup_tokens()
    ip = request.client.host if request.client else 'unknown'
    token = create_token(ip)
    return {'ok': True, 'data': {'token': token}, 'error': None}
