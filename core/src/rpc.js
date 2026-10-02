// XuNay 前端 RPC
import { ROUTES } from './rpc-routes.js'

let token = ''
let baseURL = ''

export function setBase(url) { baseURL = url }
export function getToken() { return token }

export async function initToken() {
  const r = await fetch(baseURL + '/rpc/token')
  const d = await r.json()
  if (!d.ok) throw new Error(d.error || 'token 获取失败')
  token = d.data.token
  return token
}

export const rpc = {}
for (const r of ROUTES) {
  rpc[r.name] = async (args = {}) => {
    const opts = { method: r.method, headers: {} }
    if (r.auth) opts.headers['X-Token'] = token
    if (r.method === 'POST') {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(args)
    }
    const res = await fetch(baseURL + r.path, opts)
    const d = await res.json()
    if (!d.ok) throw new Error(d.error || 'request failed')
    return d.data
  }
}
