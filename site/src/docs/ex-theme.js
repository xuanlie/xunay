// 主题切换
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("主题切换"),
    P("浅色/深色主题——CSS 变量 + signal。"),
    H2("CSS"),
    Code(":root {\n  --bg: #ffffff;\n  --fg: #1a1a2e;\n  --card: #f8f9fa;\n  --border: #e5e7eb;\n}\n\n[data-theme=\"dark\"] {\n  --bg: #1a1a2e;\n  --fg: #e8e8f0;\n  --card: #25253a;\n  --border: #3a3a50;\n}\n\nbody { background: var(--bg); color: var(--fg); }", "css"),
    H2("代码"),
    Code("import { div, h1, button, span, signal, effect, mount } from 'xunay'\n\nconst theme = signal(localStorage.getItem('theme') || 'light')\n\n// 应用到 document\neffect(() => {\n  document.documentElement.setAttribute('data-theme', theme())\n  localStorage.setItem('theme', theme())\n})\n\n// 跟随系统\nfunction followSystem() {\n  const mq = matchMedia('(prefers-color-scheme: dark)')\n  theme(mq.matches ? 'dark' : 'light')\n  mq.addEventListener('change', e => theme(e.matches ? 'dark' : 'light'))\n}\n\nmount(() => div({ class: 'app' },\n  h1(null, '主题切换'),\n  span(null, () => '当前: ' + theme()),\n  div({ class: 'row' },\n    button({ on: { click: () => theme('light') } }, '浅色'),\n    button({ on: { click: () => theme('dark') } }, '深色'),\n    button({ on: { click: followSystem } }, '跟随系统')\n  )\n), '#app')", "xuy"),
    H2("学习点"),
    Ul("CSS 变量做主题","effect 同步到 document + localStorage","matchMedia 跟随系统"),
  )
}
