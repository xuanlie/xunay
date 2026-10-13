#!/usr/bin/env node
// xuyc dev —— 开发服务器：文件变化 → 自动重建 → 浏览器自动刷新
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const XUYC = path.join(__dirname, 'xuyc.js')

const args = process.argv.slice(2)
let input = null
let outDir = 'dist'
let port = 12348

for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--out' || a === '-o') { outDir = args[++i]; continue }
  if (a === '--port' || a === '-p') { port = Number(args[++i]); continue }
  if (a.startsWith('-')) continue
  if (!input && a.endsWith('.xuy')) input = a
}

if (!input) {
  for (const c of ['app.xuy', 'src/app.xuy', 'index.xuy', 'main.xuy']) {
    if (fs.existsSync(c)) { input = c; break }
  }
}
if (!input) {
  console.error('[dev] 找不到 .xuy 入口（试过 app.xuy / src/app.xuy / index.xuy / main.xuy）')
  process.exit(1)
}

console.log('[dev] 入口: ' + input)
console.log('[dev] 输出: ' + outDir)

const DIST = path.resolve(outDir)
const IGNORE = /(node_modules|dist|\.git|\.craft|\.xunay-cache|\.entry\.js|src\/router\.xuy)/

let version = String(Date.now())
let building = false
let pendingReason = null

function rebuild(reason) {
  if (building) { pendingReason = reason; return }
  building = true
  console.log('\n[dev] ' + (reason || '首次构建'))
  const child = spawn('node', [XUYC, 'build', input, '--out', outDir], { stdio: 'inherit' })
  child.on('exit', code => {
    building = false
    if (code === 0) {
      version = String(Date.now())
      console.log('[dev] ✓ 构建完成')
    } else {
      console.error('[dev] ✗ 构建失败')
    }
    if (pendingReason) {
      const r = pendingReason; pendingReason = null
      rebuild(r)
    }
  })
}

rebuild()

// 轮询方案（比 fs.watch 可靠，Linux 上 fs.watch 会误报临时文件）
const SNAPSHOT = {}
function walkSnapshot(dir, out) {
  const abs = path.resolve(dir)
  if (!fs.existsSync(abs)) return
  try {
    for (const f of fs.readdirSync(abs)) {
      const full = path.join(abs, f)
      if (IGNORE.test(full)) continue
      try {
        const st = fs.statSync(full)
        if (st.isDirectory()) walkSnapshot(full, out)
        else if (full.endsWith('.xuy')) out[full] = st.mtimeMs
      } catch (e) {}
    }
  } catch (e) {}
}

const inputDir = path.dirname(input)
function takeSnapshot() {
  const out = {}
  if (fs.existsSync('src')) walkSnapshot('src', out)
  if (inputDir !== '.') walkSnapshot(inputDir, out)
  if (fs.existsSync(input)) {
    try { out[path.resolve(input)] = fs.statSync(input).mtimeMs } catch (e) {}
  }
  return out
}

Object.assign(SNAPSHOT, takeSnapshot())

let polling = false
setInterval(() => {
  if (polling || building) return
  polling = true
  try {
    const now = takeSnapshot()
    for (const k in now) {
      if (SNAPSHOT[k] !== now[k]) {
        const rel = path.relative(process.cwd(), k)
        Object.assign(SNAPSHOT, now)
        rebuild('变化: ' + rel)
        return
      }
    }
    for (const k in SNAPSHOT) {
      if (!(k in now)) {
        const rel = path.relative(process.cwd(), k)
        Object.assign(SNAPSHOT, now)
        rebuild('删除: ' + rel)
        return
      }
    }
  } finally { polling = false }
}, 500)

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8',
  '.mjs':'application/javascript; charset=utf-8', '.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.gif':'image/gif', '.ico':'image/x-icon',
  '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf',
  '.map':'application/json; charset=utf-8',
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0]
  if (url === '/__xuyc_version') {
    res.writeHead(200, { 'Content-Type':'text/plain', 'Cache-Control':'no-store' })
    return res.end(version)
  }
  const file = url === '/' ? '/index.html' : url
  const full = path.join(DIST, file)
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' })
    return res.end('404 Not Found: ' + file)
  }
  let buf = fs.readFileSync(full)
  if (file === '/index.html' || file === '/') {
    const inject = '<script>(function(){var last="";setInterval(function(){fetch("/__xuyc_version",{cache:"no-store"}).then(function(r){return r.text()}).then(function(v){if(last&&last!==v)location.reload();last=v}).catch(function(){})},800)})()</script>'
    buf = Buffer.from(buf.toString().replace('</body>', inject + '\n</body>'))
  }
  const ext = path.extname(file).toLowerCase()
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  })
  res.end(buf)
})

server.listen(port, '0.0.0.0', () => {
  console.log('\n[dev] 🚀 http://localhost:' + port + '/')
  console.log('[dev] 改代码 → 自动重建 → 浏览器自动刷新')
  console.log('[dev] Ctrl+C 停止\n')
})
