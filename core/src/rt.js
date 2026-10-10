// compiler2 编译产物依赖的运行时
import { effect, onCleanup } from './core.js'
import { render as __render } from './render.js'
import { createScope, disposeScope, runInScope, runtime } from './runtime.js'

export function renderChild(...args) {
  if (args.length === 0) return document.createTextNode('')
  if (args.length === 1) return __render(args[0])
  const f = document.createDocumentFragment()
  for (const a of args) f.appendChild(__render(a))
  return f
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

export function install() {
  if (typeof globalThis === 'undefined') return
  globalThis.__rt__ = {
    bindText, bindAttr, renderChild,
  }
}