import { readFileSync, writeFileSync } from "node:fs"
const p = "site/gen-docs.py"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.2lines", s)

const lines = s.split("\n")

// 721 行（数组下标 720）：双引号问题
lines[720] = "      ('Code',\"show(() => visible(), () => {\\\\n  onMount(() => console.log('进入'))\\\\n  onUnmount(() => console.log('离开'))\\\\n  return div(null, '内容')\\\\n})\\\\n// visible 变 true → 打印 进入\\\\n// visible 变 false → 打印 离开\\\\n// 再次变 true → 又打印 进入\",'xuy'),"

// 786 行（数组下标 785）：字符串被截断
lines[785] = "      ('Code',\"let el = null\\\\ndiv({ ref: e => { el = e; console.log('创建') } })\\\\n// 打印: 创建\\\\nonMount(() => console.log('挂载', el))\\\\n// 打印: 挂载\",'xuy'),"

writeFileSync(p, lines.join("\n"))
console.log("两行已修")
