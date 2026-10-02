from fastapi import HTTPException


def bad_request(msg: str):
    raise HTTPException(400, msg)


def forbidden(msg: str = '无效 token'):
    raise HTTPException(403, msg)
