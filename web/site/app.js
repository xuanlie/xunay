// title: XuNay 文档
import { div, a, mount, signal } from '/tmp/xuyg-test/xunay.js'
import { Sidebar } from './src/components/Sidebar.js'
import { Content } from './src/components/Content.js'
import { go } from './src/router.js'

const menuOpen = signal(false)

mount(() => (() => {
  const _div0 = document.createElement("div")
  __rt__.bindAttr(_div0, 'class', () => 'layout' + (menuOpen() ? ' menu-open' : ''))
  const _div1 = document.createElement("div")
  _div1.className = 'topbar'
  const _div2 = document.createElement("div")
  _div2.className = 'topbar-btn'
  _div2.addEventListener("click", () => menuOpen(!menuOpen()))
  const _div3 = document.createElement("div")
  _div3.className = 'hamburger'
  _div2.appendChild(_div3)
  _div1.appendChild(_div2)
  const _div4 = document.createElement("div")
  _div4.className = 'topbar-logo'
  _div4.addEventListener("click", () => go('/'))
  _div1.appendChild(_div4)
  const _div5 = document.createElement("div")
  _div5.className = 'topbar-title'
  _div5.addEventListener("click", () => go('/'))
  _div5.appendChild(document.createTextNode('XuNay'))
  _div1.appendChild(_div5)
  const _div6 = document.createElement("div")
  _div6.className = 'topbar-links'
  const _a7 = document.createElement("a")
  _a7.className = 'topbar-link'
  _a7.setAttribute("href", 'https://github.com')
  _a7.setAttribute("target", '_blank')
  _a7.appendChild(document.createTextNode('GitHub'))
  _div6.appendChild(_a7)
  const _a8 = document.createElement("a")
  _a8.className = 'topbar-link'
  _a8.setAttribute("href", 'https://npmjs.com/package/xunay')
  _a8.setAttribute("target", '_blank')
  _a8.appendChild(document.createTextNode('npm'))
  _div6.appendChild(_a8)
  _div1.appendChild(_div6)
  _div0.appendChild(_div1)
  const _div9 = document.createElement("div")
  _div9.className = 'backdrop'
  _div9.addEventListener("click", () => menuOpen(false))
  _div0.appendChild(_div9)
  const _t10 = __rt__.renderChild(Sidebar({ onPick: () => menuOpen(false) }))
  if (_t10) _div0.appendChild(_t10)
  const _t11 = __rt__.renderChild(Content())
  if (_t11) _div0.appendChild(_t11)
  return _div0
})(), '#app')
