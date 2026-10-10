import { px, cx } from './kit-util.js'
import { div, span, button, a, img, pre, code } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Row, Col, Card, Btn, Text } from './kit.js'

export function Typography(props, ...children) {
  const { variant = 'body', bold, italic, underline, delete: del, code: isCode, color, size } = px(props)
  const Tag = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', body: 'p', caption: 'span' }[variant] || 'p'
  const sizes = { h1: '28px', h2: '22px', h3: '18px', h4: '16px', body: '14px', caption: '12px' }
  const style = {
    fontWeight: bold ? '700' : undefined,
    fontStyle: italic ? 'italic' : undefined,
    textDecoration: (underline ? 'underline ' : '') + (del ? 'line-through' : ''),
    color: color,
    fontSize: size || sizes[variant]
  }
  if (isCode) return code({ style: { ...style, background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' } }, ...children)
  return createElement(Tag, { style }, ...children)
}

export function Comment(props, ...children) {
  const { author, avatar, time, actions = [] } = px(props)
  return div({ style: { display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f3f4f6' } },
    avatar
      ? img({ src: avatar, style: { width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 } })
      : div({ style: { width: '40px', height: '40px', borderRadius: '50%', background: '#1f6feb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '600' } }, String(author || '?')[0]),
    div({ style: { flex: 1, minWidth: 0 } },
      Row({ gap: 2, align: 'center' },
        span({ style: { fontWeight: '600', fontSize: '14px' } }, author || ''),
        time ? span({ style: { fontSize: '12px', color: '#9ca3af' } }, time) : null
      ),
      div({ style: { marginTop: '4px', fontSize: '14px', color: '#374151' } }, ...children),
      actions.length ? Row({ gap: 2, style: { marginTop: '8px' } },
        ...actions.map(a => span({ style: { fontSize: '12px', color: '#6b7280', cursor: 'pointer' } }, a))
      ) : null
    )
  )
}

export function Watermark(props, ...children) {
  const { text = 'XuNay', opacity = 0.1, rotate = -22, gap = 100, fontSize = 16 } = px(props)
  return div({
    style: {
      position: 'relative',
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${gap}' height='${gap}'><text x='50%' y='50%' transform='rotate(${rotate} 50 50)' font-size='${fontSize}' fill='#000' opacity='${opacity}' text-anchor='middle'>${text}</text></svg>`)}")`,
      backgroundRepeat: 'repeat'
    }
  }, ...children)
}

export function Ribbon(props, ...children) {
  const { text, color = '#1f6feb', position = 'end' } = px(props)
  return div({ style: { position: 'relative' } },
    ...children,
    div({
      style: {
        position: 'absolute', top: 0,
        [position === 'start' ? 'left' : 'right']: 0,
        background: color, color: '#fff', padding: '4px 12px', fontSize: '12px', fontWeight: '600',
        borderRadius: position === 'start' ? '0 0 6px 0' : '0 0 0 6px'
      }
    }, text)
  )
}

export function Code(props) {
  const { children, language, copyable = true } = px(props)
  const copied = signal(false)
  const doCopy = () => {
    const t = typeof children === 'string' ? children : String(children || '')
    navigator.clipboard ? navigator.clipboard.writeText(t) : 0
    copied(true)
    setTimeout(() => copied(false), 1200)
  }
  return div({ style: { position: 'relative', background: '#0d1117', color: '#e6edf3', borderRadius: '8px', padding: '14px 16px', fontFamily: 'ui-monospace,monospace', fontSize: '13px', lineHeight: 1.6, overflow: 'auto' } },
    copyable ? button({
      style: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,.1)', color: '#e6edf3', border: 0, padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
      on: { click: doCopy }
    }, () => copied() ? '已复制' : '复制') : null,
    pre({ style: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' } }, children)
  )
}

export function Keyboard(props, ...children) {
  return span({
    style: {
      display: 'inline-block', padding: '2px 8px', background: '#f3f4f6',
      border: '1px solid #d1d5db', borderBottom: '2px solid #d1d5db',
      borderRadius: '4px', fontFamily: 'ui-monospace,monospace', fontSize: '12px',
      fontWeight: '600', color: '#374151', margin: '0 2px'
    }
  }, ...children)
}

export function Highlight(props, ...children) {
  const { text = '', keyword = '', color = '#fef08a' } = px(props)
  const parts = String(text).split(new RegExp(`(${keyword})`, 'gi'))
  return span(null, ...parts.map(p =>
    p.toLowerCase() === keyword.toLowerCase()
      ? span({ style: { background: color, padding: '0 2px', borderRadius: '2px' } }, p)
      : p
  ))
}

export function Ellipsis(props, ...children) {
  const { lines = 1, tooltip = true } = px(props)
  const [hover, setHover] = [signal(false), v => hover(v)]
  return span({
    style: lines === 1
      ? { display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
      : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    on: { mouseenter: () => setHover(true), mouseleave: () => setHover(false) }
  }, ...children)
}
