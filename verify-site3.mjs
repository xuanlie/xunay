import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'

const distDir = '/root/xunay/site/dist'
const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8')
const appFiles = fs.readdirSync(distDir).filter(f => f.match(/^app\..*\.js$/))
if (appFiles.length === 0) { console.error('❌ 没找到 app.js'); process.exit(1) }
const appFile = appFiles[0]
console.log('加载:', appFile)

// 用 esbuild 转 IIFE（保留模块语义）
await esbuild.build({
  entryPoints: [path.join(distDir, appFile)],
  bundle: true,
  format: 'iife',
  outfile: '/tmp/site-iife.js',
  platform: 'browser',
  target: 'es2020',
  logLevel: 'error',
})

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

const code = fs.readFileSync('/tmp/site-iife.js', 'utf8')
dom.window.eval(code)
await new Promise(r => setTimeout(r, 500))

const app = dom.window.document.getElementById('app')
console.log('app 存在:', !!app)
console.log('app.innerHTML 长度:', app?.innerHTML.length || 0)
const sidebar = dom.window.document.querySelector('.sidebar')
const navItems = dom.window.document.querySelectorAll('.nav-item')
const content = dom.window.document.querySelector('.content')
console.log('sidebar:', !!sidebar)
console.log('nav-item 数量:', navItems.length)
console.log('content:', !!content)

if (navItems.length > 100) console.log('✅ Sidebar 完整渲染')
else if (navItems.length > 0) console.log('⚠️  Sidebar 部分渲染:', navItems.length)
else console.log('❌ Sidebar 没渲染')
