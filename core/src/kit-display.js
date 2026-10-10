import { px, cx } from './kit-util.js'
import {div, span, button, input, h1, h2, h3, p, label as _label, img} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { lockScroll } from './mobile.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './kit.js'

export function Alert(props, ...children) {
  const { type = 'info', title } = px(props)
  return div({ class: cx('alert', 'alert-' + type) },
    title ? div({ class: 'alert-title' }, title) : null,
    ...children
  )
}

export function Modal(props, ...children) {
  const { open, onClose, title, footer, width, mobile = 'sheet' } = px(props)
  const isOpen = typeof open === 'function' ? open : () => open
  // 移动端滚动锁定
  let unlock = null
  effect(() => {
    if (isOpen() && typeof document !== 'undefined') {
      if (!unlock) unlock = lockScroll()
    } else {
      if (unlock) { unlock(); unlock = null }
    }
  })
  // ESC 关闭
  effect(() => {
    if (!isOpen()) return
    const h = e => { if (e.key === 'Escape') onClose && onClose() }
    document.addEventListener('keydown', h)
    onCleanup(() => document.removeEventListener('keydown', h))
  })
  return div({
    class: 'modal-overlay' + (mobile === 'sheet' ? ' modal-sheet' : ''),
    style: () => isOpen() ? { display: 'flex' } : { display: 'none' },
    on: { click: e => e.target.classList.contains('modal-overlay') && onClose && onClose() }
  },
    div({
      class: 'modal',
      style: () => {
        const w = width ? { maxWidth: width } : {}
        return w
      },
      on: { click: e => e.stopPropagation() }
    },
      title ? div({ class: 'modal-header' },
        h3({ class: 'modal-title' }, title),
        button({ class: 'modal-close', on: { click: onClose } }, '×')
      ) : null,
      div({ class: 'modal-body' }, ...children),
      footer ? div({ class: 'modal-footer' }, footer) : null
    )
  )
}

export function Spinner(props) {
  const { size = 20 } = px(props)
  return div({ style: { display: 'inline-block', width: size + 'px', height: size + 'px', border: '2px solid var(--x-border)', borderTopColor: 'var(--x-primary)', borderRadius: '50%', animation: 'x-spin .6s linear infinite' } })
}

export function Empty(props) {
  const { text = '暂无数据', icon = '📭' } = px(props)
  return div({ style: { textAlign: 'center', padding: '60px 20px', color: 'var(--x-text-mute)' } },
    div({ style: { fontSize: '48px', marginBottom: '12px' } }, icon),
    div({ style: { fontSize: '14px' } }, text)
  )
}

export function Progress(props) {
  const { value = 0, max = 100, size, showText, color } = px(props)
  const val = typeof value === 'function' ? value() : value
  const pct = Math.min(100, Math.max(0, (val / max) * 100))
  return div({ class: 'field' },
    Row({ gap: 2, align: 'center' },
      div({ class: cx('progress', size && 'progress-' + size), style: { flex: 1 } },
        div({ class: 'progress-bar', style: { width: pct + '%', background: color || undefined } })
      ),
      showText ? Text({ size: 'sm', dim: true }, Math.round(pct) + '%') : null
    )
  )
}

export function Avatar(props) {
  const { src, text, size = 'md' } = px(props)
  const cls = cx('avatar', size === 'sm' && 'avatar-sm', size === 'lg' && 'avatar-lg')
  if (src) return div({ class: cls }, img( { src }))
  return div({ class: cls }, String(text || '?').slice(0, 1).toUpperCase())
}

export function Result(props) {
  const { status = 'info', title, subTitle, extra } = px(props)
  const icons = { success: '✓', error: '✗', warning: '!', info: 'i' }
  const colors = { success: 'var(--x-success)', error: 'var(--x-danger)', warning: 'var(--x-warning)', info: 'var(--x-primary)' }
  return div({ style: { textAlign: 'center', padding: '40px 20px' } },
    div({ style: { width: '64px', height: '64px', borderRadius: '50%', background: colors[status], color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px' } }, icons[status]),
    div({ style: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' } }, title || ''),
    subTitle ? div({ style: { color: 'var(--x-text-dim)', marginBottom: '20px' } }, subTitle) : null,
    extra || null
  )
}

export function Skeleton(props) {
  const { lines = 3 } = px(props)
  return Col({ gap: 2 },
    div({ class: 'skeleton skeleton-title' }),
    ...Array.from({ length: lines }, () => div({ class: 'skeleton skeleton-text' }))
  )
}

export function Count(props) {
  const { value = 0, max = 99, type = 'danger' } = px(props)
  const val = typeof value === 'function' ? value() : value
  if (val <= 0) return null
  return span({ class: 'badge badge-' + type, style: { marginLeft: '6px' } }, val > max ? max + '+' : String(val))
}

export function Stat(props) {
  const { label, value, unit, trend, color } = px(props)
  const val = typeof value === 'function' ? value() : value
  return Card(null,
    div({ style: { fontSize: '13px', color: 'var(--x-text-dim)', marginBottom: '8px' } }, label),
    Row({ gap: 1, align: 'center' },
      div({ style: { fontSize: '28px', fontWeight: '700', color: color || 'var(--x-text)' } }, val),
      unit ? span({ style: { fontSize: '14px', color: 'var(--x-text-dim)' } }, unit) : null,
      trend ? span({ style: { fontSize: '13px', marginLeft: '8px', color: trend > 0 ? 'var(--x-success)' : 'var(--x-danger)' } }, (trend > 0 ? '↑ ' : '↓ ') + Math.abs(trend) + '%') : null
    )
  )
}

export function Descriptions(props) {
  const { items = [], columns = 2, bordered = false } = px(props)
  return div({
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + columns + ', 1fr)',
      gap: bordered ? '0' : '16px',
      border: bordered ? '1px solid var(--x-border)' : 'none',
      borderRadius: bordered ? 'var(--x-radius)' : '0',
      overflow: 'hidden'
    }
  },
    ...items.map(it =>
      div({
        style: {
          padding: bordered ? '10px 14px' : '0',
          borderBottom: bordered ? '1px solid var(--x-border)' : 'none',
          display: bordered ? 'flex' : 'block',
          gap: bordered ? '12px' : '0'
        }
      },
        div({ style: { fontSize: '13px', color: 'var(--x-text-dim)', minWidth: bordered ? '80px' : 'auto', marginBottom: bordered ? '0' : '4px' } }, it.label),
        div({ style: { fontSize: '14px' } }, it.value)
      )
    )
  )
}

// ===== 二维码（用 API） =====

export function ItemCard(props) {
  const { title, desc, avatar, actions, onClick } = px(props)
  return div({
    class: 'card',
    style: { display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: onClick ? 'pointer' : 'default' },
    on: { click: onClick }
  },
    avatar || null,
    Col({ gap: 1, style: { flex: 1 } },
      div({ style: { fontWeight: '600', fontSize: '15px' } }, title),
      desc ? div({ style: { fontSize: '13px', color: 'var(--x-text-dim)' } }, desc) : null
    ),
    actions ? Row({ gap: 1 }, ...(Array.isArray(actions) ? actions : [actions])) : null
  )
}

// ===== 描述列表 =====

export function QRCode(props) {
  const { text, size = 200 } = px(props)
  const buildUrl = (t) => 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(t)
  const isFn = typeof text === 'function'
  return img( {
    src: isFn ? () => buildUrl(text()) : buildUrl(text),
    width: size,
    height: size,
    style: { borderRadius: '8px' }
  })
}

// ===== 星级评分 =====
