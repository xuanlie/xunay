import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.cssorder", s)

// 在创建按钮前注入 CSS
const oldCode = `  /* ===== 按钮 ===== */
  const btn = document.createElement('button')`

const newCode = `  /* ===== 按钮 ===== */
  injectCSS()
  const btn = document.createElement('button')`

if (!s.includes(oldCode)) throw new Error("未命中按钮创建")
s = s.replace(oldCode, newCode)

// 移除 startHooks 里重复的 injectCSS 调用（无害但没必要）
s = s.replace(
  "    S.ready = true\n    injectCSS()\n",
  "    S.ready = true\n"
)

writeFileSync(p, s)
console.log("CSS 注入时机已修复")
