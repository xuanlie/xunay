import { readFileSync, writeFileSync } from "node:fs"
const p = "bin/xuyc.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.l73", s)

const lines = s.split("\n")
lines[72] = "  src = src.replace(/^(\\s*import\\s+[^\\n]*?\\s+from\\s+)['\"]xunay['\"]/gm, (m, prefix) => prefix + \"'\" + xunayPath.replace(/\\\\/g, '/') + \"'\")"

writeFileSync(p, lines.join("\n"))
console.log("73 行已替换")
console.log("新内容:", lines[72])
