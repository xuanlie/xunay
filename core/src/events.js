const NON_DELEGATED = new Set([
  'focus', 'blur', 'load', 'error',
  'mouseenter', 'mouseleave',
  'pointerenter', 'pointerleave',
  'focusin', 'focusout',
  'DOMFocusIn', 'DOMFocusOut',
])
const rootStack = []
let currentRoot = null

export function setupDelegate(root) {
  rootStack.push(currentRoot)
  currentRoot = root
  if (!root.__xunay_boundEvents) root.__xunay_boundEvents = new Set()
  if (!root.__xunay_dispatchers) root.__xunay_dispatchers = {}
}

export function teardownDelegate() {
  currentRoot = rootStack.pop()
}

export function cleanupDelegate(root) {
  if (root.__xunay_dispatchers) {
    for (const t in root.__xunay_dispatchers) {
      root.removeEventListener(t, root.__xunay_dispatchers[t])
    }
    root.__xunay_dispatchers = null
    root.__xunay_boundEvents = null
  }
}

export function registerHandler(el, eventType, raw) {
  if (!el.__xunay_handlers) el.__xunay_handlers = {}
  let fn, opts
  if (typeof raw === 'function') { fn = raw; opts = null }
  else if (raw && typeof raw === 'object' && typeof raw.fn === 'function') { fn = raw.fn; opts = raw }
  else return
  const handler = opts ? (e) => {
    if (opts.prevent) e.preventDefault()
    if (opts.stop) e.stopPropagation()
    if (opts.self && e.target !== e.currentTarget) return
    if (opts.value) { const t = e.target; fn(t && t.value !== undefined ? t.value : e) }
    else fn(e)
  } : fn
  // 支持同一元素同一事件多个 handler
  if (!el.__xunay_handlers[eventType]) el.__xunay_handlers[eventType] = [handler]
  else el.__xunay_handlers[eventType].push(handler)

  if (NON_DELEGATED.has(eventType)) { el.addEventListener(eventType, handler); return }

  const root = currentRoot
  if (!root) { el.addEventListener(eventType, handler); return }
  if (!root.__xunay_boundEvents.has(eventType)) {
    root.__xunay_boundEvents.add(eventType)
    const dispatcher = (e) => dispatch(e, root)
    root.__xunay_dispatchers[eventType] = dispatcher
    root.addEventListener(eventType, dispatcher, false)
  }
}

function dispatch(e, root) {
  let node = e.target
  while (node && node !== root) {
    const hs = node.__xunay_handlers
    if (hs && hs[e.type]) {
      const arr = hs[e.type]
      for (let i = 0; i < arr.length; i++) {
        arr[i](e)
        if (e.cancelBubble) return
      }
    }
    if (e.cancelBubble) return
    node = node.parentNode
  }
}
