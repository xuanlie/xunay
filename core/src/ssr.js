import { ELEMENT, FRAGMENT } from './element.js'
import { render } from './render.js'
import { runtime, createScope, disposeScope, runInScope, runMountFns } from './runtime.js'

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'])

export function renderToString(component) {
  const scope = createScope(null)
  let html = ''
  runInScope(scope, () => { const vnode = typeof component === 'function' ? component() : component; html = r(vnode) })
  disposeScope(scope)
  return html
}

function r(v) {
  if (v == null || v === false || v === true) return ''
  if (typeof v === 'string' || typeof v === 'number') return esc(String(v))
  if (typeof v === 'function') return r(v())
  if (v[FRAGMENT]) return v.children.map(r).join('')
  if (v.__xunay_show) return v.cond() ? r(v.renderFn()) : ''
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

export function hydrate(component, target) {
  const root = typeof target === 'string' ? document.querySelector(target) : target
  if (!root) throw new Error('XuNay: target not found')
  if (root.__xunay_scope) { disposeScope(root.__xunay_scope); root.__xunay_scope = null }
  const scope = createScope(null)
  root.__xunay_scope = scope
  runInScope(scope, () => { root.innerHTML = ''; const vnode = typeof component === 'function' ? component() : component; root.appendChild(render(vnode)) })
  runMountFns(scope)
  return function () { disposeScope(scope); root.innerHTML = ''; root.__xunay_scope = null }
}
