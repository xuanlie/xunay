// XuNay Auth · 令牌管理
// 默认导出单例 auth，导入即可用
import { signal } from './core.js'

const STORAGES = {
  local: {
    get(k) {
      try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null }
      catch { return null }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)) } catch {}
    },
    remove(k) {
      try { localStorage.removeItem(k) } catch {}
    },
    watch(fn) {
      const h = e => { if (e.key === fn.k) fn() }
      window.addEventListener('storage', h)
      return () => window.removeEventListener('storage', h)
    },
  },
  session: {
    get(k) {
      try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null }
      catch { return null }
    },
    set(k, v) {
      try { sessionStorage.setItem(k, JSON.stringify(v)) } catch {}
    },
    remove(k) {
      try { sessionStorage.removeItem(k) } catch {}
    },
    watch() { return () => {} },
  },
  cookie: {
    get(k) {
      if (typeof document === 'undefined') return null
      const m = document.cookie.match(new RegExp('(?:^|; )' + k.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'))
      if (!m) return null
      try { return JSON.parse(decodeURIComponent(m[1])) } catch { return null }
    },
    set(k, v, opts = {}) {
      if (typeof document === 'undefined') return
      const parts = [k + '=' + encodeURIComponent(JSON.stringify(v))]
      if (opts.expiresIn) parts.push('Max-Age=' + opts.expiresIn)
      parts.push('Path=' + (opts.path || '/'))
      if (opts.sameSite) parts.push('SameSite=' + opts.sameSite)
      if (opts.secure) parts.push('Secure')
      document.cookie = parts.join('; ')
    },
    remove(k, opts = {}) {
      if (typeof document === 'undefined') return
      document.cookie = k + '=; Max-Age=0; Path=' + (opts.path || '/')
    },
    watch() { return () => {} },
  },
  memory: {
    _m: new Map(),
    get(k) { return this._m.get(k) ?? null },
    set(k, v) { this._m.set(k, v) },
    remove(k) { this._m.delete(k) },
    watch() { return () => {} },
  },
}

export function createAuth(opts = {}) {
  let {
    storage = 'local',
    key = 'xunay:token',
    expiresIn = 3600,
    refresh: refreshFn = null,
    refreshBefore = 60,
    cookie = {},
  } = opts

  const store = STORAGES[storage] || STORAGES.local
  const tokenSig = signal(null)
  let refreshTimer = null
  let watchStop = null

  function read() {
    const v = store.get(key)
    if (!v) return null
    if (v.expiresAt && Date.now() > v.expiresAt) {
      store.remove(key, cookie)
      return null
    }
    return v.value
  }

  function writeRaw(value, exp) {
    store.set(key, { value, expiresAt: exp }, { expiresIn, ...cookie })
  }

  function readExpiresAt() {
    const v = store.get(key)
    return v ? v.expiresAt : 0
  }

  function load() {
    const t = read()
    tokenSig(t)
    return t
  }

  function scheduleRefresh() {
    if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
    if (!refreshFn) return
    const exp = readExpiresAt()
    if (!exp) return
    const delay = exp - Date.now() - refreshBefore * 1000
    if (delay <= 0) return
    refreshTimer = setTimeout(() => {
      doRefresh().catch(() => {})
    }, delay)
  }

  async function doRefresh() {
    if (!refreshFn) return null
    try {
      const newToken = await refreshFn(tokenSig())
      if (newToken) {
        const exp = Date.now() + expiresIn * 1000
        writeRaw(newToken, exp)
        tokenSig(newToken)
        scheduleRefresh()
        return newToken
      }
    } catch (e) {
      if (opts.onExpire) opts.onExpire()
    }
    return null
  }

  function startWatch() {
    if (watchStop) return
    if (store.watch) {
      watchStop = store.watch({
        k: key,
        fn: () => load(),
      })
    }
  }

  // 初始化
  load()
  startWatch()

  const auth = {
    // 读（响应式）
    token() { return tokenSig() },
    // 读（不订阅）
    get() { return read() },
    // 写
    set(value, o = {}) {
      const seconds = o.expiresIn ?? expiresIn
      const exp = seconds ? Date.now() + seconds * 1000 : 0
      writeRaw(value, exp)
      tokenSig(value)
      if (typeof window !== 'undefined') {
        try { window.dispatchEvent(new CustomEvent('xunay:auth', { detail: { value } })) } catch {}
      }
      scheduleRefresh()
      return value
    },
    // 清
    clear() {
      store.remove(key, cookie)
      tokenSig(null)
      if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
    },
    // 状态
    isValid() {
      const t = tokenSig()
      if (!t) return false
      const exp = readExpiresAt()
      if (!exp) return true
      return Date.now() < exp
    },
    isEmpty() { return !tokenSig() },
    expiresAt() {
      return readExpiresAt()
    },
    remaining() {
      const exp = readExpiresAt()
      if (!exp) return tokenSig() ? Infinity : 0
      return Math.max(0, Math.floor((exp - Date.now()) / 1000))
    },
    // 刷新
    refresh() { return doRefresh() },
    // 配置
    config(o = {}) {
      if (o.expiresIn !== undefined) expiresIn = o.expiresIn
      if (o.refresh !== undefined) refreshFn = o.refresh
      if (o.refreshBefore !== undefined) refreshBefore = o.refreshBefore
      scheduleRefresh()
      return auth
    },
    // 存储 key
    key,
  }

  scheduleRefresh()
  return auth
}

// 默认单例：导入即用
export const auth = createAuth()

export default auth
