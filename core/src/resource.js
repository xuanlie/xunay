// 异步数据原语：loading / data / error 三态 + 取消
import { signal, onCleanup } from './core.js'
import { runtime } from './runtime.js'

export function resource(fetcher, opts = {}) {
  const data = signal(opts.initial ?? null)
  const error = signal(null)
  const loading = signal(false)
  let controller = null
  let version = 0
  let disposed = false

  async function reload(...args) {
    if (disposed) return
    if (controller) controller.abort()
    controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    const myVersion = ++version
    loading(true); error(null)
    try {
      const r = await fetcher(...args, { signal: controller ? controller.signal : undefined })
      if (myVersion !== version || disposed) return
      data(r); return r
    } catch (e) {
      if (myVersion !== version || disposed) return
      if (e && e.name === 'AbortError') return
      error(e); throw e
    } finally {
      if (myVersion === version && !disposed) loading(false)
    }
  }

  function cancel() {
    disposed = true
    if (controller) controller.abort()
    version++
  }

  // 注册取消：优先当前 effect，其次 scope
  if (runtime.currentEffect) onCleanup(cancel)
  else {
    const sc = runtime.currentScope
    if (sc) { if (!sc.unmountFns) sc.unmountFns = []; sc.unmountFns.push(cancel) }
  }

  if (opts.immediate !== false) reload()
  return { data, error, loading, reload, cancel }
}

// 用法：
// const todos = resource((opts) => fetch('/api/todos', opts).then(r => r.json()))
// show(todos.loading, () => p(null, '加载中...'))
// show(() => todos.error() != null, () => p(null, () => String(todos.error())))
