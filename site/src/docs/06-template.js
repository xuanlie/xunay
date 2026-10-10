// 模板语法
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("模板语法"),
    P("xunay 没有发明新语法——它就是 JavaScript。你写的每一行都是标准 JS，只是约定了两种写法：静态直接写，动态用函数包。"),
    H2("唯一的规则"),
    Quote("静态内容直接写，动态内容用函数包。"),
    P("记住这一条，就掌握了 xunay 的全部模板语法。"),
    H2("对比"),
    Code("// 静态：永远不变\nspan(null, 'hello')\n\n// 动态：跟 n 变化\nspan(null, () => n())\n\n// 动态拼接\nspan(null, () => 'n = ' + n())\n\n// 响应式模板字符串\nspan(null, txt`n = ${n}`)", "xuy"),
    H2("为什么这么设计"),
    P("React 用 JSX 编译成函数调用，Vue 用模板编译成渲染函数——都要额外的编译步骤和心智模型。xunay 直接用 JS：写 div(...) 就是调用一个函数，返回一个普通对象。"),
    Code("// 这些都是普通函数调用，没有编译魔法\nconst el = div({ class: 'card' }, 'hello')\nconsole.log(el)   // { [ELEMENT]: true, type: 'div', props: {...}, children: [...] }", "xuy"),
    H2("静态 vs 动态的判定"),
    Table(["写法","判定"], [["\"hello\"","静态"],["42","静态"],["n()","立即求值（静态）"],["() => n()","动态（订阅 n）"],["() => \"n=\" + n()","动态"],["txt`n = ${n}`","动态"]]),
    Warn("最常见的错误：写成 span(null, n()) —— 立即取值，只显示初始值。必须写 span(null, () => n())。"),
    H2("属性"),
    Code("div({\n  class: 'card',                    // 静态\n  id: () => 'item-' + n(),           // 动态\n  style: { color: 'red' },            // 静态对象\n  style: () => ({ color: n() > 0 ? 'red' : 'blue' })   // 动态对象\n})", "xuy"),
    H2("事件"),
    P("事件值永远是函数——不会自动触发，由浏览器事件触发。"),
    Code("button({\n  on: {\n    click: () => n(v => v + 1),\n    mouseenter: () => hover(true),\n    keydown: e => { if (e.key === 'Enter') submit() }\n  }\n}, '按钮')", "xuy"),
    H2("条件"),
    Code("// 方式 1：show（有独立 scope）\nshow(() => open(), () => div(null, '内容'))\n\n// 方式 2：三目\n() => open() ? div(null, '内容') : null\n\n// 方式 3：if-return\n() => {\n  if (status() === 'loading') return div(null, '加载中')\n  if (status() === 'error') return div(null, '错误')\n  return div(null, 'OK')\n}", "xuy"),
    H2("列表"),
    Code("// 静态展开：items 变了不会更新\ndiv(null, ...items.map(i => li(null, i)))\n\n// 动态列表：items 变就更新\nul(null, list(items, i => i.id, i => li(null, i.title)))", "xuy"),
    H2("Fragment"),
    Code("import { frag } from 'xunay'\n\n// 多个并列节点\nfrag(\n  h1(null, '标题'),\n  p(null, '正文')\n)", "xuy"),
    H2("事件回调里的 this"),
    P("xunay 里没有 this 概念——所有组件都是普通函数，事件回调是普通箭头函数。不需要 bind。"),
    Code("function Counter() {\n  const n = signal(0)\n  // 箭头函数自动捕获 n\n  const inc = () => n(v => v + 1)\n  return button({ on: { click: inc } }, '+1')\n}", "xuy"),
    H2("用 .xuy 写"),
    P(".xuy 文件就是 JS 加一点约定——标签名可以当函数直接用（不用 import）。"),
    Code("// app.xuy\nconst n = signal(0)\n\nmount(() => div({ class: 'app' },\n  button({ on: { click: () => n(v => v - 1) } }, '-'),\n  span(null, () => 'n = ' + n()),\n  button({ on: { click: () => n(v => v + 1) } }, '+')\n), '#app')", "xuy"),
    H2("完整示例"),
    Code("import { div, h1, p, ul, li, button, input, signal, computed, list, show, txt, mount } from 'xunay'\n\nfunction TodoApp() {\n  const todos = signal([{ id: 1, title: '学习 xunay', done: false }])\n  const filter = signal('all')\n  const draft = signal('')\n\n  const filtered = computed(() => {\n    const f = filter()\n    const t = todos()\n    if (f === 'active') return t.filter(x => !x.done)\n    if (f === 'done') return t.filter(x => x.done)\n    return t\n  })\n\n  const add = () => {\n    if (!draft().trim()) return\n    todos(list => [...list, { id: Date.now(), title: draft(), done: false }])\n    draft('')\n  }\n\n  const toggle = id => todos(list => list.map(t => t.id === id ? { ...t, done: !t.done } : t))\n\n  return div({ class: 'app' },\n    h1(null, '待办'),\n    div({ class: 'row' },\n      input({\n        placeholder: '输入任务…',\n        value: () => draft(),\n        on: { input: e => draft(e.target.value), keydown: e => { if (e.key === 'Enter') add() } }\n      }),\n      button({ on: { click: add } }, '添加')\n    ),\n    div({ class: 'tabs' },\n      ['all', 'active', 'done'].map(f =>\n        span({\n          class: () => 'tab' + (filter() === f ? ' on' : ''),\n          on: { click: () => filter(f) }\n        }, f === 'all' ? '全部' : f === 'active' ? '未完成' : '已完成')\n      )\n    ),\n    show(() => filtered().length === 0, () => p(null, '暂无任务')),\n    ul(null,\n      list(filtered, t => t.id, t => li({ class: () => t.done ? 'done' : '' },\n        input({ type: 'checkbox', checked: () => t.done, on: { change: () => toggle(t.id) } }),\n        span(null, t.title)\n      ))\n    ),\n    p(null, txt`共 ${() => todos().length} 条`)\n  )\n}\n\nmount(() => TodoApp(), '#app')", "xuy"),
  )
}
