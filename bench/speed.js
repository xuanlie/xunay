import { performance } from 'node:perf_hooks'

// ===== 最小 DOM shim（够基准用）=====
class El {
  constructor(tag) {
    this.tagName = tag.toUpperCase()
    this.nodeType = 1
    this.childNodes = []
    this.attributes = {}
    this.style = {}
    this.className = ''
    this._handlers = {}
    this.parentNode = null
    this.textContent = ''
    this.nodeValue = null
  }
  appendChild(c) { c.parentNode = this; this.childNodes.push(c); return c }
  removeChild(c) { const i = this.childNodes.indexOf(c); if (i >= 0) this.childNodes.splice(i, 1); c.parentNode = null; return c }
  remove() { if (this.parentNode) this.parentNode.removeChild(this) }
  insertBefore(c, ref) {
    const i = ref ? this.childNodes.indexOf(ref) : -1
    if (i < 0) return this.appendChild(c)
    c.parentNode = this; this.childNodes.splice(i, 0, c); return c
  }
  replaceWith(c) { if (this.parentNode) { const i = this.parentNode.childNodes.indexOf(this); this.parentNode.childNodes[i] = c; c.parentNode = this.parentNode } }
  setAttribute(k, v) { this.attributes[k] = String(v) }
  removeAttribute(k) { delete this.attributes[k] }
  getAttribute(k) { return this.attributes[k] }
  addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn) }
  removeEventListener(t, fn) { const a = this._handlers[t]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1) } }
  querySelector() { return null }
  getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 20 } }
  get innerHTML() { return '' }
  set innerHTML(v) { this.childNodes = [] }
  get children() { return this.childNodes.filter(c => c.nodeType === 1) }
}
class Txt { constructor(t) { this.nodeType = 3; this.nodeValue = t; this.textContent = t; this.parentNode = null } }

const doc = {
  createElement: t => new El(t),
  createTextNode: t => new Txt(t),
  querySelector: () => null,
  body: new El('body'),
  head: new El('head'),
  getElementById: () => null,
  addEventListener: () => {},
}
globalThis.document = doc
globalThis.window = { document: doc, addEventListener: () => {}, innerWidth: 1024, innerHeight: 768 }
globalThis.requestAnimationFrame = cb => setTimeout(cb, 0)
globalThis.AbortController = globalThis.AbortController || class { abort() {} }
globalThis.performance = performance

// ===== 加载 xunay =====
const X = await import('../core/src/index.js')
const _rt = await import('../core/src/runtime.js')
_rt.runtime.dev = false

const tags = await import('../core/src/tags-entry.js')
const ssr = await import('../core/src/ssr-entry.js')

const { signal, computed, effect, batch, untrack, onCleanup,
  createElement, registerTags, tag, tags: tagMap,
  mount, list, show,
  createRuntime, withRuntime } = X
const { div, span } = tags

// ===== 基准工具 =====
function bench(name, fn, N = 1e5, opts = {}) {
  const warmup = Math.min(2000, Math.floor(N / 10))
  for (let i = 0; i < warmup; i++) fn(i)
  let best = Infinity
  const rounds = opts.rounds || 5
  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now()
    for (let i = 0; i < N; i++) fn(i)
    const dt = performance.now() - t0
    if (dt < best) best = dt
  }
  const avgUs = best / N * 1000
  const ops = N / (best / 1000)
  return { name, N, avgUs, ops }
}

function fmt(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return n.toFixed(2)
}

function print(results, title) {
  console.log('\n## ' + title)
  console.log('| 操作 | 单次 | ops/s |')
  console.log('|---|---:|---:|')
  for (const r of results) {
    let t
    if (r.avgUs < 1) t = (r.avgUs * 1000).toFixed(0) + ' ns'
    else if (r.avgUs < 1000) t = r.avgUs.toFixed(2) + ' µs'
    else t = (r.avgUs / 1000).toFixed(2) + ' ms'
    console.log(`| ${r.name} | ${t} | ${fmt(r.ops)} |`)
  }
}

const all = []

// ===== A. 响应式 =====
{
  const r = []
  r.push(bench('signal 创建', () => signal(0), 1e6))
  const s = signal(1)
  r.push(bench('signal 读', () => s(), 1e7))
  const sw = signal(0)
  r.push(bench('signal 写（无订阅）', () => sw(v => v + 1), 1e6))
  const sw2 = signal(0)
  const stop1 = effect(() => { sw2() })
  r.push(bench('signal 写（1 订阅）', () => sw2(v => v + 1), 1e5))
  stop1()
  const a = signal(1), b = signal(2)
  r.push(bench('computed 创建（不读）', () => computed(() => a() + b()), 1e5))
  const c = computed(() => a() + b())
  c()
  r.push(bench('computed 读（缓存命中）', () => c(), 1e6))
  const a2 = signal(1)
  const c2 = computed(() => a2())
  c2()
  r.push(bench('computed 读（dirty 重算）', () => { a2(a2() + 1); return c2() }, 1e5))
  r.push(bench('effect 创建+首跑', () => {
    const s = signal(0)
    const stop = effect(() => s())
    stop()
  }, 1e5))
  const ba = signal(0), bb = signal(0)
  r.push(bench('batch 两写', () => batch(() => { ba(ba() + 1); bb(bb() + 1) }), 1e5))
  const su = signal(1)
  r.push(bench('untrack 读', () => untrack(() => su()), 1e6))
  r.push(bench('onCleanup 注册', () => {
    const stop = effect(() => { onCleanup(() => {}) })
    stop()
  }, 1e5))
  const seq = signal({ x: 1 }, { equals: () => false })
  r.push(bench('signal.equals 自定义', () => seq({ x: 1 }), 1e6))
  print(r, 'A. 响应式')
  all.push(...r)
}

// ===== B. 元素 =====
{
  const r = []
  r.push(bench('createElement', () => createElement('div', {}, 'x'), 1e5))
  r.push(bench('tag("div") 调用', () => tag('div')({}, 'x'), 1e5))
  r.push(bench('tags.div 调用', () => tagMap.div({}, 'x'), 1e5))
  r.push(bench('div() 直调', () => div({}, 'x'), 1e5))
  let i = 0
  r.push(bench('registerTags（新标签）', () => registerTags(['__bench_t' + (i++)]), 1e4, { rounds: 3 }))
  r.push(bench('registerTags（重复）', () => registerTags(['__bench_dup']), 1e5, { rounds: 3 }))
  print(r, 'B. 元素创建')
  all.push(...r)
}

// ===== C. 渲染 =====
{
  const r = []
  const v1 = div({ class: 'x' }, 'hello')
  r.push(bench('render 单节点', () => { const root = document.createElement('div'); root.appendChild(X.render(v1)) }, 1e4, { rounds: 3 }))
  const v2 = div({}, span({}, 'a'), span({}, 'b'), span({}, 'c'))
  r.push(bench('render 三子节点', () => { const root = document.createElement('div'); root.appendChild(X.render(v2)) }, 1e4, { rounds: 3 }))
  let counter = 0
  r.push(bench('mount 简单组件', () => {
    const root = document.createElement('div')
    const dispose = mount(() => div({}, () => counter++), root)
    dispose()
  }, 500, { rounds: 3 }))
  r.push(bench('show 切换', () => {
    const root = document.createElement('div')
    const cond = signal(true)
    const dispose = mount(() => show(cond, () => div({}, 'x')), root)
    cond(false); cond(true)
    dispose()
  }, 500, { rounds: 3 }))
  print(r, 'C. 渲染')
  all.push(...r)
}

// ===== D. 列表 =====
{
  const r = []
  r.push(bench('list 首次渲染 100 项', () => {
    const root = document.createElement('div')
    const arr = signal(Array.from({ length: 100 }, (_, i) => ({ id: i })))
    const dispose = mount(() => list(arr, i => i.id, i => div({}, String(i.id))), root)
    dispose()
  }, 100, { rounds: 3 }))
  r.push(bench('list 追加 1 项', () => {
    const root = document.createElement('div')
    const arr = signal(Array.from({ length: 100 }, (_, i) => ({ id: i })))
    const dispose = mount(() => list(arr, i => i.id, i => div({}, String(i.id))), root)
    arr([...arr(), { id: 100 }])
    dispose()
  }, 100, { rounds: 3 }))
  r.push(bench('list 删除 1 项', () => {
    const root = document.createElement('div')
    const arr = signal(Array.from({ length: 100 }, (_, i) => ({ id: i })))
    const dispose = mount(() => list(arr, i => i.id, i => div({}, String(i.id))), root)
    arr(arr().slice(1))
    dispose()
  }, 100, { rounds: 3 }))
  r.push(bench('list 全量替换 100 项', () => {
    const root = document.createElement('div')
    const arr = signal(Array.from({ length: 100 }, (_, i) => ({ id: i })))
    const dispose = mount(() => list(arr, i => i.id, i => div({}, String(i.id))), root)
    arr(Array.from({ length: 100 }, (_, i) => ({ id: i })))
    dispose()
  }, 100, { rounds: 3 }))
  print(r, 'D. 列表')
  all.push(...r)
}

// ===== E. Runtime =====
{
  const r = []
  r.push(bench('createRuntime', () => createRuntime(), 1e5))
  const rt = createRuntime()
  r.push(bench('withRuntime 空操作', () => withRuntime(rt, () => 0), 1e5))
  print(r, 'E. Runtime')
  all.push(...r)
}

// ===== F. SSR =====
{
  const r = []
  r.push(bench('renderToString 单节点', () => ssr.renderToString(() => div({}, 'hello')), 1e4, { rounds: 3 }))
  r.push(bench('renderToString 10 项列表', () => {
    const arr = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    return ssr.renderToString(() => list(arr, i => i.id, i => div({}, String(i.id))))
  }, 500, { rounds: 3 }))
  r.push(bench('renderToString 100 项列表', () => {
    const arr = Array.from({ length: 100 }, (_, i) => ({ id: i }))
    return ssr.renderToString(() => list(arr, i => i.id, i => div({}, String(i.id))))
  }, 200, { rounds: 3 }))
  print(r, 'F. SSR')
  all.push(...r)
}

// ===== 总览 =====
console.log('\n## 总览（按 ops/s 排序）')
const sorted = [...all].sort((a, b) => b.ops - a.ops)
console.log('\n### 最快 10 个')
for (const r of sorted.slice(0, 10)) console.log(`  ${r.name}: ${fmt(r.ops)} ops/s`)
console.log('\n### 最慢 10 个')
for (const r of sorted.slice(-10).reverse()) console.log(`  ${r.name}: ${fmt(r.ops)} ops/s`)

console.log('\n## 系统信息')
const os = await import('node:os')
console.log('Node:', process.version)
console.log('CPU:', os.cpus()[0].model)
console.log('平台:', process.platform, process.arch)
