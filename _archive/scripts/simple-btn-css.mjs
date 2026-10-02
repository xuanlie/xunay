import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.simplecss", s)

const startMark = "/* ===== 按钮 ===== */"
const endMark = "/* ===== 面板 ===== */"
const startIdx = s.indexOf(startMark)
const endIdx = s.indexOf(endMark)
if (startIdx < 0 || endIdx < 0) throw new Error("未找到 CSS 段")

const newCSS = `/* ===== 按钮 ===== */
.__xd_fab__{position:fixed;right:16px;bottom:16px;width:56px;height:56px;
border-radius:50%;border:0;padding:0;cursor:grab;z-index:2147483647;
display:flex;align-items:center;justify-content:center;
background:#1a73e8;color:#fff;
box-shadow:0 4px 14px rgba(26,115,232,.4),0 2px 6px rgba(0,0,0,.15);
transition:background .15s,box-shadow .15s,transform .1s;
-webkit-tap-highlight-color:transparent;touch-action:none;
user-select:none;-webkit-user-select:none}
.__xd_fab__:hover{background:#1765cc;box-shadow:0 6px 20px rgba(26,115,232,.5),0 2px 6px rgba(0,0,0,.15)}
.__xd_fab__:active{transform:scale(.94)}

.__xd_fab_open__,.__xd_fab_close__{position:absolute;inset:0;
display:flex;align-items:center;justify-content:center;
transition:opacity .2s}
.__xd_fab_close__{opacity:0}
.__xd_fab__.on{background:#d93025}
.__xd_fab__.on:hover{background:#b71c1c}
.__xd_fab__.on .__xd_fab_open__{opacity:0}
.__xd_fab__.on .__xd_fab_close__{opacity:1}

`
s = s.slice(0, startIdx) + newCSS + s.slice(endIdx)
writeFileSync(p, s)
console.log("按钮 CSS 已简化")
