import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.fixdup", s)

// 快捷操作块里，把 url → actUrl, reqH → actReqH
const startMark = "    d.appendChild(mk('div', '__xd_dsec__', '快捷操作'))"
const endMark = "    mainEl.appendChild(d)"
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark, i1 + startMark.length)
if (i1 < 0 || i2 < 0) throw new Error("未找到快捷操作段")

let block = s.slice(i1, i2)
block = block.replace(/\bconst url = n\.url\b/, "const actUrl = n.url")
block = block.replace(/\bconst reqH = n\.reqHeaders \|\| \{\}/, "const actReqH = n.reqHeaders || {}")
block = block.replace(/\burl\b/g, "actUrl")
block = block.replace(/\breqH\b/g, "actReqH")
// 恢复被误伤的字段访问
block = block.replace(/n\.actUrl/g, "n.url")
block = block.replace(/n\.actReqH/g, "n.reqHeaders")

s = s.slice(0, i1) + block + s.slice(i2)
writeFileSync(p, s)
console.log("重命名完成")
