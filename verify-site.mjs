import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'

const distDir = '/root/xunay/site/dist'
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
const appFile = fs.readdirSync(distDir).find(f => f.match(/^app\..*\.js$/))
if (!appFile) { console.error('❌ 没找到 app.js'); process.exit(1) }

const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  pretendToBeVisual: true,
  url: 'http://localhost/',
})
globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.Node = dom.window.Node
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.location = dom.window.location
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16)
globalThis.fetch = () => Promise.reject(new Error('no fetch in test'))

const code = fs.readFileSync(path.join(distDir, appFile), 'utf8')
dom.window.eval(code)

await new Promise(r => setTimeout(r, 500))

const app = dom.window.document.getElementById('app')
console.log('app 存在:', !!app)
console.log('app.innerHTML 长度:', app?.innerHTML.length || 0)

const sidebar = dom.window.document.querySelector('.sidebar')
console.log('sidebar 存在:', !!sidebar)

const navItems = dom.window.document.querySelectorAll('.nav-item')
console.log('nav-item 数量:', navItems.length, '（应为 320 左右）')

const content = dom.window.document.querySelector('.content')
console.log('content 存在:', !!content)

if (sidebar && navItems.length > 100) {
  console.log('✅ sidebar 渲染成功')
} else {
  console.log('❌ sidebar 没渲染或 nav-item 太少')
}
