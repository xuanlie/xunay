// 侧栏导航（原生 details 折叠）
import { div, span, a, tag, computed, effect } from '/tmp/xuyg-test/xunay.js'
import { nav } from '../docs-nav.js'
import { route, go } from '../router.js'

const Details = tag('details')
const Summary = tag('summary')

// 一个 computed 集中订阅 route，避免 320 个 item 各自订阅
const curSlug = computed(() => {
  const r = route()
  return r === '/' ? '01-overview' : r.slice(1)
})

// 每个 slug 对应一个 slug → el 的映射（Sidebar 内部）
// 用模块级 Map，保证跨多次 Sidebar() 调用
const itemRefs = new Map()

function Group(g, onPick) {
  return Details({ class: 'nav-group', open: true },
    Summary({ class: 'nav-group-title' },
      (() => {
  const _span17 = document.createElement("span")
  _span17.className = 'nav-arrow'
  _span17.appendChild(document.createTextNode('▾'))
  return _span17
})(),
      (() => {
  const _span15 = document.createElement("span")
  _span15.className = 'nav-title-text'
  const _t16 = __rt__.renderChild(g.group)
  if (_t16) _span15.appendChild(_t16)
  return _span15
})(),
      (() => {
  const _span13 = document.createElement("span")
  _span13.className = 'nav-count'
  const _t14 = __rt__.renderChild(String(g.items.length))
  if (_t14) _span13.appendChild(_t14)
  return _span13
})()
    ),
    (() => {
  const _div9 = document.createElement("div")
  _div9.className = 'nav-items'
  const _t10 = __rt__.renderChild(g.items.map(it => (() => {
  const _a11 = document.createElement("a")
  if (typeof ((el) => itemRefs.set(it.slug, el)) === 'function') ((el) => itemRefs.set(it.slug, el))(_a11)
  _a11.className = 'nav-item'
  _a11.setAttribute("data-slug", it.slug)
  _a11.setAttribute("href", '#' + it.slug)
  _a11.addEventListener("click", () => { if (onPick) onPick() })
  const _t12 = __rt__.renderChild(it.title)
  if (_t12) _a11.appendChild(_t12)
  return _a11
})()))
  if (_t10) _div9.appendChild(_t10)
  return _div9
})()
  )
}

export function Sidebar({ onPick }) {
  // 一个 effect 更新所有 item 的 on 类
  effect(() => {
    const cur = curSlug()
    for (const [slug, el] of itemRefs) {
      if (!el || !el.isConnected) continue
      if (slug === cur) {
        if (!el.classList.contains('on')) el.classList.add('on')
      } else {
        if (el.classList.contains('on')) el.classList.remove('on')
      }
    }
  })

  return (() => {
  const _div0 = document.createElement("div")
  _div0.className = 'sidebar'
  const _div1 = document.createElement("div")
  _div1.className = 'sidebar-brand'
  _div1.addEventListener("click", () => go('/'))
  const _div2 = document.createElement("div")
  _div2.className = 'brand-logo'
  _div2.appendChild(document.createTextNode('X'))
  _div1.appendChild(_div2)
  const _div3 = document.createElement("div")
  _div3.className = 'brand-text'
  const _span4 = document.createElement("span")
  _span4.className = 'brand-name'
  _span4.appendChild(document.createTextNode('XuNay'))
  _div3.appendChild(_span4)
  const _span5 = document.createElement("span")
  _span5.className = 'brand-ver'
  _span5.appendChild(document.createTextNode('v1.2.8'))
  _div3.appendChild(_span5)
  _div1.appendChild(_div3)
  _div0.appendChild(_div1)
  const _div6 = document.createElement("div")
  _div6.className = 'sidebar-body'
  const _div7 = document.createElement("div")
  const _t8 = __rt__.renderChild(nav.map(g => Group(g, onPick)))
  if (_t8) _div7.appendChild(_t8)
  _div6.appendChild(_div7)
  _div0.appendChild(_div6)
  return _div0
})()
}
