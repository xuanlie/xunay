export function createRuntime() {
  return {
    currentEffect: null,
    effectStack: [],
    currentScope: null,
    scopeStack: [],
    batchDepth: 0,
    pendingEffects: new Set(),
    pendingComputeds: new Set(),
    pendingEffectQueue: [],
    pendingEffectQueueHead: 0,
    ctxStack: [],
    dev: true,
    hooks: {
      onSignalCreate: null,
      onSignalSet: null,
      onEffectCreate: null,
      onEffectRun: null,
      onScopeCreate: null,
      onScopeDispose: null,
    }
  }
}

const G = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {})
if (!G.__XUNAY_RUNTIME__) G.__XUNAY_RUNTIME__ = createRuntime()

// ESM live binding：所有 `import { runtime }` 的地方都会看到新值
export let runtime = G.__XUNAY_RUNTIME__

export function setRuntime(rt) {
  G.__XUNAY_RUNTIME__ = rt
  runtime = rt
}

export function withRuntime(rt, fn) {
  const prev = runtime
  setRuntime(rt)
  try { return fn() } finally { setRuntime(prev) }
}

export function resetRuntime() {
  const rt = runtime
  rt.currentEffect = null
  rt.effectStack.length = 0
  rt.currentScope = null
  rt.scopeStack.length = 0
  rt.batchDepth = 0
  rt.pendingEffects.clear()
  rt.pendingComputeds.clear()
  rt.pendingEffectQueue.length = 0
  rt.pendingEffectQueueHead = 0
  rt.ctxStack.length = 0
}

export function createScope(parent) {
  const s = { effects: null, children: new Set(), mountFns: null, unmountFns: null, parent: parent || null, disposed: false }
  if (parent) parent.children.add(s)
  if (runtime.hooks.onScopeCreate) runtime.hooks.onScopeCreate(s)
  return s
}

export function disposeScope(s) {
  if (!s || s.disposed) return
  s.disposed = true
  if (runtime.hooks.onScopeDispose) runtime.hooks.onScopeDispose(s)
  if (s.unmountFns) { for (const f of s.unmountFns) try { f() } catch (e) { console.error(e) }; s.unmountFns = null }
  if (s.effects) { for (const e of s.effects) e.dispose(); s.effects = null }
  for (const c of s.children) disposeScope(c)
  s.children.clear()
  if (s.parent) s.parent.children.delete(s)
}

export function runInScope(s, fn) {
  runtime.scopeStack.push(runtime.currentScope)
  runtime.currentScope = s
  try { return fn() } finally { runtime.currentScope = runtime.scopeStack.pop() }
}

export function runMountFns(s) {
  if (s.mountFns) { for (const f of s.mountFns) try { f() } catch (e) { console.error(e) }; s.mountFns = null }
  for (const c of s.children) runMountFns(c)
}
