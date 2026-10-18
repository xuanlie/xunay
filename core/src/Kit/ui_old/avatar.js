// @xunay/kit/ui/avatar —— 精密头像 v2
// 特色：中英文智能首字母 · 图片失败回退 · 尺寸自适配 · 状态环 · 组叠缩放
import { span, img, div } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80, '2xl': 96 }
const PALETTE = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#f59e0b','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#a855f7']

function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// 中文取首字，英文取首字母（最多 2 个）
function getInitial(str) {
  const s = String(str || '').trim()
  if (!s) return '?'
  // 中文 / 日文 / 韩文
  if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(s[0])) {
    return s.slice(0, 1)
  }
  // 英文多个单词取首字母
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return s.slice(0, 2).toUpperCase()
}

export function Avatar(props, ...children) {
  const {
    src, alt, text, icon,
    size = 'md', shape = 'circle',
    tone = 'auto',
    status,
    bordered, loading,
    class: cls, style, ...rest
  } = px(props)

  const s = typeof size === 'number' ? size : (SIZES[size] || SIZES.md)
  const radius = shape === 'circle' ? '50%' : shape === 'square' ? (Math.round(s * 0.12) + 'px') : (Math.round(s * 0.28) + 'px')

  const getText = () => typeof text === 'function' ? text() : text
  const getAlt = () => typeof alt === 'function' ? alt() : alt
  const getSrc = () => typeof src === 'function' ? src() : src

  const initial = () => getInitial(getText() || getAlt() || '')

  const bg = () => {
    if (tone !== 'auto') return tone
    return PALETTE[hashCode(initial() + (getAlt() || '')) % PALETTE.length]
  }

  const imgFailed = signal(false)
  const statusColor = { online:'#10b981', offline:'#94a3b8', busy:'#ef4444', away:'#f59e0b', success:'#10b981', error:'#ef4444' }[status]

  const statusSize = Math.max(8, Math.round(s * 0.28))
  const statusBorder = Math.max(2, Math.round(s * 0.05))

  const isImage = () => getSrc() && !imgFailed()

  return span({
    class: cx('x-avatar', cls),
    style: [
      'position:relative',
      'display:inline-flex',
      'align-items:center',
      'justify-content:center',
      `width:${s}px`,
      `height:${s}px`,
      `border-radius:${radius}`,
      'overflow:visible',       // 让状态点可溢出
      'flex-shrink:0',
      'user-select:none',
      'font-weight:600',
      `font-size:${Math.max(10, Math.round(s * 0.4))}px`,
      'color:#fff',
      'background:transparent',
      style || '',
    ].filter(Boolean).join(';'),
    ...rest,
  },
    // 内容层（圆角裁剪）
    span({
      style: [
        'position:absolute',
        'inset:0',
        `border-radius:${radius}`,
        'overflow:hidden',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        `background:${isImage() ? 'var(--x-bg-soft,#f1f5f9)' : bg()}`,
        bordered ? 'box-shadow:inset 0 0 0 2px rgba(255,255,255,.4)' : '',
      ].filter(Boolean).join(';'),
    },
      loading
        ? span({
            style: `width:100%;height:100%;background:linear-gradient(90deg,var(--x-border,#e2e8f0) 25%,transparent 50%,var(--x-border,#e2e8f0) 75%);background-size:200% 100%;animation:x-avatar-shimmer 1.4s linear infinite`,
          })
        : isImage()
          ? img({
              src: getSrc(),
              alt: getAlt() || '',
              referrerpolicy: 'no-referrer',
              loading: 'lazy',
              style: 'width:100%;height:100%;object-fit:cover;display:block',
              on: { error: () => imgFailed(true) },
            })
          : icon
            ? span({
                style: `width:${Math.round(s * 0.6)}px;height:${Math.round(s * 0.6)}px;display:inline-flex;align-items:center;justify-content:center`,
              }, icon)
            : span({
                style: `line-height:1;text-shadow:0 1px 2px rgba(0,0,0,.15);letter-spacing:-.02em`,
              }, initial()),
    ),

    // 状态点
    statusColor ? span({
      class: 'x-avatar-status',
      style: [
        'position:absolute',
        'right:-1px',
        'bottom:-1px',
        `width:${statusSize}px`,
        `height:${statusSize}px`,
        'border-radius:50%',
        `background:${statusColor}`,
        `box-shadow:0 0 0 ${statusBorder}px var(--x-bg,#fff)`,
        'z-index:1',
      ].join(';'),
    }) : null,
  )
}

export function AvatarGroup(props, ...children) {
  const { max = 4, size = 'md', overlap = 0.35, class: cls, style, ...rest } = px(props)
  const s = typeof size === 'number' ? size : (SIZES[size] || SIZES.md)
  const offset = Math.round(s * (1 - overlap))
  const list = children.flat().filter(Boolean)
  const shown = list.slice(0, max)
  const extra = list.length - max
  const fontSize = Math.max(10, Math.round(s * 0.36))

  return div({
    class: cx('x-avatar-group', cls),
    style: `display:inline-flex;align-items:center;${style || ''}`,
    ...rest,
  },
    ...shown.map((c, i) => span({
      class: 'x-avatar-slot',
      style: `margin-left:${i === 0 ? 0 : -offset}px;position:relative;z-index:${i};display:inline-flex;transition:transform .2s cubic-bezier(.34,1.56,.64,1), z-index 0s`,
    }, c)),
    extra > 0 ? span({
      class: 'x-avatar-slot',
      style: `margin-left:${-offset}px;display:inline-flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;border-radius:50%;background:var(--x-bg-soft,#f1f5f9);color:var(--x-text-mute,#64748b);font-size:${fontSize}px;font-weight:600;box-shadow:0 0 0 2px var(--x-bg,#fff);position:relative;z-index:${max};font-variant-numeric:tabular-nums`,
    }, `+${extra > 99 ? '99+' : extra}`) : null,
  )
}
