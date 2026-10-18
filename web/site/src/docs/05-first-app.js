// 第一个应用
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("第一个应用"),
    P("做一个待办清单——从状态到界面，完整走一遍。"),
    H2("1. 状态"),
    P("三个 signal：列表、过滤条件、输入草稿。"),
    Code("import { signal, computed } from '/tmp/xuyg-test/xunay.js'\n\nexport const todos = signal([])\nexport const filter = signal('all')\nexport const draft = signal('')", "xuy"),
    H2("2. 派生"),
    P("过滤后的列表和统计——用 computed，依赖变才重算。"),
    Code("import { computed } from '/tmp/xuyg-test/xunay.js'\n\nexport const filtered = computed(() => {\n  const t = todos(), f = filter()\n  if (f === 'active') return t.filter(x => !x.done)\n  if (f === 'done') return t.filter(x => x.done)\n  return t\n})\n\nexport const stats = computed(() => ({\n  total: todos().length,\n  active: todos().filter(x => !x.done).length,\n}))", "xuy"),
    H2("3. 操作"),
    P("增删改——列表操作返回新数组，signal 靠引用变化触发更新。"),
    Code("export const add = () => {\n  if (!draft().trim()) return\n  todos(l => [...l, { id: Date.now(), title: draft(), done: false }])\n  draft('')\n}\n\nexport const toggle = id =>\n  todos(l => l.map(t => t.id === id ? { ...t, done: !t.done } : t))\n\nexport const remove = id =>\n  todos(l => l.filter(t => t.id !== id))", "xuy"),
    H2("4. 界面"),
    P("标签名直接当函数用，不用 import——编译器会注入。动态内容用函数包。"),
    Code("import { signal, computed, list, show, mount, txt } from '/tmp/xuyg-test/xunay.js'\n\nmount(() => div({ class: 'app' },\n  h1(null, '待办清单'),\n  p({ class: 'sub' }, txt`共 ${() => stats().total} 条 · 未完成 ${() => stats().active}`),\n\n  div({ class: 'row' },\n    input({\n      placeholder: '输入任务，回车添加…',\n      value: () => draft(),\n      on: {\n        input: e => draft(e.target.value),\n        keydown: e => { if (e.key === 'Enter') add() }\n      }\n    }),\n    button({ on: { click: add } }, '添加')\n  ),\n\n  div({ class: 'tabs' },\n    ['all', 'active', 'done'].map(k =>\n      span({\n        class: () => 'tab' + (filter() === k ? ' on' : ''),\n        on: { click: () => filter(k) }\n      }, k === 'all' ? '全部' : k === 'active' ? '未完成' : '已完成')\n    )\n  ),\n\n  show(() => filtered().length === 0, () => p({ class: 'empty' }, '暂无任务')),\n  ul({ class: 'list' },\n    list(filtered, t => t.id, t => li({ class: () => t.done ? 'done' : '' },\n      input({ type: 'checkbox', checked: () => t.done, on: { change: () => toggle(t.id) } }),\n      span(null, t.title),\n      button({ class: 'del', on: { click: () => remove(t.id) } }, '×')\n    ))\n  )\n), '#app')", "xuy"),
    H2("5. 完整代码"),
    P("把上面几段拼到一个文件就是可跑的应用："),
    Code("// app.xuy\n// title: 待办清单\nimport { signal, computed, list, show, mount, txt } from '/tmp/xuyg-test/xunay.js'\n\nconst todos = signal([])\nconst filter = signal('all')\nconst draft = signal('')\n\nconst filtered = computed(() => {\n  const t = todos(), f = filter()\n  if (f === 'active') return t.filter(x => !x.done)\n  if (f === 'done') return t.filter(x => x.done)\n  return t\n})\n\nconst stats = computed(() => ({\n  total: todos().length,\n  active: todos().filter(x => !x.done).length,\n}))\n\nconst add = () => {\n  if (!draft().trim()) return\n  todos(l => [...l, { id: Date.now(), title: draft(), done: false }])\n  draft('')\n}\nconst toggle = id => todos(l => l.map(t => t.id === id ? { ...t, done: !t.done } : t))\nconst remove = id => todos(l => l.filter(t => t.id !== id))\n\nmount(() => div({ class: 'app' },\n  h1(null, '待办清单'),\n  p({ class: 'sub' }, txt`共 ${() => stats().total} 条 · 未完成 ${() => stats().active}`),\n  div({ class: 'row' },\n    input({\n      placeholder: '输入任务，回车添加…',\n      value: () => draft(),\n      on: {\n        input: e => draft(e.target.value),\n        keydown: e => { if (e.key === 'Enter') add() }\n      }\n    }),\n    button({ on: { click: add } }, '添加')\n  ),\n  div({ class: 'tabs' },\n    ['all', 'active', 'done'].map(k =>\n      span({\n        class: () => 'tab' + (filter() === k ? ' on' : ''),\n        on: { click: () => filter(k) }\n      }, k === 'all' ? '全部' : k === 'active' ? '未完成' : '已完成')\n    )\n  ),\n  show(() => filtered().length === 0, () => p({ class: 'empty' }, '暂无任务')),\n  ul({ class: 'list' },\n    list(filtered, t => t.id, t => li({ class: () => t.done ? 'done' : '' },\n      input({ type: 'checkbox', checked: () => t.done, on: { change: () => toggle(t.id) } }),\n      span(null, t.title),\n      button({ class: 'del', on: { click: () => remove(t.id) } }, '×')\n    ))\n  )\n), '#app')", "xuy"),
    H2("6. 跑起来"),
    Code("xuyc3 build app.xuy --out dist\npython3 -m http.server 8080 --directory dist", "bash"),
    H2("下一步"),
    Ul("读「模板语法」搞清静态和动态的规则","读「概念对照」从 React / Vue 角度理解","看「示例 → 待办清单」的完整版（带持久化）"),
  )
}
