import { readFileSync, writeFileSync } from "node:fs"
const p = "core/src/devpanel.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak7", s)

// 在 isOpen 后面追加 attachButton
s = s.replace(
  "export function isOpen() { return active }",
  `export function isOpen() { return active }

/* ============ 浮动切换按钮 ============ */
let toggleBtn = null

export function attachButton() {
  if (typeof document === 'undefined' || toggleBtn) return
  const btn = document.createElement('div')
  btn.id = '__xunay_devtools_btn__'
  btn.style.cssText = [
    'position:fixed',
    'right:20px',
    'bottom:20px',
    'z-index:2147483647',
    'display:flex',
    'align-items:center',
    'gap:8px',
    'padding:12px 18px',
    'background:linear-gradient(135deg,#6366f1,#8b5cf6)',
    'color:#fff',
    'border-radius:32px',
    'font:500 13.5px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif',
    'cursor:pointer',
    'box-shadow:0 4px 16px rgba(99,102,241,.4)',
    'transition:all .2s ease',
    'user-select:none',
    '-webkit-user-select:none',
    '-webkit-tap-highlight-color:transparent',
    'white-space:nowrap'
  ].join(';')
  btn.innerHTML = '<span style="font-size:15px">🔧</span><span>DevTools</span>'
  btn.onmouseenter = () => { btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 6px 20px rgba(99,102,241,.5)' }
  btn.onmouseleave = () => { btn.style.transform = ''; btn.style.boxShadow = '0 4px 16px rgba(99,102,241,.4)' }
  btn.onclick = () => {
    if (isOpen()) {
      close()
      btn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)'
      btn.style.bottom = '20px'
      btn.innerHTML = '<span style="font-size:15px">🔧</span><span>DevTools</span>'
    } else {
      open()
      btn.style.background = '#ef4444'
      btn.innerHTML = '<span style="font-size:15px">×</span><span>关闭</span>'
      // 移动端时按钮上移到抽屉上方
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        btn.style.bottom = 'calc(70vh + 16px)'
        const upd = () => {
          if (!isOpen()) { window.removeEventListener('resize', upd); return }
          const h = window.innerWidth < 768 ? 'calc(70vh + 16px)' : '20px'
          btn.style.bottom = h
        }
        window.addEventListener('resize', upd)
      }
    }
  }
  document.body.appendChild(btn)
  toggleBtn = btn
  return btn
}

export function detachButton() {
  if (toggleBtn) { toggleBtn.remove(); toggleBtn = null }
}`)

writeFileSync(p, s)
console.log("浮动按钮已加入 devpanel")
