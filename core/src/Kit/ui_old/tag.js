// @xunay/kit/ui/tag —— 精密标签
// 特色：7 色 tone · 3 种 variant · 可关闭 · 可选中 · 图标 · 点状指示灯
import { span, button } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const SIZES = { sm: { h:20, px:6, fs:11, r:4 }, md: { h:24, px:8, fs:12, r:6 }, lg: { h:30, px:12, fs:13, r:8 } }

export function Tag(props, ...children) {
  const {
    tone = 'default',      // default | primary | success | warning | danger | info | brand | purple
    variant = 'soft',      // soft | solid | outline
    size = 'md',
    closable, closeIcon = '×',
    checkable, selected: selProp,
    icon, dot,             // 左边小圆点
    round, block, disabled,
    onClose, onChange,
    class: cls, style, ...rest
  } = px(props)

  const S = SIZES[size] || SIZES.md
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
    class: cx('x-tag', 'x-tag-' + tone, 'x-tag-' + variant, cls),
    style: () => [
      `--x-tag-h:${S.h}px`,
      `--x-tag-px:${S.px}px`,
      `--x-tag-fs:${S.fs}px`,
      `--x-tag-r:${S.r}px`,
      `display:inline-flex`,
      `align-items:center`,
      `gap:4px`,
      `height:${S.h}px`,
      `padding:0 ${S.px}px`,
      `font-size:${S.fs}px`,
      `line-height:1`,
      `border-radius:${round ? '999px' : S.r + 'px'}`,
      `font-weight:500`,
      `user-select:none`,
      `transition:background .15s, color .15s, border-color .15s, transform .12s`,
      `-webkit-tap-highlight-color:transparent`,
      checkable ? `cursor:${isDisabled() ? 'not-allowed' : 'pointer'}` : 'cursor:default',
      isSelected() ? `box-shadow:inset 0 0 0 1.5px currentColor` : '',
      block ? 'display:flex;width:100%;justify-content:center' : '',
      isDisabled() ? 'opacity:.5' : '',
      style || '',
    ].filter(Boolean).join(';'),
    role: checkable ? 'button' : undefined,
    'aria-pressed': checkable ? (() => isSelected() ? 'true' : 'false') : undefined,
    tabindex: checkable && !isDisabled() ? 0 : undefined,
    on: {
      click: handleClick,
      keydown: checkable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e) }
      } : undefined,
    },
    ...rest,
  },
    dot ? span({
      style: 'width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;box-shadow:0 0 0 2px rgba(255,255,255,.6)',
    }) : null,
    icon ? span({ style: 'width:1em;height:1em;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0' }, icon) : null,
    children.length ? span({ style: 'display:inline-block;white-space:nowrap' }, ...children) : null,
    closable ? span({
      role: 'button',
      'aria-label': '移除',
      tabindex: 0,
      style: 'display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;margin-left:2px;margin-right:-2px;opacity:.6;cursor:pointer;font-size:14px;line-height:1;transition:opacity .15s,background .15s',
      on: {
        click: (e) => { e.stopPropagation(); onClose && onClose(e) },
        mouseenter: (e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(0,0,0,.06)' },
        mouseleave: (e) => { e.currentTarget.style.opacity = '.6'; e.currentTarget.style.background = 'transparent' },
      },
    }, closeIcon) : null,
  )
}
