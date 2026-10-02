import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.perf", s)

// 1. SVG 图标
if (!s.includes("perfIcon")) {
  const anchor = "    filter: '<svg"
  if (!s.includes(anchor)) throw new Error("1. 未找到 SVG 段")
  s = s.replace(anchor, `    perfIcon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>',
` + anchor)
}

// 2. 加 S.perf 字段
if (!s.includes("perfMetrics")) {
  s = s.replace(
    "    sigMeta: new WeakMap(),",
    "    sigMeta: new WeakMap(),\n    perfMetrics: null,\n    longTasks: [],"
  )
}

// 3. TABS 数组加 perf
const tabsAnchor = "    ['console', SVG.terminal, '控制台']"
if (!s.includes(tabsAnchor)) throw new Error("3. 未找到 TABS")
s = s.replace(tabsAnchor, tabsAnchor + `,\n    ['perf', SVG.perfIcon, '性能']`)

writeFileSync(p, s)
console.log("步骤 1-3 完成")
