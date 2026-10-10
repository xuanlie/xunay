// 计数器
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("计数器"),
    P("最简单的 xunay 应用——20 行代码。"),
    H2("代码"),
    Code("// app.xuy\n// title: 计数器\nimport { div, h1, button, span, signal, computed, mount } from 'xunay'\n\nconst n = signal(0)\nconst double = computed(() => n() * 2)\n\nmount(() => div({ class: 'app' },\n  h1(null, '计数器'),\n  div({ class: 'row' },\n    button({ on: { click: () => n(v => v - 1) } }, '-'),\n    span({ class: 'num' }, () => String(n())),\n    button({ on: { click: () => n(v => v + 1) } }, '+')\n  ),\n  p(null, () => '双倍: ' + double()),\n  button({ on: { click: () => n(0) } }, '重置')\n), '#app')", "xuy"),
    H2("关键点"),
    Ul("signal(0) 创建状态","() => n() 建立响应式","n(v => v + 1) 函数式更新"),
    H2("扩展"),
    H3("加步长"),
    Code("const step = signal(1)\nbutton({ on: { click: () => n(v => v + step()) } }, '+')", "xuy"),
    H3("持久化"),
    Code("import { effect } from 'xunay'\n\nconst saved = localStorage.getItem('count')\nconst n = signal(saved ? +saved : 0)\n\neffect(() => localStorage.setItem('count', n()))", "xuy"),
    H3("键盘快捷键"),
    Code("import { onMount } from 'xunay'\n\nonMount(() => {\n  const h = e => {\n    if (e.key === 'ArrowUp') n(v => v + 1)\n    if (e.key === 'ArrowDown') n(v => v - 1)\n  }\n  window.addEventListener('keydown', h)\n  onUnmount(() => window.removeEventListener('keydown', h))\n})", "xuy"),
  )
}
