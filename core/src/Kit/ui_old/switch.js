// @xunay/kit/ui/switch —— 精密开关
// 特色：拖拽切换 · 点击震动 · 加载态 · 文字/图标 · 5 尺寸 · 状态色
import { span, button, label as labelEl } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal, effect } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const SIZES = {
  xs: { w:28, h:16, knob:12, pad:2 },
  sm: { w:36, h:20, knob:16, pad:2 },
  md: { w:44, h:24, knob:20, pad:2 },
  lg: { w:56, h:30, knob:26, pad:2 },
  xl: { w:68, h:36, knob:32, pad:2 },
}

export function Switch(props) {
  const {
    checked, defaultChecked = false,
    onChange, disabled, loading,
    size = 'md',
    onText, offText, onIcon, offIcon,
    tone = 'primary',
    label, labelPosition = 'right',
    haptic = true,
    class: cls, style, ...rest
  } = px(props)

  const S = SIZES[size] || SIZES.md
  const inner = signal(defaultChecked)
  const isChecked = () => typeof checked === 'function' ? checked() : (checked !== undefined ? checked : inner())
  const isDisabled = () => {
    const d = typeof disabled === 'function' ? disabled() : disabled
    const l = typeof loading === 'function' ? loading() : loading
    return !!(d || l)
  }
  const isLoading = () => {
    const l = typeof loading === 'function' ? loading() : loading
    return !!l
  }

  // 拖拽
  const dragX = signal(0)
  const dragging = signal(false)
  let startX = 0, startChecked = false, elRef = null

  const toggle = (e) => {
    if (isDisabled()) return
    const next = !isChecked()
    if (checked === undefined) inner(next)
    onChange && onChange(next, e)
    if (haptic && e && e.pointerType === 'touch' && navigator.vibrate) {
      try { navigator.vibrate(8) } catch {}
    }
  }

  const onDown = (e) => {
    if (isDisabled()) return
    dragging(true); startX = e.clientX; startChecked = isChecked()
    const move = (ev) => {
      const dx = ev.clientX - startX
      const range = S.w - S.knob - S.pad * 2
      const delta = Math.max(-range, Math.min(range, dx))
      dragX(delta)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const range = S.w - S.knob - S.pad * 2
      const half = range / 2
      const dx = dragX()
      dragging(false)
      dragX(0)
      if (Math.abs(dx) > half) {
        toggle()
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const toneColor = () => {
    if (isLoading()) return '#94a3b8'
    if (!isChecked()) return 'var(--x-switch-off, var(--x-border,#cbd5e1))'
    return { primary: 'var(--x-primary,#3b82f6)', success: '#10b981', warning: '#f59e0b', danger: '#ef4444' }[tone] || 'var(--x-primary,#3b82f6)'
  }

  const knobLeft = () => {
    const base = isChecked() ? (S.w - S.knob - S.pad) : S.pad
    return base + dragX()
  }

  const body = button({
    type: 'button',
    role: 'switch',
    'aria-checked': () => isChecked() ? 'true' : 'false',
    disabled: isDisabled() ? true : undefined,
    class: cx('x-switch', cls),
    style: () => [
      `--x-switch-w:${S.w}px`,
      `--x-switch-h:${S.h}px`,
      `--x-switch-knob:${S.knob}px`,
      `position:relative`,
      `display:inline-flex`,
      `align-items:center`,
      `width:${S.w}px`,
      `height:${S.h}px`,
      `padding:0`,
      `border:none`,
      `border-radius:999px`,
      `background:${toneColor()}`,
      `cursor:${isDisabled() ? 'not-allowed' : 'pointer'}`,
      `transition:background .25s cubic-bezier(.34,1.56,.64,1)`,
      `flex-shrink:0`,
      `-webkit-tap-highlight-color:transparent`,
      `touch-action:manipulation`,
      `overflow:hidden`,
      isDisabled() ? 'opacity:.55' : '',
      style || '',
    ].filter(Boolean).join(';'),
    on: {
      click: (e) => { if (!dragging()) toggle(e) },
      pointerdown: onDown,
      keydown: (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(e) }
      },
    },
    ...rest,
  },
    // 文字
    (onText || offText) ? span({
      style: () => `position:absolute;top:50%;transform:translateY(-50%);color:#fff;font-size:${Math.round(S.h*0.42)}px;font-weight:600;pointer-events:none;transition:opacity .15s, left .15s, right .15s;${isChecked() ? `left:${S.pad + S.knob * 0.15}px` : `right:${S.pad + S.knob * 0.15}px`}`,
    }, isChecked() ? (onText || '') : (offText || '')) : null,
    // 旋钮
    span({
      class: 'x-switch-knob',
      style: () => [
        `position:absolute`,
        `left:${knobLeft()}px`,
        `top:${S.pad}px`,
        `width:${S.knob}px`,
        `height:${S.knob}px`,
        `border-radius:50%`,
        `background:#fff`,
        `box-shadow:0 1px 3px rgba(0,0,0,.2), 0 0 0 0.5px rgba(0,0,0,.05)`,
        `display:flex;align-items:center;justify-content:center`,
        `transition:${dragging() ? 'none' : 'left .28s cubic-bezier(.34,1.56,.64,1), width .15s'}`,
        `will-change:left`,
      ].join(';'),
    },
      isLoading() ? span({
        style: `width:${Math.round(S.knob*0.5)}px;height:${Math.round(S.knob*0.5)}px;border:2px solid ${toneColor()};border-top-color:transparent;border-radius:50%;animation:x-switch-spin .6s linear infinite`,
      }) : null,
      (!isLoading() && isChecked() && onIcon) ? span({ style: `width:${Math.round(S.knob*0.6)}px;height:${Math.round(S.knob*0.6)}px;display:inline-flex;align-items:center;justify-content:center;color:${toneColor()}` }, onIcon) : null,
      (!isLoading() && !isChecked() && offIcon) ? span({ style: `width:${Math.round(S.knob*0.6)}px;height:${Math.round(S.knob*0.6)}px;display:inline-flex;align-items:center;justify-content:center;color:var(--x-text-mute,#94a3b8)` }, offIcon) : null,
    ),
  )

  if (!label) return body

  return labelEl({
    style: `display:inline-flex;align-items:center;gap:8px;cursor:${isDisabled() ? 'not-allowed' : 'pointer'};user-select:none;${labelPosition === 'left' ? 'flex-direction:row-reverse' : ''}`,
  }, body, span({ style: 'font-size:13.5px;color:var(--x-text,#0f172a)' }, label))
}
