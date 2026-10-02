// 异步数据原语：loading / data / error 三态
import { signal } from './core.js'

export function resource(fetcher, opts = {}) {
  const data = signal(opts.initial ?? null)
  const error = signal(null)
  const loading = signal(false)

  async function reload(...args) {
    loading(true); error(null)
    try {
      const r = await fetcher(...args)
      data(r); return r
    } catch (e) {
      error(e); throw e
    } finally {
      loading(false)
    }
  }

  if (opts.immediate !== false) reload()
  return { data, error, loading, reload }
}

// 用法：
// const todos = resource(() => fetch('/api/todos').then(r => r.json()))
// show(todos.loading, () => p(null, '加载中...'))
// show(() => todos.error() != null, () => p(null, () => String(todos.error())))

