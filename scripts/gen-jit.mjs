// 扫目录里所有 .xuy/.js/.html，抓 xxx-[value] 语法，生成 jit.css
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// 扫描目录（用户可传参）
const SCAN_DIRS = process.argv.slice(2)
if (SCAN_DIRS.length === 0) {
  SCAN_DIRS.push(path.join(ROOT, 'site', 'src'))
}
const OUT_FILE = path.join(ROOT, 'site', 'dist', 'jit.css')

const EXT = new Set(['.xuy', '.js', '.mjs', '.html', '.ts', '.tsx'])

// 前缀 → CSS 属性模板
// 用 {v} 占位
const PREFIX_MAP = {
  // 尺寸
  'w': 'width: {v}',
  'h': 'height: {v}',
  'min-w': 'min-width: {v}',
  'min-h': 'min-height: {v}',
  'max-w': 'max-width: {v}',
  'max-h': 'max-height: {v}',
  'size': 'width: {v}; height: {v}',
  // 间距
  'p': 'padding: {v}',
  'px': 'padding-left: {v}; padding-right: {v}',
  'py': 'padding-top: {v}; padding-bottom: {v}',
  'pt': 'padding-top: {v}',
  'pr': 'padding-right: {v}',
  'pb': 'padding-bottom: {v}',
  'pl': 'padding-left: {v}',
  'm': 'margin: {v}',
  'mx': 'margin-left: {v}; margin-right: {v}',
  'my': 'margin-top: {v}; margin-bottom: {v}',
  'mt': 'margin-top: {v}',
  'mr': 'margin-right: {v}',
  'mb': 'margin-bottom: {v}',
  'ml': 'margin-left: {v}',
  'gap': 'gap: {v}',
  'gap-x': 'column-gap: {v}',
  'gap-y': 'row-gap: {v}',
  // 定位
  'top': 'top: {v}',
  'right': 'right: {v}',
  'bottom': 'bottom: {v}',
  'left': 'left: {v}',
  'inset': 'top: {v}; right: {v}; bottom: {v}; left: {v}',
  'inset-x': 'left: {v}; right: {v}',
  'inset-y': 'top: {v}; bottom: {v}',
  // 颜色
  'bg': 'background-color: {v}',
  'text': 'color: {v}',  // 注意：也可能是 font-size，靠值判断
  'border': 'border-color: {v}',
  'ring': 'outline-color: {v}',
  // 其他
  'rounded': 'border-radius: {v}',
  'shadow': 'box-shadow: {v}',
  'opacity': 'opacity: {v}',
  'z': 'z-index: {v}',
  'font': 'font-family: {v}',
  'leading': 'line-height: {v}',
  'tracking': 'letter-spacing: {v}',
  'translate-x': 'transform: translateX({v})',
  'translate-y': 'transform: translateY({v})',
  'rotate': 'transform: rotate({v})',
  'scale': 'transform: scale({v})',
  'skew-x': 'transform: skewX({v})',
  'skew-y': 'transform: skewY({v})',
  'blur': 'filter: blur({v})',
  'brightness': 'filter: brightness({v})',
  'contrast': 'filter: contrast({v})',
  'grayscale': 'filter: grayscale({v})',
  'hue-rotate': 'filter: hue-rotate({v})',
  'invert': 'filter: invert({v})',
  'saturate': 'filter: saturate({v})',
  'sepia': 'filter: sepia({v})',
  'grid-cols': 'grid-template-columns: {v}',
  'grid-rows': 'grid-template-rows: {v}',
  'col-span': 'grid-column: span {v} / span {v}',
  'row-span': 'grid-row: span {v} / span {v}',
  'order': 'order: {v}',
  'basis': 'flex-basis: {v}',
  'flex': 'flex: {v}',
  'duration': 'transition-duration: {v}',
  'delay': 'transition-delay: {v}',
}

// 值规范化
function normalizeValue(v, prop) {
  v = String(v).trim()
  // 数值 → 加 px
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    // 无单位：默认 px（除非特定属性）
    if (prop === 'opacity' || prop === 'z' || prop === 'order' || prop === 'flex-grow' || prop === 'scale') {
      return v
    }
    return v + 'px'
  }
  // 0 → 0
  if (v === '0') return '0'
  // 下划线 → 空格（Tailwind 约定）
  v = v.replace(/_/g, ' ')
  return v
}

// 判断值是颜色还是尺寸（用于 text-[xxx] / border-[xxx]）
function isColorValue(v) {
  return /^#|^rgb|^hsl|^color|^currentcolor|^transparent|^white$|^black$/i.test(String(v).trim())
}

// 特殊前缀处理
function resolveProp(prefix, value) {
  // text-[14px] → font-size
  if (prefix === 'text') {
    if (/^\[/.test(value)) { /* 不会到这 */ }
    if (isColorValue(value)) return 'color: {v}'
    // 是尺寸
    return 'font-size: {v}'
  }
  // border-[1px] → border-width；border-[#ccc] → border-color
  if (prefix === 'border') {
    if (isColorValue(value)) return 'border-color: {v}'
    return 'border-width: {v}; border-style: solid'
  }
  // rounded-[50%] 值可能是 %
  return PREFIX_MAP[prefix] || null
}

// 从字符串里抓 xxx-[value]
// 匹配：可选前缀（字母/数字/-），然后是 [值]
// 值里不能有 ] （简化）
const CLASS_RE = /(?:^|[\s"'`])(?:([a-z][a-z0-9-]*):)?(-?[a-z][a-z0-9-]*)-\[([^\]]+)\]/gi

function scanFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  const out = []
  let m
  const re = new RegExp(CLASS_RE.source, 'gi')
  while ((m = re.exec(src)) !== null) {
    const variant = m[1] ? m[1].toLowerCase() : ''
    let prefix = m[2].toLowerCase()
    let value = m[3].trim()
    // -mt-[10px] 的情况：prefix 前面有 -
    if (prefix.startsWith('-')) {
      prefix = prefix.slice(1)
      value = '-' + value
    }
    out.push({ variant, prefix, value })
  }
  return out
}

function walk(dir, acc) {
  if (!fs.existsSync(dir)) return
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f === '.git' || f === 'build' || f === 'dist') continue
    const full = path.join(dir, f)
    const st = fs.statSync(full)
    if (st.isDirectory()) walk(full, acc)
    else if (EXT.has(path.extname(f))) acc.push(full)
  }
}

// 收集所有
const files = []
for (const d of SCAN_DIRS) walk(d, files)
console.log('[jit] 扫描 ' + files.length + ' 个文件')

const rules = new Map()  // key: 'prefix-\[value\]' → css
const seen = new Set()

for (const f of files) {
  for (const { variant, prefix, value } of scanFile(f)) {
    const key = (variant ? variant + ':' : '') + prefix + '-[' + value + ']'
    if (seen.has(key)) continue
    seen.add(key)
    const template = resolveProp(prefix, value)
    if (!template) continue
    const normalized = normalizeValue(value, prefix)
    const css = template.replace(/\{v\}/g, normalized)
    rules.set(key, { css, variant, prefix, value })
  }
}

// 变体映射
const VARIANT_MAP = {
  'sm':  { media: 'min-width: 640px' },
  'md':  { media: 'min-width: 768px' },
  'lg':  { media: 'min-width: 1024px' },
  'xl':  { media: 'min-width: 1280px' },
  '2xl': { media: 'min-width: 1536px' },
  'hover':    { pseudo: ':hover' },
  'focus':    { pseudo: ':focus' },
  'active':   { pseudo: ':active' },
  'disabled': { pseudo: ':disabled' },
  'focus-visible': { pseudo: ':focus-visible' },
  'focus-within':  { pseudo: ':focus-within' },
  'dark':  { wrapper: '.dark ' },
}

// 生成 CSS
const L = []
L.push('/* JIT 任意值生成 — 自动生成，勿手改 */')
L.push('/* 源: scripts/gen-jit.mjs */')
L.push('')
function esc(s) {
  return s.replace(/[\[\]#\/%.!:,()&\s]/g, c => '\\' + c)
}
const sorted = [...rules.entries()].sort((a, b) => a[0].localeCompare(b[0]))
const mediaGroups = {}
for (const [key, rule] of sorted) {
  const { css, variant } = rule
  const clsEscaped = esc(key)
  const selector = '.' + clsEscaped
  if (!variant) {
    L.push(selector + ' { ' + css + '; }')
  } else {
    const v = VARIANT_MAP[variant]
    if (!v) {
      L.push('/* 未知变体 ' + variant + ' */')
      continue
    }
    if (v.pseudo) {
      L.push(selector + v.pseudo + ' { ' + css + '; }')
    } else if (v.wrapper) {
      L.push(v.wrapper + selector + ' { ' + css + '; }')
    } else if (v.media) {
      if (!mediaGroups[v.media]) mediaGroups[v.media] = []
      mediaGroups[v.media].push('  ' + selector + ' { ' + css + '; }')
    }
  }
}
for (const [media, rules2] of Object.entries(mediaGroups)) {
  L.push('@media (' + media + ') {')
  L.push(...rules2)
  L.push('}')
}
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, L.join('\n'), 'utf8')
console.log('[jit] 生成 ' + rules.size + ' 条规则 → ' + OUT_FILE)
console.log('[jit] 体积: ' + fs.statSync(OUT_FILE).size + ' 字节')

// 自动追加 link 到 index.html
{
  const indexPath = path.join(path.dirname(OUT_FILE), 'index.html')
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8')
    // 去掉旧的
    html = html.replace(/<link rel="stylesheet" href="\.\/jit\.css[^"]*">\n?/g, '')
    const tag = '<link rel="stylesheet" href="./jit.css">'
    if (html.includes('<link rel="stylesheet" href="./ui.css">')) {
      html = html.replace('<link rel="stylesheet" href="./ui.css">', '<link rel="stylesheet" href="./ui.css">\n' + tag)
    } else {
      html = html.replace('</head>', tag + '\n</head>')
    }
    fs.writeFileSync(indexPath, html, 'utf8')
    console.log('[jit] index.html 已引用')
  }
}
