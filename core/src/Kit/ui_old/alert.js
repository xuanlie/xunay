// @xunay/kit/ui/alert —— 精密提示
// 特色：5 色 tone · banner/卡片 2 种 · 可关闭 · 图标 · 折叠动作
import { div, span, button } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const TONE_STYLE = {
  info:    { bg: 'rgba(6,182,212,.08)',  bd: 'rgba(6,182,212,.25)',  fg: '#0891b2', icon: 'M12 16v-4M12 8h.01' },
  success: { bg: 'rgba(16,185,129,.08)', bd: 'rgba(16,185,129,.25)', fg: '#059669', icon: 'M20 6L9 17l-5-5' },
  warning: { bg: 'rgba(245,158,11,.08)', bd: 'rgba(245,158,11,.25)', fg: '#d97706', icon: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' },
  danger:  { bg: 'rgba(239,68,68,.08)',  bd: 'rgba(239,68,68,.25)',  fg: '#dc2626', icon: 'M15 9l-6 6M9 9l6 6M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z' },
  primary: { bg: 'rgba(59,130,246,.08)', bd: 'rgba(59,130,246,.25)', fg: '#2563eb', icon: 'M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z' },
  brand:   { bg: 'rgba(59,130,246,.08)', bd: 'rgba(59,130,246,.25)', fg: '#2563eb', icon: 'M12 16v-4M12 8h.01M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z' },
}

export function Alert(props, ...children) {
  const {
    tone = 'info',
    title, description,
    closable, onClose,
    banner,          // 无边框条（顶部通栏）
    icon, showIcon = true,
    action,          // 右侧动作
    class: cls, style, ...rest
  } = px(props)

  const closed = signal(false)
  const T = TONE_STYLE[tone] || TONE_STYLE.info

  const iconEl = () => {
    const NS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('width', '18'); svg.setAttribute('height', '18')
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', T.fg)
    svg.setAttribute('stroke-width', '2'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round')
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', T.icon); svg.appendChild(p)
    return svg
  }

  if (closed()) return null

  return div({
    class: cx('x-alert', 'x-alert-' + tone, banner && 'x-alert-banner', cls),
    role: 'alert',
    style: [
      'display:flex',
      'align-items:flex-start',
      'gap:10px',
      banner ? 'border-radius:0' : 'border-radius:10px',
      banner ? `background:${T.fg}` : `background:${T.bg}`,
      `border:1px solid ${banner ? 'transparent' : T.bd}`,
      `padding:${banner ? '10px 16px' : '12px 14px'}`,
      `color:${banner ? '#fff' : 'var(--x-text,#0f172a)'}`,
      'font-size:13.5px',
      'line-height:1.5',
      'font-family:inherit',
      style || '',
    ].filter(Boolean).join(';'),
    ...rest,
  },
    (showIcon && !banner) ? span({ style: 'flex-shrink:0;margin-top:1px;display:inline-flex' }, icon || iconEl()) : null,
    div({ style: 'flex:1;min-width:0' },
      title ? div({
        style: `font-weight:600;font-size:14px;${banner ? '' : `color:${T.fg};`}${(description || children.length) ? 'margin-bottom:2px' : ''}`,
      }, title) : null,
      (description || children.length) ? div({
        style: `${banner ? 'opacity:.92;' : 'color:var(--x-text-mute,#475569);'}font-size:13px`,
      }, description, ...children) : null,
    ),
    action ? span({ style: 'flex-shrink:0' }, action) : null,
    closable ? button({
      type: 'button',
      'aria-label': '关闭',
      style: `flex-shrink:0;border:none;background:transparent;cursor:pointer;padding:2px;line-height:1;color:${banner ? 'rgba(255,255,255,.9)' : T.fg};opacity:.7;transition:opacity .15s, transform .15s;font-size:16px;display:inline-flex;align-items:center;justify-content:center;border-radius:4px`,
      on: {
        click: () => { closed(true); onClose && onClose() },
        mouseenter: (e) => { e.currentTarget.style.opacity = '1' },
        mouseleave: (e) => { e.currentTarget.style.opacity = '.7' },
      },
    }, '×') : null,
  )
}
