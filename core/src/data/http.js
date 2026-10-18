// XuNay HTTP · fetch 封装（超时 / 重试 / 拦截器 / 自动 token）
let defaultAuth = null
export function setHttpAuth(a) { defaultAuth = a }

export function createHttp(opts = {}) {
  const {
    baseURL = '',
    timeout = 30000,
    retries = 2,
    retryDelay = 500,
    headers: baseHeaders = {},
    onRequest = null,
    onResponse = null,
    onError = null,
    auth = null,
    authHeader = 'Authorization',
    authPrefix = 'Bearer ',
  } = opts

  async function fetchWithTimeout(url, init) {
    if (typeof AbortController === 'undefined') return fetch(url, init)
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeout)
    try { return await fetch(url, { ...init, signal: ctrl.signal }) }
    finally { clearTimeout(t) }
  }

  async function doRequest(method, url, body, extra = {}) {
    let reqURL = url.startsWith('http') ? url : baseURL + url
    const reqHeaders = { ...baseHeaders, ...extra.headers }
    let reqBody = body

    // 自动 auth
    const authInst = auth || defaultAuth
    if (authInst && authInst.get && authInst.isValid && authInst.isValid()) {
      reqHeaders[authHeader] = authPrefix + authInst.get()
    }

    // Content-Type
    if (body && !reqHeaders['Content-Type'] && !(body instanceof FormData)) {
      reqHeaders['Content-Type'] = 'application/json'
      reqBody = JSON.stringify(body)
    }

    const init = { method, headers: reqHeaders, body: reqBody }

    if (onRequest) {
      const r = onRequest({ url: reqURL, method, headers: reqHeaders, body: reqBody })
      if (r === false) throw new Error('Request cancelled by onRequest')
      if (r && typeof r === 'object') Object.assign(init, r)
    }

    let lastErr
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetchWithTimeout(reqURL, init)
        const data = await parseBody(res)
        const out = { status: res.status, ok: res.ok, headers: res.headers, data }
        if (onResponse) {
          const r = onResponse(out)
          if (r) return r
        }
        if (!res.ok) {
          const err = new Error(data?.message || data?.error || `HTTP ${res.status}`)
          err.status = res.status
          err.data = data
          throw err
        }
        return out
      } catch (e) {
        lastErr = e
        // 4xx 不重试
        if (e.status && e.status >= 400 && e.status < 500) break
        if (i < retries) await new Promise(r => setTimeout(r, retryDelay * (i + 1)))
      }
    }
    if (onError) onError(lastErr)
    throw lastErr
  }

  async function parseBody(res) {
    const ct = res.headers.get('content-type') || ''
    try {
      if (ct.includes('application/json')) return await res.json()
      if (ct.includes('text/')) return await res.text()
      return await res.blob()
    } catch { return null }
  }

  const api = {
    request: (method, url, body, extra) => doRequest(method, url, body, extra),
    get: (url, extra) => doRequest('GET', url, undefined, extra),
    post: (url, body, extra) => doRequest('POST', url, body, extra),
    put: (url, body, extra) => doRequest('PUT', url, body, extra),
    patch: (url, body, extra) => doRequest('PATCH', url, body, extra),
    delete: (url, extra) => doRequest('DELETE', url, undefined, extra),
  }
  return api
}

export const http = createHttp()
export default http
