// XuNay compiler v3 — 运行时辅助
import { effect, _captureDeps } from '../../src/core.js'

export const toString = (v) => v == null ? '' : String(v)

export function renderChild(v) {
  if (v == null || v === false || v === true) return null
  if (typeof Node !== 'undefined' && v instanceof Node) return v
  if (Array.isArray(v)) {
    const frag = document.createDocumentFragment()
    for (const item of v) {
      const n = renderChild(item)
      if (n) frag.appendChild(n)
    }
    return frag
  }
  return document.createTextNode(String(v))
}

export function bindTextDirect(textNode, sig, toStr) {
  const update = () => { textNode.data = toStr(sig()) }
  update()
  const ls = sig._listeners
  if (ls === null) sig._listeners = [update]
  else ls.push(update)
}

export function bindText(textNode, fn) {
  const cap = _captureDeps(fn)
  const initText = cap.result == null ? '' : String(cap.result)
  textNode.data = initText

  if (cap.deps.length === 1) {
    const sig = cap.deps[0]
    let prev = initText
    const update = () => {
      const v = fn()
      const s = v == null ? '' : String(v)
      if (s !== prev) { textNode.data = s; prev = s }
    }
    if (sig._listeners === null) sig._listeners = [update]
    else sig._listeners.push(update)
    return
  }

  let prev = initText
  effect(() => {
    const v = fn()
    const s = v == null ? '' : String(v)
    if (s !== prev) { textNode.data = s; prev = s }
  })
}

export function bindAttr(el, key, fn) {
  let prev
  effect(() => {
    const v = fn()
    if (v === prev) return
    prev = v
    if (key === 'class' || key === 'className') el.className = v == null ? '' : v
    else if (key === 'value') el.value = v == null ? '' : v
    else if (key === 'checked' || key === 'disabled' || key === 'selected' || key === 'readonly') el[key] = !!v
    else if (v == null || v === false) el.removeAttribute(key)
    else if (v === true) el.setAttribute(key, '')
    else el.setAttribute(key, v)
  })
}

export function bindStyle(el, fn) {
  let prev = {}
  effect(() => {
    const s = fn() || {}
    for (const k of Object.keys(prev)) {
      if (!(k in s)) el.style[k] = ''
    }
    for (const k of Object.keys(s)) {
      if (el.style[k] !== s[k]) el.style[k] = s[k]
    }
    prev = s
  })
}

export function applyProps(el, props) {
  if (!props) return
  for (const key of Object.keys(props)) {
    const v = props[key]
    if (key === 'on' && v) {
      for (const ev of Object.keys(v)) el.addEventListener(ev, v[ev])
    } else if (key === 'style' && v) {
      Object.assign(el.style, v)
    } else if (key === 'class' || key === 'className') {
      el.className = v == null ? '' : v
    } else if (key === 'ref' && typeof v === 'function') {
      v(el)
    } else if (key === 'value' || key === 'textContent') {
      el[key] = v == null ? '' : v
    } else if (typeof v === 'boolean') {
      el[key] = v
      if (!v) el.removeAttribute(key)
    } else if (v == null) {
      // skip
    } else {
      el.setAttribute(key, v)
    }
  }
}

export function applyStyle(el, style) {
  if (!style) return
  if (typeof style === 'string') el.style.cssText = style
  else if (typeof style === 'object') Object.assign(el.style, style)
}

export function classNames(obj) {
  if (!obj || typeof obj !== 'object') return ''
  const out = []
  for (const k of Object.keys(obj)) if (obj[k]) out.push(k)
  return out.join(' ')
}
