// 数据表格
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("数据表格"),
    P("带排序、分页、过滤的表格。"),
    H2("代码"),
    Code("// app.xuy\nimport { div, table, thead, tbody, tr, th, td, input, button, span, signal, computed, list, mount } from 'xunay'\n\nconst rows = signal(Array.from({ length: 100 }, (_, i) => ({\n  id: i + 1,\n  name: '用户 ' + (i + 1),\n  age: 20 + (i % 40),\n  city: ['北京', '上海', '广州', '深圳'][i % 4]\n})))\n\nconst q = signal('')\nconst sortBy = signal('id')\nconst sortDir = signal('asc')\nconst page = signal(1)\nconst pageSize = 10\n\nconst filtered = computed(() => {\n  const keyword = q().toLowerCase()\n  if (!keyword) return rows()\n  return rows().filter(r => r.name.toLowerCase().includes(keyword))\n})\n\nconst sorted = computed(() => {\n  const list = [...filtered()]\n  const key = sortBy()\n  const dir = sortDir() === 'asc' ? 1 : -1\n  list.sort((a, b) => a[key] > b[key] ? dir : -dir)\n  return list\n})\n\nconst paged = computed(() => {\n  const start = (page() - 1) * pageSize\n  return sorted().slice(start, start + pageSize)\n})\n\nconst totalPages = computed(() => Math.ceil(filtered().length / pageSize))\n\nconst sortByCol = k => {\n  if (sortBy() === k) sortDir(d => d === 'asc' ? 'desc' : 'asc')\n  else { sortBy(k); sortDir('asc') }\n}\n\nmount(() => div({ class: 'page' },\n  div({ class: 'toolbar' },\n    input({ placeholder: '搜索姓名…', value: () => q(), on: { input: e => { q(e.target.value); page(1) } } })\n  ),\n\n  table({ class: 'table' },\n    thead(null, tr(null,\n      th({ on: { click: () => sortByCol('id') } }, 'ID'),\n      th({ on: { click: () => sortByCol('name') } }, '姓名'),\n      th({ on: { click: () => sortByCol('age') } }, '年龄'),\n      th({ on: { click: () => sortByCol('city') } }, '城市')\n    )),\n    tbody(null,\n      list(paged, r => r.id, r => tr(null,\n        td(null, String(r.id)),\n        td(null, r.name),\n        td(null, String(r.age)),\n        td(null, r.city)\n      ))\n    )\n  ),\n\n  div({ class: 'pagination' },\n    button({ on: { click: () => page(p => Math.max(1, p - 1)) }, disabled: () => page() === 1 }, '上一页'),\n    span(null, () => page() + ' / ' + totalPages()),\n    button({ on: { click: () => page(p => Math.min(totalPages(), p + 1)) }, disabled: () => page() >= totalPages() }, '下一页')\n  )\n), '#app')", "xuy"),
    H2("学习点"),
    Ul("computed 链式派生——filtered → sorted → paged","每次输入 q 只重算 filtered 之后的链","表格用 th / td 标签工厂"),
  )
}
