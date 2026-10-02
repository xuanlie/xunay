import { readFileSync, writeFileSync } from "node:fs"
const p = "site/gen-docs.py"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.q2", s)

// 把代码块内的中文双引号换成单引号
s = s.replace(/\/\/ 打印"创建"/g, "// 打印: 创建")
s = s.replace(/\/\/ 打印"挂载 <div>"/g, "// 打印: 挂载")
// 通用兜底：把字符串里的半角双引号（中文上下文）替换
// 但不动 Python 的字符串定界符

writeFileSync(p, s)
console.log("引号已修")
