import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.autodef", s)

// 把 watch=1 判断改成默认开启，仅 ?nowatch=1 关闭
const from = "    if (!location.search.includes('watch=1')) return"
const to = "    if (location.search.includes('nowatch=1')) return"

if (!s.includes(from)) throw new Error("未命中 watch 判断")
s = s.replace(from, to)
writeFileSync(p, s)
console.log("自动刷新改为默认开启")
