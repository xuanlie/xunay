import { readFileSync, writeFileSync } from "node:fs"
const p = "site/gen-docs.py"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.quote", s)

// 有问题的行：单引号字符串里套单引号，把内层换成双引号
const bad = `('P','div(null, 'hello') 不创建真实 DOM，它返回一个对象：'),`
const good = `('P','div(null, "hello") 不创建真实 DOM，它返回一个对象：'),`

if (!s.includes(bad)) {
  console.log("没找到那行，尝试其他变体")
  // 宽松匹配：找 'div(null, 'hello')
  s = s.replace(/'div\(null, 'hello'\)/g, `'div(null, "hello")'`)
} else {
  s = s.replace(bad, good)
}

writeFileSync(p, s)
console.log("单引号已修")
