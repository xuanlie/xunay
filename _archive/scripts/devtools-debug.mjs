import { readFileSync, writeFileSync } from "node:fs"
const p = "myapp/src/devtools.js"
let s = readFileSync(p, "utf8")
writeFileSync(p + ".bak.debug", s)

// 在 IIFE 开头包上 try-catch
const oldOpen = "(function () {\n  if (typeof window === 'undefined' || window.__XD__) return\n"
const newOpen = `(function () {
  if (typeof window === 'undefined' || window.__XD__) return
  window.__XD_DEBUG__ = []
  try {
`

const oldClose = "  window.openDevtools = openPanel\n  window.closeDevtools = closePanel\n  window.resetDevtoolsBtn = () => {\n    try { localStorage.removeItem('__xd_btn_pos__') } catch (e) {}\n    btn.style.left = ''; btn.style.top = ''\n    btn.style.right = '16px'; btn.style.bottom = '16px'\n  }\n})()"
const newClose = `  window.openDevtools = openPanel
  window.closeDevtools = closePanel
  window.resetDevtoolsBtn = () => {
    try { localStorage.removeItem('__xd_btn_pos__') } catch (e) {}
    btn.style.left = ''; btn.style.top = ''
    btn.style.right = '16px'; btn.style.bottom = '16px'
  }
  window.__XD_DEBUG__.push('init-complete')
  } catch (err) {
    window.__XD_DEBUG__.push('ERROR: ' + (err && err.message))
    var box = document.createElement('div')
    box.style.cssText = 'position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;' +
      'background:#fce8e6;color:#c5221f;border:1px solid #c5221f;border-radius:8px;' +
      'padding:12px;font:12px/1.5 monospace;white-space:pre-wrap;word-break:break-all;' +
      'box-shadow:0 4px 20px rgba(0,0,0,.3)'
    box.textContent = '[DevTools Error] ' + (err && err.message) + '\\n\\n' + (err && err.stack ? err.stack.split('\\n').slice(0, 4).join('\\n') : '')
    var close = document.createElement('button')
    close.textContent = '关闭'
    close.style.cssText = 'margin-top:8px;padding:6px 12px;border:0;background:#c5221f;color:#fff;border-radius:4px;cursor:pointer'
    close.onclick = function () { box.remove() }
    box.appendChild(close)
    document.body.appendChild(box)
  }
})()`

if (!s.includes(oldOpen)) throw new Error("未命中开头")
s = s.replace(oldOpen, newOpen)
if (!s.includes(oldClose)) throw new Error("未命中结尾")
s = s.replace(oldClose, newClose)

writeFileSync(p, s)
console.log("调试包装已加")
