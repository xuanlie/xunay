import { readFileSync, writeFileSync } from "node:fs"
const p = "bin/xuyc.js"
let s = readFileSync(p, "utf8")

// 1. 配置读取（如果没加过）
if (!s.includes("readXunayConfig")) {
  const anchor = "const ROOT = path.resolve(__dirname, '..')"
  s = s.replace(anchor, anchor + `

function readXunayConfig() {
  const files = [
    path.join(process.cwd(), 'package.json'),
    path.join(ROOT, 'package.json'),
  ]
  for (const f of files) {
    if (!fs.existsSync(f)) continue
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'))
      if (j.xunay) return j.xunay
    } catch (e) {}
  }
  return {}
}
const XUNAY_CFG = readXunayConfig()
const DEVTOOLS_OFF = XUNAY_CFG.devtools === false
console.log('[xuyc] devtools:', DEVTOOLS_OFF ? 'off' : 'on')`)
}

// 2. 在含 xunayPath 的那行后面插入 devtools 剔除逻辑
const lines = s.split("\n")
const out = []
let inserted = false
for (const line of lines) {
  out.push(line)
  if (!inserted && line.includes("xunayPath.replace") && line.includes("src = src.replace")) {
    out.push("")
    out.push("  if (DEVTOOLS_OFF) {")
    out.push("    src = src.replace(/import\\s+['\"]\\.\\/src\\/devtools\\.js['\"]\\s*;?/g, '/* devtools off */')")
    out.push("  }")
    inserted = true
  }
}
if (!inserted) throw new Error("未找到插入点")
writeFileSync(p, out.join("\n"))
console.log("done, 插入:", inserted)
