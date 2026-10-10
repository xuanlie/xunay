// XuNay 编译器 v2 - 代码生成
import { parse as __parse } from './parser.js'

let varCounter = 0
function nextVar(prefix) { return `_${prefix}${varCounter++}` }

export function resetVars() { varCounter = 0 }

export function genNode(node, indent, out) {
  const pad = '  '.repeat(indent)

  if (node.type === 'text') {
    return { code: node.expr, isStatic: true }
  }

  if (node.type === 'dyn') {
    return { code: node.expr, isDynamic: true }
  }

  if (node.type === 'tag') {
    const v = nextVar(node.name)
    const lines = []
    lines.push(`${pad}const ${v} = document.createElement(${JSON.stringify(node.name)})`)

    if (node.props) {
      for (const p of node.props) {
        if (p.k === 'ref') {
          lines.push(`${pad}if (typeof (${p.v}) === 'function') (${p.v})(${v})`)
        } else if (p.k === 'on') {
          const inner = p.v.trim().replace(/^\{|\}$/g, '')
          for (const part of splitTopCommas(inner)) {
            const idx = part.indexOf(':')
            if (idx < 0) continue
            const evt = part.slice(0, idx).trim()
            const handler = part.slice(idx + 1).trim()
            lines.push(`${pad}${v}.addEventListener(${JSON.stringify(evt)}, ${handler})`)
          }
        } else if (p.k === 'class' || p.k === 'className') {
          if (p.v.startsWith('{')) {
            lines.push(`${pad}${v}.className = ${parseClassObj(p.v)}`)
          } else if (p.v.includes('=>')) {
            lines.push(`${pad}__rt__.bindAttr(${v}, "class", ${p.v})`)
          } else {
            lines.push(`${pad}${v}.className = ${p.v}`)
          }
        } else if (p.k === 'style') {
          lines.push(`${pad}Object.assign(${v}.style, ${p.v})`)
        } else if (p.k === 'value') {
          lines.push(`${pad}${v}.value = ${p.v}`)
        } else if (p.k === 'checked' || p.k === 'disabled' || p.k === 'selected') {
          if (p.v.includes('=>')) {
            lines.push(`${pad}__rt__.bindAttr(${v}, ${JSON.stringify(p.k)}, ${p.v})`)
          } else {
            lines.push(`${pad}${v}.${p.k} = ${p.v}`)
          }
        } else if (p.k === 'html') {
          lines.push(`${pad}${v}.innerHTML = ${p.v}`)
        } else if (p.v.startsWith('()')) {
          lines.push(`${pad}__rt__.bindAttr(${v}, ${JSON.stringify(p.k)}, ${p.v})`)
        } else {
          lines.push(`${pad}${v}.setAttribute(${JSON.stringify(p.k)}, ${p.v})`)
        }
      }
    }

    // 子节点：生成 + appendChild
    for (const c of node.children) {
      const r = genChild(c, indent, lines)
      if (r) lines.push(`${pad}${v}.appendChild(${r.code})`)
    }

    return { code: v, lines, varName: v }
  }

  return { code: 'null' }
}

function genChild(node, indent, lines) {
  const pad = '  '.repeat(indent)

  if (node.type === 'text') {
    const t = nextVar('t')
    if (/^["'`]/.test(node.expr)) {
      lines.push(`${pad}const ${t} = document.createTextNode(${node.expr})`)
    } else if (/^\d/.test(node.expr)) {
      lines.push(`${pad}const ${t} = document.createTextNode(String(${node.expr}))`)
    } else {
      lines.push(`${pad}const ${t} = __rt__.renderChild(${node.expr})`)
    }
    return { code: t }
  }

  if (node.type === 'dyn') {
    const t = nextVar('t')
    lines.push(`${pad}const ${t} = document.createTextNode('')`)
    lines.push(`${pad}__rt__.bindText(${t}, ${node.expr})`)
    return { code: t }
  }

  if (node.type === 'expr') {
    const t = nextVar('t')
    const subNodes = __parse(node.src)

    // 快路径：cond ? tagA(...) : tagB(...)，直接生成 if/else，不创建 IIFE。
    if (subNodes.length === 2) {
      const ordered = [...subNodes].sort((a, b) => a.start - b.start)
      const [a, b] = ordered
      const before = node.src.slice(0, a.start)
      const between = node.src.slice(a.end, b.start)
      const after = node.src.slice(b.end)
      const match = before.match(/^([\s\S]*?)\?\s*$/)
      console.error('[TERNARY DEBUG]', {
        count: subNodes.length,
        aType: a?.type,
        aNodeType: a?.node?.type,
        bType: b?.type,
        bNodeType: b?.node?.type,
        before,
        between,
        after,
        match: match?.[1]
      })
      if (
        match &&
        between.trim() === ':' &&
        after.trim() === '' &&
        a.node.type === 'tag' &&
        b.node.type === 'tag' &&
        match[1].trim()
      ) {
        const t = nextVar('t')
        const innerPad = '  '.repeat(indent + 1)
        const left = genNode(a.node, indent + 1, [])
        const right = genNode(b.node, indent + 1, [])
        lines.push(`${pad}let ${t}`)
        lines.push(`${pad}if (${match[1].trim()}) {`)
        for (const line of left.lines) lines.push(line)
        lines.push(`${innerPad}${t} = ${left.varName}`)
        lines.push(`${pad}} else {`)
        for (const line of right.lines) lines.push(line)
        lines.push(`${innerPad}${t} = ${right.varName}`)
        lines.push(`${pad}}`)
        return { code: t }
      }
    }

    // 快路径：表达式仅包含一个标签，直接生成 DOM 节点。
    // 保留当前词法作用域，省去 IIFE 和 renderChild。
    const only = subNodes.length === 1 ? subNodes[0] : null
    if (
      only &&
      only.node.type === 'tag' &&
      node.src.slice(0, only.start).trim() === '' &&
      node.src.slice(only.end).trim() === ''
    ) {
      const sub = genNode(only.node, indent, [])
      for (const line of sub.lines) lines.push(line)
      return { code: sub.varName }
    }

    let code = node.src
    if (subNodes.length > 0) {
      const sorted = [...subNodes].sort((a, b) => b.start - a.start)
      for (const r of sorted) {
        const sub = genNode(r.node, 0, [])
        let block = '(() => {\n'
        for (const l of sub.lines) block += '  ' + l + '\n'
        block += `  return ${sub.varName}\n})()`
        code = code.slice(0, r.start) + block + code.slice(r.end)
      }
    }
    lines.push(`${pad}const ${t} = __rt__.renderChild(${code})`)
    return { code: t }
  }

  if (node.type === 'tag') {
    const sub = genNode(node, indent, lines)
    for (const l of sub.lines) lines.push(l)
    return { code: sub.varName }
  }

  return null
}

function splitTopCommas(s) {
  const out = []
  let depth = 0, cur = '', i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c; cur += c; i++
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') { cur += s[i] + s[i+1]; i += 2; continue } cur += s[i]; i++ }
      cur += s[i] || ''; i++; continue
    }
    if (c === '(' || c === '[' || c === '{') depth++
    if (c === ')' || c === ']' || c === '}') depth--
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; i++; continue }
    cur += c; i++
  }
  if (cur.trim()) out.push(cur)
  return out
}

function parseClassObj(s) {
  s = s.slice(1, -1)
  const parts = s.split(',').map(x => x.trim()).filter(Boolean)
  const exprs = []
  for (const p of parts) {
    const idx = p.indexOf(':')
    if (idx < 0) continue
    const k = p.slice(0, idx).trim()
    const v = p.slice(idx + 1).trim()
    if (v === 'true') exprs.push(`${JSON.stringify(k)}`)
    else if (v === 'false') { /* skip */ }
    else exprs.push(`(${v} ? ${JSON.stringify(k)} : '')`)
  }
  if (!exprs.length) return "''"
  return exprs.join(` + ' ' + `)
}


export function genFunction(name, rawNodes, body) {
  resetVars()

  const ordered = [...rawNodes].sort((a, b) => a.start - b.start)
  const consumed = new Set()
  const edits = []

  // 识别简单变量声明中的：条件 ? 标签调用 : 标签调用
  for (let i = 0; i + 1 < ordered.length; i++) {
    const a = ordered[i]
    const b = ordered[i + 1]

    if (a.node?.type !== 'tag' || b.node?.type !== 'tag') continue

    const lineStart = body.lastIndexOf('\n', a.start - 1) + 1
    const prefix = body.slice(lineStart, a.start)
    const match = prefix.match(
      /^([ \t]*)(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]*?)\?\s*$/
    )

    if (!match || body.slice(a.end, b.start).trim() !== ':') continue

    const condition = match[4].trim()
    if (!condition || /[;{}]\s*$/.test(condition)) continue

    let end = b.end
    if (body[end] === ';') end++

    // 仅处理分支标签之后直接结束的声明，避免误改复杂表达式
    if (!/^\s*(?:;|$|\r?\n)/.test(body.slice(b.end))) continue

    const indent = match[1]
    const variable = match[3]
    const left = genNode(a.node, 1, [])
    const right = genNode(b.node, 1, [])

    const lines = [
      `${indent}let ${variable};`,
      `${indent}if (${condition}) {`,
      ...left.lines,
      `  ${variable} = ${left.varName}`,
      `${indent}} else {`,
      ...right.lines,
      `  ${variable} = ${right.varName}`,
      `${indent}}`
    ]

    edits.push({
      start: lineStart,
      end,
      replacement: lines.join('\n')
    })

    consumed.add(a)
    consumed.add(b)
    i++
  }

  // 普通标签仍走原有生成路径
  for (const r of ordered) {
    if (consumed.has(r)) continue

    const sub = genNode(r.node, 0, [])
    const prefix = body.slice(0, r.start)
    let replacement

    if (/=>\s*$/.test(prefix)) {
      replacement = '{\n'
      for (const line of sub.lines) replacement += '  ' + line + '\n'
      replacement += `  return ${sub.varName}\n}`
    } else {
      replacement = '(() => {\n'
      for (const line of sub.lines) replacement += '  ' + line + '\n'
      replacement += `  return ${sub.varName}\n})()`
    }

    edits.push({ start: r.start, end: r.end, replacement })
  }

  // 必须从后往前替换，保持所有原始源码偏移有效
  edits.sort((a, b) => b.start - a.start)

  let result = body
  for (const edit of edits) {
    result =
      result.slice(0, edit.start) +
      edit.replacement +
      result.slice(edit.end)
  }

  return result
}
