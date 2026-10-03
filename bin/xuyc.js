#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function readXunayConfig() {
  const files = [
    path.join(process.cwd(), 'package.json'),
    path.join(ROOT, 'package.json'),
  ]
  for (const f of files) {
    if (!fs.existsSync(f)) continue
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'))
      if (j.xunay) return j.xunay
    } catch (e) {}
  }
  return {}
}
const XUNAY_CFG = readXunayConfig()
const IS_PROD = process.env.NODE_ENV === 'production' || XUNAY_CFG.production === true
const DEVTOOLS_ON = XUNAY_CFG.devtools !== false && !IS_PROD
const MINIFY = XUNAY_CFG.minify !== undefined ? XUNAY_CFG.minify : IS_PROD
const TARGET = XUNAY_CFG.target || "es2020"
const SOURCEMAP = XUNAY_CFG.sourcemap !== undefined ? XUNAY_CFG.sourcemap : !IS_PROD
const EXTERNALS = XUNAY_CFG.externals || []
const ALIAS = XUNAY_CFG.alias || {}
const DEFINE = XUNAY_CFG.define || {}
const TITLE_CFG = XUNAY_CFG.title || null
const OPEN_BROWSER = XUNAY_CFG.open === true
const PWA_CFG = XUNAY_CFG.pwa || null

let DEVTOOLS_INJECTED = false
console.log('[xuyc] devtools:', DEVTOOLS_ON ? 'on' : 'off')
const args = process.argv.slice(2)

if (args[0] === 'scan') {
  const { scanPages } = await import('./lib/scan-pages.js')
  const r = scanPages(process.cwd())
  if (!r.ok) { console.error('❌ ' + r.reason); process.exit(1) }
  console.log('✅ 已扫描 ' + r.count + ' 个页面 → src/router.xuy')
  for (const rt of r.routes) console.log('  ' + rt.url.padEnd(30) + ' → ' + rt.rel)
  process.exit(0)
}

if (args[0] !== 'build' || !args[1]) {
  console.error('用法: node bin/xuyc.js build <入口.xuy> [--out dist]')
  console.error('      node bin/xuyc.js scan')
  process.exit(1)
}

const entryPath = path.resolve(args[1])
const entryDir = path.dirname(entryPath)
if (!fs.existsSync(entryPath)) {
  console.error('入口不存在: ' + entryPath)
  process.exit(1)
}

const outIdx = args.indexOf('--out')
const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.resolve(XUNAY_CFG.outDir || 'dist')
fs.mkdirSync(outDir, { recursive: true })

const esm = path.join(ROOT, 'core/dist/xunay.esm.js')
if (!fs.existsSync(esm)) {
  console.error('缺少 core/dist/xunay.esm.js，先跑 node core/build.js')
  process.exit(1)
}
const xunayPath = path.join(outDir, 'xunay.js')
fs.copyFileSync(esm, xunayPath)

// devtools 产物（如果配置开启）
let dtFileName = 'xunay-devtools.js'
if (DEVTOOLS_ON) {
  const dtSrc = path.join(ROOT, 'core/dist/xunay-devtools.min.js')
  if (fs.existsSync(dtSrc)) {
    const hash = Math.floor(fs.statSync(dtSrc).mtimeMs).toString(36).slice(-6)
    dtFileName = 'xunay-devtools.' + hash + '.js'
    fs.copyFileSync(dtSrc, path.join(outDir, dtFileName))
  }
}

// 可选入口：core/dist/xunay-*.min.js → outDir/xunay-*.js
const optionals = ['kit', 'devtools', 'ssr', 'anim', 'dev']
const optPaths = {}
for (const name of optionals) {
  const src = path.join(ROOT, 'core/dist/xunay-' + name + '.min.js')
  if (fs.existsSync(src)) {
    const dst = path.join(outDir, 'xunay-' + name + '.js')
    fs.copyFileSync(src, dst)
    optPaths[name] = dst
  }
}

const cache = new Map()
function processFile(file) {
  if (cache.has(file)) return cache.get(file)
  let src = fs.readFileSync(file, 'utf8')
  src = src.replace(/^(\s*import\s+[^\n]*?\s+from\s+)['"]xunay['"]/gm, (m, prefix) => prefix + "'" + xunayPath.replace(/\\/g, '/') + "'")

  src = src.replace(/from\s+(['"])([^'"]+)\.xuy\1/g, "from $1$2.js$1")

  // 展开 xunay.alias：@/xxx → 绝对路径
  // （esbuild 的 alias 只对裸包名生效，不支持路径别名）
  src = src.replace(/from\s+(['"])([^'"]+)\1/g, (m, q, p2) => {
    if (p2.startsWith('.') || p2.startsWith('/') || p2.startsWith('node:')) return m
    if (p2 === 'xunay' || p2.startsWith('xunay/')) return m
    for (const [key, value] of Object.entries(ALIAS)) {
      if (p2 === key || p2.startsWith(key + '/')) {
        const rel = p2 === key ? '' : p2.slice(key.length + 1)
        const abs = path.resolve(process.cwd(), value, rel)
        return `from ${q}${abs}${q}`
      }
    }
    return m
  })
  const out = file.replace(/\.xuy$/, '.js')
  fs.writeFileSync(out, src)
  cache.set(file, out)
  const re = /from\s+['"]([^'"]+\.(?:xuy|js))['"]/g
  let m
  while ((m = re.exec(src))) {
    const dep = m[1]
    let depPath = null

    // 1. 尝试 alias 展开（@/x → <cwd>/<alias value>/x）
    for (const [key, value] of Object.entries(ALIAS)) {
      if (dep === key || dep.startsWith(key + '/')) {
        const rel = dep === key ? '' : dep.slice(key.length + 1)
        depPath = path.resolve(process.cwd(), value, rel)
        break
      }
    }

    // 2. 相对路径
    if (!depPath && (dep.startsWith('.') || dep.startsWith('/'))) {
      depPath = path.resolve(path.dirname(file), dep)
    }

    if (depPath) {
      let depXuy = depPath.replace(/\.js$/, '.xuy')
      if (fs.existsSync(depXuy)) processFile(depXuy)
      else if (fs.existsSync(depPath) && depPath.endsWith('.xuy')) processFile(depPath)
    }
  }
  return out
}

// 自动扫描文件系统路由（src/pages/ 存在时）
if (XUNAY_CFG.scan !== false) {
  try {
    const { scanPages } = await import('./lib/scan-pages.js')
    const r = scanPages(process.cwd())
    if (r.ok) console.log('[xuyc] 扫描 ' + r.count + ' 个页面 → src/router.xuy')
  } catch (e) {
    console.warn('[xuyc] scan-pages 失败:', e.message)
  }
}

const processedEntry = processFile(entryPath)

await esbuild.build({
  entryPoints: [processedEntry],
  bundle: true,
  minify: MINIFY,
  format: 'esm',
  outfile: path.join(outDir, 'app.js'),
  target: [TARGET],
  legalComments: 'none',
  charset: 'utf8',
  sourcemap: SOURCEMAP,
  external: EXTERNALS,
  alias: ALIAS,
  define: DEFINE,
})

for (const [, out] of cache) {
  try { fs.unlinkSync(out) } catch (e) {}
}

// 复制入口目录 + src 下的 CSS
const cssLinks = []
function collectCss(dir, rel) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.css')) {
      const dst = path.join(outDir, rel, f)
      fs.mkdirSync(path.dirname(dst), { recursive: true })
      fs.copyFileSync(path.join(dir, f), dst)
      cssLinks.push('./' + path.join(rel, f).replace(/\\/g, '/'))
    }
  }
}
collectCss(entryDir, '')
collectCss(path.join(entryDir, 'src'), 'src')

// 内置 CSS（从配置读，默认全部）
const builtinCss = Array.isArray(XUNAY_CFG.css) ? XUNAY_CFG.css : ['tw', 'ui']
console.log('[xuyc] 内置 CSS:', builtinCss.length ? builtinCss.join(', ') : '(无)')
for (const name of builtinCss) {
  const src = path.join(ROOT, 'core/src/' + name + '.css')
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(outDir, name + '.css'))
    cssLinks.push('./' + name + '.css')
  } else {
    console.warn('[xuyc] 内置 CSS 不存在:', name)
  }
}

// 复制 docs 目录（如果存在）
const docsDir = path.join(entryDir, 'docs')
if (fs.existsSync(docsDir)) {
  const dst = path.join(outDir, 'docs')
  fs.mkdirSync(dst, { recursive: true })
  function cp(src, dst2) {
    for (const f of fs.readdirSync(src)) {
      const s = path.join(src, f), d = path.join(dst2, f)
      if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); cp(s, d) }
      else fs.copyFileSync(s, d)
    }
  }
  cp(docsDir, dst)
}

const raw = fs.readFileSync(entryPath, 'utf8')
const t = raw.match(/\/\/\s*title:\s*(.+)/)
const title = TITLE_CFG || (t ? t[1].trim() : path.basename(entryPath, '.xuy'))

const cssTag = cssLinks.map(l => '<link rel="stylesheet" href="' + l + '">').join('\n')
const devtoolsScript = DEVTOOLS_ON ? '<script type="module" async src="./' + dtFileName + '"></script>' : ''
const errScript = '<script>window.addEventListener("error",function(e){var m=(e.error&&e.error.stack)||e.message||"unknown";var l=(e.filename||"")+":"+(e.lineno||"")+":"+(e.colno||"");var d=document.getElementById("app");if(d)d.innerHTML="<pre style=\\"color:#d00;padding:20px;font-size:12px;white-space:pre-wrap;word-break:break-all\\">[ERROR]\\n\\n"+l+"\\n\\n"+m+"</pre>"},true);window.addEventListener("unhandledrejection",function(e){var r=e.reason;var d=document.getElementById("app");if(d)d.innerHTML="<pre style=\\"color:#d00;padding:20px;font-size:12px;white-space:pre-wrap\\">[REJECT]\\n\\n"+((r&&(r.stack||r.message))||r)+"</pre>"})</script>'
let pwaHead = ''
let pwaScript = ''
if (PWA_CFG) {
  const themeColor = PWA_CFG.themeColor || '#1f6feb'
  pwaHead = '<link rel="manifest" href="./manifest.webmanifest">\n' +
            '<meta name="theme-color" content="' + themeColor + '">\n' +
            '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
            '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
  pwaScript = '\n<script>if("serviceWorker"in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){})})}</script>'
}

const html = '<!DOCTYPE html>\n<html lang="zh">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + title + '</title>\n' + cssTag + '\n' + pwaHead + '</head>\n<body>\n<div id="app"></div>\n' + errScript + devtoolsScript + '\n<script type="module" src="./app.js"></script>' + pwaScript + '\n</body>\n</html>\n'
fs.writeFileSync(path.join(outDir, 'index.html'), html)

if (PWA_CFG) {
  const themeColor = PWA_CFG.themeColor || '#1f6feb'
  const icons = PWA_CFG.icon ? [{ src: PWA_CFG.icon, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }] : []
  const manifest = {
    name: PWA_CFG.name || title,
    short_name: PWA_CFG.shortName || PWA_CFG.name || title,
    start_url: './',
    scope: './',
    display: PWA_CFG.display || 'standalone',
    background_color: PWA_CFG.bgColor || '#ffffff',
    theme_color: themeColor,
    icons: icons,
  }
  fs.writeFileSync(path.join(outDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2))

  const sw = [
    '// 自动生成 —— xuyc PWA',
    "const CACHE = 'xunay-pwa-v1'",
    "const ASSETS = ['./', './index.html', './app.js', './xunay.js']",
    "self.addEventListener('install', function (e) {",
    "  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS).catch(function () {}) }))",
    "  self.skipWaiting()",
    "})",
    "self.addEventListener('activate', function (e) {",
    "  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE }).map(function (k) { return caches.delete(k) })) }))",
    "  self.clients.claim()",
    "})",
    "self.addEventListener('fetch', function (e) {",
    "  if (e.request.method !== 'GET') return",
    "  e.respondWith(",
    "    fetch(e.request).then(function (res) {",
    "      var clone = res.clone()",
    "      caches.open(CACHE).then(function (c) { c.put(e.request, clone) })",
    "      return res",
    "    }).catch(function () { return caches.match(e.request) })",
    "  )",
    "})",
    '',
  ].join('\n')
  fs.writeFileSync(path.join(outDir, 'sw.js'), sw)
  console.log('[xuyc] PWA: manifest.webmanifest + sw.js')
}

console.log('构建完成: ' + outDir)

// 自动打开浏览器
if (OPEN_BROWSER) {
  try {
    const { execSync } = await import('node:child_process')
    const url = 'file://' + path.join(outDir, 'index.html')
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    execSync(cmd + ' "' + url + '"', { stdio: 'ignore' })
    console.log('[xuyc] 已打开浏览器')
  } catch (e) {
    console.warn('[xuyc] 打开浏览器失败:', e.message)
  }
}
