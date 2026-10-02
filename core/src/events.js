const NON_DELEGATED = new Set(['focus', 'blur', 'load', 'error'])
let rootEl = null
const boundEvents = new Set()

export function setupDelegate(root) { rootEl = root }

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
  el.__xunay_handlers[eventType] = handler
  if (NON_DELEGATED.has(eventType)) { el.addEventListener(eventType, handler); return }
  if (rootEl && !boundEvents.has(eventType)) { boundEvents.add(eventType); rootEl.addEventListener(eventType, dispatch, false) }
}

function dispatch(e) {
  let node = e.target
  while (node && node !== rootEl) {
    const hs = node.__xunay_handlers
    if (hs && hs[e.type]) hs[e.type](e)
    node = node.parentNode
  }
}
