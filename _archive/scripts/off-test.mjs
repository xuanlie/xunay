import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/app.xuy"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.offtest", s)
s = s.replace(
  "import './src/devtools.js'",
  "// import './src/devtools.js'"
)
writeFileSync(p, s)
console.log("devtools 已临时关闭")
