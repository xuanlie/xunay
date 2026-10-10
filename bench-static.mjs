import { runtime } from './core/src/runtime.js'
runtime.dev = false
const { JSDOM } = await import('jsdom')
const dom = new JSDOM(`<!DOCTYPE html><body></body>`, { pretendToBeVisual: true })
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement

const { createStatic } = await import('./compiler3/src/runtime.js')

function best(fn, iter, runs = 7) {
  const results = []
  for (let r = 0; r < runs; r++) {
    for (let i = 0; i < 100; i++) fn()
    const t0 = process.hrtime.bigint()
    for (let i = 0; i < iter; i++) fn()
    const t1 = process.hrtime.bigint()
    results.push(Number(t1 - t0) / iter)
  }
  return Math.min(...results)
}

console.log('--- createElement 逐个建 1000 个 span ---')
{
  const ns = best(() => {
    const root = document.createElement('div')
    for (let i = 0; i < 1000; i++) {
      const s = document.createElement('span')
      s.appendChild(document.createTextNode('x'))
      root.appendChild(s)
    }
  }, 50)
  console.log('  逐个建:', ns.toFixed(0), 'ns')
}

console.log('--- createStatic 一次建 1000 个 span ---')
{
  let html = '<div>'
  for (let i = 0; i < 1000; i++) html += '<span>x</span>'
  html += '</div>'
  const ns = best(() => {
    createStatic(html)
  }, 50)
  console.log('  模板:', ns.toFixed(0), 'ns')
}
