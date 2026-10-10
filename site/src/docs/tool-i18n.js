// i18n 国际化
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("i18n 国际化"),
    P("多语言切换。支持插值、回退、自动持久化。"),
    H2("引入"),
    Code("import { i18n } from 'xunay/i18n'", "js"),
    H2("基础用法"),
    Code("i18n.t('hello')                  // '你好'\ni18n.t('welcome', { name: 'Leo' })  // '欢迎，Leo'\n\ni18n.setLocale('en')\ni18n.t('hello')                  // 'Hello'", "js"),
    H2("响应式版本"),
    Code("import { div } from 'xunay'\nimport { i18n } from 'xunay/i18n'\n\n// 函数包起来，语言变了自动重渲染\ndiv(null, i18n.tr('welcome', { name: 'Leo' }))", "js"),
    H2("自定义配置"),
    Code("import { createI18n } from 'xunay/i18n'\n\nconst i18n = createI18n({\n  locale: 'zh',\n  fallback: 'en',\n  persist: true,\n  storageKey: 'myapp:lang',\n  messages: {\n    zh: {\n      hello: '你好',\n      nav: { home: '首页', about: '关于' },\n    },\n    en: {\n      hello: 'Hello',\n      nav: { home: 'Home', about: 'About' },\n    },\n  },\n})", "js"),
    H2("动态加语言"),
    Code("i18n.addMessages('ja', { hello: 'こんにちは' })\ni18n.setLocale('ja')\ni18n.t('hello')  // 'こんにちは'", "js"),
    H2("嵌套 key"),
    Code("i18n.t('nav.home')   // '首页'", "js"),
    H2("插值"),
    Code("// messages: { zh: { greet: '你好，{name}！你有 {count} 条消息' } }\ni18n.t('greet', { name: 'Leo', count: 5 })\n// '你好，Leo！你有 5 条消息'", "js"),
  )
}
