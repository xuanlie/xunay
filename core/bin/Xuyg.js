#!/usr/bin/env node
// Xuyg —— 极简语法 CLI（分流到 compiler4）
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const xuycPath = path.join(__dirname, 'xuyc.js')

let src = fs.readFileSync(xuycPath, 'utf8')

const IMPORT_RE = /import\s*\{\s*compile\s+as\s+compileXuy\s*\}\s*from\s*['"]\.\.\/compiler3\/src\/index\.js['"]\s*;?/
const IMPORT_NEW = `import { compile as _origCompileXuy } from '../compiler3/src/index.js'
import { needsCompile4, compile4 } from '../compiler4/index.js'
function compileXuy(src, opts) {
  if (needsCompile4(src)) {
    try {
      src = compile4(src, opts)
      console.error('[xuyg] 极简语法 → 已转换')
      if (process.env.XUYG_DEBUG === '1') {
        console.log('══════ 编译产物 ══════')
        console.log(src)
        console.log('═══════════════════════')
      }
    } catch (e) {
      console.error('[xuyg] 编译失败: ' + e.message)
    }
  }
  return _origCompileXuy(src, opts)
}`

if (!IMPORT_RE.test(src)) {
  console.error('[xuyg] 无法在 bin/xuyc.js 中定位：')
  console.error("    import { compile as compileXuy } from '../compiler3/src/index.js'")
  console.error('请检查 xuyc.js 顶部第一行是否仍是这个 import（允许单/双引号、空格、分号变化）。')
  process.exit(1)
}
src = src.replace(IMPORT_RE, IMPORT_NEW)
// ── 运行时行为补丁：不改 xuyc.js 文件本身，只在内存里替换 ──
// 幂等：已经改过（to 已存在）跳过；from 找不到就报错
const PATCHES = [
  {
    name: 'collectCss 跳过 node_modules_xunay',
    from: "  'node_modules', '.git', '.craft', '.xunay-cache',",
    to:   "  'node_modules', 'node_modules_xunay', '.git', '.craft', '.xunay-cache',",
  },
  {
    name: 'autoKitUI 短路（不再生成重复的 kit-ui.css）',
    from: ';(function autoKitUI() {',
    to:   ';if (false) (function autoKitUI() {',
  },
  {
    name: 'cssTag 过滤 node_modules / css.old / ui_old / Kit/ui/css',
    from: "const cssTag = cssLinks.map(l => '<link rel=\"stylesheet\" href=\"' + l + '\">')",
    to:   "const cssTag = cssLinks.filter(l => !l.includes('node_modules') && !l.includes('/css.old/') && !l.includes('/ui_old/') && !l.includes('/core/src/Kit/ui/css')).map(l => '<link rel=\"stylesheet\" href=\"' + l + '\">')",
  },
]

for (const patch of PATCHES) {
  if (!src.includes(patch.from)) {
    if (src.includes(patch.to)) {
      console.error('[xuyg] 补丁已存在，跳过: ' + patch.name)
      continue
    }
    console.error('[xuyg] 补丁失配: ' + patch.name)
    console.error('[xuyg] 期望片段: ' + patch.from.slice(0, 120))
    process.exit(1)
  }
  src = src.replace(patch.from, patch.to)
  console.error('[xuyg] 运行时补丁: ' + patch.name)
}


const runtime = path.join(__dirname, '.xuyg-runtime-' + process.pid + '.mjs')
fs.writeFileSync(runtime, src)

function cleanupRuntime() {
  try { fs.unlinkSync(runtime) } catch (e) {}
}
process.on('exit', cleanupRuntime)
process.on('SIGINT',  () => { cleanupRuntime(); process.exit(130) })
process.on('SIGTERM', () => { cleanupRuntime(); process.exit(143) })
process.on('SIGHUP',  () => { cleanupRuntime(); process.exit(129) })

const child = spawn(process.execPath, [runtime, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: process.cwd()
})
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
  } else {
    process.exit(code == null ? 1 : code)
  }
})
