// compiler4/event —— @event / onClick 转换（字符级扫描，支持箭头函数体）
export function transformEvent(source) {
  // 1. onClick: fn → on: { click: fn }
  source = scanReplace(source, 'onClick', 'click')

  // 2. '@event.mods': fn → on: { event: 包装后的fn }
  source = scanReplace(source, null, null, true)

  return source
}

// 通用的"识别 @xxx.mods: 或 onClick: 后的完整表达式"扫描器
function scanReplace(source, plainKey, plainEv, bracketMode = false) {
  let out = ''
  let i = 0
  while (i < source.length) {
    let key = null, keyStart = -1, keyEnd = -1, evName = null, mods = []

    // 匹配 '@event.mods' 或 "@event.mods"
    if (bracketMode && (source[i] === "'" || source[i] === '"')) {
      const q = source[i]
      const m = source.slice(i).match(new RegExp('^' + q.replace(/[$^*+?.()|[\]{}]/g, '\\$&') + '@([a-z]+)((?:\\.[a-z]+)*)' + q.replace(/[$^*+?.()|[\]{}]/g, '\\$&')))
      if (m) {
        evName = m[1]
        mods = m[2] ? m[2].slice(1).split('.') : []
        keyStart = i
        keyEnd = i + m[0].length
      }
    }
    // 匹配 onClick
    else if (!bracketMode && plainKey) {
      if (source.slice(i, i + plainKey.length + 1).match(new RegExp('^' + plainKey + '\\b'))) {
        evName = plainEv
        keyStart = i
        keyEnd = i + plainKey.length
      }
    }

    if (keyStart < 0) {
      if (source[i] === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') { out += source[i]; i++ }
        continue
      }
      if (source[i] === '/' && source[i + 1] === '*') {
        out += '/*'; i += 2
        while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) { out += source[i]; i++ }
        if (i < source.length) { out += '*/'; i += 2 }
        continue
      }
      if (source[i] === "'" || source[i] === '"' || source[i] === '`') {
        const q = source[i]
        out += q; i++
        while (i < source.length) {
          if (source[i] === '\\') { out += source[i]; i++; if (i < source.length) { out += source[i]; i++ } continue }
          if (source[i] === q) { out += q; i++; break }
          out += source[i]; i++
        }
        continue
      }
      out += source[i]
      i++
      continue
    }

    // 找冒号
    let j = keyEnd
    while (j < source.length && /\s/.test(source[j])) j++
    if (source[j] !== ':') {
      out += source.slice(i, keyEnd)
      i = keyEnd
      continue
    }
    j++
    while (j < source.length && /\s/.test(source[j])) j++

    // 扫描完整的表达式（arrow fn / function / 标识符）
    const exprEnd = scanExpr(source, j)
    if (exprEnd < 0) {
      out += source.slice(i, keyEnd)
      i = keyEnd
      continue
    }

    const expr = source.slice(j, exprEnd).trim()

    // 生成替换
    let wrapped = expr
    if (mods.includes('stop') && mods.includes('prevent')) {
      wrapped = `(e) => { e.stopPropagation(); e.preventDefault(); (${expr})(e) }`
    } else if (mods.includes('stop')) {
      wrapped = `(e) => { e.stopPropagation(); (${expr})(e) }`
    } else if (mods.includes('prevent')) {
      wrapped = `(e) => { e.preventDefault(); (${expr})(e) }`
    }

    // 合并到已存在的 on: {...} 里
    const lastOnRe = /on:\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*,?\s*$/
    const m = out.match(lastOnRe)
    if (m) {
      // 已有 on，把新事件加进去
      const prev = m[1].trim().replace(/,\s*$/, '')
      out = out.replace(lastOnRe, 'on: { ' + prev + (prev ? ', ' : '') + evName + ': ' + wrapped + ' },')
    } else {
      out += 'on: { ' + evName + ': ' + wrapped + ' }'
    }
    i = exprEnd
  }
  return out
}

// 从 start 位置扫描一个"完整表达式"的结尾
function scanExpr(src, start) {
  let i = start
  // 跳过箭头函数的参数列表
  if (src[i] === '(') {
    i = matchBracket(src, i, '(', ')')
    if (i < 0) return -1
    i++
    while (i < src.length && /\s/.test(src[i])) i++
    if (src[i] === '=' && src[i + 1] === '>') {
      i += 2
      while (i < src.length && /\s/.test(src[i])) i++
      // 箭头后面：可能是 { } 或表达式
      if (src[i] === '{') {
        i = matchBracket(src, i, '{', '}')
        if (i < 0) return -1
        return i + 1
      }
      // 表达式：扫到 , 或 }（同级）
      return scanToDelimiter(src, i)
    }
    return -1
  }
  // 单个标识符（函数名）
  if (/[A-Za-z_$]/.test(src[i])) {
    let j = i
    while (j < src.length && /[\w$.]/.test(src[j])) j++
    return j
  }
  // function(...) {...}
  if (src.slice(i, i + 8) === 'function') {
    let j = i + 8
    while (j < src.length && /\s/.test(src[j])) j++
    if (src[j] === '(') {
      j = matchBracket(src, j, '(', ')')
      if (j < 0) return -1
      j++
      while (j < src.length && /\s/.test(src[j])) j++
      if (src[j] === '{') {
        j = matchBracket(src, j, '{', '}')
        if (j < 0) return -1
        return j + 1
      }
    }
  }
  return -1
}

// 从 start 扫到同级 , 或 } 之前
function scanToDelimiter(src, start) {
  let i = start, depth = 0, inStr = null
  while (i < src.length) {
    const c = src[i]
    if (inStr) {
      if (c === '\\') { i += 2; continue }
      if (c === inStr) inStr = null
      i++; continue
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue }
    if (c === '(' || c === '[' || c === '{') depth++
    else if (c === ')' || c === ']' || c === '}') {
      if (depth === 0) return i
      depth--
    } else if (c === ',' && depth === 0) {
      return i
    }
    i++
  }
  return i
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
