// Kit 图标测试页
import { div, h1, input, span } from '/tmp/xuyg-test/xunay.js'
import { signal } from '/tmp/xuyg-test/xunay.js'
import { Icon, iconNames } from '../../../../core/src/Kit/icons.js'

export function KitTest() {
  const q = signal('')
  const all = iconNames()
  const list = () => {
    const s = q().toLowerCase()
    return s ? all.filter(n => n.toLowerCase().includes(s)) : all
  }
  const slice = () => list().slice(0, 300)

  return (() => {
  const _div0 = document.createElement("div")
  __rt__.applyStyle(_div0, 'padding:20px;background:#0f172a;color:#e2e8f0;font:14px/1.5 system-ui;min-height:100vh')
  const _h11 = document.createElement("h1")
  __rt__.applyStyle(_h11, 'font-size:20px;margin:0 0 8px')
  _h11.appendChild(document.createTextNode('Kit 图标 '))
  const _span2 = document.createElement("span")
  __rt__.applyStyle(_span2, 'color:#64748b;font-size:13px')
  const _t3 = __rt__.renderChild(all.length + ' 个')
  if (_t3) _span2.appendChild(_t3)
  _h11.appendChild(_span2)
  _div0.appendChild(_h11)
  const _input4 = document.createElement("input")
  _input4.setAttribute("placeholder", '搜索：arrow / file / star / user / cloud …')
  _input4.value = q
  _input4.addEventListener("input", e => q(e.target.value))
  __rt__.applyStyle(_input4, 'padding:8px 12px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;border-radius:8px;font-size:13px;width:100%;max-width:420px;margin-bottom:14px;outline:none')
  _div0.appendChild(_input4)
  const _div5 = document.createElement("div")
  __rt__.applyStyle(_div5, 'display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:6px')
  const _t6 = __rt__.renderChild(slice().map(name =>
        (() => {
  const _div7 = document.createElement("div")
  _div7.setAttribute("title", name)
  __rt__.applyStyle(_div7, 'background:#1e293b;padding:10px 6px;border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer')
  _div7.addEventListener("click", () => navigator.clipboard?.writeText(name))
  const _t8 = __rt__.renderChild(Icon({ name, size: 26, color: '#60a5fa' }))
  if (_t8) _div7.appendChild(_t8)
  const _div9 = document.createElement("div")
  __rt__.applyStyle(_div9, 'font-size:10px;color:#64748b;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%')
  const _t10 = __rt__.renderChild(name)
  if (_t10) _div9.appendChild(_t10)
  _div7.appendChild(_div9)
  return _div7
})()
      ))
  if (_t6) _div5.appendChild(_t6)
  _div0.appendChild(_div5)
  return _div0
})()
}
