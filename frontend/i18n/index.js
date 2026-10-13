// XuNay - i18n
// V056 修复：用包名导入，构建时由 xuyc 重写
import { signal } from 'xunay'

const dicts = {}
const lang = signal('zh')

export function load(name, dict) {
  dicts[name] = dict
}

export function setLang(name) {
  lang(name)
}

export function getLang() {
  return lang()
}

export function t(key) {
  const d = dicts[lang()] || {}
  return d[key] || key
}
