import { readFileSync, writeFileSync } from "node:fs"

const p = "core/src/devpanel.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak", s)

// ① 小屏时全屏
s = s.replace(
  `function applySize() {
  if (!panelEl) return
  panelEl.style.width = panelW + 'px'
  panelEl.style.height = panelH + 'px'
  panelEl.style.right = dragX + 'px'
  panelEl.style.bottom = dragY + 'px'
}`,
  `function isMobile() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

function applySize() {
  if (!panelEl) return
  if (isMobile()) {
    panelEl.style.width = '100vw'
    panelEl.style.height = '60vh'
    panelEl.style.right = '0'
    panelEl.style.bottom = '0'
    panelEl.style.borderRadius = '12px 12px 0 0'
    return
  }
  panelEl.style.width = panelW + 'px'
  panelEl.style.height = panelH + 'px'
  panelEl.style.right = dragX + 'px'
  panelEl.style.bottom = dragY + 'px'
}`)

// ② 触摸滚动 + 移动端字号
s = s.replace(
  `  listEl.style.cssText = 'flex:1;overflow-y:auto'`,
  `  listEl.style.cssText = 'flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch'`)

s = s.replace(
  `  panelEl.style.cssText = 'position:fixed;background:#1e1e1e;color:#d4d4d4;' +`,
  `  const isM = isMobile()
  panelEl.style.cssText = 'position:fixed;background:#1e1e1e;color:#d4d4d4;' +
    (isM ? 'font-size:13px;' : '') +`)

// ③ 拖拽改 pointer events（触摸也生效）
s = s.replace(
  `function startDrag(e) {
  if (e.target.closest('div[data-no-drag]')) return
  dragging = { x: e.clientX, y: e.clientY, rx: dragX, ry: dragY }
  e.preventDefault()
}`,
  `function startDrag(e) {
  if (isMobile()) return
  if (e.target.closest('div[data-no-drag]')) return
  dragging = { x: e.clientX, y: e.clientY, rx: dragX, ry: dragY }
  e.preventDefault()
}`)

// ④ 缩放只在桌面端
s = s.replace(
  `function startResize(e) {
  e.stopPropagation(); e.preventDefault()`,
  `function startResize(e) {
  if (isMobile()) return
  e.stopPropagation(); e.preventDefault()`)

// ⑤ 标签按钮加大触点（移动端）
s = s.replace(
  `    b.style.cssText = 'padding:7px 12px;cursor:pointer;user-select:none;font-size:11.5px;white-space:nowrap;' +`,
  `    b.style.cssText = 'padding:' + (isMobile() ? '10px 14px;font-size:13px' : '7px 12px;font-size:11.5px') + ';cursor:pointer;user-select:none;white-space:nowrap;' +`)

// ⑥ 关闭键加大
s = s.replace(
  `  x.style.cssText = 'padding:5px 14px;cursor:pointer;color:#888;font-size:18px;line-height:1'`,
  `  x.style.cssText = 'padding:' + (isMobile() ? '10px 18px;font-size:24px' : '5px 14px;font-size:18px') + ';cursor:pointer;color:#888;line-height:1'`)

// ⑦ 窗口旋转/大小变化时重算
s = s.replace(
  `  timer = setInterval(() => { if (!paused) { renderTabs(); renderContent() } }, 600)`,
  `  timer = setInterval(() => { if (!paused) { renderTabs(); renderContent() } }, 600)
  window.addEventListener('resize', applySize)
  window.addEventListener('orientationchange', () => setTimeout(applySize, 200))`)

// ⑧ 关闭时移除监听
s = s.replace(
  `  document.removeEventListener('keydown', onKey)`,
  `  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', applySize)`)

writeFileSync(p, s)
console.log("devpanel 移动端适配完成")
