// compiler4/sdu —— sdu 模板编译器
// 语法：sdu<N> Comp($data)({ 子标签 })
// 编译：数据映射 → 调 Comp(item, 子元素)

let _sduUid = 0

const TAG_DEFAULT_ATTR = {
  img: 'src', video: 'src', audio: 'src', source: 'src',
  input: 'value', textarea: 'value', select: 'value',
}

export function transformSdu(source) {
  // 先处理内置模板 sdu Name({...})
  source = transformBuiltin(source)

  const re = /(^|[\s;{}()])sdu\s*<([^>]+)>\s+([A-Za-z_$][\w$]*)\s*(?:\(\s*([^()]*(?:\([^()]*\)[^()]*)*)\s*\))?\s*\(\s*\{/g
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(source))) {
    const objStart = m.index + m[0].length - 1
    const objEnd = matchBracket(source, objStart, '{', '}')
    if (objEnd < 0) {
      throw new SyntaxError(`[compile4:sdu] ${name} 参数括号未闭合，位置 ${m.index}`)
    }
    const body = source.slice(objStart + 1, objEnd)
    const code = compileSdu(m[2].trim(), m[3].trim(), (m[4] || '').trim(), body)
    let afterObj = objEnd + 1
    while (afterObj < source.length && /\s/.test(source[afterObj])) afterObj++
    if (source[afterObj] === ')') afterObj++
    out += source.slice(last, m.index) + m[1] + code
    last = afterObj
    re.lastIndex = afterObj
  }
  out += source.slice(last)
  return out
}

function compileSdu(countStr, compName, srcExpr, body) {
  const it = '_sdu' + (++_sduUid)
  const items = parseItems(body)

  // 自定义外层 class
  let customClass = null
  const clsMatch = body.match(/^\s*['"]([.\w-]+)['"]\s*:\s*true\s*$/m)
  if (clsMatch) customClass = clsMatch[1].replace(/^\./, '')
  const bodyNoCls = customClass ? body.replace(/^\s*['"]([.\w-]+)['"]\s*:\s*true\s*$/m, '') : body

  // if 条件
  let cond = null
  const ifMatch = bodyNoCls.match(/^\s*if\s*:\s*(.+?)\s*$/m)
  if (ifMatch) cond = ifMatch[1].trim()

  // @media
  const medias = []
  const mediaRe = /^\s*@media\s*\(([^)]+)\)\s*:\s*\{(.+?)\}/gm
  let mm
  while ((mm = mediaRe.exec(bodyNoCls))) medias.push({ query: mm[1].trim(), rules: mm[2].trim() })

  const cleanBody = bodyNoCls
    .replace(/^\s*if\s*:\s*.+?\s*$/gm, '')
    .replace(/^\s*@media\s*\([^)]+\)\s*:\s*\{.+?\}/gm, '')

  const realItems = parseItems(cleanBody)
  const children = buildChildren(realItems, it)

  // 数据源表达式
  let dataExpr
  if (srcExpr) {
    // $LIST → LIST，或表达式
    const src = srcExpr.startsWith('$') ? srcExpr.slice(1) : srcExpr
    dataExpr = `((typeof ${src} === 'function' ? (${src}.__xunay_signal ? ${src}() : ${src}(${countStr})) : ${src}) || [])`
  } else {
    dataExpr = `Array.from({ length: ${countStr} }, function(){ return {} })`
  }

  // 生成一个 map
  const mapFn = `function(${it}) { return ${compName}(${it}${children ? ', ' + children : ''}) }`
  const listExpr = `${dataExpr}.slice(0, ${countStr}).map(${mapFn})`

  // 无 children + 无自定义 class → 直接展开，不包 wrapper（保留 CSS grid 布局）
  const hasChildren = children && children.trim()

  // @media 注入
  let cssInj = ''
  if (medias.length) {
    const cssId = 'sdu-' + (++_sduUid) + '-css'
    const cls = customClass || 'sdu-wrap'
    const rules = medias.map(m => '@media (' + m.query + '){.' + cls + '{' + m.rules + '}}').join('\n')
    cssInj = `if (typeof document !== 'undefined' && !document.getElementById('${cssId}')) { var _st = document.createElement('style'); _st.id = '${cssId}'; _st.textContent = ${JSON.stringify(rules)}; document.head.appendChild(_st); } `
  }

  let fnBody
  if (!hasChildren && !customClass) {
    // 无子元素、无自定义 class → 直接展开到父容器
    fnBody = `${cssInj}return ${listExpr}`
    if (cond) {
      return `((function(){ var _c = (${cond}); if (!_c) return []; return (function(){ ${fnBody} })(); })())`
    }
    return `((function(){ ${fnBody} })())`
  }

  // 有子元素或有自定义 class → 包 wrapper
  const outerProps = customClass ? `{ class: '${customClass}' }` : `{ class: 'sdu-wrap' }`
  fnBody = `${cssInj}var _list = ${listExpr}; return div(${outerProps}, ..._list)`

  if (cond) {
    return `((function(){ var _c = (${cond}); if (!_c) return null; return (function(){ ${fnBody} })(); })())`
  }
  return `((function(){ ${fnBody} })())`
}

function buildChildren(items, it) {
  return items.map(({ tag, cls, expr, attrs }) => {
    const defAttr = TAG_DEFAULT_ATTR[tag]
    const props = []
    const events = []
    const classParts = []
    if (cls) classParts.push(JSON.stringify(cls))

    if (attrs) for (const [k, v] of attrs) {
      const val = wrapFields(v, it)
      if (k.startsWith('@')) {
        const mm = k.slice(1).match(/^([\w$]+)((?:\.[\w]+)*)$/)
        if (!mm) continue
        const evName = mm[1]
        const mods = mm[2] ? mm[2].slice(1).split('.') : []
        let fnExpr = val
        if (mods.includes('stop')) fnExpr = `(e) => { e.stopPropagation(); (${val})(e) }`
        events.push(`${evName}: ${fnExpr}`)
      } else if (k === 'c') {
        classParts.push(val)
      } else if (k === 'i') {
        props.push(`id: ${val}`)
      } else {
        props.push(`${JSON.stringify(k)}: ${val}`)
      }
    }
    if (classParts.length === 1) props.unshift(`class: ${classParts[0]}`)
    else if (classParts.length > 1) props.unshift(`class: [${classParts.join(', ')}].filter(Boolean).join(' ')`)

    const e = expr ? wrapFields(expr, it) : '""'
    if (defAttr && !props.some(p => p.startsWith(JSON.stringify(defAttr)))) {
      props.unshift(`${JSON.stringify(defAttr)}: ${e}`)
    }
    if (events.length) props.push(`on: { ${events.join(', ')} }`)

    if (defAttr) return `${tag}({ ${props.join(', ')} })`
    if (props.length) return `${tag}({ ${props.join(', ')} }, ${e})`
    return `${tag}(null, ${e})`
  }).join(', ')
}

function wrapFields(expr, it) {
  const strs = []
  const masked = expr.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, (m) => {
    strs.push(m); return '__WSTR' + (strs.length - 1) + '__'
  })
  const replaced = masked.replace(/@([A-Za-z_$][\w$]*)/g, (_, n) => it + '.' + n)
  return replaced.replace(/__WSTR(\d+)__/g, (_, i) => strs[+i])
}

function parseItems(body) {
  const items = []
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('//')) continue
    if (line.startsWith('if:') || line.startsWith('@media')) continue
    if (/^['"]\.[\w-]+['"]\s*:\s*true\s*$/.test(line)) continue
    if (/^['"][\w-]+['"]\s*:\s*true\s*$/.test(line)) continue

    // tag.cls: expr  或  tag: expr  或  tag: { attrs }
    const m = line.match(/^([a-zA-Z][\w-]*)(?:\.([a-zA-Z_][\w-]*))?\s*:\s*(.+)$/)
    if (!m) continue
    const tag = m[1], cls = m[2], rest = m[3].trim()
    if (rest.startsWith('{') && rest.endsWith('}')) {
      const attrs = []
      for (const part of splitTopLevel(rest.slice(1, -1))) {
        const am = part.match(/^\s*(@[\w$]+(?:\.[\w]+)*|[\w$]+|'[^']*'|"[^"]*")\s*:\s*(.+?)\s*$/)
        if (am) {
          let k = am[1]
          if ((k[0] === "'" && k.slice(-1) === "'") || (k[0] === '"' && k.slice(-1) === '"')) k = k.slice(1, -1)
          attrs.push([k, am[2]])
        }
      }
      items.push({ tag, cls, expr: '', attrs })
    } else {
      items.push({ tag, cls, expr: rest, attrs: null })
    }
  }
  return items
}

function splitTopLevel(str) {
  const parts = []
  let depth = 0, inStr = null, start = 0
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (inStr) { if (c === '\\') { i++; continue } if (c === inStr) inStr = null; continue }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue }
    if (c === '(' || c === '[' || c === '{') depth++
    else if (c === ')' || c === ']' || c === '}') depth--
    else if (c === ',' && depth === 0) { parts.push(str.slice(start, i)); start = i + 1 }
  }
  parts.push(str.slice(start))
  return parts
}

function matchBracket(src, start, open, close) {
  if (src[start] !== open) return -1
  let depth = 0, i = start, inStr = null, comment = null
  while (i < src.length) {
    const c = src[i], n = src[i + 1]
    if (comment === 'line') { if (c === '\n') comment = null; i++; continue }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = null; i += 2; continue } i++; continue }
    if (inStr) { if (c === '\\') { i += 2; continue } if (c === inStr) inStr = null; i++; continue }
    if (c === '/' && n === '/') { comment = 'line'; i += 2; continue }
    if (c === '/' && n === '*') { comment = 'block'; i += 2; continue }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return i }
    i++
  }
  return -1
}

// ── 内置模板（sdu NavBar({...}) 不带 <N>）──
import { BUILTINS } from './builtins.js'

function transformBuiltin(source) {
  const names = Object.keys(BUILTINS).join('|')
  const re = new RegExp('\\bsdu\\s+(' + names + ')\\s*\\(', 'g')
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(source))) {
    const name = m[1]
    const parenStart = m.index + m[0].length - 1
    const parenEnd = matchBracket(source, parenStart, '(', ')')
    if (parenEnd < 0) { re.lastIndex = m.index + 1; continue }
    const argsSrc = source.slice(parenStart + 1, parenEnd).trim()

    let obj = {}
    if (argsSrc.startsWith('{') && argsSrc.endsWith('}')) {
      for (const part of splitTopLevel(argsSrc.slice(1, -1))) {
        const mm = part.match(/^\s*([A-Za-z_$][\w$]*)\s*:\s*(.+?)\s*$/)
        if (mm) obj[mm[1]] = mm[2]
      }
    }

    let code
    try {
      const generated = BUILTINS[name](obj)
      if (typeof generated !== 'string' || !generated.trim()) {
        throw new TypeError('模板生成结果必须是非空字符串')
      }
      code = '(' + generated + ')'
    } catch (e) {
      const err = new Error(`[compile4:sdu] 内置模板 ${name} 生成失败: ${e.message}`)
      err.cause = e
      throw err
    }

    out += source.slice(last, m.index) + code
    last = parenEnd + 1
    re.lastIndex = parenEnd + 1
  }
  out += source.slice(last)
  return out
}
