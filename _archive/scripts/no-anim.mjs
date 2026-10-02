import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/style.css"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.noanim", s)

// 1. 注释掉 fadeIn 动画
s = s.replace(/animation:\s*fadeIn[^;]*;/g, "/* animation removed */")

// 2. 去掉 transition: all（只留 transform 和 box-shadow）
s = s.replace(/transition:\s*all\s+\.2s\s+ease;/g, "/* transition removed */")

writeFileSync(p, s)
console.log("动画已移除")
