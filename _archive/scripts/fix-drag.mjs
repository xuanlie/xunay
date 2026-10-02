import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.dragfix", s)

// 1. touchstart passive: true → false
s = s.replace(
  "btn.addEventListener('touchstart', onDown, { passive: true })",
  "btn.addEventListener('touchstart', onDown, { passive: false })"
)

// 2. onDown 立即 preventDefault + setPointerCapture
const oldOnDown = `  function onDown(e) {
    const pt = e.touches ? e.touches[0] : e
    const p = btnRect()
    drag.on = true; drag.moved = false
    drag.sx = pt.clientX; drag.sy = pt.clientY
    drag.ox = p.l; drag.oy = p.t
  }`
const newOnDown = `  function onDown(e) {
    if (e.cancelable) e.preventDefault()
    const pt = e.touches ? e.touches[0] : e
    const p = btnRect()
    drag.on = true; drag.moved = false
    drag.sx = pt.clientX; drag.sy = pt.clientY
    drag.ox = p.l; drag.oy = p.t
    if (e.pointerId != null && btn.setPointerCapture) {
      try { btn.setPointerCapture(e.pointerId) } catch (err) {}
    }
  }`
if (!s.includes(oldOnDown)) throw new Error("未命中 onDown")
s = s.replace(oldOnDown, newOnDown)

// 3. CSS 加 -webkit-user-drag
s = s.replace(
  "user-select:none;-webkit-user-select:none}",
  "user-select:none;-webkit-user-select:none;-webkit-user-drag:none}"
)

writeFileSync(p, s)
console.log("拖拽修复完成")
