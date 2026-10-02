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
const EXTERNALS = XUNAY_CFG.external || []
const ALIAS = XUNAY_CFG.alias || {}
const DEFINE = XUNAY_CFG.define || {}
const TITLE_CFG = XUNAY_CFG.title || null
const OPEN_BROWSER = XUNAY_CFG.openBrowser === true

let DEVTOOLS_INJECTED = false
console.log('[xuyc] devtools:', DEVTOOLS_ON ? 'on' : 'off')
const args = process.argv.slice(2)

if (args[0] !== 'build' || !args[1]) {
  console.error('用法: node bin/xuyc.js build <入口.xuy> [--out dist]')
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
if (DEVTOOLS_ON) {
  const dtSrc = path.join(ROOT, 'core/dist/xunay-devtools.min.js')
  if (fs.existsSync(dtSrc)) {
    fs.copyFileSync(dtSrc, path.join(outDir, 'xunay-devtools.js'))
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
  const out = file.replace(/\.xuy$/, '.js')
  fs.writeFileSync(out, src)
  cache.set(file, out)
  const re = /from\s+['"]([^'"]+\.(?:xuy|js))['"]/g
  let m
  while ((m = re.exec(src))) {
    const dep = m[1]
    if (dep.startsWith('.') || dep.startsWith('/')) {
      let depPath = path.resolve(path.dirname(file), dep)
      let depXuy = depPath.replace(/\.js$/, '.xuy')
      if (fs.existsSync(depXuy)) processFile(depXuy)
      else if (fs.existsSync(depPath) && depPath.endsWith('.xuy')) processFile(depPath)
    }
  }
  return out
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
const devtoolsScript = DEVTOOLS_ON ? '<script type="module" async src="./xunay-devtools.js"></script>' : ''
const errScript = '<script>window.addEventListener("error",function(e){var m=(e.error&&e.error.stack)||e.message||"unknown";var l=(e.filename||"")+":"+(e.lineno||"")+":"+(e.colno||"");var d=document.getElementById("app");if(d)d.innerHTML="<pre style=\\"color:#d00;padding:20px;font-size:12px;white-space:pre-wrap;word-break:break-all\\">[ERROR]\\n\\n"+l+"\\n\\n"+m+"</pre>"},true);window.addEventListener("unhandledrejection",function(e){var r=e.reason;var d=document.getElementById("app");if(d)d.innerHTML="<pre style=\\"color:#d00;padding:20px;font-size:12px;white-space:pre-wrap\\">[REJECT]\\n\\n"+((r&&(r.stack||r.message))||r)+"</pre>"})</script>'
const html = '<!DOCTYPE html>\n<html lang="zh">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + title + '</title>\n' + cssTag + '\n</head>\n<body>\n<div id="app"></div>\n' + errScript + devtoolsScript + '\n<script type="module" src="./app.js"></script>\n</body>\n</html>\n'
fs.writeFileSync(path.join(outDir, 'index.html'), html)

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
