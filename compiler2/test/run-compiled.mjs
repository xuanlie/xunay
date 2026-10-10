import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 1. jsdom（不要覆盖 performance）
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement

// 2. 装 core 运行时
await import('../../core/src/index.js')
console.log('__rt__ keys:', Object.keys(globalThis.__rt__).length)

// 3. 编译
const { compile } = await import('../src/index.js')
const src = fs.readFileSync(path.join(__dirname, 'str-test.xuy'), 'utf8')
const code = compile(src)

// 4. 执行编译产物
const fn = new Function(code)
fn()

// 5. 检查 DOM
const app = document.getElementById('app')
console.log('\n=== #app.innerHTML ===')
console.log(app.innerHTML)

const btn = app.querySelector('button')
const span = app.querySelector('span')
console.log('\n=== 检查 ===')
console.log('button 存在:', !!btn)
console.log('span 存在:', !!span)
console.log('span 文本:', span && span.textContent)