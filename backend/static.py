from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()
BASE = Path(__file__).parent.parent

MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.md': 'text/markdown; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
}


def serve(base_dir: Path, rel: str):
    if not rel:
        rel = 'index.html'
    target = (base_dir / rel).resolve()
    try:
        target.relative_to(base_dir.resolve())
    except ValueError:
        raise HTTPException(403)
    if target.is_dir():
        target = target / 'index.html'
    if not target.exists() or not target.is_file():
        raise HTTPException(404)
    mime = MIME.get(target.suffix, 'application/octet-stream')
    return FileResponse(target, media_type=mime, headers={
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    })


@router.get('/playground/{path:path}')
def playground(path: str = ''):
    return serve(BASE / 'playground', path)


@router.get('/myapp/{path:path}')
def myapp(path: str = ''):
    return serve(BASE / 'myapp', path)


@router.get('/demo/{path:path}')
def demo(path: str = ''):
    return serve(BASE / 'demo', path)


@router.get('/site/{path:path}')
def site(path: str = ''):
    return serve(BASE / 'site/dist', path)


@router.get('/examples/{path:path}')
def examples(path: str = ''):
    return serve(BASE / 'examples', path)


@router.get('/xunay/{path:path}')
def xunay(path: str = ''):
    return serve(BASE / 'core' / 'src', path)


@router.get('/{path:path}')
def frontend(path: str = ''):
    if path.startswith('rpc/') or path.startswith('ws') or path == 'docs' or path.startswith('openapi'):
        raise HTTPException(404)
    return serve(BASE / 'frontend', path)
