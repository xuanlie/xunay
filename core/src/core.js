import { runtime } from './runtime.js'

export function signal(init) {
  let v = init
  let subs = null
  let writeCount = 0
  function s(x) {
    if (arguments.length === 0) {
      const e = runtime.currentEffect
      if (e) {
        if (!subs) subs = []
        if (subs.indexOf(e) < 0) { subs.push(e); e.deps.push(subs) }
      }
      return v
    }
    const n = typeof x === 'function' ? x(v) : x
    if (Object.is(n, v)) return v
    const old = v
    v = n
    writeCount++
    if (runtime.hooks.onSignalSet) runtime.hooks.onSignalSet(s, old, n, writeCount)
    if (!subs) return v
    if (runtime.batchDepth > 0) {
      for (let i = 0; i < subs.length; i++) runtime.pendingEffects.add(subs[i])
    } else if (subs.length === 1) {
      subs[0].run()
    } else {
      const arr = subs.slice()
      for (let i = 0; i < arr.length; i++) arr[i].run()
    }
    return v
  }
  s.__xunay_signal = true
  s.subsCount = () => subs ? subs.length : 0
  s.writeCount = () => writeCount
  if (runtime.hooks.onSignalCreate) runtime.hooks.onSignalCreate(s)
  return s
}

export function computed(fn) {
  const r = signal()
  r.__xunay_computed = true
  effect(() => { r(fn()) })
  return function c() { return r() }
}

export function effect(fn) {
  const e = {
    deps: [],
    disposed: false,
    runs: 0,
    totalMs: 0,
    lastMs: 0,
    createdAt: Date.now(),
    run() {
      if (e.disposed) return
      for (let i = 0; i < e.deps.length; i++) {
        const d = e.deps[i]
        const j = d.indexOf(e)
        if (j < 0) continue
        if (j === d.length - 1) d.pop()
        else d.splice(j, 1)
      }
      e.deps.length = 0
      runtime.effectStack.push(runtime.currentEffect)
      runtime.currentEffect = e
      const t0 = performance.now()
      try { fn() } finally {
        const dt = performance.now() - t0
        e.runs++
        e.lastMs = dt
        e.totalMs += dt
        runtime.currentEffect = runtime.effectStack.pop()
        if (runtime.hooks.onEffectRun) runtime.hooks.onEffectRun(e, dt)
      }
    },
    dispose() {
      if (e.disposed) return
      e.disposed = true
      for (let i = 0; i < e.deps.length; i++) {
        const d = e.deps[i]
        const j = d.indexOf(e)
        if (j < 0) continue
        if (j === d.length - 1) d.pop()
        else d.splice(j, 1)
      }
      e.deps.length = 0
    },
  }
  if (runtime.hooks.onEffectCreate) runtime.hooks.onEffectCreate(e)
  const sc = runtime.currentScope
  if (sc) { if (!sc.effects) sc.effects = new Set(); sc.effects.add(e) }
  e.run()
  return () => e.dispose()
}

export function batch(fn) {
  runtime.batchDepth++
  try { fn() } finally {
    runtime.batchDepth--
    if (!runtime.batchDepth) { const xs = [...runtime.pendingEffects]; runtime.pendingEffects.clear(); for (const e of xs) e.run() }
  }
}

