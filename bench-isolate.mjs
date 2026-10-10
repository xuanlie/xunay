import { runtime } from './core/src/runtime.js'
runtime.dev = false
const { signal, mount } = await import('./core/src/index.js')
const { div, span } = await import('./core/src/element.js')
const { JSDOM } = await import('jsdom')
const dom = new JSDOM(`<!DOCTYPE html><body></body>`, { pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement

async function setup(n) {
  const root = document.createElement('div')
  root.id = 'app'
  document.body.innerHTML = ''
  document.body.appendChild(root)

  const sigs = Array.from({length: n}, () => signal(0))
  mount(() => div(null, ...sigs.map(s => span(null, () => String(s())))), '#app')
  await new Promise(r => setTimeout(r, 30))
  return sigs
}

console.log('=== 隔离：只测 signal 写 + listener 触发 ===')
for (const n of [10, 100, 1000]) {
  const sigs = await setup(n)

  // 测 100 轮，每轮把所有 signal 改一遍
  for (let w = 0; w < 20; w++) for (const s of sigs) s(w)  // 预热

  const t0 = process.hrtime.bigint()
  for (let w = 0; w < 100; w++) {
    for (const s of sigs) s(w)
  }
  const t1 = process.hrtime.bigint()
  const totalMs = Number(t1 - t0) / 1e6
  const perSig = Number(t1 - t0) / (100 * n)
  console.log(`${n} 个信号 ×100 轮: ${totalMs.toFixed(2)} ms，每次 ${perSig.toFixed(0)} ns`)
}

console.log('')
console.log('=== 对照：直接改 signal 不触发 DOM ===')
for (const n of [10, 100, 1000]) {
  const sigs = Array.from({length: n}, () => signal(0))
  let dummy = 0
  for (const s of sigs) s._listeners = [() => { dummy = s() }]

  for (let w = 0; w < 20; w++) for (const s of sigs) s(w)

  const t0 = process.hrtime.bigint()
  for (let w = 0; w < 100; w++) for (const s of sigs) s(w)
  const t1 = process.hrtime.bigint()
  const perSig = Number(t1 - t0) / (100 * n)
  console.log(`${n} 个信号 ×100 轮: ${(Number(t1-t0)/1e6).toFixed(2)} ms，每次 ${perSig.toFixed(0)} ns`)
}
