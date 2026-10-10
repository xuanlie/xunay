// XuNay - 前端路由
import { signal } from '../../../core/src/index.js'

const route = signal(location.pathname)
const params = signal({})

window.addEventListener('popstate', () => {
  route(location.pathname)
})

export function push(path) {
  history.pushState(null, '', path)
  route(path)
}

export function replace(path) {
  history.replaceState(null, '', path)
  route(path)
}

export function current() {
  return route()
}

export function match(pattern) {
  const path = route()
  const keys = []
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)' }) + '$')
  const m = path.match(re)
  if (!m) return null
  const p = {}
  keys.forEach((k, i) => p[k] = decodeURIComponent(m[i+1]))
  return p
}
