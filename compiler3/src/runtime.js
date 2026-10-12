// compiler2/compiler3 编译产物依赖的运行时
import { effect, onCleanup } from '../../core/src/core.js'
import { render as __render, mount } from '../../core/src/render.js'
import { createScope, disposeScope, runInScope, runtime } from '../../core/src/runtime.js'

export function renderChild(...args) {
  if (args.length === 0) return document.createTextNode('')
  if (args.length === 1) return __render(args[0])
  const f = document.createDocumentFragment()
  for (const a of args) f.appendChild(__render(a))
  return f
}

export const toString = (v) => v == null ? '' : String(v)

export function bindTextDirect(textNode, sig, toStr) {
  const update = () => { textNode.textContent = toStr(sig()) }
  update()
  const ls = sig._listeners
  if (!ls) sig._listeners = [update]
  else ls.push(update)
}

export function bindText(node, fn) {
  let prev = undefined
  let mode = null
  let innerScope = null

  function clearInner() {
    if (innerScope) { disposeScope(innerScope); innerScope = null }
  }

  effect(() => {
    const v = fn()
    const isText = v == null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
    if (isText) {
      clearInner()
      const s = (v == null || v === false || v === true) ? '' : String(v)
      if (mode === 'text' && s === prev) return
      node.textContent = s
      prev = s
      mode = 'text'
      return
    }
    if (mode === 'node' && v === prev) return
    clearInner()
    node.textContent = ''
    innerScope = createScope(runtime.currentScope)
    let r
    runInScope(innerScope, () => { r = __render(v) })
    if (r) node.appendChild(r)
    prev = v
    mode = 'node'
    onCleanup(clearInner)
  })
}

export function bindAttr(el, name, fn) {
  let prev
  effect(() => {
    const v = fn()
    if (v === prev) return
    prev = v
    if (v == null || v === false) { el.removeAttribute(name); return }
    if (name === 'class' || name === 'className') el.className = v
    else if (name === 'value') el.value = v
    else if (name === 'checked' || name === 'disabled' || name === 'selected') el[name] = !!v
    else el.setAttribute(name, String(v))
  })
}

export function bindStyle(el, fn) {
  let prev = {}
  effect(() => {
    const s = fn()
    if (s == null) { el.style.cssText = ''; prev = {}; return }
    if (typeof s === 'string') { el.style.cssText = s; prev = {}; return }
    if (typeof s !== 'object') return
    for (const k of Object.keys(prev)) if (!(k in s)) el.style[k] = ''
    for (const k of Object.keys(s)) if (el.style[k] !== s[k]) el.style[k] = s[k]
    prev = s
  })
}

export function applyProps(el, props) {
  if (!props) return
  for (const key of Object.keys(props)) {
    const v = props[key]
    if (key === 'on' && v) { for (const ev of Object.keys(v)) el.addEventListener(ev, v[ev]) }
    else if (key === 'style' && v) {
      if (typeof v === 'string') el.style.cssText = v
      else Object.assign(el.style, v)
    }
    else if (key === 'class' || key === 'className') el.className = v == null ? '' : v
    else if (key === 'ref' && typeof v === 'function') v(el)
    else if (key === 'value' || key === 'textContent') el[key] = v == null ? '' : v
    else if (typeof v === 'boolean') { el[key] = v; if (!v) el.removeAttribute(key) }
    else if (v == null) { /* skip */ }
    else el.setAttribute(key, v)
  }
}

export function applyStyle(el, style) {
  if (style == null) return
  if (typeof style === 'string') el.style.cssText = style
  else if (typeof style === 'object') Object.assign(el.style, style)
}

export function classNames(obj) {
  if (!obj || typeof obj !== 'object') return ''
  const out = []
  for (const k of Object.keys(obj)) if (obj[k]) out.push(k)
  return out.join(' ')
}

export function createStatic(html) {
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  return tpl.content.firstChild
}

export function install() {
  if (typeof globalThis === 'undefined') return
  globalThis.__rt__ = {
    bindText, bindAttr, renderChild,
    bindTextDirect, bindStyle, applyProps, applyStyle,
    classNames, createStatic, toString,
  }
}

// 编译产物入口使用的 app = mount
export const app = mount
