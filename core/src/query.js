// XuNay Query · 数据请求 + 缓存 + 失效
import { signal, effect, onCleanup } from './core.js'
import { http } from './http.js'

const _cache = new Map()
const _subs = new Map()

function hashKey(k) {
  return typeof k === 'string' ? k : JSON.stringify(k)
}

function now() { return Date.now() }

export function query(opts = {}) {
  const {
    key,
    fetcher,
    staleTime = 30000,       // 数据新鲜期（ms）
    cacheTime = 300000,      // 缓存保留期（ms）
    retry = 3,
    retryDelay = 500,
    enabled = true,
    initial = null,
    onSuccess,
    onError,
    refetchOnFocus = false,
    refetchOnReconnect = false,
  } = opts

  const cacheKey = hashKey(key)
  const data = signal(initial)
  const error = signal(null)
  const loading = signal(false)
  const fetchedAt = signal(0)

  let controller = null
  let version = 0
  let retriesLeft = retry

  // 从缓存恢复
  const cached = _cache.get(cacheKey)
  if (cached && now() - cached.time < cacheTime) {
    data(cached.data)
    fetchedAt(cached.time)
  }

  async function fetchData(force = false) {
    if (!enabled && !force) return
    if (controller) controller.abort()
    controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const myVersion = ++version
    loading(true)
    error(null)
    try {
      const r = await fetcher({ signal: controller ? controller.signal : undefined })
      if (myVersion !== version) return
      data(r)
      fetchedAt(now())
      _cache.set(cacheKey, { data: r, time: now() })
      // 通知订阅者
      _subs.forEach(s => s())
      if (onSuccess) onSuccess(r)
      return r
    } catch (e) {
      if (myVersion !== version) return
      if (e && e.name === 'AbortError') return
      if (retriesLeft > 0) {
        retriesLeft--
        await new Promise(r => setTimeout(r, retryDelay * (retry - retriesLeft)))
        return fetchData(force)
      }
      retriesLeft = retry
      error(e)
      if (onError) onError(e)
      throw e
    } finally {
      if (myVersion === version) loading(false)
    }
  }

  const api = {
    data,
    error,
    loading,
    fetchedAt,
    isStale: () => now() - fetchedAt() > staleTime,
    refetch: () => fetchData(true),
    invalidate: () => {
      _cache.delete(cacheKey)
      fetchedAt(0)
    },
    setData: (v) => {
      data(v)
      _cache.set(cacheKey, { data: v, time: now() })
    },
    key: cacheKey,
  }

  if (enabled) fetchData()

  return api
}

// 全局失效
export function invalidateQueries(prefix) {
  const keys = [..._cache.keys()]
  keys.forEach(k => {
    if (!prefix || k.startsWith(prefix)) _cache.delete(k)
  })
  _subs.forEach(s => s())
}

export function clearQueryCache() {
  _cache.clear()
}

// 全局订阅（框架内部用）
export function subscribeQuery(fn) {
  _subs.set(fn, fn)
  return () => _subs.delete(fn)
}

export default query
