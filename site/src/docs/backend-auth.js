// 认证
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("认证"),
    P("xunay 用 token 认证——简单、无状态、四套后端共用。"),
    H2("流程"),
    Code("1. 前端 GET /rpc/token 拿 token\n2. 后续请求带 Authorization: Bearer <token>\n3. 后端验证 token\n4. 无效返回 401", "txt"),
    H2("获取 token"),
    Code("GET /rpc/token\n\n// 响应\n{\n  \"ok\": true,\n  \"data\": { \"token\": \"dd5de76d99752b4aa31892d7bedbd285\" }\n}", "txt"),
    H2("后端签发（Python）"),
    Code("# api/token.py\nimport secrets\nfrom fastapi import APIRouter\n\nrouter = APIRouter()\n_tokens = set()\n\n@router.get('/rpc/token')\nasync def issue_token():\n    t = secrets.token_hex(16)\n    _tokens.add(t)\n    return { 'ok': True, 'data': { 'token': t } }\n\ndef verify(token: str) -> bool:\n    return token in _tokens", "py"),
    H2("后端验证"),
    Code("# core/security.py\nfrom fastapi import Header, HTTPException\n\nasync def require_token(authorization: str = Header(None)):\n    if not authorization or not authorization.startswith('Bearer '):\n        raise HTTPException(401, '需要认证')\n    token = authorization[7:]\n    if not verify(token):\n        raise HTTPException(401, 'token 无效')\n    return token", "py"),
    H2("前端带上"),
    Code("// api/client.js\nlet _token = ''\n\nexport async function ensureToken() {\n  if (_token) return _token\n  const r = await fetch('/rpc/token')\n  const j = await r.json()\n  _token = j.data.token\n  return _token\n}\n\nasync function request(path, opts = {}) {\n  const t = await ensureToken()\n  const r = await fetch(path, {\n    ...opts,\n    headers: { ...opts.headers, 'Authorization': 'Bearer ' + t }\n  })\n  return r.json()\n}", "js"),
    H2("受保护接口标记"),
    P("在 routes.json 里标记哪些需要认证："),
    Code("{\n  \"name\": \"getTodos\",\n  \"method\": \"GET\",\n  \"path\": \"/rpc/getTodos\",\n  \"auth\": true\n}", "json"),
    H2("生产建议"),
    Ul("用 JWT 替代临时 token","加过期时间","HTTPS 传输","存 Redis 而非内存"),
  )
}
