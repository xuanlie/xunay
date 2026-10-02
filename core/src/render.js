import { ELEMENT, FRAGMENT } from './element.js'
import { effect } from './core.js'
import { registerHandler, setupDelegate } from './events.js'
import { runtime, createScope, disposeScope, runInScope, runMountFns } from './runtime.js'
import { sanitize } from './sanitize.js'
import { flip } from './transition.js'

export function render(v) {
  if (v == null || v === false || v === true) return document.createTextNode('')
  if (typeof v === 'string' || typeof v === 'number') return document.createTextNode(String(v))
  if (typeof v === 'function') return render(v())
  if (v[FRAGMENT]) {
    const h = document.createElement('span')
    h.style.display = 'contents'
    for (const c of v.children) h.appendChild(render(c))
    return h
  }
  if (v.__xunay_show) return renderShow(v)
  if (v[ELEMENT]) return el(v)
  return document.createTextNode(String(v))
}

function renderShow(v) {
  const h = document.createElement('span')
  h.style.display = 'contents'
  let cur = null, sc = null
  effect(() => {
    if (v.cond()) {
      if (cur) return
      sc = createScope(runtime.currentScope)
      runInScope(sc, () => { cur = render(v.renderFn()); h.appendChild(cur) })
    } else {
      if (!cur) return
      if (sc) disposeScope(sc)
      sc = null; cur.remove(); cur = null
    }
  })
  return h
}

function el(v) {
  const { type, props, children } = v
  const dom = document.createElement(type)
  const bind = []
  let scope = null
  const gs = () => scope || (scope = createScope(runtime.currentScope))

  for (const k in props) {
    const pv = props[k]
    if (k === 'on') { for (const e in pv) registerHandler(dom, e, pv[e]) }
    else if (k === 'ref') { if (typeof pv === 'function') pv(dom) }
    else if (k === 'class' && pv && typeof pv === 'object') { gs(); bind.push([2, pv]) }
    else if (k === 'style' && typeof pv === 'function') { gs(); bind.push([3, pv]) }
    else if (typeof pv === 'function') { gs(); bind.push([1, k, pv]) }
    else set(dom, k, pv)
  }

  const MERGE_MIN = runtime.mergeSiblings === false ? Infinity : 8
  const probeDeps = (fn) => {
    const fake = { deps: [], disposed: false }
    const saved = runtime.currentEffect
    runtime.currentEffect = fake
    let out = null
    try {
      fn()
      out = fake.deps.slice()
    } catch (e) {
      out = null
    } finally {
      runtime.currentEffect = saved
      for (let i = 0; i < fake.deps.length; i++) {
        const subs = fake.deps[i]
        const j = subs.indexOf(fake)
        if (j >= 0) subs.splice(j, 1)
      }
    }
    return out
  }
  const sameDeps = (a, b) => {
    if (!a || !b || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
    return true
  }
  const tryMergeInfo = (c) => {
    if (!c || typeof c !== 'object' || !c[ELEMENT]) return null
    if (!c.children || c.children.length !== 1) return null
    if (typeof c.children[0] !== 'function') return null
    const cp = c.props
    if (cp) for (const k in cp) {
      const pv = cp[k]
      if (typeof pv === 'function') return null
      if (pv && typeof pv === 'object') return null
    }
    const deps = probeDeps(c.children[0])
    if (!deps || deps.length === 0) return null
    return deps
  }
  let ci = 0
  const clen = children.length
  while (ci < clen) {
    const c = children[ci]
    const cInfo = typeof c !== 'function' ? tryMergeInfo(c) : null
    if (cInfo) {
      const rt = c.type
      let cj = ci + 1
      while (cj < clen) {
        const nxt = children[cj]
        if (typeof nxt === 'function') break
        const nInfo = tryMergeInfo(nxt)
        if (!nInfo || nxt.type !== rt || !sameDeps(cInfo, nInfo)) break
        cj++
      }
      if (cj - ci >= MERGE_MIN) {
        gs()
        for (let k = ci; k < cj; k++) {
          const cv = children[k]
          const cd = document.createElement(cv.type)
          const cp = cv.props
          if (cp) for (const pk in cp) set(cd, pk, cp[pk])
          const txt = document.createTextNode('')
          cd.appendChild(txt)
          dom.appendChild(cd)
          bind.push([0, txt, cv.children[0]])
        }
        ci = cj
        continue
      }
    }
    if (typeof c === 'function') {
      const __saved = runtime.currentEffect
      runtime.currentEffect = null
      let r, err = null
      try { r = c() } catch (e) { err = e } finally { runtime.currentEffect = __saved }
      if (err) {
        gs()
        const t = document.createTextNode('')
        t.textContent = '[XuNay] ' + (err.message || String(err))
        dom.appendChild(t)
      }
      else if (r && r.__xunay_list) { gs(); applyList(dom, r) }
      else if (r && r.__xunay_show) { gs(); dom.appendChild(renderShow(r)) }
      else if (r && (r[ELEMENT] || r[FRAGMENT])) { gs(); dom.appendChild(renderDyn(c)) }
      else { gs(); const t = document.createTextNode(''); dom.appendChild(t); bind.push([0, t, c]) }
    } else dom.appendChild(render(c))
    ci++
  }

  if (scope) {
    dom.__xunay_scope = scope
    const N = bind.length
    if (N === 1) {
      const b = bind[0]
      if (b[0] === 0) { const t = b[1], fn = b[2]; let p; runInScope(scope, () => effect(() => { const n = fn(); const s = n == null ? '' : String(n); if (s !== p) { t.textContent = s; p = s } })) }
      else if (b[0] === 1) { const k = b[1], fn = b[2]; let p; runInScope(scope, () => effect(() => { const n = fn(); if (n !== p) { set(dom, k, n); p = n } })) }
      else if (b[0] === 2) { const val = b[1]; let p; runInScope(scope, () => effect(() => { let c = ''; for (const x in val) { const on = typeof val[x] === 'function' ? val[x]() : val[x]; if (on) c += (c ? ' ' : '') + x } if (c !== p) { dom.className = c; p = c } })) }
      else { const fn = b[1]; runInScope(scope, () => effect(() => { const s = fn(); if (s && typeof s === 'object') Object.assign(dom.style, s) })) }
    } else if (N > 1) {
      const prev = []
      runInScope(scope, () => {
        effect(() => {
          for (let i = 0; i < N; i++) {
            const b = bind[i], t = b[0]
            if (t === 0) { const n = b[2](); const s = n == null ? '' : String(n); if (s !== prev[i]) { b[1].textContent = s; prev[i] = s } }
            else if (t === 1) { const n = b[2](); if (n !== prev[i]) { set(dom, b[1], n); prev[i] = n } }
            else if (t === 2) { let c = ''; for (const x in b[1]) { const on = typeof b[1][x] === 'function' ? b[1][x]() : b[1][x]; if (on) c += (c ? ' ' : '') + x } if (c !== prev[i]) { dom.className = c; prev[i] = c } }
            else if (t === 3) { const s = b[1](); if (s && typeof s === 'object') Object.assign(dom.style, s) }
          }
        })
      })
    }
  }
  return dom
}

function set(d, k, v) {
  if (v == null || v === false) { d.removeAttribute(k === 'className' ? 'class' : k); return }
  if (k === 'html') { d.innerHTML = sanitize(v); return }
  if (k === 'class' || k === 'className') d.className = v
  else if (k === 'value') d.value = v
  else if (k === 'style' && typeof v === 'object') Object.assign(d.style, v)
  else if (k === 'checked' || k === 'disabled' || k === 'selected') d[k] = !!v
  else d.setAttribute(k, v)
}

export function list(arr, keyFn, renderFn) {
  const getArr = typeof arr === 'function' ? arr : () => arr
  return () => ({ __xunay_list: true, getArr, keyFn, renderFn })
}

function applyList(parent, def) {
  const holder = document.createElement('span')
  holder.style.display = 'contents'
  parent.appendChild(holder)
  const map = new Map()
  const listScope = createScope(runtime.currentScope)
  holder.__xunay_scope = listScope

  runInScope(listScope, () => {
    effect(() => {
      const items = def.getArr() || []
      const N = items.length
      if (N === 0) {
        if (map.size) { for (const [, e] of map) if (e.dom.__xunay_scope) disposeScope(e.dom.__xunay_scope); map.clear(); holder.textContent = '' }
        return
      }
      const newDoms = new Array(N)
      const keySet = new Set()
      for (let i = 0; i < N; i++) {
        const item = items[i]
        const key = def.keyFn(item)
        keySet.add(key)
        let e = map.get(key)
        if (!e) { const dom = render(def.renderFn(item)); e = { dom, item }; map.set(key, e) }
        else if (e.item !== item) {
          if (!fastUpdate(e.dom, def.renderFn(item))) {
            if (e.dom.__xunay_scope) disposeScope(e.dom.__xunay_scope)
            const nd = render(def.renderFn(item))
            e.dom.replaceWith(nd); e.dom = nd
          }
          e.item = item
        }
        newDoms[i] = e.dom
      }
      if (map.size !== N) {
        for (const [k, e] of map) {
          if (!keySet.has(k)) {
            if (e.dom.__xunay_scope) disposeScope(e.dom.__xunay_scope)
            e.dom.remove(); map.delete(k)
          }
        }
      }
      for (let j = N - 1; j >= 0; j--) {
        const cur = holder.childNodes[j]
        if (cur === newDoms[j]) continue
        const next = j + 1 < N ? newDoms[j + 1] : null
        holder.insertBefore(newDoms[j], next)
      }
    })
  })
  return holder
}

function fastUpdate(dom, vnode) {
  if (vnode == null || vnode === false || vnode === true) return false
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    if (dom.nodeType === 3) { const s = String(vnode); if (dom.textContent !== s) dom.textContent = s; return true }
    return false
  }
  if (typeof vnode === 'function') return false
  if (!vnode[ELEMENT]) return false
  if (dom.tagName.toLowerCase() !== vnode.type) return false
  const props = vnode.props || {}
  for (const k in props) {
    if (k === 'on' || k === 'ref' || typeof props[k] === 'function') return false
  }
  const ch = vnode.children, dc = dom.childNodes
  if (ch.length !== dc.length) return false
  for (let i = 0; i < ch.length; i++) {
    if (!fastUpdate(dc[i], ch[i])) return false
  }
  for (const k in props) set(dom, k, props[k])
  return true
}


function renderDyn(fn) {
  const holder = document.createElement('span')
  holder.style.display = 'contents'
  let sc = null
  effect(() => {
    if (sc) disposeScope(sc)
    holder.textContent = ''
    sc = createScope(runtime.currentScope)
    runInScope(sc, () => {
      holder.appendChild(render(fn()))
      runMountFns(sc)
    })
  })
  return holder
}

export function mount(comp, target) {
  const root = typeof target === 'string' ? document.querySelector(target) : target
  if (!root) throw new Error('XuNay: target not found')
  if (root.__xunay_scope) { disposeScope(root.__xunay_scope); root.__xunay_scope = null }
  setupDelegate(root)
  root.innerHTML = ''
  const scope = createScope(null)
  root.__xunay_scope = scope
  runInScope(scope, () => { const vnode = typeof comp === 'function' ? comp() : comp; root.appendChild(render(vnode)) })
  runMountFns(scope)
  return function () { disposeScope(scope); root.innerHTML = ''; root.__xunay_scope = null }
}
