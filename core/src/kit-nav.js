import { px, cx } from './kit-util.js'
import { div, span, button, input, h1, h2, h3, p, label as _label } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './kit.js'

export function Tabs(props) {
  const { items = [], active, onChange } = px(props)
  const isActive = typeof active === 'function' ? active : () => active
  return div({ class: 'tabs' },
    ...items.map(it => button({
      class: () => cx('tab', isActive() === it.key && 'active'),
      on: { click: () => onChange && onChange(it.key) }
    }, it.title))
  )
}

export function Breadcrumb(props) {
  const { items = [], separator = '/' } = px(props)
  const out = []
  items.forEach((it, i) => {
    out.push(span({ style: { color: i === items.length - 1 ? 'var(--x-text)' : 'var(--x-text-dim)', cursor: it.onClick ? 'pointer' : 'default' }, on: { click: it.onClick } }, it.label))
    if (i < items.length - 1) out.push(span({ style: { margin: '0 8px', color: 'var(--x-text-mute)' } }, separator))
  })
  return Row({ gap: 0, align: 'center' }, ...out)
}

export function Pagination(props) {
  const { page, total, pageSize = 20, onChange } = px(props)
  const cur = typeof page === 'function' ? page() : page
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const jump = p => { if (p >= 1 && p <= pages && onChange) onChange(p) }
  const nums = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    const out = [1]
    if (cur > 3) out.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(pages - 1, cur + 1); i++) out.push(i)
    if (cur < pages - 2) out.push('...')
    out.push(pages)
    return out
  }
  const isMob = typeof window !== 'undefined' && window.innerWidth < 768
  return Row({ gap: 1, align: 'center', class: isMob ? 'pagination pagination-mobile' : 'pagination' },
    Btn({ size: 'sm', disabled: cur <= 1, onClick: () => jump(cur - 1) }, '‹'),
    ...nums().map(p => typeof p === 'number'
      ? Btn({ size: 'sm', type: cur === p ? 'primary' : 'default', onClick: () => jump(p) }, String(p))
      : span({ style: { padding: '0 4px', color: 'var(--x-text-mute)' } }, '...')
    ),
    Btn({ size: 'sm', disabled: cur >= pages, onClick: () => jump(cur + 1) }, '›')
  )
}

export function Steps(props) {
  const { steps = [], current = 0 } = px(props)
  return Row({ gap: 3, align: 'center' },
    ...steps.map((s, i) =>
      Row({ gap: 2, align: 'center' },
        div({ style: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', background: i < current ? 'var(--x-success)' : i === current ? 'var(--x-primary)' : 'var(--x-bg-soft)', color: i <= current ? '#fff' : 'var(--x-text-mute)' } }, i < current ? '✓' : String(i + 1)),
        span({ style: { fontSize: '14px', color: i <= current ? 'var(--x-text)' : 'var(--x-text-mute)', fontWeight: i === current ? '600' : '400' } }, s.label || s),
        i < steps.length - 1 ? div({ style: { width: '40px', height: '1px', background: 'var(--x-border)' } }) : null
      )
    )
  )
}

export function Accordion(props) {
  const { items = [], defaultOpen = 0 } = px(props)
  const openIdx = signal(defaultOpen)
  return Col({ gap: 0 },
    ...items.map((it, i) =>
      div({ style: { border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', marginBottom: '8px', overflow: 'hidden' } },
        div({ style: { padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: openIdx() === i ? 'var(--x-bg-soft)' : 'transparent', fontWeight: '500' }, on: { click: () => openIdx(openIdx() === i ? -1 : i) } },
          span(null, it.title),
          span({ style: { transition: 'transform .2s', transform: openIdx() === i ? 'rotate(90deg)' : 'none', color: 'var(--x-text-mute)' } }, '›')
        ),
        div({ style: { padding: '12px 16px', borderTop: '1px solid var(--x-border)', display: openIdx() === i ? 'block' : 'none' } }, it.content)
      )
    )
  )
}
