// XuNay Storage · 通用键值存储
import { signal } from './core.js'

function memBackend() {
  const m = new Map()
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, v),
    removeItem: k => m.delete(k),
    clear: () => m.clear(),
  }
}

const BACKENDS = {
  local: () => {
    try { if (typeof localStorage !== 'undefined') return localStorage } catch {}
    return memBackend()
  },
  session: () => {
    try { if (typeof sessionStorage !== 'undefined') return sessionStorage } catch {}
    return memBackend()
  },
  memory: memBackend,
}

export function createStore(opts = {}) {
  const {
    backend = 'local',
    prefix = 'xunay:',
    ttl = 0,             // 0 = 永不过期，单位秒
    onChange = null,
  } = opts

  const be = (typeof BACKENDS[backend] === 'function' ? BACKENDS[backend]() : BACKENDS[backend]) || BACKENDS.memory()

  const fullKey = k => prefix + k

  function read(k) {
    try {
      const raw = be.getItem(fullKey(k))
      if (!raw) return null
      const obj = JSON.parse(raw)
      if (obj.e && Date.now() > obj.e) {
        be.removeItem(fullKey(k))
        return null
      }
      return obj.v
    } catch { return null }
  }

  function write(k, v, t) {
    const secs = t ?? ttl
    const exp = secs > 0 ? Date.now() + secs * 1000 : 0
    try { be.setItem(fullKey(k), JSON.stringify({ v, e: exp })) } catch {}
    if (onChange) onChange(k, v)
  }

  return {
    get(k) { return read(k) },
    set(k, v, t) { write(k, v, t); return v },
    remove(k) {
      be.removeItem(fullKey(k))
      if (onChange) onChange(k, null)
    },
    clear() {
      try { be.clear() } catch {}
      if (onChange) onChange(null, null)
    },
    has(k) { return read(k) !== null },
    // 响应式版本
    ref(k, init = null) {
      const sig = signal(read(k) ?? init)
      return {
        get value() { return sig() },
        set value(v) { write(k, v); sig(v) },
        signal: sig,
      }
    },
  }
}

export const storage = createStore({ backend: 'local' })
export const session = createStore({ backend: 'session' })
export const memory = createStore({ backend: 'memory' })

export default storage
