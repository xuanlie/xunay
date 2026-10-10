import { auth as defaultAuth } from './auth.js'
// XuNay 前端 RPC
import { ROUTES } from './rpc-routes.js'

let token = ''
let baseURL = ''
let timeout = 30000
let retries = 0
let retryDelay = 500

export function setBase(url) { baseURL = url }
export function setOptions(opts = {}) {
  if (opts.timeout !== undefined) timeout = opts.timeout
  if (opts.retries !== undefined) retries = opts.retries
  if (opts.retryDelay !== undefined) retryDelay = opts.retryDelay
}
export function getToken() { return token }

export async function initToken() {
  const r = await fetchWithTimeout(baseURL + '/rpc/token', {})
  const d = await r.json()
  if (!d.ok) throw new Error(d.error || 'token 获取失败')
  token = d.data.token
  return token
}

async function fetchWithTimeout(url, opts) {
  if (typeof AbortController === 'undefined') return fetch(url, opts)
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}

async function withRetry(fn) {
  let lastErr
  for (let i = 0; i <= retries; i++) {
    try { return await fn() }
    catch (e) {
      lastErr = e
      if (e && e.name === 'AbortError') throw e
      if (i < retries) await new Promise(r => setTimeout(r, retryDelay * (i + 1)))
    }
  }
  throw lastErr
}

export const rpc = {}
for (const r of ROUTES) {
  rpc[r.name] = async (args = {}) => {
    return withRetry(async () => {
      const opts = { method: r.method, headers: {} }
      if (r.auth) opts.headers['X-Token'] = defaultAuth.get() || token
      if (r.method === 'POST') {
        opts.headers['Content-Type'] = 'application/json'
        opts.body = JSON.stringify(args)
      }
      const res = await fetchWithTimeout(baseURL + r.path, opts)
      const d = await res.json()
      if (!d.ok) throw new Error(d.error || 'request failed')
      return d.data
    })
  }
}
