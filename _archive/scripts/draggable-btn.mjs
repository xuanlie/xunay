import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak", s)

// 替换按钮创建那段，加入拖拽
const from = `  const btn = document.createElement('button')
  btn.textContent = '🔧'
  btn.style.cssText = 'position:fixed;right:16px;bottom:16px;width:56px;height:56px;border-radius:50%;border:0;' +
    'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:24px;' +
    'z-index:2147483647;box-shadow:0 6px 20px rgba(99,102,241,.5);' +
    'display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;' +
    '-webkit-tap-highlight-color:transparent;font-family:inherit'
  document.body.appendChild(btn)`

const to = `  const btn = document.createElement('button')
  btn.textContent = '🔧'
  btn.style.cssText = 'position:fixed;right:16px;bottom:16px;width:56px;height:56px;border-radius:50%;border:0;' +
    'background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:24px;' +
    'z-index:2147483647;box-shadow:0 6px 20px rgba(99,102,241,.5);' +
    'display:flex;align-items:center;justify-content:center;padding:0;cursor:grab;' +
    '-webkit-tap-highlight-color:transparent;font-family:inherit;' +
    'touch-action:none;user-select:none;-webkit-user-select:none'
  document.body.appendChild(btn)

  // ==== 拖拽 ====
  ;(function setupDrag() {
    // 恢复保存的位置
    try {
      const saved = localStorage.getItem('__xd_btn_pos__')
      if (saved) {
        const pos = JSON.parse(saved)
        btn.style.left = pos.left + 'px'
        btn.style.top = pos.top + 'px'
        btn.style.right = 'auto'
        btn.style.bottom = 'auto'
      }
    } catch {}

    let dragging = false, moved = false
    let sx = 0, sy = 0, ox = 0, oy = 0
    const THRESHOLD = 6

    function getPos() {
      const r = btn.getBoundingClientRect()
      return { left: r.left, top: r.top }
    }

    function clamp(l, t) {
      const w = btn.offsetWidth, h = btn.offsetHeight
      const maxL = window.innerWidth - w
      const maxT = window.innerHeight - h
      return {
        left: Math.max(0, Math.min(l, maxL)),
        top: Math.max(0, Math.min(t, maxT))
      }
    }

    function onDown(e) {
      // 记录起点
      const pt = e.touches ? e.touches[0] : e
      const pos = getPos()
      sx = pt.clientX; sy = pt.clientY
      ox = pos.left; oy = pos.top
      dragging = true
      moved = false
      btn.style.cursor = 'grabbing'
      btn.style.transition = 'none'
      btn.setPointerCapture && e.pointerId != null && btn.setPointerCapture(e.pointerId)
    }

    function onMove(e) {
      if (!dragging) return
      const pt = e.touches ? e.touches[0] : e
      const dx = pt.clientX - sx
      const dy = pt.clientY - sy
      if (!moved && Math.abs(dx) + Math.abs(dy) > THRESHOLD) moved = true
      if (!moved) return
      e.preventDefault()
      const c = clamp(ox + dx, oy + dy)
      btn.style.left = c.left + 'px'
      btn.style.top = c.top + 'px'
      btn.style.right = 'auto'
      btn.style.bottom = 'auto'
      // 拖动时按钮移到面板上方
      if (XD.open && isMobile()) {
        // 已经拖动就不跟随抽屉
      }
    }

    function onUp() {
      if (!dragging) return
      dragging = false
      btn.style.cursor = 'grab'
      btn.style.transition = ''
      if (moved) {
        const pos = getPos()
        try { localStorage.setItem('__xd_btn_pos__', JSON.stringify(pos)) } catch {}
      }
    }

    // Pointer Events（现代浏览器全支持，鼠标+触摸+笔）
    btn.addEventListener('pointerdown', onDown)
    btn.addEventListener('pointermove', onMove)
    btn.addEventListener('pointerup', onUp)
    btn.addEventListener('pointercancel', onUp)
    // 兜底：老 Safari 不支持 pointer events 用 touch
    if (!window.PointerEvent) {
      btn.addEventListener('touchstart', onDown, { passive: true })
      btn.addEventListener('touchmove', onMove, { passive: false })
      btn.addEventListener('touchend', onUp)
      btn.addEventListener('mousedown', onDown)
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }
  })()`

if (!s.includes(from)) throw new Error("未命中按钮代码")
s = s.replace(from, to)

// 点击时如果发生过拖动，不触发 toggle
s = s.replace(
  `  btn.onclick = () => XD.open ? close() : open()`,
  `  btn.onclick = (e) => {
    // 拖动结束的 click 忽略
    if (btn.__justDragged) { btn.__justDragged = false; return }
    XD.open ? close() : open()
  }`)

writeFileSync(p, s)
console.log("按钮拖拽已加入")
