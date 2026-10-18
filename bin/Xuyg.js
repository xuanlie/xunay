#!/usr/bin/env node
// Xuyg —— 极简语法 CLI
// 原则：只读 xuyc.js，绝不修改磁盘上的 xuyc.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'
import http from 'node:http'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const _args = process.argv.slice(2)
const xuycPath = path.join(__dirname, 'xuyc.js')

// C: xuyg dev 用独立入口 xuyc-dev.js
if (_args[0] === 'dev') {
  const devPath = path.join(__dirname, 'xuyc-dev.js')
  if (!fs.existsSync(devPath)) {
    console.error('[xuyg] 没找到 xuyc-dev.js')
    process.exit(1)
  }
  let devSrc = fs.readFileSync(devPath, 'utf8')
  const DEV_OLD = "import { compile as compileXuy } from '../compiler3/src/index.js'"
  const DEV_NEW = `import { compile as _origCompileXuy } from '../compiler3/src/index.js'
import { needsCompile4, compile4 } from '../core/compiler4/index.js'
function compileXuy(src, opts) {
  if (needsCompile4(src)) {
    try { src = compile4(src, opts); console.log('[xuyg] 极简语法 → 已转换') }
    catch (e) {
      throw new Error('[xuyg] 极简语法编译失败: ' + e.message, {
        cause: e
      })
    }
  }
  return _origCompileXuy(src, opts)
}`
  if (devSrc.includes(DEV_OLD)) {
    devSrc = devSrc.replace(DEV_OLD, DEV_NEW)
    const devRuntime = path.join(__dirname, '.xuyg-dev-' + process.pid + '.mjs')
    fs.writeFileSync(devRuntime, devSrc)
    process.on('exit', () => { try { fs.unlinkSync(devRuntime) } catch (e) {} })
    const devChild = spawn(process.execPath, [devRuntime, ...process.argv.slice(3)], { stdio: 'inherit', cwd: process.cwd() })
    devChild.on('exit', c => process.exit(c == null ? 1 : c))
    process.exit(0)
  } else {
    console.error('[xuyg] xuyc-dev.js 里找不到 import 位置')
    process.exit(1)
  }
}

// 只读 xuyc.js（不写回磁盘）
let src = fs.readFileSync(xuycPath, 'utf8')

const IMPORT_OLD = "import { compile as compileXuy } from '../compiler3/src/index.js'"
const IMPORT_NEW = `import { compile as _origCompileXuy } from '../compiler3/src/index.js'
import { needsCompile4, compile4 } from '../core/compiler4/index.js'
function compileXuy(src, opts) {
  if (needsCompile4(src)) {
    try {
      src = compile4(src, opts)
      console.log('[xuyg] 极简语法 → 已转换')
      if (process.env.XUYG_DEBUG === '1') {
        console.log('══════ 编译产物 ══════')
        console.log(src)
        console.log('═══════════════════════')
      }
    } catch (e) {
      throw new Error('[xuyg] 极简语法编译失败: ' + e.message, {
        cause: e
      })
    }
  }
  return _origCompileXuy(src, opts)
}`

if (!src.includes(IMPORT_OLD)) {
  console.error('[xuyg] 无法定位 xuyc.js 的 compileXuy import')
  process.exit(1)
}
src = src.replace(IMPORT_OLD, IMPORT_NEW)

// 内存版 xuyc.js：错误捕获过滤资源 404
const ERR_FROM = 'window.addEventListener("error",function(e){'
const ERR_TO   = 'window.addEventListener("error",function(e){if(!e.error)return;if(e.target&&e.target!==window)return;'
if (src.includes(ERR_FROM) && !src.includes('if(!e.error)return;if(e.target')) {
  src = src.split(ERR_FROM).join(ERR_TO)
  console.log('[xuyg] 内存版 xuyc.js: errScript 已加 e.error 过滤')
}

// 写临时文件
const runtime = path.join(__dirname, '.xuyg-runtime-' + process.pid + '.mjs')
fs.writeFileSync(runtime, src)
process.on('exit', () => { try { fs.unlinkSync(runtime) } catch (e) {} })

// D: --minify
if (_args.includes('--minify')) {
  process.env.NODE_ENV = 'production'
}

const child = spawn(process.execPath, [runtime, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
})

child.on('exit', code => {
  if (code === 0) {
    const outIdx = _args.findIndex(a => a === '--out' || a.startsWith('--out='))
    const outDir = outIdx >= 0
      ? (_args[outIdx].includes('=') ? _args[outIdx].split('=')[1] : _args[outIdx + 1])
      : 'dist'
    const distFull = path.resolve(process.cwd(), outDir)
    const cwdFull = process.cwd()

    // 后处理：清绝对路径 + 修 index.html 错误捕获
    const walk = (dir) => {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name)
        const st = fs.statSync(full)
        if (st.isDirectory()) walk(full)
        else if (/\.[mc]?js$/.test(name) || name.endsWith('.map') || name.endsWith('.html')) {
          let t = fs.readFileSync(full, 'utf8')
          const orig = t
          t = t.split(distFull + '/').join('./')
          t = t.split(distFull).join('.')
          t = t.replace(/\/root\/xunay\/core\/src\/Kit\/ui\//g, 'xunay/kit/ui/')
          t = t.replace(/\/root\/xunay\/core\/src\//g, 'xunay/')
          t = t.split(cwdFull + '/src/').join('./src/')
          t = t.replace(/\/root\/[^"'\s]+\/([^"'\/]+\.[mc]?js)/g, './$1')
          if (t !== orig) {
            fs.writeFileSync(full, t)
          }
        }
      }
    }
    try { walk(distFull) } catch (e) { console.error('[xuyg] 后处理失败: ' + e.message) }

    // 编译完成 → 起服务 + 打开浏览器
    const si = _args.findIndex(a => a === '--serve' || a.startsWith('--serve='))
    const autoOpen = _args.includes('--open')
    if (si >= 0) {
      const port = _args[si].includes('=') ? _args[si].split('=')[1] : (_args[si + 1] && /^\d+$/.test(_args[si + 1]) ? _args[si + 1] : '12343')
      // http 已顶层 import
      const fsMod = fs
      const mime = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
        '.woff': 'font/woff', '.woff2': 'font/woff2',
      }
      const server = http.createServer((req, res) => {
        let u = decodeURIComponent(req.url.split('?')[0])
        if (u === '/') u = '/index.html'
        const fp = path.join(distFull, u)
        if (!fp.startsWith(distFull)) { res.writeHead(403); return res.end('Forbidden') }
        fsMod.stat(fp, (err, st) => {
          if (err || !st.isFile()) {
            const idx = path.join(distFull, 'index.html')
            if (fsMod.existsSync(idx)) {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
              return res.end(fsMod.readFileSync(idx))
            }
            res.writeHead(404); return res.end('Not Found')
          }
          const ext = path.extname(fp).toLowerCase()
          res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=3600' })
          res.end(fsMod.readFileSync(fp))
        })
      })
      server.listen(port, '0.0.0.0', () => {
        const url = 'http://0.0.0.0:' + port + '/'
        console.log('')
        console.log('════════════════════════════════════════')
        console.log('  ✅ 编译完成 · 服务已启动')
        console.log('  🌐 本机: http://localhost:' + port + '/')
        console.log('  🌐 远程: http://<服务器IP>:' + port + '/')
        console.log('  📁 目录: ' + distFull)
        console.log('  ⏹  Ctrl+C 停止')
        console.log('════════════════════════════════════════')
        console.log('')
        if (autoOpen && process.platform === 'linux') {
          try { execSync('xdg-open http://localhost:' + port + '/') } catch (e) {}
        }
      })
      // 不退出，保持服务运行
      return
    }
  }
  process.exit(code == null ? 1 : code)
})
