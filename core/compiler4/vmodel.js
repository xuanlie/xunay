// compiler4/vmodel —— vmodel 转换（合并已有 on）
export function transformVmodel(source) {
  // 1. 找 vmodel: kw
  const re = /\bvmodel\s*:\s*([A-Za-z_$][\w$]*)/g
  let out = ''
  let last = 0
  let m
  while ((m = re.exec(source))) {
    const varName = m[1]
    const vmodelEnd = re.lastIndex

    // 检查后面是否已有 on: {...}
    let j = vmodelEnd
    // 跳过空白、逗号
    while (j < source.length && /[\s,]/.test(source[j])) j++
    // 跳过其它属性直到找到 on: { 或 }
    const rest = source.slice(j)
    const onMatch = rest.match(/^((?:[^{}]|\{[^{}]*\})*?)\bon\s*:\s*\{/)

    let replacement
    if (onMatch) {
      // 已有 on，合并进去
      const onOpen = j + onMatch[0].length
      const onClose = matchBracket(source, onOpen - 1, '{', '}')
      if (onClose > 0) {
        const onBody = source.slice(onOpen, onClose).trim()
        const newOn = `value: () => ${varName}(), on: { ${onBody}${onBody ? ', ' : ''}input: (e) => ${varName}(e.target.value) }`
        out += source.slice(last, m.index) + newOn
        last = onClose + 1
        re.lastIndex = onClose + 1
        continue
      }
    }
    // 没找到 on，单独生成
    replacement = `value: () => ${varName}(), on: { input: (e) => ${varName}(e.target.value) }`
    out += source.slice(last, m.index) + replacement
    last = vmodelEnd
    re.lastIndex = vmodelEnd
  }
  out += source.slice(last)
  return out
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
