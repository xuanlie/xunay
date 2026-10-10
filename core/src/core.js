import { runtime } from './runtime.js'

const _warnedSelfWrite = new WeakSet()
let _currentEffect = null
let _probing = null
let _activeTrackingVersion = 0
let _flushId = 0
let _inPropagate = false

export function _captureDeps(fn) {
  if (_currentEffect !== null) return { result: fn(), deps: [] }
  const prev = _probing
  const arr = []
  _probing = arr
  try {
    return { result: fn(), deps: arr }
  } finally {
    _probing = prev
  }
}

function addSubscription(sig, sub) {
  const last = sub._lastLink
  if (last && last._sig === sig) {
    last._version = sub._trackingVersion
    sub._lastLinkSig = sig
    return
  }

  let link
  const index = sub._sourceMap
  if (index) {
    link = index.get(sig)
    if (link) {
      link._version = sub._trackingVersion
      sub._lastLink = link
      sub._lastLinkSig = sig

      return
    }
  } else {
    link = sub._sourcesHead
    while (link) {
      if (link._sig === sig) {
        link._version = sub._trackingVersion
        sub._lastLink = link
        sub._lastLinkSig = sig

        return
      }
      link = link._nextSource
    }
  }

  sub._simple = false
  link = {
    _sig: sig, _sub: sub, _version: sub._trackingVersion,
    _nextSub: null, _prevSub: null,
    _nextSource: null, _prevSource: null,
  }
  if (sig._subsTail) { sig._subsTail._nextSub = link; link._prevSub = sig._subsTail }
  else sig._subsHead = link
  sig._subsTail = link

  if (sub._sourcesTail) { sub._sourcesTail._nextSource = link; link._prevSource = sub._sourcesTail }
  else sub._sourcesHead = link
  sub._sourcesTail = link
  sub._lastLink = link

  if (index) {
    index.set(sig, link)
  } else {
    let count = 0
    for (let cur = sub._sourcesHead; cur; cur = cur._nextSource) {
      if (++count >= 16) {
        const map = new Map()
        for (cur = sub._sourcesHead; cur; cur = cur._nextSource) {
          map.set(cur._sig, cur)
        }
        sub._sourceMap = map
        break
      }
    }
  }
}

function removeLink(link) {
  const sig = link._sig, sub = link._sub
  if (link._prevSub) link._prevSub._nextSub = link._nextSub
  else sig._subsHead = link._nextSub
  if (link._nextSub) link._nextSub._prevSub = link._prevSub
  else sig._subsTail = link._prevSub

  if (link._prevSource) link._prevSource._nextSource = link._nextSource
  else sub._sourcesHead = link._nextSource
  if (link._nextSource) link._nextSource._prevSource = link._prevSource
  else sub._sourcesTail = link._prevSource

  if (sub._lastLink === link) { sub._lastLink = null; sub._lastLinkSig = null }
  if (sub._sourceMap && sub._sourceMap.get(sig) === link) {
    sub._sourceMap.delete(sig)
  }
}

function finishTracking(sub) {
  const v = sub._trackingVersion
  let link = sub._sourcesHead
  while (link) {
    const next = link._nextSource
    if (link._version !== v) removeLink(link)
    link = next
  }
}

function enqueuePendingEffect(rt, sub) {
  if (!sub || sub.disposed || rt.pendingEffects.has(sub)) return
  rt.pendingEffects.add(sub)
  if (sub.__xunayComputedInternal) rt.pendingComputeds.add(sub)
  else rt.pendingEffectQueue.push(sub)
}

function flushPendingEffects() {
  const rt = runtime
  if (rt.batchDepth > 0 || rt._xunayFlushingEffects) return
  if (!Number.isInteger(rt.pendingEffectQueueHead)) rt.pendingEffectQueueHead = 0
  rt._xunayFlushingEffects = true
  const maxRuns = rt.dev ? 100 : 1000
  const runCounts = new Map()
  let firstError = null, hasError = false
  try {
    while (rt.pendingEffects.size > 0) {
      let next = null
      while (rt.pendingComputeds.size > 0 && !next) {
        const c = rt.pendingComputeds.values().next().value
        rt.pendingComputeds.delete(c)
        if (rt.pendingEffects.has(c)) next = c
      }
      while (!next && rt.pendingEffectQueueHead < rt.pendingEffectQueue.length) {
        const c = rt.pendingEffectQueue[rt.pendingEffectQueueHead++]
        if (rt.pendingEffects.has(c)) next = c
      }
      if (!next) {
        next = rt.pendingEffects.values().next().value
        if (next && next.__xunayComputedInternal) rt.pendingComputeds.delete(next)
      }
      if (!next) break
      rt.pendingEffects.delete(next)
      if (next.disposed) continue
      if (!next.__xunayComputedInternal) {
        const count = (runCounts.get(next) || 0) + 1
        runCounts.set(next, count)
        if (count > maxRuns) {
          if (!hasError) { firstError = new Error('[XuNay] effect 死循环'); hasError = true }
          continue
        }
      }
      try { next.run() } catch (err) { if (!hasError) { firstError = err; hasError = true } }
    }
  } finally {
    rt._xunayFlushingEffects = false
    if (rt.pendingEffectQueueHead >= rt.pendingEffectQueue.length) {
      rt.pendingEffectQueue.length = 0
      rt.pendingEffectQueueHead = 0
    } else if (rt.pendingEffectQueueHead > 1024) {
      rt.pendingEffectQueue = rt.pendingEffectQueue.slice(rt.pendingEffectQueueHead)
      rt.pendingEffectQueueHead = 0
    }
  }
  if (hasError) throw firstError
}

function propagate(sig) {
  if (runtime.batchDepth > 0) {
    let link = sig._subsHead
    while (link) { enqueuePendingEffect(runtime, link._sub); link = link._nextSub }
    return
  }

  // ─── 快速路径：单订阅 + 顶层 + 是 effect ───
  // 条件严格：保证不误用 diamond 场景
  const head = sig._subsHead
  if (head !== null && head._nextSub === null && !_inPropagate) {
    const only = head._sub
    if (only !== null && !only.disposed && !only.__xunayComputedInternal) {
      if (only._running) {
        enqueuePendingEffect(runtime, only)
      } else if (only._ultra) {
        only._ultraRun()
      } else if (only._simple) {
        only._quickRun()
      } else {
        _inPropagate = true
        try {
          only.run()
        } finally {
          _inPropagate = false
        }
      }
      return
    }
  }

  // ─── 慢路径：多订阅 / computed / 嵌套传播 ───
  const isOuter = !_inPropagate
  if (isOuter) { _flushId++; _inPropagate = true }
  const myFlush = _flushId
  let firstError = null
  try {
    let link = sig._subsHead
    while (link) {
      const sub = link._sub
      const next = link._nextSub
      if (!sub.disposed) {
        try {
          if (sub.__xunayComputedInternal) {
            if (!sub._dirty) { sub._dirty = true; propagate(sub) }
          } else if (sub._lastFlushId !== myFlush) {
            sub._lastFlushId = myFlush
            enqueuePendingEffect(runtime, sub)
          }
        } catch (err) {
          if (firstError === null) firstError = err
        }
      }
      link = next
    }
  } finally {
    if (isOuter) _inPropagate = false
  }

  if (isOuter && !_currentEffect && runtime.pendingEffects.size > 0) {
    flushPendingEffects()
  }
  if (firstError !== null) throw firstError
}

export function signal(init, opts) {
  const eq = opts && typeof opts.equals === 'function' ? opts.equals : Object.is
  let v = init
  let writeCount = 0
  function s(x) {
    if (x === undefined) {
      const e = _currentEffect
      if (e !== null) {
        if (e._lastLinkSig === s) {
          e._lastLink._version = _activeTrackingVersion
        } else {
          addSubscription(s, e)
        }
      } else if (_probing !== null) {
        _probing.push(s)
      }
      return v
    }
    const n = typeof x === 'function' ? x(v) : x
    if (eq(n, v)) return v
    const old = v
    v = n
    writeCount++
    const _h = runtime.hooks
    const _setHook = _h.onSignalSet
    if (_setHook) _setHook(s, old, n, writeCount)
    if (runtime.dev && _currentEffect !== null) {
      let l = s._subsHead
      while (l) {
        if (l._sub === _currentEffect) {
          if (!_warnedSelfWrite.has(s)) {
            _warnedSelfWrite.add(s)
            console.warn('[XuNay] signal 在订阅它的 effect 里被写入')
          }
          break
        }
        l = l._nextSub
      }
    }
    if (s._subsHead) propagate(s)
    const ls = s._listeners
    if (ls !== null) {
      for (let i = 0; i < ls.length; i++) ls[i]()
    }
    return v
  }
  s._subsHead = null
  s._subsTail = null
  s._listeners = null
  s.__xunay_signal = true
  s.subsCount = () => { let n = 0, l = s._subsHead; while (l) { n++; l = l._nextSub } return n }
  s.writeCount = () => writeCount
  if (runtime.hooks.onSignalCreate) runtime.hooks.onSignalCreate(s)
  return s
}

export function computed(fn) {
  let value
  let evaluated = false
  const internal = {
    _sourcesHead: null, _sourcesTail: null, _lastLink: null, _lastLinkSig: null, _sourceMap: null,
    _trackingVersion: 0,
    _dirty: true, disposed: false, skip: false,
    __xunayComputedInternal: true,
    _subsHead: null, _subsTail: null,
    run() {
      if (this.disposed || this._dirty) return
      this._dirty = true
      if (this._subsHead) propagate(this)
    },
    dispose() {
      if (this.disposed) return
      this.disposed = true
      let l = this._sourcesHead
      while (l) { const n = l._nextSource; removeLink(l); l = n }
      l = this._subsHead
      while (l) { const n = l._nextSub; removeLink(l); l = n }
    },
  }

  const evaluate = () => {
    const prev = _currentEffect
    internal._trackingVersion++
    const _prevTV2 = _activeTrackingVersion
    _activeTrackingVersion = internal._trackingVersion
    _currentEffect = internal
    runtime.currentEffect = internal
    try { value = fn(); internal._dirty = false }
    finally {
      _currentEffect = prev
      runtime.currentEffect = prev
      _activeTrackingVersion = _prevTV2
      finishTracking(internal)
    }
  }

  const c = () => {
    const e = _currentEffect
    if (e !== null) addSubscription(internal, e)
    if (!evaluated) { evaluated = true; evaluate() }
    else if (internal._dirty) evaluate()
    return value
  }
  c.__xunay_computed = true
  c.dispose = () => internal.dispose()
  return c
}

export function effect(fn) {
  const e = {
    _sourcesHead: null, _sourcesTail: null, _lastLink: null, _lastLinkSig: null, _sourceMap: null,
    _trackingVersion: 0,
    disposed: false, skip: false,
    cleanups: null, runs: 0, totalMs: 0, lastMs: 0, createdAt: Date.now(),
    _running: false, _reentry: 0,
    _simple: false,   // 首次运行后判定：无 cleanup / 无嵌套
    _lastFlushId: 0,
    _ownerScope: null,
    run: null,
    dispose() {
      if (e.disposed) return
      e.disposed = true
      if (e._ownerScope && e._ownerScope.effects) e._ownerScope.effects.delete(e)
      if (e.cleanups) {
        const cs = e.cleanups
        for (let i = 0; i < cs.length; i++) { try { cs[i]() } catch (err) { console.error(err) } }
        e.cleanups = null
      }
      let l = e._sourcesHead
      while (l) { const n = l._nextSource; removeLink(l); l = n }
    },
  }
  e.run = function () {
    if (e.disposed) return
    // 死循环保护：独立于 dev，生产环境也安全
    if (e._running) {
      e._reentry++
      if (e._reentry > 100) throw new Error('[XuNay] effect 递归超 100')
    } else e._reentry = 0
    const _dev = runtime.dev
    const _wasRunning = e._running
    e._running = true
    try {
      if (e.cleanups) {
        const cs = e.cleanups
        for (let i = 0; i < cs.length; i++) { try { cs[i]() } catch (err) { console.error(err) } }
        e.cleanups = null
      }
      e._trackingVersion++
      const _prevTV = _activeTrackingVersion
      _activeTrackingVersion = e._trackingVersion
      const prev = _currentEffect
      _currentEffect = e
      if (_dev) runtime.currentEffect = e
      try {
        if (_dev && runtime.timing) {
          const t0 = performance.now()
          try { fn() } finally {
            const dt = performance.now() - t0
            e.runs++; e.lastMs = dt; e.totalMs += dt
            const _hook = runtime.hooks.onEffectRun
            if (_hook) _hook(e, dt)
          }
        } else fn()
      } finally {
        _currentEffect = prev
        if (_dev) runtime.currentEffect = prev
        _activeTrackingVersion = _prevTV
        finishTracking(e)
      }
    } finally {
      if (!_wasRunning) {
        e._running = false
        if (!_currentEffect && !_inPropagate && runtime.batchDepth === 0 && runtime.pendingEffects.size > 0) {
          flushPendingEffects()
        }
      }
    }
  }
  e._quickRun = function () {
    if (e._running) { e.run(); return }
    e._running = true
    const prev = _currentEffect
    const prevTV = _activeTrackingVersion
    _currentEffect = e
    _activeTrackingVersion = ++e._trackingVersion
    try {
      fn()
    } finally {
      _currentEffect = prev
      _activeTrackingVersion = prevTV
      e._running = false
    }
  }
  e._ultraRun = function () {
    if (e._running) { e.run(); return }
    e._running = true
    try {
      fn()
    } finally {
      e._running = false
    }
  }
  const _cHook = runtime.hooks.onEffectCreate
  if (_cHook) _cHook(e)
  const sc = runtime.currentScope
  if (sc) { if (!sc.effects) sc.effects = new Set(); sc.effects.add(e) }
  e._ownerScope = sc
  e.run()
  // 首次运行后判定：单依赖 + 非 dev + 无 cleanup
  if (!e._simple && !runtime.dev && !e.cleanups && e._sourcesHead !== null && e._sourcesHead === e._sourcesTail) {
    e._simple = true
    e._ultra = true
  }
  return () => e.dispose()
}

export function onCleanup(fn) {
  const e = runtime.currentEffect
  if (!e) return
  if (!e.cleanups) e.cleanups = []
  e.cleanups.push(fn)
}

export function untrack(fn) {
  const prev = _currentEffect
  if (prev === null) return fn()
  _currentEffect = null
  runtime.currentEffect = null
  try { return fn() } finally {
    _currentEffect = prev
    runtime.currentEffect = prev
  }
}

export function batch(fn) {
  runtime.batchDepth++
  try { fn() } finally {
    runtime.batchDepth--
    if (!runtime.batchDepth) flushPendingEffects()
  }
}
