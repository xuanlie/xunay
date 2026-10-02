// HTML 白名单净化——用于 set(dom,'html',v) 的兜底
const ALLOWED = new Set([
  'a','b','i','em','strong','p','br','hr','ul','ol','li',
  'h1','h2','h3','h4','h5','h6','code','pre','blockquote',
  'span','div','table','thead','tbody','tr','td','th','img'
])
const ATTR_OK = new Set(['href','src','alt','title','class','id'])

export function sanitize(html) {
  if (typeof html !== 'string') return ''
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  walk(tpl.content)
  return tpl.innerHTML
}

function walk(node) {
  for (const el of [...node.children]) {
    if (!ALLOWED.has(el.tagName.toLowerCase())) {
      el.replaceWith(...el.childNodes)
      continue
    }
    for (const a of [...el.attributes]) {
      const n = a.name.toLowerCase()
      if (!ATTR_OK.has(n)) { el.removeAttribute(a.name); continue }
      if ((n === 'href' || n === 'src') && /^\s*javascript:/i.test(a.value)) {
        el.removeAttribute(a.name)
      }
    }
    walk(el)
  }
}

// 用法：在 render.js 的 set() 里把 d.innerHTML = v 改成 d.innerHTML = sanitize(v)
// TODO: 接入 render.js

