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
    lines.push(`${pad}const ${t} = document.createElement('span')`)
    lines.push(`${pad}${t}.style.display = 'contents'`)
    lines.push(`${pad}__rt__.bindText(${t}, ${node.expr})`)
    return { code: t }
  }

  if (node.type === 'expr') {
    const t = nextVar('t')
    const subNodes = __parse(node.src)
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
  let bodyCode = body
  const sorted = [...rawNodes].sort((a, b) => b.start - a.start)
  for (const r of sorted) {
    const sub = genNode(r.node, 0, [])
    let block = '(() => {\n'
    for (const l of sub.lines) block += '  ' + l + '\n'
    block += `  return ${sub.varName}\n})()`
    bodyCode = bodyCode.slice(0, r.start) + block + bodyCode.slice(r.end)
  }
  return bodyCode
}
