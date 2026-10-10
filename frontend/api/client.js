let token = ''

export async function initToken() {
  const r = await fetch('/rpc/token')
  const d = await r.json()
  if (!d.ok) throw new Error('token 获取失败')
  token = d.data.token
}

async function request(method, url, body) {
  const opts = {
    method,
    headers: { 'X-Token': token },
  }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const r = await fetch(url, opts)
  const d = await r.json()
  if (!d.ok) throw new Error(d.error || 'unknown error')
  return d.data
}

export const client = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
}
