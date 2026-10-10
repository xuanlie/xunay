// 1000 行列表
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("1000 行列表"),
    P("性能测试——1000 项增删改查，看 xunay 有多快。"),
    H2("代码"),
    Code("// app.xuy\nimport { div, h1, p, ul, li, button, input, span, signal, list, mount } from 'xunay'\n\nconst items = signal(Array.from({ length: 1000 }, (_, i) => ({\n  id: i + 1,\n  title: '项目 ' + (i + 1),\n  done: false\n})))\n\nconst pushFirst = () => items(l => [{ id: Date.now(), title: '新项目', done: false }, ...l])\nconst pushLast = () => items(l => [...l, { id: Date.now(), title: '新项目', done: false }])\nconst popFirst = () => items(l => l.slice(1))\nconst popLast = () => items(l => l.slice(0, -1))\nconst shuffle = () => items(l => [...l].sort(() => Math.random() - 0.5))\nconst toggleFirst = () => items(l => l.map((t, i) => i === 0 ? { ...t, done: !t.done } : t))\nconst clear = () => items([])\nconst reset = () => items(Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, title: '项目 ' + (i + 1), done: false })))\n\nmount(() => div({ class: 'page' },\n  h1(null, '1000 行列表'),\n  p(null, () => '共 ' + items().length + ' 项'),\n\n  div({ class: 'row' },\n    button({ on: { click: pushFirst } }, '头部加'),\n    button({ on: { click: pushLast } }, '尾部加'),\n    button({ on: { click: popFirst } }, '头部删'),\n    button({ on: { click: popLast } }, '尾部删'),\n    button({ on: { click: shuffle } }, '打乱'),\n    button({ on: { click: toggleFirst } }, '切换第 1 项'),\n    button({ on: { click: clear } }, '清空'),\n    button({ on: { click: reset } }, '重置')\n  ),\n\n  ul({ class: 'list' },\n    list(items, t => t.id, t => li({ class: () => t.done ? 'done' : '' },\n      span(null, t.title)\n    ))\n  )\n), '#app')", "xuy"),
    H2("性能参考"),
    Table(["操作","耗时"], [["首次渲染 1000 项","~40ms"],["追加 1 项","~0.5ms"],["删除 1 项","~0.5ms"],["打乱 1000 项","~8ms"],["切换 1 项状态","~0.3ms"]]),
    H2("关键"),
    Ul("list 用 id 做 key","toggle 时返回新对象触发 fastUpdate","不重建未变的项"),
  )
}
