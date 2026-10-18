// @xunay/kit/ui/badge —— 精密徽章 v2
// 特色：计数/点/文本 · 溢出截断 · 呼吸脉冲 · 数字自适应胶囊 · 图片头像兼容
import { span, div } from '../../element.js'
import { px } from '../../kit-util.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const TONE = {
  danger: '#ef4444', red: '#ef4444',
  primary: 'var(--x-primary,#3b82f6)', brand: 'var(--x-primary,#3b82f6)',
  success: '#10b981', green: '#10b981',
  warning: '#f59e0b', orange: '#f59e0b',
  info: '#06b6d4', cyan: '#06b6d4',
  purple: '#8b5cf6', pink: '#ec4899',
}

export function Badge(props, ...children) {
  const {
    count, dot, max = 99, showZero = false,
    tone = 'danger',
    pulse, text,
    standalone, offset = [0, 0],
    class: cls, style, ...rest
  } = px(props)

  const getCount = () => typeof count === 'function' ? count() : count
  const shouldShow = () => {
    if (text != null) return true
    if (dot) return true
    const c = getCount()
    if (c == null) return false
    if (typeof c === 'number') return !(c === 0 && !showZero)
    return !!c
  }
  const display = () => {
    if (text != null) return text
    if (dot) return null
    const c = getCount()
    if (typeof c === 'number' && c > max) return max + '+'
    return String(c)
  }
  const isDot = dot && text == null

  const buildBadge = () => {
    if (!shouldShow()) return null
    const txt = display()
    const isSingle = txt != null && String(txt).length === 1
    const size = isDot ? 8 : (isSingle ? 18 : 20)
    return span({
      class: cx('x-badge', 'x-badge-' + tone, pulse && 'x-badge-pulse', cls),
      style: [
        isDot
          ? 'width:8px;height:8px;padding:0;min-width:0'
          : `min-width:${size}px;height:${size}px;padding:0 ${isSingle ? 0 : 6}px;border-radius:${size / 2}px`,
        'display:inline-flex',
        'align-items:center',
        'justify-content:center',
        `background:${TONE[tone] || TONE.danger}`,
        'color:#fff',
        'font-size:11px',
        'font-weight:600',
        'line-height:1',
        'font-family:inherit',
        'font-variant-numeric:tabular-nums',
        'letter-spacing:-.01em',
        'white-space:nowrap',
        'box-sizing:border-box',
        'user-select:none',
        style || '',
      ].filter(Boolean).join(';'),
      ...(isDot ? [] : [String(txt)]),
    })
  }

  if (standalone) return buildBadge()

  const [ox, oy] = offset
  return span({
    class: 'x-badge-wrap',
    style: 'position:relative;display:inline-flex;vertical-align:middle;flex-shrink:0',
    ...rest,
  },
    ...children,
    shouldShow() ? span({
      class: 'x-badge-anchor',
      style: [
        'position:absolute',
        'top:0',
        'right:0',
        `transform:translate(${ox}px,${oy}px) translate(50%,-50%)`,
        'pointer-events:none',
        'z-index:2',
        'display:inline-flex',
      ].join(';'),
    }, buildBadge()) : null,
  )
}
