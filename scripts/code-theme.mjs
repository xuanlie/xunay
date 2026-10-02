import { readFileSync, writeFileSync } from "node:fs"
const p = "site/src/style.css"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.codetheme", s)

// 找代码高亮段并替换
const startMark = "/* ============ 代码高亮（GitHub Dark）============ */"
const endMark = "/* ============ 表格 ============ */"
const i1 = s.indexOf(startMark)
const i2 = s.indexOf(endMark)
if (i1 < 0 || i2 < 0) throw new Error("未找到高亮段")

const newTheme = `/* ============ 代码高亮（Dracula / 紫调）============ */
.code-block {
  background: #1e1f2e !important;
  border-color: rgba(139, 92, 246, 0.25) !important;
  box-shadow: 0 4px 16px rgba(30,31,46,0.25), 0 0 0 1px rgba(139,92,246,0.08) inset !important;
}
.code-block:hover {
  box-shadow: 0 8px 32px rgba(30,31,46,0.35), 0 0 0 1px rgba(139,92,246,0.35) inset !important;
}
.code-head {
  background: #26273a !important;
  border-bottom-color: rgba(139,92,246,0.15) !important;
}
.code-lang { color: #a78bfa !important; letter-spacing: 1px; }
.code-copy { color: #8b8fa8 !important; }
.code-copy:hover { background: rgba(139,92,246,0.15) !important; color: #a78bfa !important; }
.code-copy.on { color: #50fa7b !important; }
.code-pre { color: #f8f8f2; background: #1e1f2e; }
.code-pre::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 4px; }

/* Dracula 配色 */
.code-pre .c { color: #6272a4; font-style: italic; }   /* 注释：灰蓝斜体 */
.code-pre .s { color: #f1fa8c; }                        /* 字符串：淡黄 */
.code-pre .k { color: #ff79c6; }                        /* 关键字：粉红 */
.code-pre .b { color: #8be9fd; }                        /* 内置/常量：青蓝 */
.code-pre .t { color: #8be9fd; }                        /* 类型：青蓝 */
.code-pre .n { color: #bd93f9; }                        /* 数字：紫 */
.code-pre .f { color: #50fa7b; }                        /* 函数名：绿 */
.code-pre .o { color: #ff79c6; }                        /* 操作符：粉红 */
.code-pre .m { color: #f8f8f2; }                        /* 标点：亮白 */
.code-pre .d { color: #ffb86c; font-weight: 600; }      /* 标签/装饰：橙 */
.code-pre .p { color: #8be9fd; }                        /* CSS 属性：青 */

`
s = s.slice(0, i1) + newTheme + s.slice(i2)
writeFileSync(p, s)
console.log("代码主题已换 Dracula 紫调")
