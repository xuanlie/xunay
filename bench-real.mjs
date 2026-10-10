import { runtime } from './core/src/runtime.js'
runtime.dev = false
const { signal, effect, mount } = await import('./core/src/index.js')
const { div, span, button, li, ul } = await import('./core/src/element.js')
const { JSDOM } = await import('jsdom')
const dom = new JSDOM(`<!DOCTYPE html><body></body>`, { pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement

async function mountRoot(fn) {
  const root = document.createElement('div'); root.id = 'app'
  document.body.innerHTML = ''
  document.body.appendChild(root)
  mount(fn, '#app')
  await new Promise(r => setTimeout(r, 30))
  return root
}

function time(label, fn) {
  const t0 = process.hrtime.bigint()
  fn()
  const t1 = process.hrtime.bigint()
  console.log(label.padEnd(35), (Number(t1-t0)/1e6).toFixed(2), 'ms')
}

console.log('=== 场景 1：1000 个静态节点首挂 ===')
await mountRoot(() => {
  const c = []
  for (let i = 0; i < 1000; i++) c.push(span(null, 'x'))
  return div(null, ...c)
}).then(() => {
  // 重新测挂载时间
})
{
  const root = document.createElement('div'); root.id = 'app2'
  document.body.appendChild(root)
  const t0 = process.hrtime.bigint()
  // 模拟挂载
  const c = []
  for (let i = 0; i < 1000; i++) c.push(span(null, 'x'))
  const tree = div(null, ...c)
  const t1 = process.hrtime.bigint()
  console.log('构建 vnode 树'.padEnd(35), (Number(t1-t0)/1e6).toFixed(2), 'ms')
}

console.log('')
console.log('=== 场景 2：列表 1000 项更新 ===')
{
  const items = signal(Array.from({length: 1000}, (_, i) => ({ id: i, name: 'item' + i })))
  const root = await mountRoot(() => ul(null, () => items().map(it => li(null, it.name))))
  const t0 = process.hrtime.bigint()
  items(Array.from({length: 1000}, (_, i) => ({ id: i, name: 'X' + i })))
  await new Promise(r => setTimeout(r, 50))
  const t1 = process.hrtime.bigint()
  console.log('1000 项全量更新'.padEnd(35), (Number(t1-t0)/1e6).toFixed(2), 'ms')
}

console.log('')
console.log('=== 场景 3：100 个独立 signal 一次全改 ===')
{
  const sigs = Array.from({length: 100}, () => signal(0))
  const root = await mountRoot(() => div(null, ...sigs.map(s => span(null, () => String(s())))))
  const t0 = process.hrtime.bigint()
  for (const s of sigs) s(1)
  await new Promise(r => setTimeout(r, 50))
  const t1 = process.hrtime.bigint()
  console.log('100 个信号全改'.padEnd(35), (Number(t1-t0)/1e6).toFixed(2), 'ms')
}

console.log('')
console.log('=== 场景 4：1000 属性同时改 ===')
{
  const s = signal(0)
  const root = await mountRoot(() => {
    const c = []
    for (let i = 0; i < 1000; i++) c.push(span({ 'data-i': () => String(s()) }, 'x'))
    return div(null, ...c)
  })
  const t0 = process.hrtime.bigint()
  s(1)
  await new Promise(r => setTimeout(r, 50))
  const t1 = process.hrtime.bigint()
  console.log('1000 属性更新'.padEnd(35), (Number(t1-t0)/1e6).toFixed(2), 'ms')
}

console.log('')
console.log('=== 场景 5：内存占用 ===')
{
  if (global.gc) global.gc()
  const before = process.memoryUsage().heapUsed / 1024 / 1024
  const sigs = []
  for (let i = 0; i < 10000; i++) sigs.push(signal(0))
  const after = process.memoryUsage().heapUsed / 1024 / 1024
  console.log('10000 signal 内存'.padEnd(35), (after-before).toFixed(2), 'MB')
}
