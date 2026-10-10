// XuNay i18n · 国际化
import { signal, computed } from './core.js'

export function createI18n(opts = {}) {
  const {
    locale: initLocale = 'zh',
    fallback = 'zh',
    messages = {},
    storageKey = 'xunay:locale',
    persist = true,
  } = opts

  let saved = initLocale
  if (persist && typeof localStorage !== 'undefined') {
    saved = localStorage.getItem(storageKey) || initLocale
  }

  const localeSig = signal(saved)

  function get(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj)
  }

  function interpolate(str, params) {
    if (typeof str !== 'string') return str
    return str.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? params[k] : '{' + k + '}')
  }

  function t(key, params) {
    const dict = messages[localeSig()] || {}
    const fb = messages[fallback] || {}
    let val = get(dict, key)
    if (val === undefined) val = get(fb, key)
    if (val === undefined) return key
    if (params) val = interpolate(val, params)
    return val
  }

  function setLocale(l) {
    localeSig(l)
    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, l)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
    }
  }

  return {
    locale: () => localeSig(),
    t,
    // 响应式版本，自动重渲染
    tr: (key, params) => () => t(key, params),
    setLocale,
    available: Object.keys(messages),
    addMessages(l, m) { messages[l] = { ...(messages[l] || {}), ...m } },
    setMessages(m) { Object.assign(messages, m) },
  }
}

export const i18n = createI18n({
  messages: {
    zh: { hello: '你好', welcome: '欢迎，{name}' },
    en: { hello: 'Hello', welcome: 'Welcome, {name}' },
  },
})
export default i18n
