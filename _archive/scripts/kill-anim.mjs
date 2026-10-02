import { readFileSync, writeFileSync } from "node:fs"

// 1. myapp 页面动画
{
  const p = "myapp/src/style.css"
  let s = readFileSync(p, "utf8")
  writeFileSync(p + ".bak.killanim", s)
  // 在文件末尾追加全局关闭
  if (!s.includes("__kill_anim__")) {
    s += `

/* ============ 全局关闭动画 ============ */
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
}
/* __kill_anim__ */
`
    writeFileSync(p, s)
    console.log("页面动画已关")
  }
}

// 2. devtools 动画
{
  const p = "myapp/src/devtools.js"
  let s = readFileSync(p, "utf8")
  writeFileSync(p + ".bak.killanim", s)
  // 在 devtools 的 CSS 里加一段覆盖
  const anchor = ".__xd_panel__{position:fixed;"
  if (!s.includes(anchor)) throw new Error("未找到面板 CSS")
  if (!s.includes("__kill_anim__")) {
    s = s.replace(anchor, `/* __kill_anim__ */
.__xd_panel__ *,.__xd_panel__ *::before,.__xd_panel__ *::after,.__xd_fab__ *,.__xd_fab__ *::before,.__xd_fab__ *::after{animation:none!important;transition:none!important}
` + anchor)
    writeFileSync(p, s)
    console.log("devtools 动画已关")
  }
}
