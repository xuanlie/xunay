#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { compile } from '../compiler3/src/index.js'
import { build } from 'esbuild'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CORE_SRC = fs.existsSync(path.join(ROOT, 'core/src'))
  ? path.join(ROOT, 'core/src')
  : path.join(ROOT, 'src')

function parseArgs(argv) {
  const args = { input: null, out: 'dist', title: 'XuNay App', mode: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === 'build') continue
    if (a === '--out' || a === '-o') { args.out = argv[++i]; continue }
    if (a === '--title') { args.title = argv[++i]; continue }
    if (a === '--mode') { args.mode = argv[++i]; continue }
    if (!args.input && !a.startsWith('--')) args.input = a
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.input) {
    console.error('用法: xuyc3 build <input.xuy> [--out dist] [--title 标题] [--mode compiled|runtime|hybrid]')
    process.exit(1)
  }

  const src = fs.readFileSync(args.input, 'utf8')
  const m = src.match(/\/\/\s*title:\s*(.+)/)
  if (m) args.title = m[1].trim()

  // 优先：命令行 --mode > package.json.xunay.compileMode > "compiled"
  let compileMode = 'hybrid'
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    if (pkg.xunay && pkg.xunay.compileMode) compileMode = pkg.xunay.compileMode
  } catch {}
  if (args.mode) compileMode = args.mode
  console.log('   编译模式: ' + compileMode)

  const tagModule = path.join(CORE_SRC, 'element.js')
  const compiled = compile(src, { mode: compileMode, tagModule })

  // V081 修复：用 site-entry.js（index + tags + advanced + alias 超集）
  // 用户 .xuy 里 `import { div, signal } from 'xunay'` 都能解析
  const coreEntry = path.join(CORE_SRC, 'site-entry.js')
  const rtEntry = path.join(ROOT, 'compiler3/src/runtime.js')

  const entryCode =
    `import * as __rt__ from ${JSON.stringify(rtEntry)}\n` +
    compiled.replace(/from\s+['"]xunay['"]/g, `from ${JSON.stringify(coreEntry)}`)

  fs.mkdirSync(args.out, { recursive: true })
  // V077 修复：.entry.js 相对入口文件解析 import，必须写到入口同目录
  const entryDir = path.dirname(path.resolve(args.input))
  const tmpEntry = path.join(entryDir, '.xuyc-entry.js')
  fs.writeFileSync(tmpEntry, entryCode)

  // V078 修复：给 esbuild 加 .xuy loader 插件
  // 被入口 import 的 .xuy 文件（如 src/router.xuy）也需要编译
  const xuyPlugin = {
    name: 'xuy-loader',
    setup(b) {
      b.onLoad({ filter: /\.xuy$/ }, async (a) => {
        // V080 修复：只做路径重写，不调 compile
        // 原因：.xuy 就是合法 JS；compileRuntime 会重复注入已 import 的标签
        // 所有 web/site 的 .xuy 都显式 `from 'xunay'`
        let out = fs.readFileSync(a.path, 'utf8')
        // xunay / xunay/* → 绝对路径
        out = out.replace(/(['"])xunay(\/[^'"]*)?\1/g, (m, q, sub) => {
          if (!sub) return q + coreEntry + q
          // xunay/kit → core/src/kit-entry.js
          const subPath = sub.slice(1)  // 去掉开头 /
          const candidate = path.join(CORE_SRC, subPath + '-entry.js')
          if (fs.existsSync(candidate)) return q + candidate + q
          const alt = path.join(CORE_SRC, subPath + '.js')
          if (fs.existsSync(alt)) return q + alt + q
          return m
        })
        return { contents: out, loader: 'js' }
      })
    }
  }

  // ===== React 兼容模式 =====
  const compatMode = (() => {
    if (process.env.XUNAY_COMPAT === '1' || process.env.XUNAY_COMPAT === 'true') return true
    try {
      const pkg = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'package.json'), 'utf8'))
      if (pkg.xunay && pkg.xunay.compat && pkg.xunay.compat.react) return true
    } catch (_) {}
    let dir = process.cwd()
    for (let i = 0; i < 5; i++) {
      const f = path.join(dir, 'xunay.config.json')
      if (fs.existsSync(f)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(f, 'utf8'))
          if (cfg.compat && cfg.compat.react) return true
        } catch (_) {}
        break
      }
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    return false
  })()
  const compatPath = path.resolve(ROOT, 'core/src/react-compat.js')
  if (compatMode) console.log('  [xuyc3] React 兼容模式：react → xunay/compat')

  await build({
    entryPoints: [tmpEntry],
    bundle: true,
    format: 'iife',
    outfile: path.join(args.out, 'app.js'),
    platform: 'browser',
    target: 'es2020',
    logLevel: 'error',
    plugins: [xuyPlugin],
    jsx: 'automatic',
    jsxImportSource: compatMode ? 'react' : 'react',
    ...(compatMode ? { alias: {
      react: compatPath,
      'react-dom': compatPath.replace('react-compat', 'react-dom-compat'),
      'react-dom/client': compatPath.replace('react-compat', 'react-dom-compat'),
      'react/jsx-runtime': compatPath,
      'react/jsx-dev-runtime': compatPath,
    } } : {}),
  })
  fs.unlinkSync(tmpEntry)

  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${args.title}</title>
<script>
window.__XERR__ = function(msg, src, line, col, err) {
  try {
    document.title = '[ERR] ' + msg
    var el = document.getElementById('__xerr__')
    if (!el) {
      el = document.createElement('pre')
      el.id = '__xerr__'
      el.style.cssText = 'position:fixed;inset:0;background:#1a1b26;color:#f55;padding:16px;font:12px monospace;white-space:pre-wrap;z-index:2147483647;overflow:auto;margin:0'
      if (document.body) document.body.appendChild(el)
      else document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(el) })
    }
    var txt = '=== 页面错误 ===\n' + msg + '\n  at ' + (src||'?') + ':' + line + ':' + col + '\n'
    if (err && err.stack) txt += '\n' + err.stack
    el.textContent = txt
  } catch (_) {}
}
window.onerror = function(m, s, l, c, e) { window.__XERR__(m, s, l, c, e); return false }
window.addEventListener('unhandledrejection', function(e) { window.__XERR__('Promise 拒绝: ' + (e.reason && e.reason.message || e.reason), '', 0, 0, e.reason) })
</script>
<link rel="stylesheet" href="./tw.css">
<link rel="stylesheet" href="./ui.css">
<style>
  body { font-family: -apple-system, "PingFang SC", sans-serif; margin: 0; padding: 24px; }
  button { padding: 6px 14px; margin: 0 4px; }
  #__err { position: fixed; inset: 0; background: #1a1b26; color: #f55; padding: 16px;
    font: 12px monospace; white-space: pre-wrap; overflow: auto; z-index: 99999; display: none; }
  #__err .head { color: #ff7; font-size: 14px; margin-bottom: 8px; }
</style>
</head>
<body>
<div id="app"></div>
<div id="__err"><div class="head">❌ 页面错误（点此关闭）</div><div id="__errbody"></div></div>
<script>
(function(){
  var err = document.getElementById('__err');
  var errbody = document.getElementById('__errbody');
  var text = '';
  function show(s) {
    text += s + '\n';
    errbody.textContent = text;
    err.style.display = 'block';
  }
  err.addEventListener('click', function(){ err.style.display = 'none' });
  window.onerror = function(msg, src, line, col, e) {
    show('ERR: ' + msg + '\n  at ' + (src||'') + ':' + line + ':' + col +
      (e && e.stack ? '\n' + e.stack.split('\n').slice(0,6).join('\n') : ''));
  };
  window.addEventListener('unhandledrejection', function(e) {
    show('REJECT: ' + ((e.reason && e.reason.message) || e.reason));
  });
})();
</script>
<script src="./app.js"></script>
</body>
</html>
`
  // 自动拷贝 kit 样式
try {
  const cssSrc = path.join(ROOT, 'core/src')
  for (const f of ['ui.css', 'tw.css']) {
    const src = path.join(cssSrc, f)
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(args.out, f))
  }
} catch (e) { console.warn('[xuyc3] CSS 拷贝失败:', e.message) }
fs.writeFileSync(path.join(args.out, 'index.html'), html)
  console.log('✅ 构建完成 → ' + args.out + '/index.html')
}

main().catch(e => { console.error(e); process.exit(1) })
