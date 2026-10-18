// compiler4/xuy —— 嵌套生成器
// 数据源：
//   $VAR  → 模块级变量（顶层）
//   #VAR  → 同上（旧写法）
//   cVAR  → 同上（class 风格）
//   字段名（不带前缀）→ 从外层当前项取字段

export function transformXuy(source) {
  const re = /(^|[\s;{}()])xuy\s+([A-Za-z_$][\w$]*)\s*=\s*(\([^()]*(?:\([^()]*\)[^()]*)*\)(?:\s*\.psc\s*\([^()]*(?:\([^()]*\)[^()]*)*\))*)[ \t]*;?/g
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(source))) {
    const code = buildXuy(m[2], m[3])
    out += source.slice(last, m.index) + m[1] + code + '\n'
    last = m.index + m[0].length
    re.lastIndex = last
  }
  out += source.slice(last)
  return out
}

function buildXuy(name, expr) {
  const parts = []
  const first = expr.match(/^\(([^()]*(?:\([^()]*\)[^()]*)*)\)/)
  if (!first) {
    throw new SyntaxError(`[compile4:xuy] ${name} 的首层参数无法解析；请检查括号和参数格式`)
  }
  parts.push(parseTuple(first[1]))

  const pscRe = /\.psc\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g
  let p
  while ((p = pscRe.exec(expr))) parts.push(parseTuple(p[1]))

  return `export function ${name}() {
  return ${buildNested(parts, 0)}
}`
}

function parseTuple(s) {
  const args = splitArgs(s)
  const raw = (args[1] || '').trim()
  return {
    tag: (args[0] || 'div').trim(),
    data: raw,
    // 顶层用 $/#/c 前缀；内层不带前缀 = 从父项取字段
    isGlobal: !raw || raw.startsWith('$') || raw.startsWith('#') || /^c[A-Z]/.test(raw),
    count: (args[2] || '1').trim(),
  }
}

function splitArgs(s) {
  const parts = []
  let depth = 0, inStr = null, cur = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      cur += c
      if (c === '\\') { cur += s[++i] || ''; continue }
      if (c === inStr) inStr = null
    } else if (c === '"' || c === "'" || c === '`') { inStr = c; cur += c }
    else if (c === '(' || c === '[' || c === '{') { depth++; cur += c }
    else if (c === ')' || c === ']' || c === '}') { depth--; cur += c }
    else if (c === ',' && depth === 0) { parts.push(cur); cur = '' }
    else cur += c
  }
  if (cur.trim()) parts.push(cur)
  return parts
}

function resolveGlobal(sel) {
  if (!sel) return null
  let s = sel.trim()
  if (s.startsWith('$')) s = s.slice(1)
  else if (s.startsWith('#')) s = s.slice(1)
  else if (s.startsWith('c') && /^c[A-Z]/.test(s)) s = s.slice(1)
  return s
}

function buildNested(parts, i, parentVar) {
  if (i >= parts.length) return 'null'
  const p = parts[i]
  const idx = '_i' + i

  // 数据源表达式
  let dataExpr
  if (p.isGlobal) {
    const g = resolveGlobal(p.data)
    if (g) {
      dataExpr = `((typeof ${g} === 'function' ? ${g}(${p.count}) : ${g}) || [])`
    } else {
      dataExpr = `Array.from({ length: ${p.count} }, function(){ return {} })`
    }
  } else {
    // 从父项取字段
    if (!parentVar) {
      // 没有父级 → 用空数组
      dataExpr = `[]`
    } else {
      dataExpr = `((${parentVar}.${p.data}) || [])`
    }
  }

  // 最内层
  if (i === parts.length - 1) {
    return `(${dataExpr}).slice(0, ${p.count}).map(function(${idx}) { return ${p.tag}(${idx}) })`
  }

  // 中间层
  const inner = buildNested(parts, i + 1, idx)
  return `(${dataExpr}).slice(0, ${p.count}).map(function(${idx}) { return ${p.tag}(${idx}, ...${inner}) })`
}
