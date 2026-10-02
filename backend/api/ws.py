from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

router = APIRouter()
clients = set()


@router.websocket('/ws')
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    clients.add(ws)
    print(f'[WS] 连接，共 {len(clients)} 个', flush=True)
    try:
        while True:
            text = await ws.receive_text()
            print(f'[WS] 收到: {text[:80]}', flush=True)
            try:
                json.loads(text)
                dead = []
                for c in list(clients):
                    try:
                        await c.send_text(text)
                    except Exception as e:
                        print(f'[WS] 发送失败: {e}', flush=True)
                        dead.append(c)
                for d in dead:
                    clients.discard(d)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        pass
    finally:
        clients.discard(ws)
        print(f'[WS] 断开，共 {len(clients)} 个', flush=True)


async def broadcast(msg: dict):
    dead = []
    for c in list(clients):
        try:
            await c.send_json(msg)
        except Exception:
            dead.append(c)
    for d in dead:
        clients.discard(d)
