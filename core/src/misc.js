import { signal, onCleanup } from './core.js'
import { runtime } from './runtime.js'
import { createFragment } from './element.js'

export function frag(...children) { return createFragment(children) }
export const F = frag  // @deprecated 用 frag
export function show(cond, renderFn) { return { __xunay_show: true, cond, renderFn } }
export function txt(strings, ...values) {
  return () => {
    let s = ''
    for (let i = 0; i < strings.length; i++) {
      s += strings[i]
      if (i < values.length) { const v = typeof values[i] === 'function' ? values[i]() : values[i]; s += v == null ? '' : String(v) }
    }
    return s
  }
}
export function onMount(fn) { const sc = runtime.currentScope; if (!sc) return; if (!sc.mountFns) sc.mountFns = []; sc.mountFns.push(fn) }
export function onUnmount(fn) { const sc = runtime.currentScope; if (!sc) return; if (!sc.unmountFns) sc.unmountFns = []; sc.unmountFns.push(fn) }
export function ref(init = null) { let cur = init; return function r(v) { if (arguments.length === 0) return cur; cur = v; return v } }
export function ctx(defaultValue) {
  const id = Symbol()
  return {
    id,
    defaultValue,
    get() {
      const stack = runtime.ctxStack
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].id === id) return stack[i].value
      return defaultValue
    },
    provide(value, fn) {
      const stack = runtime.ctxStack
      stack.push({ id, value })
      try { return fn() } finally { stack.pop() }
    }
  }
}
export function err(fn, fallback) {
  try { return fn() } catch (e) { if (typeof console !== 'undefined') console.error('[XuNay]', e); return typeof fallback === 'function' ? fallback(e) : fallback }
}
export function lazy(loader) {
  const comp = signal(null)
  const errSig = signal(null)
  let started = false
  let cancelled = false

  function cancel() { cancelled = true }
  if (runtime.currentEffect) onCleanup(cancel)
  else {
    const sc = runtime.currentScope
    if (sc) { if (!sc.unmountFns) sc.unmountFns = []; sc.unmountFns.push(cancel) }
  }

  return function Lazy(...args) {
    if (!started) {
      started = true
      loader()
        .then(mod => { if (!cancelled) comp(mod.default || mod) })
        .catch(e => { if (!cancelled) errSig(e) })
    }
    if (errSig()) throw errSig()
    const c = comp()
    return c ? c(...args) : null
  }
}
