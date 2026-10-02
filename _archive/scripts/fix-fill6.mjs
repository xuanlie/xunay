import { readFileSync, writeFileSync } from "node:fs"
const p = "scripts/fill-core-6.mjs"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.js", s)

s = s.replace(
  `      ('P','txt 是"响应式模板字符串"——用反引号写，内部 \${} 里的值自动响应式。比拼接字符串更自然。'),`,
  `      ('P','txt 是"响应式模板字符串"——用反引号写，内部插值里的值自动响应式。比拼接字符串更自然。'),`
)

writeFileSync(p, s)
console.log("修好")
