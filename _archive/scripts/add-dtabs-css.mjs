import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.dtabscss", s)

// 找 CSS 里的 __xd_dsec__ 定位，往它前面插
const anchor = ".__xd_dsec__{padding:16px 20px 6px;"
if (!s.includes(anchor)) throw new Error("未找到 dsec CSS")

s = s.replace(anchor, `.__xd_dtabs__{display:flex;gap:2px;padding:0 16px;background:#f8f9fa;border-bottom:1px solid #dadce0;position:sticky;top:0;z-index:3;overflow-x:auto;scrollbar-width:none}
.__xd_dtabs__::-webkit-scrollbar{display:none}
.__xd_dtabs__ button{background:transparent;border:0;padding:10px 14px;font:inherit;font-size:12.5px;color:#5f6368;cursor:pointer;border-bottom:2px solid transparent;font-family:inherit;white-space:nowrap;flex-shrink:0;transition:color .15s,border-color .15s}
.__xd_dtabs__ button:hover{color:#202124}
.__xd_dtabs__ button.on{color:#8b5cf6;border-bottom-color:#8b5cf6;font-weight:600}
` + anchor)

writeFileSync(p, s)
console.log("CSS 完成")
