import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/hl.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.hlbug", s)

const from = `  for (const [re, cls] of rules) {
    out = out.replace(re, m => {
      if (m.indexOf('<span') === 0) return m
      const idx = marks.length
      marks.push('<span class="h-' + cls + '">' + m + '</span>')
      return '\\x00' + idx + '\\x00'
    })
  }

  out = out.replace(/\\x00(\\d+)\\x00/g, (_, i) => marks[+i])
  return out`

const to = `  for (const [re, cls] of rules) {
    out = out.replace(re, m => {
      if (m.indexOf('<span') === 0) return m
      const idx = marks.length
      marks.push('<span class="h-' + cls + '">' + m + '</span>')
      // 占位符用 base36 编码 + 前缀 X，避免后续的数字规则匹配到
      return '\\uE000X' + idx.toString(36) + '\\uE001'
    })
  }

  out = out.replace(/\\uE000X([0-9a-z]+)\\uE001/g, (_, i) => marks[parseInt(i, 36)])
  return out`

if (!s.includes(from)) throw new Error("未命中 highlight 主体")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("hl.js 修复完成")
