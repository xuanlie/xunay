#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import esbuild from 'esbuild'
import { compile as compileXuy } from '../compiler3/src/index.js'

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
    } catch (e) {
      console.warn('[xuyc] 读取 ' + f + ' 失败: ' + e.message)
    }
  }
  return {}
}
const XUNAY_CFG = readXunayConfig()
const IS_PROD = process.env.NODE_ENV === 'production' || XUNAY_CFG.production === true
const DEVTOOLS_ON = XUNAY_CFG.devtools !== false && !IS_PROD
const MINIFY = XUNAY_CFG.minify !== undefined ? XUNAY_CFG.minify : IS_PROD
const TARGET = XUNAY_CFG.target || 'es2020'
const SOURCEMAP = XUNAY_CFG.sourcemap !== undefined ? XUNAY_CFG.sourcemap : !IS_PROD
const EXTERNALS = XUNAY_CFG.externals || []
const ALIAS = XUNAY_CFG.alias || {}
const DEFINE = XUNAY_CFG.define || {}
const TITLE_CFG = XUNAY_CFG.title || null
const OPEN_BROWSER = XUNAY_CFG.open === true
const PWA_CFG = XUNAY_CFG.pwa || null
const COMPILE_MODE = XUNAY_CFG.compileMode || 'compiled'
const ERR_SCRIPT_ON = XUNAY_CFG.errScript !== false && !IS_PROD
const KEEP = process.env.XUYC_KEEP === '1'

console.log('[xuyc] devtools:', DEVTOOLS_ON ? 'on' : 'off')
console.log('[xuyc] compileMode:', COMPILE_MODE)
const args = process.argv.slice(2)

// --target=ui|3d|filament → 转发到 Android/3D CLI
{
  const __ti = args.findIndex(a => a === '--target' || a.startsWith('--target='))
  if (__ti >= 0) {
    const __tv = args[__ti].includes('=') ? args[__ti].split('=')[1] : args[__ti + 1]
    const __map = { ui: 'xuyc-android.js', android: 'xuyc-android.js', '3d': 'xuyc-3d.js', filament: 'xuyc-filament.js' }
    const __cli = __map[__tv]
    if (!__cli) {
      console.error('[xuyc] 未知 --target: ' + __tv + '（支持 ui / 3d / filament）')
      process.exit(1)
    }
    const __fwd = []
    for (let i = 0; i < args.length; i++) {
      if (i === __ti) { if (!args[__ti].includes('=')) i++; continue }
      __fwd.push(args[i])
    }
    if (!__fwd[0]) {
      console.error('[xuyc] 用法: node bin/xuyc.js <entry.xuy> --target=' + __tv + ' [--out dir] [--build] [--install]')
      process.exit(1)
    }
    console.log('[xuyc] target=' + __tv + ' -> ' + __cli)
    const { spawnSync } = await import('node:child_process')
    const __r = spawnSync('node', [path.join(__dirname, __cli), ...__fwd], { stdio: 'inherit' })
    process.exit(__r.status || 0)
  }
}

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

const esm = [
  path.join(ROOT, 'core/dist/xunay-site.esm.js'),
  path.join(ROOT, 'dist/xunay-site.esm.js'),
].find(p => fs.existsSync(p))
if (!esm) {
  console.error('缺少 core/dist/xunay-site.esm.js，先跑 node core/build.js')
  process.exit(1)
}
const xunayPath = path.join(outDir, 'xunay.js')
fs.copyFileSync(esm, xunayPath)

// devtools 产物
let dtFileName = 'xunay-devtools.js'
if (DEVTOOLS_ON) {
  const dtSrc = [
    path.join(ROOT, 'core/dist/xunay-devtools.min.js'),
    path.join(ROOT, 'dist/xunay-devtools.min.js'),
  ].find(p => fs.existsSync(p))
  if (dtSrc) {
    dtFileName = 'xunay-devtools.js'
    fs.copyFileSync(dtSrc, path.join(outDir, dtFileName))
  }
}

// 可选入口：core/dist/xunay-*.min.js → outDir/xunay-*.js
const optionals = ['kit', 'devtools', 'ssr', 'anim', 'dev', 'alias', 'tags', 'audio', 'auth', 'babylon', 'music', 'game', 'game-mobile', 'router', 'theme', 'i18n', 'http', 'storage', 'persist', 'query', 'mobile', 'form']
for (const name of optionals) {
  const src = [
    path.join(ROOT, 'core/dist/xunay-' + name + '.min.js'),
    path.join(ROOT, 'dist/xunay-' + name + '.min.js'),
  ].find(p => fs.existsSync(p))
  if (src) fs.copyFileSync(src, path.join(outDir, 'xunay-' + name + '.js'))
}

// === 状态 ===
const cache = new Map()
const generated = new Set()      // 生成的 .xuy→.js，构建后删除
const modified = new Map()       // 被改写的 .js 源文件，构建后还原

function shouldCompileFile(src) {
  if (/^\s*\/\/\s*@compiled/.test(src)) return true
  if (/^\s*\/\/\s*@runtime/.test(src)) return false
  return COMPILE_MODE !== 'runtime'
}

function expandAlias(spec) {
  if (!spec) return null
  if (spec.startsWith('.') || spec.startsWith('/') || spec.startsWith('node:')) return null
  if (spec === 'xunay' || spec.startsWith('xunay/')) return null
  for (const [key, value] of Object.entries(ALIAS)) {
    if (spec === key || spec.startsWith(key + '/')) {
      const rel = spec === key ? '' : spec.slice(key.length + 1)
      return path.resolve(process.cwd(), value, rel)
    }
  }
  return null
}

const XUNAY_MAP = {
  '/kit': 'xunay-kit',
  '/anim': 'xunay-anim',
  '/ssr': 'xunay-ssr',
  '/devtools': 'xunay-devtools',
  '/alias': 'xunay-alias',
  '/tags': 'xunay-tags',
  '/audio': 'xunay-audio',
  '/auth': 'xunay-auth',
  '/babylon': 'xunay-babylon',
  '/music': 'xunay-music',
  '/game': 'xunay-game',
  '/game-mobile': 'xunay-game-mobile',
  '/router': 'xunay-router',
  '/theme': 'xunay-theme',
  '/i18n': 'xunay-i18n',
  '/http': 'xunay-http',
  '/storage': 'xunay-storage',
  '/persist': 'xunay-persist',
  '/query': 'xunay-query',
  '/mobile': 'xunay-mobile',
  '/form': 'xunay-form',
}

function resolveXunaySub(sub) {
  if (!sub) return xunayPath
  for (const [k, v] of Object.entries(XUNAY_MAP)) {
    if (sub === k || sub.startsWith(k + '/')) return path.join(outDir, v + '.js')
  }
  return null
}

function rewriteImports(src) {
  // 1. xunay / xunay/*（静态和动态一起处理）
  src = src.replace(/(['"])xunay(\/[^'"]*)?\1/g, (m, q, sub) => {
    const target = resolveXunaySub(sub)
    if (!target) return m
    return q + target.replace(/\\/g, '/') + q
  })
  // 2. .xuy → .js
  src = src.replace(/from\s+(['"])([^'"]+)\.xuy\1/g, 'from $1$2.js$1')
  src = src.replace(/import\(\s*(['"])([^'"]+)\.xuy\1\s*\)/g, 'import($1$2.js$1)')
  // 3. 静态 import alias 展开
  src = src.replace(/from\s+(['"])([^'"]+)\1/g, (m, q, spec) => {
    const abs = expandAlias(spec)
    if (!abs) return m
    return `from ${q}${abs}${q}`
  })
  // 4. 动态 import alias 展开
  src = src.replace(/import\(\s*(['"])([^'"]+)\1\s*\)/g, (m, q, spec) => {
    const abs = expandAlias(spec)
    if (!abs) return m
    return `import(${q}${abs}${q})`
  })
  return src
}

function resolveDep(spec, basedir) {
  if (!spec) return null
  if (spec === 'xunay' || spec.startsWith('xunay/')) return null
  if (spec.startsWith('node:')) return null
  let p
  if (spec.startsWith('.')) p = path.resolve(basedir, spec)
  else if (spec.startsWith('/')) p = spec
  else {
    const abs = expandAlias(spec)
    if (!abs) return null  // 裸包名，交给 esbuild
    p = abs
  }
  const candidates = []
  // 优先 .xuy：如果 p 是 .js 且同名 .xuy 存在，用 .xuy
  if (p.endsWith('.js')) {
    const xuyAlt = p.replace(/\.js$/, '.xuy')
    if (fs.existsSync(xuyAlt) && fs.statSync(xuyAlt).isFile()) candidates.push(xuyAlt)
  }
  candidates.push(
    p,
    p + '.js',
    p + '.xuy',
    path.join(p, 'index.js'),
    path.join(p, 'index.xuy'),
  )
  for (const c of candidates) {
    try {
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c
    } catch {}
  }
  return null
}

function processFile(file) {
  if (cache.has(file)) return cache.get(file)
  const original = fs.readFileSync(file, 'utf8')
  let src = rewriteImports(original)

  if (file.endsWith('.xuy') && !process.env.XUYC_NO_COMPILE && shouldCompileFile(src)) {
    try {
      const before = src.length
      src = compileXuy(src, { mode: 'compiled' })
      if (process.env.XUYC_DEBUG) console.log('[xuyc] compiled ' + file + ': ' + before + ' -> ' + src.length)
    } catch (e) {
      console.error('[xuyc] 编译失败 ' + file + ': ' + e.message)
      process.exit(1)
    }
  }

  const isXuy = file.endsWith('.xuy')
  const out = isXuy ? file.replace(/\.xuy$/, '.js') : file
  if (isXuy) {
    fs.writeFileSync(out, src)
    generated.add(out)
  } else if (src !== original) {
    if (!modified.has(file)) modified.set(file, original)
    fs.writeFileSync(out, src)
  }
  cache.set(file, out)

  const re = /(?:from\s+|import\(\s*)['"]([^'"]+)['"]/g
  let m
  while ((m = re.exec(src))) {
    const depPath = resolveDep(m[1], path.dirname(file))
    if (depPath) processFile(depPath)
  }
  return out
}

// 自动扫描文件系统路由
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

const WANT_SPLIT = process.argv.includes('--splitting')
const baseOpts = {
  entryPoints: [processedEntry],
  bundle: true,
  minify: MINIFY,
  format: 'esm',
  target: [TARGET],
  legalComments: 'none',
  charset: 'utf8',
  sourcemap: SOURCEMAP,
  external: EXTERNALS,
  alias: ALIAS,
  define: DEFINE,
}
if (WANT_SPLIT) {
  await esbuild.build(Object.assign({}, baseOpts, {
    outdir: outDir,
    entryNames: 'app',
    chunkNames: 'chunks/[name]-[hash]',
    splitting: true,
  }))
} else {
  await esbuild.build(Object.assign({}, baseOpts, {
    outfile: path.join(outDir, 'app.js'),
  }))
}

if (!KEEP) {
  for (const f of generated) {
    try { fs.unlinkSync(f) } catch (e) { console.warn('[xuyc] 清理失败 ' + f + ': ' + e.message) }
  }
  for (const [f, orig] of modified) {
    try { fs.writeFileSync(f, orig) } catch (e) { console.warn('[xuyc] 还原失败 ' + f + ': ' + e.message) }
  }
} else {
  console.log('[xuyc] XUYC_KEEP=1，保留 ' + generated.size + ' 个生成产物，' + modified.size + ' 个源文件保持改写')
}

// 复制 CSS（递归）
const cssLinks = []
function collectCss(dir, rel) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git') continue
    const full = path.join(dir, f)
    try {
      if (path.resolve(full) === path.resolve(outDir)) continue
    } catch {}
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      collectCss(full, rel ? path.join(rel, f) : f)
    } else if (f.endsWith('.css')) {
      const dst = path.join(outDir, rel, f)
      fs.mkdirSync(path.dirname(dst), { recursive: true })
      fs.copyFileSync(full, dst)
      cssLinks.push('./' + path.join(rel, f).replace(/\\/g, '/'))
    }
  }
}
collectCss(entryDir, '')

const builtinCss = Array.isArray(XUNAY_CFG.css) ? XUNAY_CFG.css : ['tw', 'ui']
console.log('[xuyc] 内置 CSS:', builtinCss.length ? builtinCss.join(', ') : '(无)')
for (const name of builtinCss) {
  const src = [
    path.join(ROOT, 'core/src/' + name + '.css'),
    path.join(ROOT, 'src/' + name + '.css'),
  ].find(p => fs.existsSync(p))
  if (src) {
    fs.copyFileSync(src, path.join(outDir, name + '.css'))
    cssLinks.push('./' + name + '.css')
  } else {
    console.warn('[xuyc] 内置 CSS 不存在:', name)
  }
}

// 复制 docs
const docsDir = path.join(entryDir, 'docs')
if (fs.existsSync(docsDir)) {
  const dst = path.join(outDir, 'docs')
  fs.mkdirSync(dst, { recursive: true })
  ;(function cp(src, dst2) {
    for (const f of fs.readdirSync(src)) {
      const s = path.join(src, f), d = path.join(dst2, f)
      if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); cp(s, d) }
      else fs.copyFileSync(s, d)
    }
  })(docsDir, dst)
}

const raw = fs.readFileSync(entryPath, 'utf8')
const t = raw.match(/\/\/\s*title:\s*(.+)/)
const title = TITLE_CFG || (t ? t[1].trim() : path.basename(entryPath, '.xuy'))

const cssTag = cssLinks.map(l => '<link rel="stylesheet" href="' + l + '">').join('\n')
const devtoolsScript = DEVTOOLS_ON ? '<script type="module" async src="./' + dtFileName + '"></script>' : ''
const errScript = ERR_SCRIPT_ON ? '<script>window.addEventListener("error",function(e){var m=(e.error&&e.error.stack)||e.message||"unknown";var l=(e.filename||"")+":"+(e.lineno||"")+":"+(e.colno||"");var d=document.getElementById("app");if(d)d.innerHTML="<pre style=\\"color:#d00;padding:20px;font-size:12px;white-space:pre-wrap;word-break:break-all\\">[ERROR]\\n\\n"+l+"\\n\\n"+m+"</pre>"},true);window.addEventListener("unhandledrejection",function(e){var r=e.reason;var d=document.getElementById("app");if(d)d.innerHTML="<pre style=\\"color:#d00;padding:20px;font-size:12px;white-space:pre-wrap\\">[REJECT]\\n\\n"+((r&&(r.stack||r.message))||r)+"</pre>"})</script>' : ''
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

  const BUILD_ID = Date.now().toString(36)
  const sw = [
    '// 自动生成 —— xuyc PWA',
    "const CACHE = 'xunay-pwa-" + BUILD_ID + "'",
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
