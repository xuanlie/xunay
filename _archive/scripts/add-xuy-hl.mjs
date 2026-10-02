import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/hl.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.xuyhl", s)

// 在 RULES 对象开头找到 js 定义，在其后插入 xuy
const jsStart = s.indexOf("  js: [")
if (jsStart < 0) throw new Error("未找到 js 规则")

// 找到 js 段结束（下一个 "  ts: ["）
const tsStart = s.indexOf("  ts: [", jsStart)
if (tsStart < 0) throw new Error("未找到 ts 规则")

// 提取 js 规则段，复制成 xuy 并追加标签名
const jsBlock = s.slice(jsStart, tsStart)

// 把 js: [ 改成 xuy: [ 并追加标签规则
let xuyBlock = jsBlock.replace("  js: [", "  xuy: [")
// 去掉末尾换行，追加标签规则后再加 \n
xuyBlock = xuyBlock.trimEnd()
// 标签规则：跟在函数名后面（div( / span( 等）
xuyBlock += `\n    [/\\b(div|span|p|a|button|input|form|label|ul|ol|li|h1|h2|h3|h4|h5|h6|table|thead|tbody|tr|td|th|img|header|footer|nav|main|section|article|select|option|textarea|pre|code|br|hr)(?=\\s*\\()/g, 'd'],\n  ],\n\n`

// 插入到 js 段之后
s = s.slice(0, tsStart) + xuyBlock + s.slice(tsStart)

writeFileSync(p, s)
console.log("xuy 高亮规则已加")
