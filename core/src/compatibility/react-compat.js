/**
 * xunay/react-compat —— 用 XuNay 实现 React 核心 API
 *
 * 用法：
 *   import React from 'xunay/compat'
 *   或
 *   import { useState, useEffect, createElement } from 'xunay/compat'
 *
 * 编译配置（esbuild）：
 *   jsxFactory: 'React.createElement'
 *   jsxFragment: 'React.Fragment'
 * 或 alias：
 *   react      → xunay/compat
 *   react-dom  → xunay/compat
 *
 * 设计取舍：
 *   · 不做 vnode diff —— state 变重建该组件子树
 *   · 不做 Concurrent —— 同步渲染
 *   · 不做 Fiber —— 递归
 *   · 用 comment 节点锚定组件边界
 *   · hooks 按调用顺序索引（跟 React 一样）
 */

// ============ 常量 ============
const REACT_ELEMENT  = Symbol.for('react.element')
const REACT_FRAGMENT = Symbol.for('react.fragment')
const REACT_PROVIDER = Symbol.for('react.provider')
const REACT_PORTAL = Symbol.for('react.portal')

// ============ 全局渲染上下文 ============
let currentInstance = null
let currentContexts = new Map()
let activeRenderTransaction = null
let uid = 0

// ============ 组件实例 ============
class Instance {
  constructor(vnode) {
    this.id = ++uid
    this.vnode = vnode
    this.key = vnode.key == null ? null : String(vnode.key)
    this.parent = null
    this.children = new Set()
    this.hooks = []
    this.hookIndex = 0
    this.contexts = new Map()
    this.portals = []
    this.startMark = document.createComment('c' + this.id + 's')
    this.endMark   = document.createComment('c' + this.id + 'e')
    this.startMark._inst = this
    this.endMark._inst   = this
    this.effectQueue  = []
    this.cleanupQueue = []
    this.updateScheduled = false
    this.disposed = false
  }
}

// ============ createElement ============
export function createElement(type, config, ...children) {
  const props = {}
  let key = null
  let ref = null
  if (config) {
    for (const k in config) {
      if (k === 'key') { key = config[k]; continue }
      if (k === 'ref') { ref = config[k]; continue }
      props[k] = config[k]
    }
  }
  if (children.length === 1) props.children = children[0]
  else if (children.length > 1) props.children = children
  const vnode = { $$typeof: REACT_ELEMENT, type, key, props }
  if (ref !== null) vnode.ref = ref
  return vnode
}

export function isValidElement(v) {
  return v != null && typeof v === 'object' && v.$$typeof === REACT_ELEMENT
}

export function cloneElement(vnode, config, ...children) {
  if (!isValidElement(vnode)) {
    throw new TypeError('cloneElement expected a valid element')
  }
  const props = { ...vnode.props, ...(config || {}) }
  if (children.length === 1) props.children = children[0]
  else if (children.length > 1) props.children = children
  return {
    $$typeof: REACT_ELEMENT,
    type: vnode.type,
    key: config && config.key != null ? config.key : vnode.key,
    ref: config && Object.prototype.hasOwnProperty.call(config, 'ref')
      ? config.ref
      : vnode.ref,
    props,
  }
}

export const Fragment = REACT_FRAGMENT

// ============ 调度 ============
const pendingInstances = new Set()
let scheduled = false

function scheduleUpdate(inst) {
  pendingInstances.add(inst)
  if (scheduled) return
  scheduled = true
  Promise.resolve().then(flushUpdates)
}

function scheduleUpdateAll() {
  for (const inst of allInstances) scheduleUpdate(inst)
}

const allInstances = new Set()

// 挂载后才执行的 effects 队列
const pendingEffectInstances = new Set()
let flushScheduled = false
function scheduleFlushEffects() {
  if (flushScheduled) return
  flushScheduled = true
  queueMicrotask(() => {
    flushScheduled = false
    flushEffectsNow()
  })
}

function flushEffectsNow(layoutOnly = false) {
  const list = Array.from(pendingEffectInstances)
  pendingEffectInstances.clear()

  for (const inst of list) {
    if (inst.disposed || !allInstances.has(inst)) continue

    const queue = inst.effectQueue
    if (!queue.length) continue

    const selected = []
    const remaining = []

    for (const slot of queue) {
      // 类组件生命周期没有 layout 标记，仍按原来的同步行为执行。
      const isLayout = slot.layout === true
      if (layoutOnly ? (isLayout || slot.layout === undefined) : !isLayout) {
        selected.push(slot)
      } else {
        remaining.push(slot)
      }
    }

    inst.effectQueue = remaining
    if (selected.length) runEffects(inst, selected)
    if (remaining.length) pendingEffectInstances.add(inst)
  }

  if (pendingEffectInstances.size) scheduleFlushEffects()
}

function flushUpdates() {
  scheduled = false
  const list = Array.from(pendingInstances)
  pendingInstances.clear()

  for (const inst of list) {
    if (!inst.disposed && allInstances.has(inst)) rerenderInstance(inst)
  }

  // 本轮 DOM 提交完成后，同步处理 layout effects。
  flushEffectsNow(true)
}

// ============ Hooks ============
function hookSlot() {
  const inst = currentInstance
  if (!inst) throw new Error('[xunay/compat] hooks 只能在组件内调用')
  const idx = inst.hookIndex++
  if (inst.hooks.length <= idx) inst.hooks[idx] = {}
  return { inst, idx, slot: inst.hooks[idx] }
}

export function useState(init) {
  const { inst, slot } = hookSlot()
  if (!('value' in slot)) {
    slot.value = typeof init === 'function' ? init() : init
    slot.setter = (action) => {
      const next = typeof action === 'function' ? action(slot.value) : action
      if (Object.is(next, slot.value)) return
      slot.value = next
      inst._hasPendingStateUpdate = true
      scheduleUpdate(inst)
    }
  }
  return [slot.value, slot.setter]
}

function depsChanged(prev, next) {
  if (!prev) return true
  if (!next) return true
  if (prev.length !== next.length) return true
  for (let i = 0; i < prev.length; i++) if (!Object.is(prev[i], next[i])) return true
  return false
}

function useEffectImpl(fn, deps, layout) {
  const { inst, slot } = hookSlot()
  if (!('deps' in slot)) {
    slot.deps = deps
    slot.fn = fn
    slot.layout = layout
    inst.effectQueue.push(slot)
    return
  }
  if (depsChanged(slot.deps, deps)) {
    slot.deps = deps
    slot.fn = fn
    slot.layout = layout
    inst.effectQueue.push(slot)
  }
}

export function useEffect(fn, deps)       { useEffectImpl(fn, deps, false) }
export function useLayoutEffect(fn, deps) { useEffectImpl(fn, deps, true) }

export function useMemo(fn, deps) {
  const { slot } = hookSlot()
  if (!('value' in slot) || depsChanged(slot.deps, deps)) {
    slot.value = fn()
    slot.deps = deps
  }
  return slot.value
}

export function useCallback(fn, deps) {
  return useMemo(() => fn, deps)
}

export function useRef(init) {
  const { slot } = hookSlot()
  if (!('current' in slot)) slot.current = init
  return slot
}

export function useReducer(reducer, init, initFn) {
  const [state, setState] = useState(() => initFn ? initFn(init) : init)
  const dispatch = useCallback(action => setState(prev => reducer(prev, action)), [reducer])
  return [state, dispatch]
}

export function useId() {
  const { slot } = hookSlot()
  if (!('id' in slot)) slot.id = ':x' + (++uid).toString(36)
  return slot.id
}

export function useImperativeHandle(ref, create, deps) {
  useEffect(() => {
    if (!ref) return
    let value
    try { value = create() } catch (e) { console.error('[compat] useImperativeHandle create 失败:', e); return }
    if (typeof ref === 'function') { try { ref(value) } catch (_) {} }
    else if (ref && typeof ref === 'object') ref.current = value
    return () => {
      if (typeof ref === 'function') { try { ref(null) } catch (_) {} }
      else if (ref && typeof ref === 'object') ref.current = null
    }
  }, deps)
}

export function useDebugValue() {}

// ============ Context ============
export function createContext(defaultValue) {
  const key = Symbol('xunay-ctx')
  const ctx = {
    $$typeof: Symbol.for('react.context'),
    _key: key,
    _defaultValue: defaultValue,
    Provider(props) {
      // 返回特殊 vnode，让渲染器在渲染 children 期间设置 context
      return {
        $$typeof: REACT_PROVIDER,
        _key: key,
        value: props.value,
        children: props.children,
      }
    },
  }
  return ctx
}

export function useContext(ctx) {
  if (!ctx || !ctx._key) return ctx ? ctx._defaultValue : undefined

  const value = currentContexts.has(ctx._key)
    ? currentContexts.get(ctx._key)
    : ctx._defaultValue

  if (currentInstance) {
    if (!currentInstance._contextDeps) currentInstance._contextDeps = new Map()
    currentInstance._contextDeps.set(ctx._key, { ctx, value })
  }

  return value
}

function memoContextChanged(inst) {
  const deps = inst._contextDeps
  if (!deps || deps.size === 0) return false

  for (const [key, dep] of deps) {
    const contexts = inst.contexts
    const value = contexts && contexts.has(key)
      ? contexts.get(key)
      : dep.ctx._defaultValue
    if (!Object.is(value, dep.value)) return true
  }

  return false
}

// ============ 包装组件 ============
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k) ||
        !Object.is(a[k], b[k])) return false
  }
  return true
}

export function memo(comp, compare = shallowEqual) {
  function MemoComponent(props) {
    // 组件实例级的 props 比较由 rerenderInstance 负责。
    // 不在包装函数上共享渲染结果，否则可能返回旧实例的结果。
    return comp(props)
  }

  MemoComponent._isMemo = true
  MemoComponent._memoCompare = compare
  MemoComponent._wrapped = comp
  MemoComponent._memoCacheValid = false
  MemoComponent._memoCacheProps = null
  MemoComponent._memoCacheResult = null
  return MemoComponent
}

export function forwardRef(render) {
  const F = function forwardRefWrapper(props, ref) {
    return render(props, ref !== undefined ? ref : props.ref)
  }
  F._isForwardRef = true
  return F
}

export function lazy(loader) {
  let Comp = null
  let started = false
  let status = 'pending'  // 'pending' | 'resolved' | 'rejected'
  let error = null
  const L = (props) => {
    if (status === 'resolved') return Comp(props)
    if (status === 'rejected') throw error
    L.__load()
    return null
  }
  L.__lazy = true
  L.__status = () => status
  L.__load = () => {
    if (started || status !== 'pending') return
    started = true
    Promise.resolve().then(() => loader()).then(m => {
      Comp = m.default || m
      status = 'resolved'
      scheduleUpdateAll()
    }).catch(e => {
      status = 'rejected'
      error = e
      scheduleUpdateAll()
    })
  }
  return L
}

function hasPendingLazy(vnode) {
  if (!vnode) return false
  if (typeof vnode === 'function') {
    if (vnode.__lazy && vnode.__status() === 'pending') return true
    return false
  }
  if (Array.isArray(vnode)) return vnode.some(hasPendingLazy)
  if (vnode.$$typeof === REACT_ELEMENT) {
    if (typeof vnode.type === 'function' && vnode.type.__lazy) {
      if (vnode.type.__status() === 'pending') {
        vnode.type.__load()
        return true
      }
      return false
    }
    return hasPendingLazy(vnode.props && vnode.props.children)
  }
  return false
}

export function Suspense(props) {
  const children = props.children
  if (hasPendingLazy(children)) {
    return props.fallback !== undefined ? props.fallback : null
  }
  return children
}

export function StrictMode({ children }) { return children }

// ============ useInsertionEffect ============
export function useInsertionEffect(fn, deps) {
  // 跟 useLayoutEffect 一样，先简单复用
  useEffectImpl(fn, deps, true)
}

// ============ createPortal ============
export function createPortal(children, container, key) {
  if (!container) {
    console.warn('[xunay/compat] createPortal: container 为空')
    return null
  }
  return {
    $$typeof: REACT_PORTAL,
    children,
    container,
    key: key != null ? String(key) : null,
  }
}

// ============ flushSync ============
export function flushSync(fn) {
  let result
  if (typeof fn === 'function') result = fn()
  if (pendingInstances.size) flushUpdates()
  else flushEffectsNow(true)
  return result
}

// ============ unstable_batchedUpdates ============
export function unstable_batchedUpdates(fn, a) {
  // 我们的调度已是批量（微任务），直接调用
  if (typeof fn === 'function') return fn(a)
  return undefined
}

// ============ 其他 React 内部 API（空壳，兼容用） ============
export function unstable_renderSubtreeIntoContainer() {
  console.warn('[xunay/compat] unstable_renderSubtreeIntoContainer 未实现')
  return null
}
export function createFactory(type) {
  return function (config, ...children) { return createElement(type, config, ...children) }
}
// ============ useSyncExternalStore（保守版） ============
export function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
  const [, forceUpdate] = useState(0)

  let snapshot
  try {
    snapshot = typeof getServerSnapshot === 'function'
      ? getServerSnapshot()
      : getSnapshot()
  } catch (e) {
    console.error('[xunay/compat] useSyncExternalStore getSnapshot 失败:', e)
    snapshot = undefined
  }

  useEffect(() => {
    let alive = true
    let previous = snapshot

    const check = () => {
      if (!alive) return
      let next
      try {
        next = getSnapshot()
      } catch (e) {
        console.error('[xunay/compat] useSyncExternalStore getSnapshot 失败:', e)
        return
      }

      if (!Object.is(previous, next)) {
        previous = next
        forceUpdate(n => n + 1)
      }
    }

    let unsub
    try {
      unsub = subscribe(check)
      // 处理渲染与订阅建立之间发生的快照变化。
      check()
    } catch (e) {
      console.error('[xunay/compat] useSyncExternalStore subscribe 失败:', e)
    }

    return () => {
      alive = false
      if (typeof unsub === 'function') {
        try { unsub() } catch (e) {
          console.error('[xunay/compat] useSyncExternalStore unsubscribe 失败:', e)
        }
      }
    }
  }, [subscribe, getSnapshot])

  return snapshot
}

// ============ act（简化版） ============
export function act(fn) {
  const r = typeof fn === 'function' ? fn() : fn
  if (r && typeof r.then === 'function') {
    return r.then(() => {})
  }
  return r
}

// ============ 过渡 API（rAF 版） ============
export function startTransition(fn) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => { try { fn() } catch (e) { console.error(e) } })
  } else {
    fn()
  }
}

export function useTransition() {
  const [pending, setPending] = useState(false)
  const start = useCallback((fn) => {
    setPending(true)
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        try { fn() } finally { setPending(false) }
      })
    } else {
      try { fn() } finally { setPending(false) }
    }
  }, [])
  return [pending, start]
}

export function useDeferredValue(value) {
  const [deferred, setDeferred] = useState(value)
  useEffect(() => {
    if (Object.is(deferred, value)) return
    if (typeof requestAnimationFrame === 'function') {
      const id = requestAnimationFrame(() => setDeferred(value))
      return () => cancelAnimationFrame(id)
    } else {
      setDeferred(value)
    }
  }, [value])
  return deferred
}

// ============ React 19 useOptimistic ============
export function useOptimistic(actual, updateFn) {
  const [optimistic, setOptimistic] = useState(actual)
  useEffect(() => { setOptimistic(actual) }, [actual])
  const dispatch = useCallback((action) => {
    const next = updateFn ? updateFn(optimistic, action) : action
    setOptimistic(next)
  }, [optimistic, updateFn])
  return [optimistic, dispatch]
}

// ============ Class Component ============
export function Component(props, context, updater) {
  this.props = props
  this.context = context
  this.refs = {}
  this.updater = updater
  this.state = this.state || null
  this._inst = null
}

Component.prototype.isReactComponent = {}

Component.prototype.setState = function(partial, cb) {
  const next = typeof partial === 'function' ? partial(this.state, this.props) : partial
  if (this._inst && !this._inst._hasPrevState) {
    this._inst._prevState = this.state
    this._inst._hasPrevState = true
  }
  this.state = Object.assign({}, this.state || {}, next)
  if (this._inst) scheduleUpdate(this._inst)
  if (typeof cb === 'function') cb()
}

Component.prototype.forceUpdate = function(cb) {
  if (this._inst) {
    this._inst._forceUpdate = true
    scheduleUpdate(this._inst)
  }
  if (typeof cb === 'function') cb()
}

Component.prototype.render = function() { return null }

Component.prototype.isReactComponent = true

// React.PureComponent：浅比较 props 和 state，跳过无变化的更新。
export class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
           !shallowEqual(this.state, nextState)
  }
}

// ============ SVG 支持 ============
const SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline',
  'g', 'defs', 'use', 'symbol', 'text', 'tspan', 'textPath',
  'clipPath', 'mask', 'pattern', 'marker',
  'linearGradient', 'radialGradient', 'stop',
  'filter', 'feGaussianBlur', 'feColorMatrix', 'feOffset',
  'feComposite', 'feBlend', 'feMorphology', 'feTurbulence', 'feDisplacementMap',
  'foreignObject', 'image', 'switch', 'view',
])
const SVG_NS = 'http://www.w3.org/2000/svg'
// 这几个在 SVG 里就是驼峰，不转 kebab
const SVG_KEEP_CAMEL = new Set([
  'viewBox', 'preserveAspectRatio', 'gradientUnits', 'gradientTransform',
  'patternUnits', 'patternContentUnits', 'patternTransform',
  'clipPathUnits', 'maskUnits', 'maskContentUnits', 'primitiveUnits',
  'markerWidth', 'markerHeight', 'markerUnits', 'markerStart', 'markerEnd', 'markerMid',
  'refX', 'refY', 'baseFrequency', 'numOctaves', 'kernelMatrix',
  'stdDeviation', 'tableValues', 'targetX', 'targetY', 'spreadMethod',
])
function toSvgAttr(name) {
  if (SVG_KEEP_CAMEL.has(name)) return name
  if (name === 'className') return 'class'
  if (name === 'htmlFor') return 'for'
  if (name.startsWith('xlink')) return 'xlink:' + name.slice(5).toLowerCase()
  return name.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
}

// ============ DOM 属性 ============
function applyProp(el, key, value, isSvg) {
  if (key === 'key' || key === 'ref') return
  if (key === 'children') return
  if (key === 'className' || key === 'class') { el.setAttribute('class', value == null ? '' : value); return }
  if (key === 'htmlFor') { el.setAttribute('for', value == null ? '' : value); return }
  if (key === 'style') {
    if (typeof value === 'string') { el.setAttribute('style', value); return }
    if (value && typeof value === 'object') {
      for (const k in value) {
        const v = value[k]
        if (v == null) continue
        const cssKey = k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
        el.style.setProperty(cssKey, String(v))
      }
    }
    return
  }
  if (key === 'dangerouslySetInnerHTML') {
    if (value && value.__html) el.innerHTML = value.__html
    return
  }
  if (key.startsWith('on') && typeof value === 'function') {
    const evt = key.slice(2).toLowerCase()
    el.addEventListener(evt, value)
    return
  }
  if (value === false || value == null) return
  if (value === true) { el.setAttribute(key, ''); return }
  const name = isSvg ? toSvgAttr(key) : key
  el.setAttribute(name, String(value))
}

// ============ 渲染 ============
function renderVNode(vnode) {
  if (vnode == null || vnode === false || vnode === true) {
    return document.createComment('empty')
  }
  const t = typeof vnode
  if (t === 'string' || t === 'number') return document.createTextNode(String(vnode))
  if (Array.isArray(vnode)) {
    const frag = document.createDocumentFragment()
    for (const v of vnode) frag.appendChild(renderVNode(v))
    return frag
  }
  if (t === 'function') {
    return renderComponent(vnode, {})
  }
  if (vnode && vnode.$$typeof === REACT_PROVIDER) {
    return renderProvider(vnode)
  }
  if (vnode && vnode.$$typeof === REACT_PORTAL) {
    return renderPortal(vnode)
  }
  if (vnode && vnode.$$typeof === REACT_ELEMENT) {
    return renderElement(vnode)
  }
  return document.createComment('unknown')
}

function renderElement(vnode) {
  const { type, props, ref } = vnode
  if (type === REACT_FRAGMENT) {
    const frag = document.createDocumentFragment()
    appendChildren(frag, props.children)
    return frag
  }
  if (typeof type === 'function') {
    return renderComponent(type, props, ref, vnode.key)
  }
  // 原生 DOM 元素
  const isSvg = SVG_TAGS.has(type)
  const el = isSvg
    ? document.createElementNS(SVG_NS, type)
    : document.createElement(type)
  for (const k in props) {
    applyProp(el, k, props[k], isSvg)
  }
  appendChildren(el, props.children)
  if (ref) {
    if (typeof ref === 'function') ref(el)
    else if (ref && typeof ref === 'object') ref.current = el
  }
  return el
}

function appendChildren(parent, children) {
  if (children == null || children === false || children === true) return
  if (Array.isArray(children)) {
    for (const c of children) appendChildren(parent, c)
    return
  }
  parent.appendChild(renderVNode(children))
}

function renderPortal(vnode) {
  const placeholder = document.createComment('portal')
  try {
    const node = renderVNode(vnode.children)
    if (vnode.container && node) {
      const inserted = node.nodeType === 11
        ? Array.from(node.childNodes)
        : [node]
      // Portal 目标可能位于 document.documentElement 之外。
      // 必须在插入新节点前保存目标容器的原始子树。
      if (activeRenderTransaction && activeRenderTransaction.saveTree) {
        activeRenderTransaction.saveTree(vnode.container)
      }
      vnode.container.appendChild(node)
      const inst = currentInstance
      if (inst) {
        if (!inst.portals) inst.portals = []
        for (const child of inserted) {
          inst.portals.push({ container: vnode.container, node: child })
        }
      }
    }
  } catch (e) {
    console.error('[xunay/compat] portal 渲染失败:', e)
  }
  return placeholder
}

function cleanupPortals(inst) {
  if (inst.portals && inst.portals.length) {
    for (const p of inst.portals) {
      try {
        if (p.node && p.node.parentNode) p.node.parentNode.removeChild(p.node)
      } catch (_) {}
    }
    inst.portals = []
  }
}

function renderProvider(vnode) {
  const saved = currentContexts
  currentContexts = new Map(saved)
  currentContexts.set(vnode._key, vnode.value)
  try {
    return renderVNode(vnode.children)
  } finally {
    currentContexts = saved
  }
}

function renderComponent(type, props, ref, key = null) {
  const owner = currentInstance
  const vnode = { type, props, key: key == null ? null : String(key) }
  if (ref !== undefined && ref !== null) vnode.ref = ref

  // 父组件重渲染时，优先复用同类型、同 key 的直接子组件。
  let inst = null
  if (owner && owner._reuseCandidates) {
    for (const candidate of owner._reuseCandidates) {
      if (
        !candidate.disposed &&
        !owner._usedChildren.has(candidate) &&
        candidate.vnode.type === type &&
        candidate.key === vnode.key
      ) {
        inst = candidate
        break
      }
    }
  }

  if (inst) {
    owner._usedChildren.add(inst)
    owner.children.add(inst)
    inst.parent = owner
    inst.vnode = vnode
    inst.contexts = new Map(currentContexts)

    const frag = document.createDocumentFragment()

    if (inst.startMark.parentNode) {
      // 标记仍在 DOM 中：先更新，再移动完整组件范围。
      rerenderInstance(inst)

      let node = inst.startMark
      while (node) {
        const next = node.nextSibling
        frag.appendChild(node)
        if (node === inst.endMark) break
        node = next
      }
    } else {
      // 父组件正在重建子树：临时脱离 DOM 不代表组件已卸载。
      // 先恢复标记范围，再在范围内部更新内容。
      frag.appendChild(inst.startMark)
      frag.appendChild(inst.endMark)
      rerenderInstance(inst, frag)
    }

    return frag
  }

  inst = new Instance(vnode)
  inst.parent = owner
  inst.contexts = new Map(currentContexts)
  if (owner) owner.children.add(inst)
  allInstances.add(inst)

  const frag = document.createDocumentFragment()
  frag.appendChild(inst.startMark)
  renderIntoInstance(inst, frag)
  frag.appendChild(inst.endMark)
  return frag
}

function renderIntoInstance(inst, parent) {
  if (inst.vnode && inst.vnode.type && inst.vnode.type._isMemo) {
    inst._memoProps = inst.vnode.props
  }
  const prev = currentInstance
  const prevCtx = currentContexts
  currentInstance = inst
  currentContexts = inst.contexts
  inst._contextDeps = new Map()
  inst.hookIndex = 0
  inst.effectQueue = []

  let result
  try {
    const type = inst.vnode.type
    // 检测类组件：有 isReactComponent 或 原型上定义了 render
    const isClass = type.prototype && (type.prototype.isReactComponent || typeof type.prototype.render === 'function')
    if (isClass) {
      // 实例化一次，缓存到 inst
      if (!inst.classInst) {
        inst.classInst = new type(inst.vnode.props)
        inst.classInst._inst = inst
        inst.classInst.props = inst.vnode.props
        // ★ 关键：类组件的 ref 指向组件实例
        const cref = inst.vnode.ref
        if (cref !== undefined && cref !== null) {
          if (typeof cref === 'function') {
            try { cref(inst.classInst) } catch (_) {}
          } else if (typeof cref === 'object') {
            cref.current = inst.classInst
          }
        }
        // 兼容 componentDidMount（老库用）
        if (typeof inst.classInst.componentDidMount === 'function') {
          const didMount = inst.classInst.componentDidMount.bind(inst.classInst)
          inst.effectQueue.push({ fn: () => { didMount() }, deps: undefined, cleanup: null })
        }
        // 兼容 componentWillUnmount
        if (typeof inst.classInst.componentWillUnmount === 'function') {
          const willUnmount = inst.classInst.componentWillUnmount.bind(inst.classInst)
          inst.cleanupQueue.push({ cleanup: () => {
            try { willUnmount() } catch (e) { console.error(e) }
            if (cref !== undefined && cref !== null) {
              if (typeof cref === 'function') { try { cref(null) } catch (_) {} }
              else if (typeof cref === 'object') cref.current = null
            }
          } })
        } else if (cref !== undefined && cref !== null) {
          inst.cleanupQueue.push({ cleanup: () => {
            if (typeof cref === 'function') { try { cref(null) } catch (_) {} }
            else if (typeof cref === 'object') cref.current = null
          } })
        }
      } else {
        inst.classInst.props = inst.vnode.props
      }
      inst._firstRender = false
      result = inst.classInst.render()

      // 生命周期在新 DOM 提交后执行，参数使用更新前的快照。
      if (inst._pendingDidUpdate) {
        const snapshot = inst._pendingDidUpdate
        const didUpdate = inst.classInst.componentDidUpdate
        if (typeof didUpdate === 'function') {
          inst.effectQueue.push({
            fn: () => didUpdate.call(
              inst.classInst,
              snapshot.prevProps,
              snapshot.prevState
            ),
            deps: undefined,
            cleanup: null,
          })
        }
        inst._pendingDidUpdate = null
        inst._prevState = undefined
        inst._hasPrevState = false
        inst._forceUpdate = false
      }
    } else {
      // 函数组件 —— ref 同时塞进 props 和第二参数，最大兼容
      let props2 = inst.vnode.props
      if (inst.vnode.ref !== undefined && inst.vnode.ref !== null) {
        props2 = Object.assign({}, props2, { ref: inst.vnode.ref })
      }
      if (type._isForwardRef) {
        result = type(props2, inst.vnode.ref)
      } else {
        result = type(props2)
      }
    }
  } catch (e) {
    // 错误不能由发生错误的组件自身捕获，只查找祖先边界。
    let boundary = inst.parent
    while (boundary) {
      const cls = boundary.classInst
      const ctor = cls && cls.constructor
      if (
        cls &&
        (
          typeof ctor.getDerivedStateFromError === 'function' ||
          typeof cls.componentDidCatch === 'function'
        )
      ) break
      boundary = boundary.parent
    }

    let captured = false
    if (boundary) {
      const cls = boundary.classInst
      try {
        const derive = cls.constructor.getDerivedStateFromError
        if (typeof derive === 'function') {
          const patch = derive(e)
          if (patch != null) {
            cls.state = Object.assign({}, cls.state || {}, patch)
          }
        }

        if (!boundary._pendingCaughtErrors) {
          boundary._pendingCaughtErrors = []
        }
        boundary._pendingCaughtErrors.push(e)

        // 由边界在下一次更新中渲染降级 UI。
        // 不修改事务的 failed 标记，避免掩盖其他组件的错误。
        scheduleUpdate(boundary)
        result = null
        captured = true
      } catch (boundaryError) {
        console.error('[xunay/compat] 错误边界处理失败:', boundaryError)
      }
    }

    if (!captured) {
      console.error('[xunay/compat] 渲染错误:', e)
      inst._renderFailed = true
      if (activeRenderTransaction) activeRenderTransaction.failed = true
      if (typeof window !== 'undefined') {
        if (window.__XUNAY_COMPAT_THROW) throw e
        if (typeof window.__XUNAY_DEBUG_LOG === 'function') {
          try {
            window.__XUNAY_DEBUG_LOG(
              '!! 组件 ' + (inst.vnode.type.name || '?') +
              ' 崩溃:\n' + (e.stack || e.message)
            )
          } catch (_) {}
        }
      }
      result = null
    }
  }

  if (
    !inst._renderFailed &&
    inst.classInst &&
    inst._pendingCaughtErrors &&
    inst._pendingCaughtErrors.length
  ) {
    const errors = inst._pendingCaughtErrors.splice(0)
    const cls = inst.classInst
    if (typeof cls.componentDidCatch === 'function') {
      for (const error of errors) {
        inst.effectQueue.push({
          fn: () => cls.componentDidCatch(error, { componentStack: '' }),
          deps: undefined,
          cleanup: null,
        })
      }
    }
  }

  try {
    if (!inst._renderFailed) appendChildren(parent, result)

    // 不立即跑 effect —— 等整棵树挂载完
    pendingEffectInstances.add(inst)
    scheduleFlushEffects()
  } finally {
    // 即使 appendChildren 或调试模式下的渲染抛错，
    // 也必须恢复外层组件的 Hook 与 Context 环境。
    currentInstance = prev
    currentContexts = prevCtx
  }
}

function runEffects(inst, effects = inst.effectQueue) {
  const q = effects
  if (effects === inst.effectQueue) inst.effectQueue = []
  for (const slot of q) {
    // 先跑上一次的 cleanup（仅当这个 effect 要重新跑时）
    if (slot.cleanup) {
      try { slot.cleanup() } catch (e) { console.error(e) }
      slot.cleanup = null
    }
    try {
      const c = slot.fn()
      if (typeof c === 'function') {
        slot.cleanup = c
        if (!inst.cleanupQueue.includes(slot)) inst.cleanupQueue.push(slot)
      }
    } catch (e) { console.error('[xunay/compat] effect 错误:', e) }
  }
}


function snapshotRenderTransaction() {
  const instances = new Set(allInstances)
  const instanceState = new Map()
  const slotState = new Map()
  const classState = new Map()
  const pendingState = new Set(pendingInstances)
  const pendingEffects = new Set(pendingEffectInstances)
  const domState = []
  const savedDOMNodes = new Set()

  function copyValue(value) {
    if (value instanceof Set) return new Set(value)
    if (value instanceof Map) return new Map(value)
    if (Array.isArray(value)) return value.slice()
    return value
  }

  function saveObject(obj) {
    const state = new Map()
    for (const key of Object.keys(obj)) {
      state.set(key, copyValue(obj[key]))
    }
    return state
  }

  function saveTree(node) {
    if (!node || savedDOMNodes.has(node)) return
    savedDOMNodes.add(node)
    const children = Array.from(node.childNodes || [])
    domState.push([node, children])
    for (const child of children) saveTree(child)
  }

  saveTree(document.documentElement)

  for (const inst of instances) {
    instanceState.set(inst, saveObject(inst))

    const slots = []
    for (const slot of inst.hooks || []) {
      if (slot && typeof slot === 'object') {
        slots.push([slot, saveObject(slot)])
      }
    }
    slotState.set(inst, slots)

    if (inst.classInst && typeof inst.classInst === 'object') {
      classState.set(inst.classInst, saveObject(inst.classInst))
    }
  }

  return {
    instances,
    instanceState,
    slotState,
    classState,
    pendingState,
    pendingEffects,
    domState,
    saveTree,
    failed: false,
  }
}

function restoreRenderTransaction(tx) {
  function restoreObject(obj, state) {
    for (const key of Object.keys(obj)) {
      if (!state.has(key)) delete obj[key]
    }
    for (const [key, value] of state) {
      obj[key] = value instanceof Set ? new Set(value)
        : value instanceof Map ? new Map(value)
        : Array.isArray(value) ? value.slice()
        : value
    }
  }

  // 先恢复原有节点的父子关系，保留节点对象、事件监听器和引用。
  for (const [parent, children] of tx.domState) {
    for (const child of children) parent.appendChild(child)
    const expected = new Set(children)
    for (const child of Array.from(parent.childNodes || [])) {
      if (!expected.has(child)) parent.removeChild(child)
    }
  }

  // 失败事务新建的实例不执行生命周期清理，避免把未提交的副作用当作已挂载。
  for (const inst of allInstances) {
    if (!tx.instances.has(inst)) {
      inst.disposed = true
    }
  }

  allInstances.clear()
  for (const inst of tx.instances) allInstances.add(inst)

  for (const [inst, state] of tx.instanceState) {
    restoreObject(inst, state)

    for (const [slot, slotSnapshot] of tx.slotState.get(inst) || []) {
      restoreObject(slot, slotSnapshot)
    }
  }

  for (const [classInst, state] of tx.classState) {
    restoreObject(classInst, state)
  }

  pendingInstances.clear()
  for (const inst of tx.pendingState) pendingInstances.add(inst)

  pendingEffectInstances.clear()
  for (const inst of tx.pendingEffects) pendingEffectInstances.add(inst)
}

function rerenderInstanceImpl(inst, detachedParent = null) {
  const nextVNode = inst.vnode

  // 类组件更新判断必须发生在清除旧 DOM 之前。
  const classInst = inst.classInst
  if (classInst && !inst._firstRender) {
    const prevProps = classInst.props || {}
    const prevState = inst._hasPrevState
      ? inst._prevState
      : classInst.state
    const nextProps = nextVNode.props || {}
    const nextState = classInst.state
    const forced = !!inst._forceUpdate

    if (
      !forced &&
      typeof classInst.shouldComponentUpdate === 'function' &&
      !classInst.shouldComponentUpdate.call(
        classInst, nextProps, nextState
      )
    ) {
      // 即使跳过渲染，也要接收父组件传入的新 props。
      classInst.props = nextProps
      inst._prevState = undefined
      inst._hasPrevState = false
      inst._forceUpdate = false
      inst._pendingDidUpdate = null
      return
    }

    inst._pendingDidUpdate = { prevProps, prevState }
  }

  const hasPendingStateUpdate = !!inst._hasPendingStateUpdate
  inst._hasPendingStateUpdate = false

  if (!hasPendingStateUpdate &&
      inst.startMark.parentNode &&
      nextVNode && nextVNode.type && nextVNode.type._isMemo &&
      inst._memoProps && nextVNode.props &&
      nextVNode.type._memoCompare(inst._memoProps, nextVNode.props) &&
      !memoContextChanged(inst)) {
    return
  }

  const parent = inst.startMark.parentNode || detachedParent
  if (!parent) {
    disposeInstance(inst)
    return
  }

  // 分离旧 Portal 与本轮新 Portal。
  const oldPortals = inst.portals ? inst.portals.slice() : []
  inst.portals = []

  // 暂存旧 DOM；只有渲染成功后才提交新内容。
  const oldNodes = []
  let oldNode = inst.startMark.nextSibling
  while (oldNode && oldNode !== inst.endMark) {
    oldNodes.push(oldNode)
    oldNode = oldNode.nextSibling
  }

  inst._renderFailed = false

  // 暂存旧的直接子组件，渲染期间按 type + key 复用。
  const candidates = new Set(inst.children)
  inst._reuseCandidates = candidates
  inst._usedChildren = new Set()
  inst.children = new Set()

  // 旧 DOM 暂时留在原位置，避免渲染抛错时页面变空。
  const frag = document.createDocumentFragment()
  try {
    renderIntoInstance(inst, frag)
  } catch (e) {
    // 本轮失败：删除新 Portal，保留旧 Portal。
    cleanupPortals(inst)
    inst.portals = oldPortals

    inst.children = candidates
    delete inst._reuseCandidates
    delete inst._usedChildren
    inst._renderFailed = false
    throw e
  }

  if (inst._renderFailed) {
    // 默认错误恢复模式：回滚 Portal，保留旧 DOM。
    cleanupPortals(inst)
    inst.portals = oldPortals

    inst.children = candidates
    delete inst._reuseCandidates
    delete inst._usedChildren
    inst._renderFailed = false
    return
  }

  for (const old of oldNodes) {
    if (old.parentNode === parent) parent.removeChild(old)
  }
  // 成功提交：只清理旧 Portal，不删除新 Portal。
  for (const portal of oldPortals) {
    try {
      if (portal.node && portal.node.parentNode) {
        portal.node.parentNode.removeChild(portal.node)
      }
    } catch (_) {}
  }
  parent.insertBefore(frag, inst.endMark)

  // 未被新树复用的旧子组件才真正卸载。
  for (const child of candidates) {
    if (!inst._usedChildren.has(child)) disposeInstance(child)
  }

  delete inst._reuseCandidates
  delete inst._usedChildren
}


function rerenderInstance(inst, detachedParent = null) {
  // 嵌套更新共享最外层事务，避免子组件独立确认提交。
  if (activeRenderTransaction) {
    return rerenderInstanceImpl(inst, detachedParent)
  }

  const tx = snapshotRenderTransaction()
  activeRenderTransaction = tx

  try {
    const result = rerenderInstanceImpl(inst, detachedParent)

    if (tx.failed) {
      restoreRenderTransaction(tx)
      return false
    }

    return result
  } catch (error) {
    restoreRenderTransaction(tx)
    throw error
  } finally {
    activeRenderTransaction = null
  }
}

function disposeInstance(inst) {
  if (!inst || inst.disposed) return
  inst.disposed = true
  pendingInstances.delete(inst)
  pendingEffectInstances.delete(inst)
  allInstances.delete(inst)

  // 子组件可能嵌套在任意层级的原生 DOM 中，不能只查直接兄弟节点。
  for (const child of Array.from(inst.children)) {
    disposeInstance(child)
  }
  inst.children.clear()

  if (inst.parent && inst.parent.children) {
    inst.parent.children.delete(inst)
  }
  inst.parent = null

  for (const slot of inst.cleanupQueue) {
    if (slot.cleanup) { try { slot.cleanup() } catch (e) { console.error(e) } }
    slot.cleanup = null
  }
  inst.cleanupQueue = []
  cleanupPortals(inst)
}

// ============ 根 ============
export function createRoot(container) {
  let lastVNode = null
  let rootInstance = null
  let mounted = false
  let unmounted = false
  const owned = new Set()

  function snapshotInstances() {
    return new Set(allInstances)
  }
  function collectNewInstances(before) {
    for (const inst of allInstances) {
      if (!before.has(inst)) owned.add(inst)
    }
  }
  function disposeOwned() {
    for (const inst of Array.from(owned)) {
      disposeInstance(inst)
    }
    owned.clear()
    rootInstance = null
  }

  return {
    render(vnode) {
      if (unmounted) {
        throw new Error('Cannot render an unmounted root')
      }
      if (!container || !container.appendChild) {
        throw new TypeError('createRoot requires a DOM container')
      }
      const sameRoot = mounted && rootInstance &&
        lastVNode && vnode &&
        lastVNode.type === vnode.type &&
        lastVNode.key === vnode.key &&
        vnode.type && typeof vnode.type === 'function'

      if (sameRoot) {
        const previousVNode = rootInstance.vnode
        rootInstance.vnode = vnode

        const committed = rerenderInstance(rootInstance)
        if (committed === false) {
          // DOM 与实例状态已由事务恢复；根 vnode 也必须恢复。
          rootInstance.vnode = previousVNode
          return
        }

        lastVNode = vnode
        flushEffectsNow(true)
        return
      }

      if (mounted) {
        disposeOwned()
        container.innerHTML = ''
      }

      // 首次挂载使用完整事务，任何子组件渲染失败都不提交半截 DOM。
      const tx = snapshotRenderTransaction()
      tx.saveTree(container)
      const previousVNode = lastVNode
      const before = snapshotInstances()
      activeRenderTransaction = tx

      try {
        const node = renderVNode(vnode)

        if (tx.failed) {
          restoreRenderTransaction(tx)
          lastVNode = previousVNode
          rootInstance = null
          mounted = false
          return
        }

        container.appendChild(node)
        collectNewInstances(before)

        const first = container.firstChild
        rootInstance = first && first._inst &&
          first._inst.startMark === first ? first._inst : null
        lastVNode = vnode
        mounted = true
        flushEffectsNow(true)
      } catch (error) {
        restoreRenderTransaction(tx)
        lastVNode = previousVNode
        rootInstance = null
        mounted = false
        throw error
      } finally {
        activeRenderTransaction = null
      }
    },
    unmount() {
      if (unmounted) return
      unmounted = true
      disposeOwned()
      container.innerHTML = ''
      lastVNode = null
      rootInstance = null
      mounted = false
    },
    _container: container,
  }
}

export function hydrateRoot(container, initialChildren) {
  const root = createRoot(container)
  if (initialChildren !== undefined) {
    container.innerHTML = ''
    root.render(initialChildren)
  }
  return {
    render: root.render,
    unmount: root.unmount,
    _container: container,
  }
}

const legacyRoots = new WeakMap()

export function render(vnode, container) {
  let root = legacyRoots.get(container)
  if (!root) {
    root = createRoot(container)
    legacyRoots.set(container, root)
  }
  return root.render(vnode)
}

export function unmountComponentAtNode(container) {
  const root = legacyRoots.get(container)
  if (root) {
    root.unmount()
    legacyRoots.delete(container)
  } else if (container) {
    container.innerHTML = ''
  }
  return true
}

export function findDOMNode(ref) {
  if (!ref) return null
  if (ref instanceof Element) return ref
  return ref._el || null
}

// ============ Children ============
export const Children = {
  map(children, fn) {
    const out = []
    let i = 0
    const arr = Array.isArray(children) ? children : (children == null ? [] : [children])
    for (const c of arr) {
      if (c == null || c === false || c === true) continue
      out.push(fn(c, i++))
    }
    return out
  },
  forEach(children, fn) { Children.map(children, fn) },
  count(children) { return Children.map(children, () => 1).length },
  only(children) {
    if (!isValidElement(children)) throw new Error('[xunay/compat] Children.only 只接受单个 element')
    return children
  },
  toArray(children) { return Children.map(children, c => c) },
}

// ============ JSX Runtime（React 17+ automatic） ============
function _jsxImpl(type, config, maybeKey) {
  const props = {}
  let key = maybeKey !== undefined && maybeKey !== null ? String(maybeKey) : null
  let ref = null

  if (config) {
    for (const k in config) {
      if (k === 'key') {
        if (maybeKey === undefined || maybeKey === null) key = config[k] != null ? String(config[k]) : null
        continue
      }
      if (k === 'ref') { ref = config[k]; continue }
      props[k] = config[k]
    }
  }

  const vnode = {
    $$typeof: REACT_ELEMENT,
    type,
    key,
    props,
  }
  if (ref !== null && ref !== undefined) vnode.ref = ref
  return vnode
}

export function jsx(type, config, maybeKey) {
  return _jsxImpl(type, config, maybeKey)
}
export function jsxs(type, config, maybeKey) {
  return _jsxImpl(type, config, maybeKey)
}
export function jsxDEV(type, config, maybeKey, isStaticChildren, source, self) {
  const v = _jsxImpl(type, config, maybeKey)
  if (source) v._source = source
  return v
}

// ============ 默认导出 ============
const React = {
  createElement, cloneElement, isValidElement,
  Fragment, Children,
  Component,
  useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef,
  useReducer, useContext, useImperativeHandle, useId, useDebugValue,
  createContext,
  memo, forwardRef, lazy, Suspense, StrictMode,
  startTransition, useTransition, useDeferredValue, useOptimistic,
  createRoot, hydrateRoot, render, unmountComponentAtNode, findDOMNode,
  jsx, jsxs, jsxDEV,
  useInsertionEffect, createPortal, flushSync,
  useSyncExternalStore, act,
  unstable_batchedUpdates, unstable_renderSubtreeIntoContainer, createFactory,
  PureComponent,
}

export default React

// 便于 `import * as React from 'xunay/compat'`
export const version = '0.1.0-xunay'
