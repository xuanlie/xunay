import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.persist", s)

let hits = 0
function hit(from, to, label) {
  if (!s.includes(from)) { console.log("跳过:", label); return }
  s = s.replace(from, to)
  hits++
}

// 1. 在 startHooks() 前加 loadState + saveState 定义
hit(
`  // 立即挂 hook，早于 app 里所有 fetch
  startHooks()`,
`  // ===== 数据持久化 =====
  function loadState() {
    try {
      const raw = sessionStorage.getItem('__xd_state__')
      if (!raw) return
      const d = JSON.parse(raw)
      if (Array.isArray(d.nets)) S.nets = d.nets.slice(-100)
      if (Array.isArray(d.logs)) S.logs = d.logs.slice(-200)
      if (Array.isArray(d.longTasks)) S.longTasks = d.longTasks.slice(-30)
      S._restoredAt = d.savedAt || null
      S._restoredSigCount = d.sigCount || 0
    } catch (e) {}
  }

  let _saveTimer = 0
  function saveState() {
    clearTimeout(_saveTimer)
    _saveTimer = setTimeout(() => {
      try {
        let sigCount = 0
        try { sigCount = S.signals.length } catch (e) {}
        sessionStorage.setItem('__xd_state__', JSON.stringify({
          savedAt: Date.now(),
          nets: S.nets.slice(-100),
          logs: S.logs.slice(-200),
          longTasks: S.longTasks.slice(-30),
          sigCount: sigCount
        }))
      } catch (e) {}
    }, 800)
  }

  loadState()

  // 立即挂 hook，早于 app 里所有 fetch
  startHooks()`,
"1.持久化定义")

// 2. hookFetch 里 push 后保存
hit(
"          S.nets.push(e)\n          if (S.nets.length > 200) S.nets.shift()",
"          S.nets.push(e)\n          if (S.nets.length > 200) S.nets.shift()\n          saveState()",
"2.fetch保存")

// 3. hookConsole 里 push 后保存
hit(
"        S.logs.push({ level, text })\n        if (S.logs.length > 300) S.logs.shift()",
"        S.logs.push({ level, text })\n        if (S.logs.length > 300) S.logs.shift()\n        saveState()",
"3.console保存")

// 4. 长任务保存
hit(
"            S.longTasks.push({ start: e.startTime, duration: e.duration })\n            if (S.longTasks.length > 50) S.longTasks.shift()",
"            S.longTasks.push({ start: e.startTime, duration: e.duration })\n            if (S.longTasks.length > 50) S.longTasks.shift()\n            saveState()",
"4.长任务保存")

// 5. 清空按钮同时清 sessionStorage
hit(
"    clr.onclick = () => { S.nets.length = 0; S.logs.length = 0; S.signals.length = 0; buildSidebar(); buildTabBar(); renderBody() }",
"    clr.onclick = () => { S.nets.length = 0; S.logs.length = 0; S.signals.length = 0; S.longTasks.length = 0; try { sessionStorage.removeItem('__xd_state__') } catch (e) {}; buildSidebar(); buildTabBar(); renderBody() }",
"5.清空同步")

// 6. 顶部工具条显示"上次刷新时间"
hit(
"    const clr = mk('button')\n    clr.innerHTML = SVG.trash",
`    if (S._restoredAt) {
      const info = mk('span')
      const ago = Math.round((Date.now() - S._restoredAt) / 1000)
      info.textContent = '上次刷新前 ' + ago + 's'
      info.style.cssText = 'color:#9aa0a6;font-size:11px;margin-right:8px;white-space:nowrap'
      head.appendChild(info)
    }
    const clr = mk('button')
    clr.innerHTML = SVG.trash`,
"6.时间提示")

writeFileSync(p, s)
console.log("成功应用 " + hits + " / 6 处")
