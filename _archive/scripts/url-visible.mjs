import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.urlvis", s)

// 1. 列表行 URL 加 title 悬停 + 时间戳 class
const oldCode = `      const u = mk('span', null, n.url.replace(/^https?:\\/\\/[^/]+/, ''))
      u.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis'
      r.appendChild(u)
      const t = mk('span', null, fmtTime(n.start))
      t.style.cssText = 'color:#9aa0a6;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      r.appendChild(t)`

const newCode = `      const u = mk('span')
      u.textContent = n.url.replace(/^https?:\\/\\/[^/]+/, '')
      u.title = n.url
      u.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;color:#8b5cf6;font-family:ui-monospace,Consolas,monospace'
      r.appendChild(u)
      r.title = n.url
      const t = mk('span', '__xd_col_time__', fmtTime(n.start))
      t.style.cssText = 'color:#9aa0a6;flex-shrink:0;font-family:ui-monospace,Consolas,monospace;font-size:11px'
      r.appendChild(t)`

if (!s.includes(oldCode)) throw new Error("1. 未命中 URL 段")
s = s.replace(oldCode, newCode)

// 2. 手机端隐藏时间戳列
const cssAnchor = "  .__xd_row__{min-height:46px;font-size:13px}"
if (!s.includes(cssAnchor)) throw new Error("2. 未命中移动端 CSS")
s = s.replace(cssAnchor, cssAnchor + `\n  .__xd_col_time__{display:none}`)

writeFileSync(p, s)
console.log("URL 显示优化完成")
