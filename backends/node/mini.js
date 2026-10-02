// XuNay Node mini router，20 行
const routes = new Map()

export const get = (p, fn) => routes.set('GET ' + p, fn)
export const post = (p, fn) => routes.set('POST ' + p, fn)

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'X-Token, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  })
  res.end(body === null ? '' : JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', c => { data += c })
    req.on('end', () => {
      if (!data) return resolve({})
      try { resolve(JSON.parse(data)) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

export function makeCtx(req, res) {
  return {
    req,
    headers: req.headers,
    async body(Schema) {
      const data = await readBody(req)
      const inst = new Schema(data)
      if (inst.validate) inst.validate()
      return inst
    },
    ok(data) { send(res, 200, { ok: true, data, error: null }) },
    fail(msg, status = 400) { send(res, status, { ok: false, data: null, error: msg }) },
  }
}

export function wrapAuth(fn) {
  return async ctx => {
    const t = ctx.headers['x-token']
    if (!t || !globalThis.checkToken(t)) return ctx.fail('无效 token', 403)
    return fn(ctx)
  }
}

export async function handle(req, res) {
  if (req.method === 'OPTIONS') return send(res, 204, null)
  const url = req.url.split('?')[0]
  const fn = routes.get(req.method + ' ' + url)
  if (!fn) return send(res, 404, { ok: false, data: null, error: '接口不存在' })
  const ctx = makeCtx(req, res)
  try {
    await fn(ctx)
  } catch (e) {
    send(res, 500, { ok: false, data: null, error: e.message })
  }
}
