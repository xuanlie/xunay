import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.simplebtn", s)

// 找到按钮创建段：从"/* ===== 按钮 ===== */"到"btn.onclick"前
const startMark = "  /* ===== 按钮 ===== */"
const endMark = "  btn.onclick = () => {"
const startIdx = s.indexOf(startMark)
const endIdx = s.indexOf(endMark)
if (startIdx < 0 || endIdx < 0) throw new Error("未找到按钮段")

const newBtn = `  /* ===== 按钮 ===== */
  const btn = document.createElement('button')
  btn.className = '__xd_fab__'
  btn.innerHTML =
    '<span class="__xd_fab_open__">' + SVG.debug + '</span>' +
    '<span class="__xd_fab_close__">' + SVG.close + '</span>'
  document.body.appendChild(btn)
  S.btn = btn

  try {
    const saved = localStorage.getItem('__xd_btn_pos__')
    if (saved) {
      const p0 = JSON.parse(saved)
      if (p0.left != null && p0.top != null) {
        btn.style.left = p0.left + 'px'; btn.style.top = p0.top + 'px'
        btn.style.right = 'auto'; btn.style.bottom = 'auto'
      }
    }
  } catch (e) {}

  const drag = { on: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0 }
  const btnRect = () => { const r = btn.getBoundingClientRect(); return { l: r.left, t: r.top } }
  const clamp = (l, t) => {
    const w = btn.offsetWidth || 56, h = btn.offsetHeight || 56
    return { l: Math.max(0, Math.min(l, window.innerWidth - w)), t: Math.max(0, Math.min(t, window.innerHeight - h)) }
  }
  function onDown(e) {
    const pt = e.touches ? e.touches[0] : e
    const p = btnRect()
    drag.on = true; drag.moved = false
    drag.sx = pt.clientX; drag.sy = pt.clientY
    drag.ox = p.l; drag.oy = p.t
  }
  function onMove(e) {
    if (!drag.on) return
    const pt = e.touches ? e.touches[0] : e
    const dx = pt.clientX - drag.sx, dy = pt.clientY - drag.sy
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 6) { drag.moved = true; btn.style.cursor = 'grabbing' }
    if (!drag.moved) return
    if (e.cancelable) e.preventDefault()
    const c = clamp(drag.ox + dx, drag.oy + dy)
    btn.style.left = c.l + 'px'; btn.style.top = c.t + 'px'
    btn.style.right = 'auto'; btn.style.bottom = 'auto'
  }
  function onUp() {
    if (!drag.on) return
    drag.on = false
    btn.style.cursor = 'grab'
    if (drag.moved) {
      const p = btnRect()
      try { localStorage.setItem('__xd_btn_pos__', JSON.stringify(p)) } catch (e) {}
      btn.__skipClick = true
      setTimeout(() => { btn.__skipClick = false }, 250)
    }
  }
  if (window.PointerEvent) {
    btn.addEventListener('pointerdown', onDown)
    btn.addEventListener('pointermove', onMove)
    btn.addEventListener('pointerup', onUp)
    btn.addEventListener('pointercancel', onUp)
  } else {
    btn.addEventListener('touchstart', onDown, { passive: true })
    btn.addEventListener('touchmove', onMove, { passive: false })
    btn.addEventListener('touchend', onUp)
    btn.addEventListener('mousedown', onDown)
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }
`

s = s.slice(0, startIdx) + newBtn + s.slice(endIdx)
writeFileSync(p, s)
console.log("按钮已简化")
