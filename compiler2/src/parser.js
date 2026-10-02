// XuNay 编译器 v2 - 语法分析
// 把 tag(...) 调用解析成 AST

import { TAGS } from './tokenizer.js'
import { wrapError } from './errors.js'

export function parse(src) {
  let pos = 0

  function skipWs() { while (pos < src.length && /\s/.test(src[pos])) pos++ }
  function match(c) { skipWs(); if (src[pos] === c) { pos++; return true } return false }
  function expect(c) { if (!match(c)) throw wrapError(src, pos, `期望 ${c}`) }

  function readIdent() {
    skipWs()
    let v = ''
    while (pos < src.length && /[\w$]/.test(src[pos])) { v += src[pos]; pos++ }
    return v
  }

  // 找到匹配的右括号
  function readBracket() {
    let depth = 1
    let v = ''
    while (pos < src.length && depth > 0) {
      const c = src[pos]
      if (c === '"' || c === "'" || c === '`') {
        const q = c; v += c; pos++
        while (pos < src.length && src[pos] !== q) { if (src[pos] === '\\') { v += src[pos] + src[pos+1]; pos += 2; continue } v += src[pos]; pos++ }
        v += src[pos] || ''; pos++
        continue
      }
      if (c === '(') depth++
      if (c === ')') { depth--; if (depth === 0) { pos++; break } }
      v += c; pos++
    }
    return v
  }

  // 读一个参数（到逗号或右括号）
  function readArg() {
    skipWs()
    let depth = 0
    let v = ''
    while (pos < src.length) {
      const c = src[pos]
      if (c === '"' || c === "'" || c === '`') {
        const q = c; v += c; pos++
        while (pos < src.length && src[pos] !== q) { if (src[pos] === '\\') { v += src[pos] + src[pos+1]; pos += 2; continue } v += src[pos]; pos++ }
        v += src[pos] || ''; pos++
        continue
      }
      if (c === '(' || c === '[' || c === '{') depth++
      if (c === ')' || c === ']' || c === '}') {
        if (depth === 0) break
        depth--
      }
      if (c === ',' && depth === 0) break
      v += c; pos++
    }
    return v.trim()
  }

  // 解析一个 tag 调用
  function parseTag() {
    skipWs()
    const name = readIdent()
    if (!TAGS.has(name)) return null

    expect('(')
    const propsStr = readArg()
    expect(',')

    const children = []
    while (true) {
      skipWs()
      if (src[pos] === ')') { pos++; break }
      const arg = readArg()
      if (arg) children.push(parseChild(arg))
      skipWs()
      if (src[pos] === ',') { pos++; continue }
      if (src[pos] === ')') { pos++; break }
    }

    return { type: 'tag', name, props: parseProps(propsStr), children }
  }

  function parseChild(arg) {
    arg = arg.trim()
    // 函数 → 动态文本
    if (/^\(\)\s*=>/.test(arg)) return { type: 'dyn', expr: arg }
    // 字符串字面量 → 静态
    if (/^["'`].*["'`]$/.test(arg)) return { type: 'text', expr: arg }
    // 数字 → 静态
    if (/^\d/.test(arg)) return { type: 'text', expr: arg }
    // 嵌套 tag 调用
    if (/^[a-z]+\(/.test(arg)) {
      const sub = arg.match(/^([a-z]+)\(/)
      if (sub && TAGS.has(sub[1])) {
        const saved = pos
        // 用 parseTag 解析子调用
        const subSrc = arg
        const subParser = parseSub(subSrc)
        if (subParser) return subParser
        pos = saved
      }
    }
    // 其他表达式 → 静态（编译时不确定）
    return { type: 'text', expr: arg }
  }

  function parseSub(src2) {
    let p = 0
    function skip() { while (p < src2.length && /\s/.test(src2[p])) p++ }
    function ident() { let v = ''; while (p < src2.length && /[\w$]/.test(src2[p])) { v += src2[p]; p++ } return v }
    function arg() {
      let depth = 0, v = ''
      while (p < src2.length) {
        const c = src2[p]
        if (c === '"' || c === "'" || c === '`') { const q = c; v += c; p++; while (p < src2.length && src2[p] !== q) { v += src2[p]; p++ } v += src2[p]||''; p++; continue }
        if (c === '(' || c === '[' || c === '{') depth++
        if (c === ')' || c === ']' || c === '}') { if (depth === 0) break; depth-- }
        if (c === ',' && depth === 0) break
        v += c; p++
      }
      return v.trim()
    }
    skip()
    const name = ident()
    if (!TAGS.has(name)) return null
    if (src2[p] !== '(') return null
    p++
    const propsStr = arg()
    skip(); if (src2[p] === ',') p++
    const children = []
    while (p < src2.length) {
      skip()
      if (src2[p] === ')') { p++; break }
      const a = arg()
      if (a) children.push(parseChild(a))
      skip()
      if (src2[p] === ',') { p++; continue }
      if (src2[p] === ')') { p++; break }
    }
    return { type: 'tag', name, props: parseProps(propsStr), children }
  }

  function parseProps(s) {
    s = s.trim()
    if (!s || s === 'null') return []
    if (!s.startsWith('{')) return null
    // 简单解析 { key: value, key2: value2 }
    s = s.slice(1, -1)
    const parts = splitTop(s)
    const out = []
    for (const p of parts) {
      const idx = p.indexOf(':')
      if (idx < 0) continue
      const k = p.slice(0, idx).trim()
      const v = p.slice(idx + 1).trim()
      out.push({ k, v })
    }
    return out
  }

  function splitTop(s) {
    const out = []
    let depth = 0, cur = ''
    for (let i = 0; i < s.length; i++) {
      const c = s[i]
      if (c === '"' || c === "'" || c === '`') { const q = c; cur += c; i++; while (i < s.length && s[i] !== q) { cur += s[i]; i++ } cur += s[i] || ''; continue }
      if (c === '(' || c === '[' || c === '{') depth++
      if (c === ')' || c === ']' || c === '}') depth--
      if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue }
      cur += c
    }
    if (cur.trim()) out.push(cur.trim())
    return out
  }

  // 扫描源代码，找出所有 tag 调用
  const result = []
  while (pos < src.length) {
    skipWs()
    if (pos >= src.length) break
    const c = src[pos]
    if (/[a-z]/.test(c)) {
      const saved = pos
      const name = readIdent()
      if (TAGS.has(name) && src[pos] === '(') {
        pos = saved
        const node = parseTag()
        if (node) {
          result.push({ type: 'raw', node, start: saved, end: pos })
          continue
        }
      }
      pos = saved + name.length
      continue
    }
    pos++
  }

  return result
}
