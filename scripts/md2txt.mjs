import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs"

const files = process.argv.slice(2)
if (!files.length) { console.log("用法: node scripts/md2txt.mjs <file...>"); process.exit(1) }

function convert(s) {
  const lines = s.split("\n")
  const out = []
  let inCode = false
  for (let raw of lines) {
    // 代码围栏
    if (/^```/.test(raw.trim())) { inCode = !inCode; continue }
    if (inCode) { out.push("  " + raw); continue }

    // 标题：# X / ## X / ### X → X
    let line = raw.replace(/^#{1,6}\s+/, "")

    // 水平线
    if (/^[-*_]{3,}\s*$/.test(line.trim())) { out.push(""); continue }

    // 表格行：| a | b | → a  b
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const cells = line.split("|").slice(1, -1).map(c => c.trim())
      if (cells.every(c => /^:?-+:?$/.test(c))) continue  // 分隔行丢掉
      out.push("  " + cells.join("   "))
      continue
    }

    // 列表：- / * / + → 两空格缩进
    line = line.replace(/^(\s*)[-*+]\s+/, "$1  ")
    // 有序列表 1. → 保留
    // 粗体 **x** → x
    line = line.replace(/\*\*(.+?)\*\*/g, "$1")
    // 斜体 *x* → x
    line = line.replace(/(^|[^*])\*([^*]+)\*/g, "$1$2")
    // 行内代码 `x` → x
    line = line.replace(/`([^`]+)`/g, "$1")
    // 链接 [text](url) → text (url)
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    // 引用 > x → x
    line = line.replace(/^>\s?/, "")
    out.push(line)
  }
  // 压缩 3+ 空行为 2 空行
  let r = out.join("\n").replace(/\n{3,}/g, "\n\n")
  // 去首尾空行
  return r.replace(/^\n+|\n+$/g, "") + "\n"
}

for (const f of files) {
  if (!existsSync(f)) { console.log("跳过（不存在）", f); continue }
  const s = readFileSync(f, "utf8")
  const t = convert(s)
  writeFileSync(f + ".orig.md", s)
  writeFileSync(f, t)
  console.log("转", f, "(" + s.length + " → " + t.length + ")")
}
console.log("done")
