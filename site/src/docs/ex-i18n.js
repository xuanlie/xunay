// 国际化
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("国际化"),
    P("多语言切换——上下文传递 + 动态文字。"),
    H2("字典"),
    Code("// i18n/dict.js\nexport const dict = {\n  'zh-CN': {\n    hello: '你好',\n    bye: '再见',\n    welcome: '欢迎使用 {name}',\n    count: '共 {n} 条'\n  },\n  'en-US': {\n    hello: 'Hello',\n    bye: 'Bye',\n    welcome: 'Welcome, {name}',\n    count: '{n} items'\n  }\n}", "js"),
    H2("上下文"),
    Code("import { ctx, signal } from 'xunay'\nimport { dict } from './dict.js'\n\nexport const locale = signal('zh-CN')\nexport const LocaleCtx = ctx('zh-CN')\n\nexport function t(key, vars) {\n  const l = LocaleCtx.get()\n  let s = (dict[l] && dict[l][key]) || key\n  if (vars) {\n    for (const k in vars) s = s.replace('{' + k + '}', vars[k])\n  }\n  return s\n}", "xuy"),
    H2("应用"),
    Code("import { div, h1, p, button, span, signal, mount } from 'xunay'\nimport { locale, LocaleCtx, t } from './i18n/index.js'\n\nfunction Content() {\n  const n = signal(3)\n  return div(null,\n    h1(null, t('hello')),\n    p(null, t('welcome', { name: '用户' })),\n    p(null, t('count', { n: n() })),\n    button({ on: { click: () => n(v => v + 1) } }, '+1')\n  )\n}\n\nmount(() => div({ class: 'app' },\n  div({ class: 'lang-switch' },\n    button({ on: { click: () => locale('zh-CN') } }, '中文'),\n    button({ on: { click: () => locale('en-US') } }, 'English')\n  ),\n  () => LocaleCtx.provide(locale(), () => Content())\n), '#app')", "xuy"),
    H2("学习点"),
    Ul("ctx 传递语言","locale 变化时整个子树重渲染","t() 函数查字典"),
  )
}
