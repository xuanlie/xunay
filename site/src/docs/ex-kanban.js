// 看板
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("看板"),
    P("拖拽任务卡——三列布局。"),
    H2("代码"),
    Code("import { div, h1, span, button, signal, list, mount } from 'xunay'\n\nconst columns = ['todo', 'doing', 'done']\nconst titles = { todo: '待做', doing: '进行中', done: '已完成' }\n\nconst tasks = signal([\n  { id: 1, title: '写文档', status: 'todo' },\n  { id: 2, title: '修 bug', status: 'doing' },\n  { id: 3, title: '开会', status: 'done' },\n])\n\nconst byStatus = s => tasks().filter(t => t.status === s)\n\nfunction move(id, dir) {\n  tasks(list => list.map(t => {\n    if (t.id !== id) return t\n    const i = columns.indexOf(t.status)\n    const next = columns[Math.max(0, Math.min(columns.length - 1, i + dir))]\n    return { ...t, status: next }\n  }))\n}\n\nfunction add(status) {\n  const title = prompt('任务标题')\n  if (!title) return\n  tasks(l => [...l, { id: Date.now(), title, status }])\n}\n\nfunction remove(id) {\n  tasks(l => l.filter(t => t.id !== id))\n}\n\nmount(() => div({ class: 'kanban' },\n  h1(null, '看板'),\n  div({ class: 'kb-cols' },\n    ...columns.map(col =>\n      div({ class: 'kb-col' },\n        div({ class: 'kb-col-head' },\n          span(null, titles[col]),\n          button({ class: 'kb-add', on: { click: () => add(col) } }, '+')\n        ),\n        div({ class: 'kb-list' },\n          list(() => byStatus(col), t => t.id, t =>\n            div({ class: 'kb-card' },\n              div({ class: 'kb-title' }, t.title),\n              div({ class: 'kb-actions' },\n                col !== 'todo' && button({ on: { click: () => move(t.id, -1) } }, '←'),\n                col !== 'done' && button({ on: { click: () => move(t.id, 1) } }, '→'),\n                button({ class: 'del', on: { click: () => remove(t.id) } }, '×')\n              )\n            )\n          )\n        )\n      )\n    )\n  )\n), '#app')", "xuy"),
  )
}
