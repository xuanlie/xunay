import { px, cx } from './kit-util.js'
import { div, span, button, a } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'

export function Menu(props) {
  const { items = [], mode = 'vertical', selected, onSelect } = px(props)
  const sel = () => typeof selected === 'function' ? selected() : selected
  const renderItem = (it, depth = 0) => div({
    style: {
      padding: '10px 16px', paddingLeft: (16 + depth * 16) + 'px',
      cursor: 'pointer', borderRadius: '6px', fontSize: '14px',
      background: sel() === it.key ? '#eff6ff' : 'transparent',
      color: sel() === it.key ? '#1f6feb' : '#374151',
      fontWeight: sel() === it.key ? '600' : '400'
    },
    on: {
      click: () => onSelect && onSelect(it.key),
      mouseenter: e => { if (sel() !== it.key) e.currentTarget.style.background = '#f3f4f6' },
      mouseleave: e => { if (sel() !== it.key) e.currentTarget.style.background = 'transparent' }
    }
  }, it.icon ? span({ style: { marginRight: '8px' } }, it.icon) : null, it.label)
  return div({
    style: { display: 'flex', flexDirection: mode === 'horizontal' ? 'row' : 'column', gap: '2px' }
  }, ...items.map(it => renderItem(it)))
}

export function Anchor(props) {
  const { items = [], offsetTop = 0 } = px(props)
  const active = signal(items[0]?.href || '')
  effect(() => {
    const onScroll = () => {
      let cur = items[0]?.href
      for (const it of items) {
        const el = document.querySelector(it.href)
        if (el && el.getBoundingClientRect().top <= offsetTop + 10) cur = it.href
      }
      active(cur)
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    onCleanup(() => window.removeEventListener('scroll', onScroll))
  })
  return div({ style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
    ...items.map(it => a({
      href: it.href,
      style: () => ({
        padding: '6px 12px', fontSize: '13px', textDecoration: 'none',
        color: active() === it.href ? '#1f6feb' : '#6b7280',
        borderLeft: '2px solid ' + (active() === it.href ? '#1f6feb' : 'transparent'),
        fontWeight: active() === it.href ? '600' : '400'
      })
    }, it.label))
  )
}

export function BackTop(props) {
  const { top = 400, right = 40, bottom = 40 } = px(props)
  const visible = signal(false)
  effect(() => {
    const onScroll = () => visible(window.scrollY > top)
    window.addEventListener('scroll', onScroll)
    onScroll()
    onCleanup(() => window.removeEventListener('scroll', onScroll))
  })
  return show(visible, () => button({
    style: {
      position: 'fixed', right: right + 'px', bottom: bottom + 'px',
      width: '44px', height: '44px', borderRadius: '50%',
      background: '#1f6feb', color: '#fff', border: 0, cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(31,111,235,.4)', fontSize: '18px', zIndex: 100
    },
    on: { click: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }, '↑'))
}

export function Collapse(props, ...children) {
  const { items = [] } = px(props)
  const openIdx = signal(-1)
  return div({ style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
    ...items.map((it, i) => div({
      style: { border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }
    },
      div({
        style: {
          padding: '12px 16px', cursor: 'pointer', fontWeight: '500',
          background: openIdx() === i ? '#f9fafb' : '#fff',
          display: 'flex', justifyContent: 'space-between'
        },
        on: { click: () => openIdx(openIdx() === i ? -1 : i) }
      },
        span(null, it.title),
        span({ style: { transition: 'transform .2s', transform: openIdx() === i ? 'rotate(90deg)' : 'none' } }, '›')
      ),
      show(() => openIdx() === i, () => div({
        style: { padding: '12px 16px', borderTop: '1px solid #e5e7eb', fontSize: '13px' }
      }, it.content))
    ))
  )
}
