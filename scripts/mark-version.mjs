import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.mark", s)

const anchor = "  const S = window.__XD__ = {"
if (!s.includes(anchor)) throw new Error("未找到 S 定义")

s = s.replace(anchor, `  const __BUILD__ = 'v10-27'
  console.log('[devtools] build', __BUILD__)
  const S = window.__XD__ = {
    build: __BUILD__,`)

writeFileSync(p, s)
console.log("版本标记已加")
