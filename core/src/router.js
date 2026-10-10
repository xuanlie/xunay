// XuNay Router v2 · 修复 wildcard + query 剥离 + 守卫全覆盖 + 无副作用渲染
import { signal, computed } from './core.js'

function decodeSafe(s) {
  try { return decodeURIComponent(s) } catch { return s }
}

// 修 1：通配符允许长度不等；修 5：decodeURIComponent 容错
function matchPath(pattern, path) {
  const pParts = pattern.split('/').filter(Boolean)
  const aParts = path.split('/').filter(Boolean)
  const params = {}

  for (let i = 0; i < pParts.length; i++) {
    const pp = pParts[i]

    // 通配符：吃掉剩下所有
    if (pp.startsWith('*')) {
      params[pp.slice(1) || 'wildcard'] = aParts.slice(i).map(decodeSafe).join('/')
      return params
    }

    // pattern 还有，path 不够了
    if (i >= aParts.length) return null

    const ap = aParts[i]
    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeSafe(ap)
    } else if (pp !== ap) {
      return null
    }
  }

  // 无通配符时长度必须相等
  if (aParts.length !== pParts.length) return null
  return params
}

export function createRouter(opts = {}) {
  const {
    routes = [],
    mode = 'hash',
    fallback = '/',
    notFound = null,
    base = '',
    scrollBehavior = 'top',
  } = opts

  // 修 2：hash 模式下剥离 query；修 6：base 前缀严格校验
  function getPath() {
    if (typeof location === 'undefined') return '/'
    let raw
    if (mode === 'history') {
      const pn = location.pathname
      if (base) {
        if (pn !== base && !pn.startsWith(base + '/')) return '/'
        raw = pn.slice(base.length) || '/'
      } else {
        raw = pn || '/'
      }
    } else {
      raw = location.hash.slice(1) || '/'
    }
    const q = raw.indexOf('?')
    if (q >= 0) raw = raw.slice(0, q)
    const h = raw.indexOf('#')
    if (h >= 0) raw = raw.slice(0, h)
    return raw || '/'
  }

  function parseQuery() {
    if (typeof location === 'undefined') return {}
    const search = mode === 'history'
      ? location.search
      : (location.hash.split('?')[1] || '')
    const q = {}
    try {
      new URLSearchParams(search).forEach((v, k) => { q[k] = v })
    } catch {}
    return q
  }

  const path = signal(getPath())
  const query = signal(parseQuery())
  const matched = computed(() => {
    const p = path()
    for (const r of routes) {
      const params = matchPath(r.path, p)
      if (params) return { route: r, params }
    }
    return null
  })

  const guards = []

  // 修 3：所有导航集中走 doNavigate，全部过守卫
  function doNavigate(to, { replace = false, skipGuards = false } = {}) {
    const from = path()
    let target = to.startsWith('/') ? to : '/' + to

    if (!skipGuards) {
      for (const g of guards) {
        const r = g(target, from)
        if (r === false) return
        if (typeof r === 'string') target = r
      }
    }

    if (mode === 'history') {
      replace
        ? history.replaceState(null, '', base + target)
        : history.pushState(null, '', base + target)
    } else {
      if (replace) {
        if (typeof history !== 'undefined' && history.replaceState) {
          history.replaceState(null, '', location.pathname + location.search + '#' + target)
        } else {
          location.replace('#' + target)
        }
      } else {
        location.hash = "#" + target
      }
    }

    path(getPath())
    query(parseQuery())
    if (scrollBehavior === 'top' && typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }

  // 浏览器 back/forward 也会过守卫
  function handleChange() {
    const from = path()
    const to = getPath()
    for (const g of guards) {
      const r = g(to, from)
      if (r === false) {
        doNavigate(from, { replace: true, skipGuards: true })
        return
      }
      if (typeof r === 'string' && r !== to) {
        doNavigate(r, { replace: true, skipGuards: true })
        return
      }
    }
    path(to)
    query(parseQuery())
  }

  if (typeof window !== 'undefined') {
    window.addEventListener(mode === 'history' ? 'popstate' : 'hashchange', handleChange)
  }

  const router = {
    path,
    query,
    matched,
    params: computed(() => matched()?.params || {}),
    route: computed(() => matched()?.route || null),

    push: (to) => doNavigate(to),
    replace: (to) => doNavigate(to, { replace: true }),
    back: () => { if (typeof history !== 'undefined') history.back() },
    forward: () => { if (typeof history !== 'undefined') history.forward() },
    go: (n) => { if (typeof history !== 'undefined') history.go(n) },

    // 修 4：view 不再触发导航（无副作用）
    view() {
      const m = matched()
      if (!m) {
        if (notFound) return notFound()
        return null
      }
      const Comp = m.route.component
      return typeof Comp === 'function' ? Comp(m.params) : Comp
    },

    // 守卫：现在拦截 push / replace / 浏览器前进后退
    beforeEach(fn) {
      guards.push(fn)
      return () => {
        const i = guards.indexOf(fn)
        if (i >= 0) guards.splice(i, 1)
      }
    },
  }

  return router
}

export default createRouter
