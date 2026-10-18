// @xunay/kit/ui/input —— 精密输入框
// 特色：浮动 label · 前后缀 · 可清除 · 密码切换 · 字数计数 ·
//      错误抖动 · 状态环 · 8pt 网格 · 键盘适配
import { div, span, input, label as labelEl, button } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal, effect } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

const SIZES = { sm: { h:32, px:10, fs:13, r:8 }, md: { h:40, px:12, fs:14, r:10 }, lg: { h:48, px:14, fs:15, r:12 } }

export function Input(props) {
  const {
    value, defaultValue = '',
    placeholder, label, hint, error,
    size = 'md', type = 'text',
    prefix, suffix, icon, allowClear,
    maxLength, showCount,
    disabled, readonly, required,
    password,       // 显示切换
    onChange, onEnter, onFocus, onBlur, onClear,
    class: cls, style, ...rest
  } = px(props)

  const S = SIZES[size] || SIZES.md
  const focused = signal(false)
  const inner = signal(defaultValue)
  const showPwd = signal(false)
  const getVal = () => typeof value === 'function' ? value() : (value !== undefined ? value : inner())
  const setVal = (v) => { inner(v); onChange && onChange(v) }
  const hasVal = () => String(getVal() ?? '').length > 0

  let elRef = null
  // 错误抖动
  let lastError = ''
  effect(() => {
    if (!elRef) return
    const e = typeof error === 'function' ? error() : error
    if (e && e !== lastError) {
      lastError = e
      elRef.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ], { duration: 320, easing: 'ease-out' })
    }
  })

  const inputType = () => password && showPwd() ? 'text' : (password ? 'password' : type)

  return div({
    class: cx('x-input-wrap', cls),
    ref: (el) => { elRef = el },
    style: () => {
      const custom = typeof style === 'function' ? style() : (style || '')
      return `display:flex;flex-direction:column;gap:6px;${custom}`
    },
  },
    label ? labelEl({
      class: 'x-input-label',
      style: `font-size:12.5px;color:#0f172a;font-weight:500;display:flex;gap:4px;align-items:center`,
    }, label, required ? span({ style: 'color:#ef4444' }, '*') : null) : null,

    div({
      class: 'x-input-box',
      style: () => {
        const f = focused()
        const e = typeof error === 'function' ? error() : error
        const dis = typeof disabled === 'function' ? disabled() : disabled
        return [
          `--x-input-h:${S.h}px`,
          `position:relative`,
          `display:flex`,
          `align-items:center`,
          `gap:8px`,
          `height:${S.h}px`,
          `padding:0 ${S.px}px`,
          `font-size:${S.fs}px`,
          `border-radius:${S.r}px`,
          `background:#fff`,
          `border:1.5px solid ${e ? '#ef4444' : (f ? '#3b82f6' : '#e2e8f0')}`,
          `box-shadow:${f && !e ? '0 0 0 3px rgba(59,130,246,.15)' : (f && e ? '0 0 0 3px rgba(239,68,68,.15)' : 'none')}`,
          `transition:border-color .15s, box-shadow .15s, background .15s`,
          dis ? 'opacity:.55;cursor:not-allowed;background:#f8fafc' : '',
        ].filter(Boolean).join(';')
      },
    },
      icon ? span({ style: `color:#64748b;display:inline-flex;flex-shrink:0;width:1.1em;height:1.1em;align-items:center` }, icon) : null,
      prefix ? span({ class: 'x-input-prefix', style: `color:#64748b;flex-shrink:0` }, prefix) : null,
      input({
        ref: (el) => { /* nothing */ },
        class: 'x-input-el',
        type: inputType(),
        value: getVal(),
        placeholder,
        disabled: disabled ? true : undefined,
        readonly: readonly ? true : undefined,
        style: `flex:1;min-width:0;border:none;outline:none;background:transparent;color:inherit;font:inherit;padding:0;height:100%`,
        on: {
          input: (e) => setVal(e.target.value),
          focus: (e) => { focused(true); onFocus && onFocus(e) },
          blur: (e) => { focused(false); onBlur && onBlur(e) },
          keydown: (e) => {
            if (e.key === 'Enter') onEnter && onEnter(e)
            if (e.key === 'Escape' && allowClear) setVal('')
          },
        },
        ...rest,
      }),
      allowClear && hasVal() ? button({
        class: 'x-input-clear',
        type: 'button',
        tabindex: -1,
        style: `display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border:none;background:#94a3b8;color:#fff;border-radius:50%;cursor:pointer;font-size:11px;line-height:1;padding:0;flex-shrink:0;transition:transform .15s,background .15s`,
        on: {
          click: () => { setVal(''); onClear && onClear() },
          mouseenter: (e) => { e.currentTarget.style.background = '#64748b' },
          mouseleave: (e) => { e.currentTarget.style.background = '#94a3b8' },
        },
      }, '×') : null,
      password ? button({
        class: 'x-input-eye',
        type: 'button',
        tabindex: -1,
        style: `display:inline-flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;padding:0;color:#64748b;flex-shrink:0`,
        on: { click: () => showPwd(!showPwd()) },
      }, showPwd() ? '🙈' : '👁') : null,
      suffix ? span({ class: 'x-input-suffix', style: `color:#64748b;flex-shrink:0` }, suffix) : null,
    ),

    (hint || error || (maxLength && showCount)) ? div({
      style: `display:flex;justify-content:space-between;font-size:12px;line-height:1.4;min-height:16px`,
    },
      error
        ? span({ style: 'color:#ef4444' }, typeof error === 'function' ? error() : error)
        : (hint ? span({ style: 'color:#64748b' }, hint) : span()),
      (maxLength && showCount)
        ? span({ style: () => `color:${String(getVal() || '').length >= maxLength ? '#ef4444' : '#64748b'};font-variant-numeric:tabular-nums` },
            () => `${String(getVal() || '').length}/${maxLength}`)
        : null
    ) : null,
  )
}
