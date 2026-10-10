import { ELEMENT, FRAGMENT } from './element.js'
import { render } from './render.js'
import { runtime, setRuntime, withRuntime, createScope, disposeScope, runInScope, runMountFns, resetRuntime } from './runtime.js'

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'])

export function renderToString(component, opts = {}) {
  const run = () => {
    resetRuntime()
    const scope = createScope(null)
    let html = ''
    runInScope(scope, () => { const vnode = typeof component === 'function' ? component() : component; html = r(vnode) })
    disposeScope(scope)
    return html
  }
  if (opts.runtime) return withRuntime(opts.runtime, run)
  return run()
}

function r(v) {
  if (v == null || v === false || v === true) return ''
  if (typeof v === 'string' || typeof v === 'number') return esc(String(v))
  if (typeof v === 'function') return r(v())
  if (v[FRAGMENT]) return v.children.map(r).join('')
  if (v.__xunay_show) return v.cond() ? r(v.renderFn()) : ''
  if (v.__xunay_list) {
    const items = v.getArr() || []
    return items.map((item, i) => r(v.renderFn(item, i))).join('')
  }
  if (v[ELEMENT]) return el(v)
  return esc(String(v))
}

function el(v) {
  const { type, props, children } = v
  let attrs = ''
  for (const k in props) {
    if (k === 'on' || k === 'ref') continue
    const val = typeof props[k] === 'function' ? props[k]() : props[k]
    if (val == null || val === false) continue
    const name = k === 'className' ? 'class' : k
    if (name === 'class' && val && typeof val === 'object') {
      const cls = Object.entries(val).filter(([_, o]) => typeof o === 'function' ? o() : o).map(([k]) => k).join(' ')
      if (cls) attrs += ` class="${ea(cls)}"`
    } else if (name === 'style' && typeof val === 'object') {
      attrs += ` style="${ea(Object.entries(val).map(([k, x]) => keb(k) + ':' + x).join(';'))}"`
    } else if (val === true) attrs += ` ${name}`
    else attrs += ` ${name}="${ea(val)}"`
  }
  if (VOID.has(type)) return `<${type}${attrs}>`
  const inner = children.map(c => typeof c === 'function' ? r(c()) : r(c)).join('')
  return `<${type}${attrs}>${inner}</${type}>`
}

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function ea(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;') }
function keb(s) { return s.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) }

// 注意：这里不是真 hydrate，是"清空重建"式客户端挂载
// 真正的 hydrate 需要复用服务端 DOM，见 hydrate.js（未实现）
// 保留旧名 hydrate 向后兼容，但请优先用 hydrateMount
export function hydrateMount(component, target, opts = {}) {
  if (opts.runtime) return withRuntime(opts.runtime, () => hydrateMount(component, target))
  const root = typeof target === 'string' ? document.querySelector(target) : target
  if (!root) throw new Error('XuNay: target not found')
  if (root.__xunay_scope) { disposeScope(root.__xunay_scope); root.__xunay_scope = null }
  const scope = createScope(null)
  root.__xunay_scope = scope
  runInScope(scope, () => { root.innerHTML = ''; const vnode = typeof component === 'function' ? component() : component; root.appendChild(render(vnode)) })
  runMountFns(scope)
  return function () { disposeScope(scope); root.innerHTML = ''; root.__xunay_scope = null }
}

// @deprecated 用 hydrateMount，这里只是别名
export const hydrate = hydrateMount
