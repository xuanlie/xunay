import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/hl.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.hlrewrite", s)

const lines = s.split("\n")
// 找 highlight 函数起始行（0-based）
let start = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("export function highlight(")) { start = i; break }
}
if (start < 0) throw new Error("未找到 highlight")

// 保留前面，重写从 highlight 开始的全部内容
const head = lines.slice(0, start).join("\n")

const tail = `export function highlight(code, lang) {
  const rules = RULES[lang] || RULES.js
  let out = esc(code)
  const marks = []

  for (const [re, cls] of rules) {
    out = out.replace(re, m => {
      if (m.indexOf('<span') >= 0) return m
      const idx = marks.length
      marks.push('<span class="h-' + cls + '">' + m + '</span>')
      return '\\uE000' + idx.toString(36) + '\\uE001'
    })
  }

  out = out.replace(/\\uE000([0-9a-z]+)\\uE001/g, (_, i) => marks[parseInt(i, 36)])
  return out
}

export const languages = Object.keys(RULES)
`

writeFileSync(p, head + "\n" + tail)
console.log("highlight 重写完成")
