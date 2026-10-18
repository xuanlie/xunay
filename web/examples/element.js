import { runtime } from './runtime.js'

const _warnedTags = new Set()

export const ELEMENT = Symbol.for('xunay.element')
export const FRAGMENT = Symbol.for('xunay.fragment')

export function createElement(type, props, ...children) { return { [ELEMENT]: true, type, props: props || {}, children } }
export function createFragment(children) { return { [FRAGMENT]: true, children } }

const N = 'div span p a button input form label ul ol li h1 h2 h3 h4 h5 h6 img br hr table thead tbody tr td th pre code blockquote header footer nav main section article select option textarea checkbox switch radio progress slider tabs tab canvas video audio summary details'.split(' ')

export const tags = {}
for (const t of N) tags[t] = (p, ...c) => createElement(t, p, ...c)

export const div = tags.div, span = tags.span, p = tags.p, a = tags.a, button = tags.button, input = tags.input, form = tags.form, label = tags.label, ul = tags.ul, ol = tags.ol, li = tags.li, h1 = tags.h1, h2 = tags.h2, h3 = tags.h3, h4 = tags.h4, h5 = tags.h5, h6 = tags.h6, img = tags.img, br = tags.br, hr = tags.hr, table = tags.table, thead = tags.thead, tbody = tags.tbody, tr = tags.tr, td = tags.td, th = tags.th, pre = tags.pre, code = tags.code, blockquote = tags.blockquote, header = tags.header, footer = tags.footer, nav = tags.nav, main = tags.main, section = tags.section, article = tags.article, select = tags.select, option = tags.option, textarea = tags.textarea, checkbox = tags.checkbox, radio = tags.radio, progress = tags.progress, slider = tags.slider, tabs = tags.tabs, tab = tags.tab, canvas = tags.canvas, video = tags.video, audio = tags.audio, summary = tags.summary, details = tags.details

export function tag(n) { return (p, ...c) => createElement(n, p, ...c) }

// 新增：注册自定义标签 / Web Components
export function registerTags(names) {
  const list = typeof names === 'string' ? names.split(/\s+/).filter(Boolean) : (Array.isArray(names) ? names : [names])
  const added = []
  for (const t of list) {
    if (tags[t]) {
      if (runtime && runtime.dev && !_warnedTags.has(t)) {
        _warnedTags.add(t)
        console.warn('[XuNay] registerTags: 标签已存在，跳过', t)
      }
      continue
    }
    tags[t] = (p, ...c) => createElement(t, p, ...c)
    added.push(t)
  }
  return added
}
