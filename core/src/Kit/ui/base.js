// @xunay/kit/ui/base —— 基础组件（精修版）
// Btn / Row / Col / Text / Card / Divider / Space / Tag / Badge
import { div, span, button, h1, h2, h3, h4, h5, h6, p, a, code as _code, pre as _pre, label as _label } from '../../element.js'
import { px, cx } from './util.js'
import { signal, effect, onCleanup } from '../../core.js'

// ═══════════════════════════════════════════════
// Btn · 按钮
// 特性：磁吸 hover · 点击涟漪 · 加载宽度保持 · 5 尺寸 · 6 类型
//      图标左右 · 徽标 · 快捷键 · 长按 · 触屏震动 · 键盘
// ═══════════════════════════════════════════════
const BTN_SIZES = {
  xs: { h: 24, px: 8,  fs: 12, icon: 12 },
  sm: { h: 32, px: 12, fs: 13, icon: 14 },
  md: { h: 40, px: 16, fs: 14, icon: 16 },
  lg: { h: 48, px: 20, fs: 15, icon: 20 },
  xl: { h: 56, px: 24, fs: 16, icon: 22 },
}

export function Btn(props, ...children) {
  const {
    type = 'default', size = 'md', block, disabled, loading,
    icon, iconRight, badge, shortcut,
    magnet = false, ripple = true, haptic = false,
    onClick, onLongPress,
    class: cls, style, ...rest
  } = px(props)

  const S = BTN_SIZES[size] || BTN_SIZES.md
  const tilt = signal({ x: 0, y: 0 })
  const pressed = signal(false)
  let elRef = null
  let longTimer = null

  const isDisabled = () => {
    const d = typeof disabled === 'function' ? disabled() : disabled
    const l = typeof loading === 'function' ? loading() : loading
    return !!(d || l)
  }
  const isLoading = () => typeof loading === 'function' ? !!loading() : !!loading

  const onMove = (e) => {
    if (!magnet || isDisabled() || !elRef || e.pointerType === 'touch') return
    const r = elRef.getBoundingClientRect()
    const dx = (e.clientX - r.left - r.width / 2) / r.width
    const dy = (e.clientY - r.top - r.height / 2) / r.height
    tilt({ x: dx * 3, y: dy * 2 })
  }
  const onLeave = () => { tilt({ x: 0, y: 0 }); pressed(false) }
  const onDown = (e) => {
    if (isDisabled()) return
    pressed(true)
    if (haptic && e.pointerType === 'touch' && navigator.vibrate) {
      try { navigator.vibrate(8) } catch {}
    }
    if (onLongPress) {
      longTimer = setTimeout(() => { longTimer = null; onLongPress(e) }, 500)
    }
  }
  const onUp = () => {
    pressed(false)
    if (longTimer) { clearTimeout(longTimer); longTimer = null }
  }
  const spawnRipple = (e) => {
    if (!ripple || !elRef) return
    const r = elRef.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const size_ = Math.max(r.width, r.height) * 2
    const el = document.createElement('span')
    el.style.cssText = `position:absolute;left:${x - size_ / 2}px;top:${y - size_ / 2}px;width:${size_}px;height:${size_}px;border-radius:50%;background:currentColor;opacity:.25;pointer-events:none;animation:x-btn-ripple .6s ease-out forwards`
    elRef.appendChild(el)
    setTimeout(() => el.remove(), 620)
  }
  const handleClick = (e) => {
    if (isDisabled()) return
    spawnRipple(e)
    onClick && onClick(e)
  }

  // 加载态宽度冻结
  let frozenW = 0
  effect(() => {
    if (!elRef) return
    if (isLoading()) {
      if (!frozenW) frozenW = elRef.offsetWidth
      elRef.style.minWidth = frozenW + 'px'
    } else {
      frozenW = 0
      elRef.style.minWidth = ''
    }
  })

  return button({
    class: cx('btn', type !== 'default' && 'btn-' + type, size !== 'md' && 'btn-' + size, block && 'btn-block', cls),
    ref: (el) => { elRef = el },
    disabled: isDisabled() ? true : undefined,
    style: () => {
      const t = tilt()
      const p = pressed() ? 0.96 : 1
      const custom = typeof style === 'function' ? style() : style
      return [
        'position:relative;overflow:hidden',
        `display:inline-flex;align-items:center;justify-content:center`,
        `gap:${Math.max(4, S.px / 2)}px`,
        `height:${S.h}px;padding:0 ${S.px}px;font-size:${S.fs}px;font-weight:500;line-height:1`,
        `transform:translate(${t.x}px,${t.y}px) scale(${p})`,
        `transition:transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .15s, background .15s, color .15s, border-color .15s`,
        'user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation',
        block ? 'width:100%' : '',
        custom || '',
      ].filter(Boolean).join(';')
    },
    on: {
      click: handleClick,
      pointermove: onMove,
      pointerleave: onLeave,
      pointerdown: onDown,
      pointerup: onUp,
      pointercancel: onUp,
      keydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!isDisabled()) pressed(true)
          if (e.key === ' ') e.preventDefault()
        }
      },
      keyup: (e) => {
        if (e.key === 'Enter' || e.key === ' ') pressed(false)
      },
    },
    ...rest,
  },
    isLoading()
      ? span({ class: 'btn-spinner', style: `width:${S.icon}px;height:${S.icon}px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:x-btn-spin .6s linear infinite;flex-shrink:0` })
      : (icon ? span({ style: `width:${S.icon}px;height:${S.icon}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0` }, icon) : null),
    children.length ? span({ style: 'display:inline-block;white-space:nowrap' }, ...children) : null,
    iconRight ? span({ style: `width:${S.icon}px;height:${S.icon}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0` }, iconRight) : null,
    shortcut ? span({ style: 'margin-left:4px;font-size:.85em;opacity:.55;font-family:ui-monospace,monospace' }, shortcut) : null,
    badge != null ? span({ style: 'position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:var(--x-danger,#ef4444);color:#fff;font-size:10px;font-weight:600;line-height:16px;text-align:center;box-shadow:0 0 0 2px var(--x-bg,#fff);font-variant-numeric:tabular-nums;pointer-events:none' }, String(badge)) : null,
  )
}

// ═══════════════════════════════════════════════
// Row / Col / Text / Divider / Space
// ═══════════════════════════════════════════════
export function Row(props, ...children) {
  const { gap = 4, align, justify, wrap, class: cls, style, ...rest } = px(props)
  return div({
    class: cx('flex', 'gap-' + gap, align && 'items-' + align, justify && 'justify-' + justify, wrap && 'flex-wrap', cls),
    style,
    ...rest,
  }, ...children)
}

export function Col(props, ...children) {
  const { gap = 4, align, class: cls, style, ...rest } = px(props)
  return div({
    class: cx('flex', 'flex-col', 'gap-' + gap, align && 'items-' + align, cls),
    style,
    ...rest,
  }, ...children)
}

const TEXT_TAGS = { p, span, h1, h2, h3, h4, h5, h6, a, code: _code, pre: _pre }

export function Text(props, ...children) {
  const { size, dim, bold, center, mono, tag = 'p', class: cls, style, ...rest } = px(props)
  const cls_ = cx(
    size && 'text-' + size,
    dim && 'text-dim',
    bold && 'font-' + (bold === true ? 'bold' : bold),
    center && 'text-center',
    mono && 'mono',
    cls,
  )
  const Tag = TEXT_TAGS[tag] || p
  return Tag({ class: cls_, style, ...rest }, ...children)
}

export function Divider(props) {
  const { text, class: cls, style, ...rest } = px(props)
  if (!text) return div({ class: cx('divider', cls), style, ...rest })
  return div({
    class: cls,
    style: ['display:flex', 'align-items:center', 'gap:12px', 'margin:20px 0', 'color:var(--x-text-mute,#9ca3af)', 'font-size:13px', style].filter(Boolean).join(';'),
    ...rest,
  },
    div({ style: 'flex:1;height:1px;background:var(--x-border,#e5e7eb)' }),
    span(null, text),
    div({ style: 'flex:1;height:1px;background:var(--x-border,#e5e7eb)' }),
  )
}

export function Space(props, ...children) {
  const { size = 16, direction = 'horizontal', wrap, class: cls, style, ...rest } = px(props)
  const real = children.length ? children : [props.children].filter(Boolean)
  if (!real.length) return div({ style: `height:${size}px`, ...rest })
  const n = typeof size === 'number' ? size : (parseInt(size) || 16)
  const s = direction === 'vertical'
    ? { display: 'flex', flexDirection: 'column', gap: n + 'px' }
    : { display: 'inline-flex', alignItems: 'center', gap: n + 'px', flexWrap: wrap ? 'wrap' : undefined }
  return div({ class: cls, style: { ...s, ...(style || {}) }, ...rest }, ...real)
}

// ═══════════════════════════════════════════════
// Card · 卡片（封面 / 折叠 / 加载 / 色带 / 图标）
// ═══════════════════════════════════════════════
export function Card(props, ...children) {
  const {
    title, desc, icon, cover, coverRatio = 16 / 9,
    footer, actions, extra, padding = 'md',
    variant = 'elevated', tone = 'default',
    stripe, hover, pressable, collapsible, defaultOpen = true,
    loading, skeleton, disabled, selected,
    onClick, class: cls, style, ...rest
  } = px(props)

  const isOpen = signal(typeof defaultOpen === 'function' ? defaultOpen() : !!defaultOpen)
  const PADS = { sm: 12, md: 16, lg: 20, xl: 24 }
  const pad = PADS[padding] || PADS.md
  const isDisabled = () => typeof disabled === 'function' ? disabled() : !!disabled
  const isCollapsible = collapsible && (title || desc)
  const handleClick = (e) => {
    if (isDisabled()) return
    if (isCollapsible) isOpen(!isOpen())
    onClick && onClick(e)
  }
  return div({
    class: cx('card', variant !== 'elevated' && 'card-' + variant, tone !== 'default' && 'card-tone-' + tone, cls),
    style: [
      `position:relative;padding:${pad}px;border-radius:12px`,
      'background:var(--x-bg-elev,#fff);color:var(--x-text,#111827)',
      variant === 'outlined' ? 'border:1px solid var(--x-border,#e5e7eb)' : '',
      hover ? 'transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .2s' : '',
      (pressable || isCollapsible) ? 'cursor:pointer;user-select:none' : '',
      isDisabled() ? 'opacity:.5;cursor:not-allowed' : '',
      style || '',
    ].filter(Boolean).join(';'),
    on: (pressable || isCollapsible || onClick) ? { click: handleClick } : undefined,
    ...rest,
  },
    stripe === 'top' ? div({ style: `position:absolute;left:0;right:0;top:0;height:3px;background:var(--x-primary,#2563eb)` }) : null,
    stripe === 'left' ? div({ style: `position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--x-primary,#2563eb)` }) : null,
    cover ? div({ style: `margin:${-pad}px ${-pad}px ${pad}px;aspect-ratio:${coverRatio};overflow:hidden;background:var(--x-bg-soft,#f5f6f8);display:flex;align-items:center;justify-content:center` },
      typeof cover === 'string' ? div({ style: `width:100%;height:100%;background:${cover};background-size:cover;background-position:center` }) : cover
    ) : null,
    (title || desc || icon || extra || isCollapsible) ? div({
      style: `display:flex;align-items:flex-start;gap:${Math.max(8, pad / 2)}px;margin-bottom:${(children.length || footer || actions) ? pad / 2 : 0}px`,
    },
      icon ? span({ style: 'width:36px;height:36px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:var(--x-primary-soft,#eff6ff);color:var(--x-primary,#2563eb)' }, icon) : null,
      (title || desc) ? div({ style: 'flex:1;min-width:0' },
        title ? div({ style: 'font-size:15px;font-weight:600;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap' }, title) : null,
        desc ? div({ style: 'font-size:12.5px;line-height:1.5;color:var(--x-text-dim,#6b7280);margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical' }, desc) : null,
      ) : null,
      extra ? span({ style: 'flex-shrink:0' }, extra) : null,
      isCollapsible ? span({ style: () => `flex-shrink:0;transition:transform .2s ease;color:var(--x-text-mute,#9ca3af);transform:rotate(${isOpen() ? 90 : 0}deg)` }, '›') : null,
    ) : null,
    skeleton
      ? div({},
          div({ style: 'height:12px;width:100%;border-radius:6px;background:linear-gradient(90deg,var(--x-border,#e5e7eb) 25%,transparent 50%,var(--x-border,#e5e7eb) 75%);background-size:200% 100%;animation:x-card-shimmer 1.4s linear infinite;margin-bottom:8px' }),
          div({ style: 'height:12px;width:92%;border-radius:6px;background:linear-gradient(90deg,var(--x-border,#e5e7eb) 25%,transparent 50%,var(--x-border,#e5e7eb) 75%);background-size:200% 100%;animation:x-card-shimmer 1.4s linear infinite;margin-bottom:8px' }),
          div({ style: 'height:12px;width:78%;border-radius:6px;background:linear-gradient(90deg,var(--x-border,#e5e7eb) 25%,transparent 50%,var(--x-border,#e5e7eb) 75%);background-size:200% 100%;animation:x-card-shimmer 1.4s linear infinite' }),
        )
      : (children.length
          ? (isCollapsible
              ? div({ style: () => `overflow:hidden;transition:grid-template-rows .28s cubic-bezier(.4,0,.2,1);display:grid;grid-template-rows:${isOpen() ? '1fr' : '0fr'}` },
                  div({ style: `overflow:hidden;min-height:0;${loading ? 'filter:blur(2px);opacity:.6;pointer-events:none' : ''}` }, ...children)
                )
              : div({ style: loading ? 'filter:blur(2px);opacity:.6;pointer-events:none;transition:filter .2s' : '' }, ...children)
            )
          : null),
    loading ? div({ style: 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none' },
      span({ style: 'width:24px;height:24px;border:2.5px solid var(--x-primary,#2563eb);border-top-color:transparent;border-radius:50%;animation:x-btn-spin .7s linear infinite' })
    ) : null,
    (footer || actions) ? div({
      style: `display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:${pad}px;padding-top:${pad}px;border-top:1px solid var(--x-border,#e5e7eb)`,
    }, footer, actions) : null,
  )
}

// ═══════════════════════════════════════════════
// Tag · 标签（7 色 × 3 variant + 关闭 + 选中 + 圆点）
// ═══════════════════════════════════════════════
const TAG_SIZES = { sm: { h: 20, px: 6, fs: 11, r: 4 }, md: { h: 24, px: 8, fs: 12, r: 6 }, lg: { h: 30, px: 12, fs: 13, r: 8 } }

export function Tag(props, ...children) {
  const {
    type = 'default', tone, variant = 'soft', size = 'md',
    closable, closeIcon = '×', checkable, selected: selProp,
    icon, dot, round, block, disabled,
    onClose, onChange,
    class: cls, style, ...rest
  } = px(props)

  const t = tone || type
  const S = TAG_SIZES[size] || TAG_SIZES.md
  const selected = signal(typeof selProp === 'function' ? selProp() : !!selProp)
  const isSelected = () => typeof selProp === 'function' ? selProp() : selected()
  const isDisabled = () => typeof disabled === 'function' ? disabled() : !!disabled

  const handleClick = (e) => {
    if (isDisabled()) return
    if (checkable) {
      selected(!selected())
      onChange && onChange(!selected(), e)
    }
  }

  return span({
    class: cx('tag', 'tag-' + t, 'tag-' + variant, cls),
    style: [
      `display:inline-flex;align-items:center;gap:4px`,
      `height:${S.h}px;padding:0 ${S.px}px;font-size:${S.fs}px;line-height:1`,
      `border-radius:${round ? '999px' : S.r + 'px'}`,
      'font-weight:500;user-select:none;transition:background .15s,color .15s,border-color .15s,transform .12s',
      '-webkit-tap-highlight-color:transparent',
      checkable ? `cursor:${isDisabled() ? 'not-allowed' : 'pointer'}` : 'cursor:default',
      isSelected() ? 'box-shadow:inset 0 0 0 1.5px currentColor' : '',
      block ? 'display:flex;width:100%;justify-content:center' : '',
      isDisabled() ? 'opacity:.5' : '',
      style || '',
    ].filter(Boolean).join(';'),
    role: checkable ? 'button' : undefined,
    tabindex: checkable && !isDisabled() ? 0 : undefined,
    on: {
      click: handleClick,
      keydown: checkable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e) }
      } : undefined,
    },
    ...rest,
  },
    dot ? span({ style: 'width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0' }) : null,
    icon ? span({ style: 'width:1em;height:1em;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0' }, icon) : null,
    children.length ? span({ style: 'display:inline-block;white-space:nowrap' }, ...children) : null,
    closable ? span({
      role: 'button',
      'aria-label': '移除',
      tabindex: 0,
      style: 'display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;margin-left:2px;margin-right:-2px;opacity:.6;cursor:pointer;font-size:14px;line-height:1;transition:opacity .15s',
      on: {
        click: (e) => { e.stopPropagation(); onClose && onClose(e) },
        mouseenter: (e) => { e.currentTarget.style.opacity = '1' },
        mouseleave: (e) => { e.currentTarget.style.opacity = '.6' },
      },
    }, closeIcon) : null,
  )
}

// ═══════════════════════════════════════════════
// Badge · 徽章（计数 / 点 / 文本 / 呼吸脉冲）
// ═══════════════════════════════════════════════
const BADGE_TONES = {
  danger: '#ef4444', red: '#ef4444',
  primary: 'var(--x-primary,#2563eb)', brand: 'var(--x-primary,#2563eb)',
  success: '#10b981', green: '#10b981',
  warning: '#f59e0b', orange: '#f59e0b',
  info: '#06b6d4', cyan: '#06b6d4',
  purple: '#8b5cf6',
}

export function Badge(props, ...children) {
  const {
    count, dot, max = 99, showZero = false, tone = 'danger',
    pulse, text, standalone, offset = [0, 0],
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

  const build = () => {
    if (!shouldShow()) return null
    const txt = display()
    const single = txt != null && String(txt).length === 1
    const size = isDot ? 8 : (single ? 18 : 20)
    return span({
      class: cx('badge', 'badge-' + tone, pulse && 'badge-pulse', cls),
      style: [
        isDot
          ? 'width:8px;height:8px;padding:0;min-width:0'
          : `min-width:${size}px;height:${size}px;padding:0 ${single ? 0 : 6}px;border-radius:${size / 2}px`,
        'display:inline-flex;align-items:center;justify-content:center',
        `background:${BADGE_TONES[tone] || BADGE_TONES.danger}`,
        'color:#fff;font-size:11px;font-weight:600;line-height:1;font-family:inherit',
        'font-variant-numeric:tabular-nums;letter-spacing:-.01em;white-space:nowrap',
        'box-sizing:border-box;user-select:none',
        'box-shadow:0 0 0 2px var(--x-bg,#fff)',
        style || '',
      ].filter(Boolean).join(';'),
      ...(isDot ? [] : [String(txt)]),
    })
  }

  if (standalone) return build()

  const [ox, oy] = offset
  return span({
    style: 'position:relative;display:inline-flex;vertical-align:middle;flex-shrink:0',
    ...rest,
  },
    ...children,
    shouldShow() ? span({
      style: `position:absolute;top:0;right:0;transform:translate(${ox}px,${oy}px) translate(50%,-50%);pointer-events:none;z-index:2;display:inline-flex`,
    }, build()) : null,
  )
}
