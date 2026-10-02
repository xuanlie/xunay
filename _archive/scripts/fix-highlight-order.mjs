import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/hl.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.hlorder", s)

const lines = s.split("\n")
let start = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("export function highlight(")) { start = i; break }
}
if (start < 0) throw new Error("未找到 highlight")

const head = lines.slice(0, start).join("\n")

const tail = `export function highlight(code, lang) {
  const rules = RULES[lang] || RULES.js
  const marks = []
  let out = code

  // 第一步：在原始文本上 token 化
  for (const [re, cls] of rules) {
    out = out.replace(re, m => {
      if (m.indexOf('\\uE000') >= 0) return m
      const idx = marks.length
      marks.push({ cls: cls, text: m })
      return '\\uE000' + String.fromCharCode(0xE100 + idx) + '\\uE001'
    })
  }

  // 第二步：转义剩余的普通文本（& < >）
  out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 第三步：把占位符恢复成带样式的 span（token 文本也做转义）
  out = out.replace(/\\uE000([\\uE100-\\uE8FF]+)\\uE001/g, (_, ch) => {
    const m = marks[ch.charCodeAt(0) - 0xE100]
    if (!m) return ''
    const text = m.text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return '<span class="h-' + m.cls + '">' + text + '</span>'
  })

  return out
}

export const languages = Object.keys(RULES)
`

writeFileSync(p, head + "\n" + tail)
console.log("highlight 重写完成")
