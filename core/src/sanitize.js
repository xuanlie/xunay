// HTML 白名单清洗：允许安全标签 + data-* / aria-* 属性，拦截 javascript: / vbscript: / data:text/html
const ALLOWED = new Set([
  'a','b','i','em','strong','p','br','hr','ul','ol','li',
  'h1','h2','h3','h4','h5','h6','code','pre','blockquote',
  'span','div','table','thead','tbody','tr','td','th','img',
  'svg','path','circle','rect','line','polyline','polygon','g','defs','use','text','tspan'
])
const ATTR_OK = new Set([
  'href','src','alt','title','class','id',
  'viewBox','viewbox','d','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin',
  'cx','cy','r','x','y','x1','y1','x2','y2','width','height','points','transform','xmlns'
])

export function sanitize(html) {
  if (typeof html !== 'string') return ''
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  walk(tpl.content)
  return tpl.innerHTML
}

function walk(node) {
  // 先递归后代，保证被提升上来的子节点已经清洗过
  for (const child of [...node.children]) walk(child)
  // 再处理当前层：剥离非法标签 / 非法属性
  for (const el of [...node.children]) {
    const tag = el.tagName.toLowerCase()
    if (!ALLOWED.has(tag)) {
      el.replaceWith(...el.childNodes)
      continue
    }
    for (const a of [...el.attributes]) {
      const n = a.name.toLowerCase()
      if (n.startsWith('data-') || n.startsWith('aria-')) continue
      if (!ATTR_OK.has(n)) { el.removeAttribute(a.name); continue }
      if (n === 'href' || n === 'src') {
        const v = a.value.trim().toLowerCase().replace(/\s+/g, '')
        if (v.startsWith('javascript:') || v.startsWith('vbscript:') || v.startsWith('data:text/html')) {
          el.removeAttribute(a.name)
        }
      }
    }
  }
}
