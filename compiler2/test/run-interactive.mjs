import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>')
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement

await import('../../core/src/index.js')
const { compile } = await import('../src/index.js')
const src = fs.readFileSync(path.join(__dirname, 'str-test.xuy'), 'utf8')
new Function(compile(src))()

const app = document.getElementById('app')
const btn = app.querySelector('button')
const span = app.querySelector('span')

console.log('初始:', span.textContent)
btn.click()
console.log('点 - 后:', span.textContent)
btn.click()
console.log('再点 -:', span.textContent)
btn.click()
console.log('三点 -:', span.textContent)