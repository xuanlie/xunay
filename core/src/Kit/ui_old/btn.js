// @xunay/kit/ui/btn —— 精密按钮
// 特色：磁吸 hover · 按下阻尼 · 弹簧回弹 · 点击涟漪 ·
//      加载宽度保持 · 8pt 网格 · 键盘/触屏适配 · 主题变量
import { button, span, div } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal, effect, onCleanup } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const SIZES = {
  xs: { h: 24, px: 8,  fs: 12, icon: 12, radius: 6 },
  sm: { h: 32, px: 12, fs: 13, icon: 14, radius: 8 },
  md: { h: 40, px: 16, fs: 14, icon: 16, radius: 10 },
  lg: { h: 48, px: 20, fs: 15, icon: 20, radius: 12 },
  xl: { h: 56, px: 24, fs: 16, icon: 22, radius: 14 },
}

// 弹簧参数：阻尼比 ζ≈0.55，有轻微 overshoot
function spring(t) {
  if (t >= 1) return 1
  const w = Math.PI * 2 * 1.8
  return 1 - Math.exp(-4 * t) * Math.cos(w * t)
}

export function Btn(props, ...children) {
  const {
    type = 'default',
    size = 'md',
    block, disabled, loading,
    icon, iconRight, badge, shortcut,
    magnet = true,        // 磁吸 hover
    ripple = true,        // 点击涟漪
    haptic = true,        // 触屏震动
    onClick, onLongPress,
    class: cls, style, ...rest
  } = px(props)

  const S = SIZES[size] || SIZES.md
  const isDisabled = () => {
    const d = typeof disabled === 'function' ? disabled() : disabled
    const l = typeof loading === 'function' ? loading() : loading
    return !!(d || l)
  }
  const isLoading = () => {
    const l = typeof loading === 'function' ? loading() : loading
    return !!l
  }

  // 磁吸位移
  const tilt = signal({ x: 0, y: 0 })
  // 按下
  const pressed = signal(false)
  // 焦点
  const focused = signal(false)
  // 长按计时
  let longTimer = null
  // 涟漪数组
  let rippleId = 0

  let elRef = null
  let magnetStrength = magnet ? 0.15 : 0

  const onPointerMove = (e) => {
    if (isDisabled() || !elRef) return
    if (e.pointerType === 'touch') return
    const r = elRef.getBoundingClientRect()
    const cx_ = r.left + r.width / 2
    const cy_ = r.top + r.height / 2
    const dx = (e.clientX - cx_) / r.width
    const dy = (e.clientY - cy_) / r.height
    // 极坐标距离越远，磁吸越弱
    const dist = Math.hypot(dx, dy)
    const k = Math.max(0, 1 - dist)
    tilt({ x: dx * magnetStrength * k * 4, y: dy * magnetStrength * k * 4 })
  }
  const onPointerLeave = () => {
    tilt({ x: 0, y: 0 })
    pressed(false)
  }
  const onPointerDown = (e) => {
    if (isDisabled()) return
    pressed(true)
    if (haptic && e.pointerType === 'touch' && navigator.vibrate) {
      try { navigator.vibrate(8) } catch {}
    }
    if (onLongPress) {
      longTimer = setTimeout(() => {
        longTimer = null
        onLongPress(e)
      }, 500)
    }
  }
  const onPointerUp = () => {
    pressed(false)
    if (longTimer) { clearTimeout(longTimer); longTimer = null }
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isDisabled()) pressed(true)
    }
  }
  const onKeyUp = (e) => {
    if (e.key === 'Enter' || e.key === ' ') pressed(false)
  }

  // 涟漪：动态插入 span，动画结束后移除
  const spawnRipple = (e) => {
    if (!ripple || !elRef) return
    const r = elRef.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const size_ = Math.max(r.width, r.height) * 2
    const id = ++rippleId
    const el = document.createElement('span')
    el.className = 'x-btn-ripple'
    el.style.cssText = `
      position:absolute;left:${x - size_/2}px;top:${y - size_/2}px;
      width:${size_}px;height:${size_}px;border-radius:50%;
      background:currentColor;opacity:0.25;pointer-events:none;
      transform:scale(0);animation:x-btn-ripple .6s ease-out forwards;
    `
    elRef.appendChild(el)
    setTimeout(() => el.remove(), 620)
  }

  const handleClick = (e) => {
    if (isDisabled()) return
    spawnRipple(e)
    onClick && onClick(e)
  }

  // 加载宽度保持：进入 loading 时冻结当前宽度
  let frozenWidth = 0
  effect(() => {
    if (!elRef) return
    if (isLoading()) {
      frozenWidth = elRef.offsetWidth
      elRef.style.minWidth = frozenWidth + 'px'
    } else {
      elRef.style.minWidth = ''
    }
  })

  const btnNode = button({
    class: cx('x-btn', 'x-btn-' + type, cls),
    ref: (el) => { elRef = el },
    style: () => {
      const t = tilt()
      const p = pressed() ? 0.96 : 1
      const f = focused() ? `0 0 0 3px var(--x-btn-ring, rgba(59,130,246,.35))` : ''
      const shadow = pressed()
        ? '0 1px 2px rgba(0,0,0,.12)'
        : '0 2px 6px rgba(0,0,0,.08)'
      return [
        `--x-btn-h:${S.h}px`,
        `--x-btn-px:${S.px}px`,
        `--x-btn-fs:${S.fs}px`,
        `--x-btn-radius:${S.radius}px`,
        `--x-btn-icon:${S.icon}px`,
        `position:relative;overflow:hidden`,
        `display:inline-flex;align-items:center;justify-content:center`,
        `gap:${Math.max(4, S.px / 2)}px`,
        `height:${S.h}px`,
        `padding:0 ${S.px}px`,
        `font-size:${S.fs}px`,
        `font-weight:500`,
        `line-height:1`,
        `border-radius:${S.radius}px`,
        `transform:translate(${t.x}px, ${t.y}px) scale(${p})`,
        `transition:transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .15s, background .15s, color .15s, border-color .15s`,
        `box-shadow:${shadow}${f ? ',' + f : ''}`,
        `cursor:${isDisabled() ? 'not-allowed' : 'pointer'}`,
        `user-select:none`,
        `-webkit-tap-highlight-color:transparent`,
        `touch-action:manipulation`,
        (block || badge != null) ? 'width:100%' : '',
        isDisabled() ? 'opacity:.55' : '',
        style || '',
      ].filter(Boolean).join(';')
    },
    disabled: isDisabled() ? true : undefined,
    on: {
      click: handleClick,
      pointermove: onPointerMove,
      pointerleave: onPointerLeave,
      pointerdown: onPointerDown,
      pointerup: onPointerUp,
      pointercancel: onPointerUp,
      focus: () => focused(true),
      blur: () => { focused(false); pressed(false) },
      keydown: onKeyDown,
      keyup: onKeyUp,
    },
    ...rest,
  },
    isLoading()
      ? span({
          class: 'x-btn-spinner',
          style: `width:${S.icon}px;height:${S.icon}px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:x-btn-spin .6s linear infinite;flex-shrink:0`,
        })
      : (icon
          ? span({
              class: 'x-btn-icon',
              style: `width:${S.icon}px;height:${S.icon}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0`,
            }, icon)
          : null),
    children.length ? span({ class: 'x-btn-label', style: 'display:inline-block;white-space:nowrap' }, ...children) : null,
    iconRight
      ? span({
          class: 'x-btn-icon',
          style: `width:${S.icon}px;height:${S.icon}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0`,
        }, iconRight)
      : null,
    shortcut
      ? span({
          class: 'x-btn-shortcut',
          style: 'margin-left:4px;font-size:.85em;opacity:.55;font-family:ui-monospace,monospace',
        }, shortcut)
      : null,
  )

  if (badge == null) return btnNode

  // 有徽标：用 wrapper 包住，让徽标不被按钮的 overflow:hidden 裁剪
  return span({
    class: 'x-btn-wrap',
    style: () => {
      const isBlock = typeof block === 'function' ? block() : block
      return `position:relative;${isBlock ? 'display:block;width:100%' : 'display:inline-block'}`
    },
  },
    btnNode,
    span({
      class: 'x-btn-badge',
      style: 'position:absolute;top:-6px;right:-6px;z-index:1;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--x-btn-badge-bg,#ef4444);color:#fff;font-size:11px;font-weight:600;line-height:18px;text-align:center;box-shadow:0 0 0 2px var(--x-bg,#fff);box-sizing:border-box;white-space:nowrap;font-variant-numeric:tabular-nums;pointer-events:none',
    }, String(badge))
  )
}
