// @xunay/kit/ui/card —— 精密卡片
// 特色：悬浮抬升弹簧 · 按下阻尼 · 色带 · 封面 · 骨架态 ·
//      加载模糊 · 折叠 · 状态色 · 图标标题 · 8pt 网格 · 主题变量
import { div, span, button } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal, effect } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const PAD = { sm: 12, md: 16, lg: 20, xl: 24 }

export function Card(props, ...children) {
  const {
    title, desc, icon, cover, coverRatio = 16/9,
    footer, actions, extra,
    padding = 'md',
    variant = 'elevated',      // elevated | outlined | flat
    tone = 'default',          // default | success | warning | danger | info | brand
    stripe,                    // 'top' | 'left' | false
    hover = true,              // 悬浮抬升
    pressable = false,         // 可点击（按下反馈）
    collapsible = false,       // 可折叠
    defaultOpen = true,
    loading = false,           // 加载态（内容模糊 + spinner）
    skeleton = false,          // 骨架态（占位条）
    disabled, selected,
    onClick, onLongPress,
    class: cls, style, ...rest
  } = px(props)

  const isDisabled = () => typeof disabled === 'function' ? disabled() : !!disabled
  const isSelected = () => typeof selected === 'function' ? selected() : !!selected
  const isLoading = () => typeof loading === 'function' ? loading() : !!loading
  const isSkeleton = () => typeof skeleton === 'function' ? skeleton() : !!skeleton
  const isOpen = signal(typeof defaultOpen === 'function' ? defaultOpen() : !!defaultOpen)

  const hovering = signal(false)
  const pressed = signal(false)
  const focused = signal(false)
  let longTimer = null

  const pad = PAD[padding] || PAD.md

  const onEnter = () => { if (!isDisabled() && hover) hovering(true) }
  const onLeave = () => { hovering(false); pressed(false) }
  const onDown = (e) => {
    if (isDisabled()) return
    if (pressable) pressed(true)
    if (onLongPress) {
      longTimer = setTimeout(() => { longTimer = null; onLongPress(e) }, 500)
    }
  }
  const onUp = () => {
    pressed(false)
    if (longTimer) { clearTimeout(longTimer); longTimer = null }
  }
  const onKey = (e) => {
    if (!pressable) return
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isDisabled()) pressed(true)
      if (e.key === ' ') e.preventDefault()
    }
  }
  const onKeyUp = (e) => {
    if (!pressable) return
    if (e.key === 'Enter' || e.key === ' ') pressed(false)
  }
  const handleClick = (e) => {
    if (isDisabled() || isLoading()) return
    if (collapsible) isOpen(!isOpen())
    onClick && onClick(e)
  }

  // 骨架占位条
  function skeletonLine(w) {
    return div({
      class: 'x-card-skeleton-line',
      style: `height:12px;width:${w};border-radius:6px;background:linear-gradient(90deg,var(--x-border,#e2e8f0) 25%,transparent 50%,var(--x-border,#e2e8f0) 75%);background-size:200% 100%;animation:x-card-shimmer 1.4s linear infinite;margin-bottom:8px`,
    })
  }

  const isCollapsible = collapsible && (title || desc)

  return div({
    class: cx('x-card', 'x-card-' + variant, 'x-card-tone-' + tone, cls),
    ref: (el) => {
      if (el && stripe) el.setAttribute('data-stripe', stripe)
    },
    tabindex: (pressable || collapsible) ? 0 : undefined,
    role: pressable ? 'button' : undefined,
    'aria-expanded': isCollapsible ? (() => isOpen() ? 'true' : 'false') : undefined,
    style: () => {
      const h = hovering() && hover && !isDisabled()
      const p = pressed() ? 0.985 : 1
      const s = isSelected()
      const lift = h ? 'translateY(-2px)' : ''
      const shadow = h
        ? '0 12px 28px -8px rgba(0,0,0,.14), 0 4px 10px -2px rgba(0,0,0,.06)'
        : (variant === 'elevated' ? '0 2px 8px -2px rgba(0,0,0,.08)' : 'none')
      const ring = s
        ? '0 0 0 2px var(--x-card-ring, var(--x-primary,#3b82f6))'
        : (focused() ? '0 0 0 3px var(--x-card-ring, rgba(59,130,246,.35))' : '')
      return [
        `position:relative`,
        `padding:${pad}px`,
        `border-radius:14px`,
        `background:var(--x-card, #fff)`,
        `color:var(--x-text, #0f172a)`,
        `border:1px solid ${variant === 'outlined' ? 'var(--x-border,#e2e8f0)' : 'transparent'}`,
        `box-shadow:${[shadow, ring].filter(Boolean).join(',') || 'none'}`,
        `transform:${lift} scale(${p})`,
        `transition:transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s ease, background .2s, color .2s`,
        `overflow:hidden`,
        (pressable || collapsible) ? `cursor:${isDisabled() ? 'not-allowed' : 'pointer'}` : '',
        `user-select:none`,
        `-webkit-tap-highlight-color:transparent`,
        isDisabled() ? 'opacity:.5' : '',
        style || '',
      ].filter(Boolean).join(';')
    },
    on: {
      mouseenter: onEnter,
      mouseleave: onLeave,
      pointerdown: onDown,
      pointerup: onUp,
      pointercancel: onUp,
      focus: () => focused(true),
      blur: () => { focused(false); pressed(false) },
      keydown: onKey,
      keyup: onKeyUp,
      click: handleClick,
    },
    ...rest,
  },
    // 色带
    stripe === 'top' ? div({
      style: `position:absolute;left:0;right:0;top:0;height:3px;background:var(--x-card-stripe, var(--x-primary,#3b82f6))`,
    }) : null,
    stripe === 'left' ? div({
      style: `position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--x-card-stripe, var(--x-primary,#3b82f6))`,
    }) : null,

    // 封面
    cover ? div({
      style: `margin:${-pad}px ${-pad}px ${pad}px;aspect-ratio:${coverRatio};overflow:hidden;background:var(--x-bg-soft,#f1f5f9);display:flex;align-items:center;justify-content:center`,
    }, typeof cover === 'string' ? div({ style: `width:100%;height:100%;background:${cover};background-size:cover;background-position:center` }) : cover) : null,

    // 头部（图标 + 标题 + 副标题 + 折叠箭头 + 额外）
    (title || desc || icon || extra || isCollapsible) ? div({
      class: 'x-card-head',
      style: `display:flex;align-items:flex-start;gap:${Math.max(8, pad/2)}px;margin-bottom:${(children.length || footer || actions) ? pad/2 : 0}px`,
    },
      icon ? span({
        class: 'x-card-icon',
        style: `width:36px;height:36px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:var(--x-card-icon-bg, var(--x-bg-soft, #f1f5f9));color:var(--x-card-icon-fg, var(--x-primary,#3b82f6))`,
      }, icon) : null,
      (title || desc) ? div({
        style: `flex:1;min-width:0`,
      },
        title ? div({
          class: 'x-card-title',
          style: `font-size:15px;font-weight:600;line-height:1.35;color:var(--x-text,#0f172a);overflow:hidden;text-overflow:ellipsis;white-space:nowrap`,
        }, title) : null,
        desc ? div({
          class: 'x-card-desc',
          style: `font-size:12.5px;line-height:1.5;color:var(--x-text-mute,var(--x-muted,#64748b));margin-top:2px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical`,
        }, desc) : null,
      ) : null,
      extra ? span({ class: 'x-card-extra', style: 'flex-shrink:0' }, extra) : null,
      isCollapsible ? span({
        class: 'x-card-arrow',
        style: () => `flex-shrink:0;transition:transform .2s ease;color:var(--x-text-mute,var(--x-muted,#64748b));transform:rotate(${isOpen() ? 90 : 0}deg)`,
      }, '›') : null,
    ) : null,

    // 内容
    (() => {
      if (isSkeleton()) {
        return div({ class: 'x-card-body' }, skeletonLine('100%'), skeletonLine('92%'), skeletonLine('78%'))
      }
      if (!children.length) return null
      const body = div({
        class: 'x-card-body',
        style: () => `transition:filter .2s ease, opacity .2s ease;${isLoading() ? 'filter:blur(2px);opacity:.6;pointer-events:none' : ''}`,
      }, ...children)
      if (!isCollapsible) return body
      return div({
        class: 'x-card-collapse',
        style: () => `overflow:hidden;transition:grid-template-rows .28s cubic-bezier(.4,0,.2,1);display:grid;grid-template-rows:${isOpen() ? '1fr' : '0fr'}`,
      },
        div({ style: 'overflow:hidden;min-height:0' }, body)
      )
    })(),

    // 加载覆盖
    isLoading() ? div({
      style: 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none',
    }, span({
      style: 'width:24px;height:24px;border:2.5px solid var(--x-primary,#3b82f6);border-top-color:transparent;border-radius:50%;animation:x-card-spin .7s linear infinite',
    })) : null,

    // 底部
    (footer || actions) ? div({
      class: 'x-card-foot',
      style: `display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:${pad}px;padding-top:${pad}px;border-top:1px solid var(--x-border,#e2e8f0)`,
    }, footer, actions) : null,
  )
}
