import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/devpanel.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak4", s)

// ① 引入状态变量（加在 open() 之前）
s = s.replace(
  `/* ============ 生命周期 ============ */`,
  `/* ============ 状态缓存 ============ */
let lastFingerprint = ''
let cachedFilterInput = null
let mainScrollTop = 0
let resizeTimer = 0
let sidebarBuilt = false

function fingerprint() {
  return signals.length + '|' + effects.length + '|' + scopes.length + '|' + timeline.length + '|' + consoleLogs.length + '|' + currentTab
}

function isDirty() {
  const fp = fingerprint()
  if (fp !== lastFingerprint) { lastFingerprint = fp; return true }
  return false
}

/* ============ 生命周期 ============ */`)

// ② renderMain 保留滚动位置
s = s.replace(
  `function renderMain() {
  mainEl.innerHTML = ''
  if (currentTab === 'elements') renderElements()
  else if (currentTab === 'console') renderConsole()
  else if (currentTab === 'signals') renderSignals()
  else if (currentTab === 'effects') renderEffects()
  else if (currentTab === 'scopes') renderScopes()
  else if (currentTab === 'timeline') renderTimeline()
  else if (currentTab === 'perf') renderPerf()
}`,
  `function renderMain() {
  if (!mainEl) return
  const st = mainEl.scrollTop
  mainEl.innerHTML = ''
  if (currentTab === 'elements') renderElements()
  else if (currentTab === 'console') renderConsole()
  else if (currentTab === 'signals') renderSignals()
  else if (currentTab === 'effects') renderEffects()
  else if (currentTab === 'scopes') renderScopes()
  else if (currentTab === 'timeline') renderTimeline()
  else if (currentTab === 'perf') renderPerf()
  mainEl.scrollTop = st
}`)

// ③ render 拆成 tab 变化才重建 toolbar/sidebar
s = s.replace(
  `function render() {
  if (!rootEl) return
  renderToolbar()
  if (!isMobile()) renderSidebar()
  renderMain()
}`,
  `let lastTab = '', lastFilter = ''

function render() {
  if (!rootEl) return
  if (lastTab !== currentTab || lastFilter !== filter || !toolbarEl.dataset.built) {
    lastTab = currentTab
    lastFilter = filter
    renderToolbar()
    if (!isMobile()) renderSidebar()
  }
  renderMain()
}`)

// ④ renderToolbar 缓存 filter input 值
s = s.replace(
  `    const f = el('input', 'xd-input')
    f.placeholder = '过滤…'
    f.value = filter
    f.style.width = '200px'
    f.oninput = e => { filter = e.target.value; render() }
    toolbarEl.appendChild(f)`,
  `    const f = el('input', 'xd-input')
    f.placeholder = '过滤…'
    f.value = filter
    f.style.width = '200px'
    cachedFilterInput = f
    f.oninput = e => { filter = e.target.value; lastFilter = ''; renderMain() }
    toolbarEl.appendChild(f)`)

// ⑤ renderToolbar 标记 built
s = s.replace(
  `function renderToolbar() {
  toolbarEl.innerHTML = ''`,
  `function renderToolbar() {
  if (!toolbarEl) return
  toolbarEl.innerHTML = ''
  toolbarEl.dataset.built = '1'`)

// ⑥ resize 只 applySize，不重建
s = s.replace(
  `function onResize() {
  if (!rootEl) return
  const wasMobile = rootEl.querySelector('.xd-tabbar')
  const nowMobile = isMobile()
  if ((wasMobile && !nowMobile) || (!wasMobile && nowMobile)) {
    const open = active
    close()
    if (open) setTimeout(() => open(), 0)
    return
  }
  applySize()
}`,
  `function onResize() {
  if (!rootEl) return
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (!rootEl) return
    const hasTabsBar = !!rootEl.querySelector('.xd-tabbar')
    const nowMobile = isMobile()
    // 只有跨过断点才真正重建布局，其他 resize 只重算尺寸
    if (hasTabsBar !== nowMobile) {
      toolbarEl.dataset.built = ''
      lastTab = lastFilter = ''
      // 清空 body 里的旧 sidebar/main 引用，重建
      const oldBody = rootEl.querySelector('div[style*="display:flex"][style*="flex:1"]')
      if (oldBody) oldBody.remove()
      if (handleEl) { handleEl.remove(); handleEl = null }
      buildBody()
      render()
    } else {
      applySize()
    }
  }, 120)
}`)

// ⑦ 抽出 buildBody
s = s.replace(
  `export function open() {
  if (active || typeof document === 'undefined') return
  injectStyle()
  install()
  active = true

  rootEl = el('div', 'xd')
  const mobile = isMobile()
  if (mobile) rootEl.style.height = mobileHeight

  toolbarEl = el('div', 'xd-toolbar')
  rootEl.appendChild(toolbarEl)

  if (mobile) setupMobileSwipe()

  const body = el('div')
  body.style.cssText = 'display:flex;flex:1;overflow:hidden;min-height:0'
  rootEl.appendChild(body)

  sidebarEl = el('div', 'xd-sidebar')
  body.appendChild(sidebarEl)

  const split = el('div', 'xd-splitter')
  split.onmousedown = e => startResize(e, 'sidebar')
  body.appendChild(split)

  mainEl = el('div', 'xd-main')
  body.appendChild(mainEl)

  if (!mobile) {
    const e = el('div', 'xd-drag e'); e.onmousedown = ev => startResize(ev, 'e'); rootEl.appendChild(e)
    const s = el('div', 'xd-drag s'); s.onmousedown = ev => startResize(ev, 's'); rootEl.appendChild(s)
    const se = el('div', 'xd-drag se'); se.onmousedown = ev => startResize(ev, 'se'); rootEl.appendChild(se)
    toolbarEl.onmousedown = startDrag
  }

  document.body.appendChild(rootEl)
  applySize()
  render()

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)

  timer = setInterval(() => { if (!paused && active) render() }, 800)
}`,
  `function buildBody() {
  const mobile = isMobile()
  const body = el('div')
  body.dataset.body = '1'
  body.style.cssText = 'display:flex;flex:1;overflow:hidden;min-height:0'
  rootEl.appendChild(body)

  sidebarEl = el('div', 'xd-sidebar')
  body.appendChild(sidebarEl)

  const split = el('div', 'xd-splitter')
  split.onmousedown = e => startResize(e, 'sidebar')
  body.appendChild(split)

  mainEl = el('div', 'xd-main')
  body.appendChild(mainEl)

  if (mobile) {
    handleEl = el('div', 'xd-handle')
    handleEl.onclick = () => { rootEl.classList.toggle('full'); applySize() }
    rootEl.insertBefore(handleEl, rootEl.firstChild)
  } else {
    const e = el('div', 'xd-drag e'); e.onmousedown = ev => startResize(ev, 'e'); rootEl.appendChild(e)
    const s2 = el('div', 'xd-drag s'); s2.onmousedown = ev => startResize(ev, 's'); rootEl.appendChild(s2)
    const se = el('div', 'xd-drag se'); se.onmousedown = ev => startResize(ev, 'se'); rootEl.appendChild(se)
  }
}

export function open() {
  if (active || typeof document === 'undefined') return
  injectStyle()
  install()
  active = true

  rootEl = el('div', 'xd')
  if (isMobile()) rootEl.style.height = mobileHeight

  // 触摸事件隔离，阻止穿透到页面
  const stop = e => e.stopPropagation()
  rootEl.addEventListener('touchstart', stop, { passive: true })
  rootEl.addEventListener('touchmove', stop, { passive: true })
  rootEl.addEventListener('wheel', stop, { passive: true })

  toolbarEl = el('div', 'xd-toolbar')
  rootEl.appendChild(toolbarEl)

  buildBody()

  if (!isMobile()) toolbarEl.onmousedown = startDrag

  document.body.appendChild(rootEl)
  applySize()
  render()

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  window.addEventListener('orientationchange', onResize)

  // 数据没变化就不重建
  timer = setInterval(() => {
    if (paused || !active) return
    if (isDirty()) renderMain()
  }, 700)
}`)

// ⑧ 首屏初始化
s = s.replace(
  `export function close() {
  if (!active) return
  active = false`,
  `export function close() {
  if (!active) return
  active = false
  lastFingerprint = ''
  lastTab = lastFilter = ''
  sidebarBuilt = false
  clearTimeout(resizeTimer)`)

// ⑨ 关闭时移除触摸监听
s = s.replace(
  `  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)
  sidebarEl = toolbarEl = tabsBarEl = mainEl = handleEl = null`,
  `  window.removeEventListener('resize', onResize)
  window.removeEventListener('orientationchange', onResize)
  sidebarEl = toolbarEl = tabsBarEl = mainEl = handleEl = null`)

// ⑩ render() 首次构建标记
s = s.replace(
  `  if (lastTab !== currentTab || lastFilter !== filter || !toolbarEl.dataset.built) {`,
  `  if (lastTab !== currentTab || lastFilter !== filter || toolbarEl.dataset.built !== '1') {`)

writeFileSync(p, s)
console.log("devpanel bug 修复完成")
