// XuNay - i18n
import { signal } from '../../../core/src/index.js'

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
