// XuNay Persist · signal 自动持久化
import { signal, effect } from './core.js'

const BACKENDS = {
  local: () => {
    try { if (typeof localStorage !== 'undefined') return localStorage } catch {}
    return mem()
  },
  session: () => {
    try { if (typeof sessionStorage !== 'undefined') return sessionStorage } catch {}
    return mem()
  },
  memory: mem,
}

function mem() {
  const m = new Map()
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, v),
    removeItem: k => m.delete(k),
  }
}

export function persist(init, opts = {}) {
  const {
    key = typeof init === 'string' ? init : 'xunay:persist',
    storage = 'local',
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    ttl = 0,
    prefix = 'xunay:',
    migrate = null,
  } = typeof opts === 'string' ? { key: opts } : opts

  const fullKey = prefix + key
  const be = (typeof BACKENDS[storage] === 'function' ? BACKENDS[storage]() : BACKENDS[storage])

  // 读初始值
  let initial = init
  try {
    const raw = be.getItem(fullKey)
    if (raw) {
      const obj = deserializer(raw)
      if (obj && typeof obj === 'object' && 'v' in obj) {
        // 带 ttl 的结构
        if (obj.e && Date.now() > obj.e) {
          be.removeItem(fullKey)
        } else {
          initial = migrate ? migrate(obj.v) : obj.v
        }
      } else {
        initial = migrate ? migrate(obj) : obj
      }
    }
  } catch {}

  const sig = signal(initial)

  // 自动保存
  effect(() => {
    const v = sig()
    const exp = ttl > 0 ? Date.now() + ttl * 1000 : 0
    try { be.setItem(fullKey, serializer({ v, e: exp })) } catch {}
  })

  // 跨标签页同步
  if (storage === 'local' && typeof window !== 'undefined') {
    window.addEventListener('storage', e => {
      if (e.key !== fullKey) return
      try {
        const obj = deserializer(e.newValue)
        if (obj && 'v' in obj) sig(obj.v)
      } catch {}
    })
  }

  return sig
}

// 带版本迁移
export function persistWithMigration(init, opts = {}) {
  const { version = 1, migrations = {}, ...rest } = opts
  const key = rest.key || 'xunay:persist'
  const versionKey = 'xunay:persist:version:' + key

  let savedVersion = 1
  try {
    if (typeof localStorage !== 'undefined') {
      savedVersion = parseInt(localStorage.getItem(versionKey) || '1', 10)
    }
  } catch {}

  const migrate = (data) => {
    let d = data
    for (let v = savedVersion; v < version; v++) {
      const fn = migrations[v + '->' + (v + 1)]
      if (fn) d = fn(d)
    }
    return d
  }

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(versionKey, String(version))
    }
  } catch {}

  return persist(init, { ...rest, migrate })
}

export default persist
