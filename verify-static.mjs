import { JSDOM } from 'jsdom'
const dom = new JSDOM(`<!DOCTYPE html><body></body>`, {
  runScripts: 'outside-only', pretendToBeVisual: true,
})
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement

const { mount } = await import('./core/src/index.js')
const { div, span } = await import('./core/src/element.js')
const { createStatic } = await import('./compiler3/src/runtime.js')

const root = document.createElement('div'); root.id = 'app'
document.body.appendChild(root)

// 模拟编译器输出：8 个静态 span 走 createStatic
const html = '<div class="box"><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span><span>g</span><span>h</span></div>'
mount(() => createStatic(html), '#app')

await new Promise(r => setTimeout(r, 50))
const el = document.querySelector('.box')
console.log('class:', el.className)
console.log('子节点数:', el.children.length)
console.log('第一个子节点文本:', el.children[0].textContent)
console.log(el.className === 'box' && el.children.length === 8 ? '✅ 静态模板正常' : '❌ 挂了')
