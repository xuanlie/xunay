// 日历
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("日历"),
    P("月视图——日期网格 + 事件标记。"),
    H2("代码"),
    Code("import { div, h1, button, span, signal, computed, list, show, mount } from 'xunay'\n\nconst today = new Date()\nconst year = signal(today.getFullYear())\nconst month = signal(today.getMonth())\nconst events = signal({\n  [`${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`]: ['会议 10:00']\n})\n\nconst days = computed(() => {\n  const y = year(), m = month()\n  const first = new Date(y, m, 1)\n  const lastDay = new Date(y, m + 1, 0).getDate()\n  const startWeekday = first.getDay()\n  const out = []\n  for (let i = 0; i < startWeekday; i++) out.push({ type: 'blank', key: 'b' + i })\n  for (let d = 1; d <= lastDay; d++) {\n    const key = y + '-' + m + '-' + d\n    out.push({ type: 'day', day: d, key, events: events()[key] || [] })\n  }\n  return out\n})\n\nconst title = computed(() => year() + ' 年 ' + (month() + 1) + ' 月')\n\nconst prev = () => {\n  if (month() === 0) { year(y => y - 1); month(11) }\n  else month(m => m - 1)\n}\nconst next = () => {\n  if (month() === 11) { year(y => y + 1); month(0) }\n  else month(m => m + 1)\n}\n\nconst weekdays = ['日', '一', '二', '三', '四', '五', '六']\n\nmount(() => div({ class: 'calendar' },\n  div({ class: 'cal-header' },\n    button({ on: { click: prev } }, '‹'),\n    h1(null, () => title()),\n    button({ on: { click: next } }, '›')\n  ),\n  div({ class: 'cal-week' }, ...weekdays.map(w => span({ class: 'cal-wd' }, w))),\n  div({ class: 'cal-grid' },\n    list(days, d => d.key, d =>\n      d.type === 'blank'\n        ? div({ class: 'cal-cell blank' })\n        : div({ class: 'cal-cell' },\n            span({ class: 'cal-day' }, String(d.day)),\n            show(() => d.events.length > 0, () =>\n              div({ class: 'cal-events' },\n                list(d.events, e => e, e => div({ class: 'cal-event' }, e))\n              )\n            )\n          )\n    )\n  )\n), '#app')", "xuy"),
  )
}
