import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.top", s)

// 在 mob 定义之后立即调用 startHooks
const anchor = "  const mob = () => window.innerWidth < 768"
if (!s.includes(anchor)) throw new Error("未找到 mob")
s = s.replace(anchor, anchor + `

  // 立即挂 hook，早于 app 里所有 fetch
  startHooks()`)

// 删掉按钮创建后的重复调用
s = s.replace(
  "  document.body.appendChild(btn)\n  S.btn = btn\n\n  // 页面加载即启动 hook，保证数据不丢\n  startHooks()",
  "  document.body.appendChild(btn)\n  S.btn = btn"
)

writeFileSync(p, s)
console.log("hook 提前完成")
