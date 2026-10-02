import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.violet", s)

// ===== 1. 全局色替换：蓝 → 紫 =====
const map = [
  ["#1a73e8", "#8b5cf6"],     // 主蓝 → 主紫
  ["#1765cc", "#7c3aed"],     // 深蓝 → 深紫
  ["#4285f4", "#a78bfa"],     // 亮蓝 → 亮紫
  ["#6ba4f8", "#c4b5fd"],     // 浅蓝 → 浅紫
  ["#e8f0fe", "#f5f3ff"],     // 淡蓝底 → 淡紫底
  ["rgba(26,115,232,", "rgba(139,92,246,"],
]
for (const [a, b] of map) s = s.split(a).join(b)

// ===== 2. 按钮段重写：白底紫图标 =====
const btnStart = "/* ===== 按钮 ===== */"
const btnEnd = "/* ===== 面板 ===== */"
const i1 = s.indexOf(btnStart)
const i2 = s.indexOf(btnEnd)
if (i1 < 0 || i2 < 0) throw new Error("未找到按钮 CSS")

const newBtnCSS = `/* ===== 按钮 ===== */
.__xd_fab__{position:fixed;right:16px;bottom:16px;width:56px;height:56px;
border-radius:50%;border:1.5px solid #e9d5ff;padding:0;cursor:grab;
z-index:2147483647;display:flex;align-items:center;justify-content:center;
background:#ffffff;color:#8b5cf6;
box-shadow:0 2px 8px rgba(139,92,246,.18),0 1px 3px rgba(0,0,0,.06);
transition:background .15s,color .15s,border-color .15s,box-shadow .15s,transform .1s;
-webkit-tap-highlight-color:transparent;touch-action:none;
user-select:none;-webkit-user-select:none;-webkit-user-drag:none}
.__xd_fab__:hover{background:#f5f3ff;border-color:#c4b5fd;
box-shadow:0 4px 16px rgba(139,92,246,.28),0 1px 3px rgba(0,0,0,.06)}
.__xd_fab__:active{transform:scale(.94)}

.__xd_fab_open__,.__xd_fab_close__{position:absolute;inset:0;
display:flex;align-items:center;justify-content:center;
transition:opacity .2s}
.__xd_fab_close__{opacity:0}
.__xd_fab__.on{background:#8b5cf6;color:#ffffff;border-color:#8b5cf6;
box-shadow:0 4px 16px rgba(139,92,246,.4),0 1px 3px rgba(0,0,0,.1)}
.__xd_fab__.on:hover{background:#7c3aed;border-color:#7c3aed}
.__xd_fab__.on .__xd_fab_open__{opacity:0}
.__xd_fab__.on .__xd_fab_close__{opacity:1}

`
s = s.slice(0, i1) + newBtnCSS + s.slice(i2)

writeFileSync(p, s)
console.log("白底紫罗兰完成")
