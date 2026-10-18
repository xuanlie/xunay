// @xunay/kit/ui/spinner —— 精密加载指示
// 特色：环形/点阵/脉冲/条 4 种 · 5 尺寸 · 全屏遮罩 · 进度条联动
import { span, div } from '../../element.js'
import { px } from '../../kit-util.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const SIZES = { xs: 14, sm: 18, md: 24, lg: 36, xl: 52 }

export function Spinner(props) {
  const {
    size = 'md', variant = 'ring',   // ring | dots | pulse | bars
    tone = 'primary',                 // primary | current | white
    label, fullscreen, overlay,
    delay = 0,                        // 延迟显示（ms）
    class: cls, style, ...rest
  } = px(props)

  const s = typeof size === 'number' ? size : (SIZES[size] || SIZES.md)
  const color = tone === 'white' ? '#fff' : tone === 'current' ? 'currentColor' : 'var(--x-primary,#3b82f6)'

  const inner = () => {
    if (variant === 'dots') {
      return div({
        style: `display:inline-flex;gap:${Math.round(s*0.2)}px;align-items:center`,
      },
        ...[0,1,2].map(i => span({
          style: `width:${Math.round(s*0.28)}px;height:${Math.round(s*0.28)}px;border-radius:50%;background:${color};animation:x-spinner-dot 1.2s ease-in-out ${i*0.16}s infinite`,
        }))
      )
    }
    if (variant === 'pulse') {
      return span({
        style: `position:relative;display:inline-block;width:${s}px;height:${s}px`,
      },
        span({ style: `position:absolute;inset:0;border-radius:50%;background:${color};opacity:.6;animation:x-spinner-pulse 1.6s ease-out infinite` }),
        span({ style: `position:absolute;inset:0;border-radius:50%;background:${color};opacity:.6;animation:x-spinner-pulse 1.6s ease-out .8s infinite` }),
      )
    }
    if (variant === 'bars') {
      return div({
        style: `display:inline-flex;gap:2px;align-items:center;height:${s}px`,
      },
        ...[0,1,2,3,4].map(i => span({
          style: `width:${Math.max(2, Math.round(s*0.15))}px;height:100%;background:${color};border-radius:2px;transform-origin:center;animation:x-spinner-bar 1s ease-in-out ${i*0.1}s infinite`,
        }))
      )
    }
    // ring
    return span({
      style: `display:inline-block;width:${s}px;height:${s}px;border:${Math.max(2, Math.round(s*0.1))}px solid ${color};border-top-color:transparent;border-radius:50%;animation:x-spinner-spin .7s linear infinite`,
    })
  }

  const wrap = (content) => span({
    class: cx('x-spinner', cls),
    role: 'status',
    'aria-live': 'polite',
    style: `display:inline-flex;align-items:center;gap:8px;${style || ''}`,
    ...rest,
  },
    content,
    label ? span({ style: `font-size:13px;color:var(--x-text-mute,#64748b);font-family:inherit` }, label) : null,
  )

  if (fullscreen || overlay) {
    return div({
      class: 'x-spinner-overlay',
      style: [
        'position:fixed;inset:0;display:flex;align-items:center;justify-content:center',
        'background:rgba(15,23,42,.45);backdrop-filter:blur(2px)',
        'z-index:9999',
        delay ? `animation:x-spinner-fade .2s ${delay}ms both` : '',
      ].filter(Boolean).join(';'),
    },
      div({
        style: 'padding:20px 24px;background:var(--x-card,#fff);border-radius:12px;display:flex;flex-direction:column;align-items:center;gap:10px;box-shadow:0 10px 40px -8px rgba(0,0,0,.24)',
      }, inner(), label ? span({ style: 'font-size:13px;color:var(--x-text-mute,#64748b)' }, label) : null),
    )
  }

  return wrap(inner())
}
