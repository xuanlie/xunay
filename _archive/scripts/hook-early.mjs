import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.earlyhook", s)

// 1. 在按钮创建后立即启动 hook（不再等点击）
const anchor = "  document.body.appendChild(btn)\n  S.btn = btn"
if (!s.includes(anchor)) throw new Error("1. 未找到按钮锚点")
s = s.replace(anchor, anchor + "\n\n  // 页面加载即启动 hook，保证数据不丢\n  startHooks()")

// 2. LCP 用 PerformanceObserver 采集
const lcpAnchor = "  function startHooks() {"
if (!s.includes(lcpAnchor)) throw new Error("2. 未找到 startHooks")
s = s.replace(lcpAnchor, `  let _lcpValue = 0
  try {
    if (window.PerformanceObserver) {
      const lcpObs = new PerformanceObserver(list => {
        const entries = list.getEntries()
        if (entries.length) _lcpValue = entries[entries.length - 1].startTime
      })
      lcpObs.observe({ entryTypes: ['largest-contentful-paint'] })
    }
  } catch (e) {}

  function startHooks() {`)

// 3. collectPerf 用 _lcpValue
s = s.replace(
  `    try {
      const lcp = performance.getEntriesByType('largest-contentful-paint')
      if (lcp.length) m.lcp = lcp[lcp.length - 1].startTime
    } catch (e) {}`,
  `    if (_lcpValue) m.lcp = _lcpValue`
)

writeFileSync(p, s)
console.log("hook 提前 + LCP 采集 完成")
