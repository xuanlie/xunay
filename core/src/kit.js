import { px, cx } from './kit-util.js'
import { div, span, button, input, h1, h2, h3, p, label as _label } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal } from './core.js'

export function Btn(props, ...children) {
  const { type = 'default', size = '', block, disabled, onClick, icon } = px(props)
  const isDisabled = () => typeof disabled === 'function' ? !!disabled() : !!disabled
  return button({
    class: cx('btn', type !== 'default' && 'btn-' + type, size && 'btn-' + size, block && 'btn-block'),
    disabled: () => isDisabled() ? true : undefined,
    on: { click: e => { if (!isDisabled()) onClick && onClick(e) } }
  }, ...(icon ? [icon, ...children] : children))
}

export function Row(props, ...children) {
  const { gap = 4, align, justify, wrap } = px(props)
  return div({ class: cx('flex', 'gap-' + gap, align && 'items-' + align, justify && 'justify-' + justify, wrap && 'flex-wrap') }, ...children)
}

export function Col(props, ...children) {
  const { gap = 4, align } = px(props)
  return div({ class: cx('flex', 'flex-col', 'gap-' + gap, align && 'items-' + align) }, ...children)
}

export function Text(props, ...children) {
  const { size, dim, bold, center, tag = 'p' } = px(props)
  const cls = cx(size && 'text-' + size, dim && 'text-dim', bold && 'font-' + (bold === true ? 'bold' : bold), center && 'text-center')
  const Tag = { p, span, h1, h2, h3 }[tag] || p
  return Tag({ class: cls }, ...children)
}

export function Card(props, ...children) {
  const { title, desc, footer, flat, hover } = px(props)
  return div({ class: cx('card', flat && 'card-flat', hover && 'card-hover') },
    title ? div({ class: 'card-header' },
      div({ class: 'card-title' }, title),
      desc ? div({ class: 'card-desc' }, desc) : null
    ) : null,
    ...children,
    footer ? div({ class: 'card-footer' }, footer) : null
  )
}

export function Divider(props) {
  const { text } = px(props)
  if (!text) return div({ class: 'divider' })
  return div({ style: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0', color: 'var(--x-text-mute)', fontSize: '13px' } },
    div({ style: { flex: 1, height: '1px', background: 'var(--x-border)' } }),
    span(null, text),
    div({ style: { flex: 1, height: '1px', background: 'var(--x-border)' } })
  )
}

export function Space(props) {
  const { size = 16 } = px(props)
  return div({ style: { height: size + 'px' } })
}

export function Tag(props, ...children) {
  const { type, closable, onClose } = px(props)
  return span({ class: cx('badge', type && 'badge-' + type), style: { paddingRight: closable ? '4px' : '8px' } },
    ...children,
    closable ? span({ style: { marginLeft: '4px', cursor: 'pointer', opacity: .7 }, on: { click: onClose } }, '×') : null
  )
}

export function Badge(props, ...children) {
  const { type } = px(props)
  return span({ class: cx('badge', type && 'badge-' + type) }, ...children)
}
