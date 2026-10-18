import { px, cx } from './util.js'
import {div, span, button, input, h1, h2, h3, p, label as _label, option, select, textarea} from '../../element.js'
import { createElement } from '../../element.js'
import { show } from '../../misc.js'
import { signal, effect, onCleanup } from '../../core.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './base.js'

export function Input(props) {
  const {
    value, defaultValue = '', placeholder = '', label, hint, error,
    size = 'md', type = 'text', prefix, suffix, icon, allowClear,
    maxLength, showCount, disabled, readonly, required, password,
    onChange, onEnter, onFocus, onBlur, onClear,
    class: cls, style, ...rest
  } = px(props)
  let inpEl = null, clearEl = null, countEl = null, hintText = null
  const sync = () => {
    if (!inpEl) return
    const v = inpEl.value
    if (clearEl) clearEl.style.display = v ? 'inline-flex' : 'none'
    if (countEl && maxLength) {
      countEl.textContent = v.length + '/' + maxLength
      countEl.classList.toggle('over', v.length >= maxLength)
    }
  }
  const initVal = typeof value === 'function' ? value() : (value !== undefined ? value : defaultValue)
  return div({
    class: cx('field', cls),
    style: ['display:flex', 'flex-direction:column', 'gap:6px', style].filter(Boolean).join(';'),
  },
    label ? _label({ class: 'label' }, label, required ? span({ style: 'color:var(--x-danger);margin-left:2px' }, '*') : null) : null,
    div({
      class: cx('field-box', size, disabled && 'disabled', error && 'error'),
    },
      icon ? span({ class: 'field-icon' }, icon) : null,
      prefix ? span({ class: 'field-icon' }, prefix) : null,
      input({
        class: 'field-el',
        type: password ? 'password' : type,
        value: initVal,
        placeholder,
        disabled: disabled ? true : undefined,
        readonly: readonly ? true : undefined,
        maxlength: maxLength,
        ref: (el) => {
          inpEl = el
          sync()
          el.addEventListener('input', () => { sync(); onChange && onChange(el.value) })
          el.addEventListener('focus', (e) => onFocus && onFocus(e))
          el.addEventListener('blur', (e) => onBlur && onBlur(e))
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') onEnter && onEnter(e)
            if (e.key === 'Escape' && allowClear) { el.value = ''; sync() }
          })
          // ★ 响应式：value 传函数时，订阅并在信号变化时同步
          if (typeof value === 'function') {
            effect(() => {
              const v = value()
              const next = v == null ? '' : String(v)
              if (el.value !== next) { el.value = next; sync() }
            })
          }
        },
      }),
      allowClear ? span({
        class: 'field-clear',
        style: 'display:none',
        ref: (el) => { clearEl = el; sync() },
        on: { click: () => { if (inpEl) { inpEl.value = ''; sync(); onChange && onChange(''); onClear && onClear() } } },
      }, '×') : null,
      password ? span({
        class: 'field-eye',
        on: { click: () => { if (inpEl) inpEl.type = inpEl.type === 'password' ? 'text' : 'password' } },
      }, '👁') : null,
      suffix ? span({ class: 'field-icon' }, suffix) : null,
    ),
    (hint || error || (maxLength && showCount)) ? div({
      class: cx('field-hint', error && 'error'),
    },
      span({ ref: (el) => { hintText = el } }, error || hint || ''),
      (maxLength && showCount) ? span({ class: 'field-count', ref: (el) => { countEl = el; sync() } }) : null,
    ) : null,
  )
}

export function Textarea(props) {
  const { label, hint, error, value, onChange, placeholder, rows = 4 } = px(props)
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    textarea( {
      class: cx('textarea', error && 'error'), rows,
      placeholder: placeholder || '',
      value: typeof value === 'function' ? value : (value || ''),
      on: { input: e => onChange && onChange(e.target.value, e) }
    }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function Select(props) {
  const { label, hint, error, options = [], value, onChange, placeholder, disabled, size } = px(props)
  const val = typeof value === 'function' ? value() : value
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    select( {
      class: cx('select', size && 'input-' + size, error && 'error'),
      disabled: !!disabled,
      value: typeof value === 'function' ? value : (value || ''),
      on: { change: e => onChange && onChange(e.target.value) }
    },
      placeholder ? option( { value: '' }, placeholder) : null,
      ...options.map(o => option( { value: o.value, selected: o.value === val ? true : undefined }, o.label))
    ),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function Checkbox(props) {
  const {
    label, desc, checked, defaultChecked = false, indeterminate,
    onChange, disabled, size = 'md', tone = 'primary', card,
    class: cls, style, ...rest
  } = px(props)
  let elRef = null
  const isControlled = typeof checked !== 'undefined'
  const initOn = isControlled ? (typeof checked === 'function' ? !!checked() : !!checked) : !!defaultChecked
  const isIndet = typeof indeterminate === 'function' ? !!indeterminate() : !!indeterminate
  const isDisabled = () => typeof disabled === 'function' ? !!disabled() : !!disabled
  const toggle = (e) => {
    if (isDisabled()) return
    e.preventDefault()
    e.stopPropagation()
    const next = !elRef.classList.contains('on')
    if (!isControlled) {
      elRef.classList.toggle('on', next)
      elRef.classList.remove('indeterminate')
      elRef.setAttribute('aria-checked', String(next))
    }
    onChange && onChange(next, e)
  }
  return _label({
    class: cx(
      'checkbox',
      size !== 'md' && size,
      tone !== 'primary' && tone,
      initOn && 'on',
      isIndet && 'indeterminate',
      isDisabled() && 'disabled',
      card && 'card',
      cls,
    ),
    style,
    ref: (el) => {
      elRef = el
      el.setAttribute('aria-checked', String(initOn))
      el.setAttribute('role', 'checkbox')
      el.setAttribute('tabindex', isDisabled() ? '-1' : '0')
    },
    ...rest,
    on: {
      click: toggle,
      keydown: (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(e) }
      },
    },
  },
    span({ class: 'cb-box' },
      span({
        class: 'cb-check',
        ref: (el) => {
          const NS = 'http://www.w3.org/2000/svg'
          const svg = document.createElementNS(NS, 'svg')
          svg.setAttribute('viewBox', '0 0 24 24')
          svg.style.cssText = 'position:absolute;inset:0;padding:2px'
          const p = document.createElementNS(NS, 'path')
          p.setAttribute('d', 'M5 12l5 5L20 7')
          p.setAttribute('fill', 'none')
          p.setAttribute('stroke', '#fff')
          p.setAttribute('stroke-width', '3')
          p.setAttribute('stroke-linecap', 'round')
          p.setAttribute('stroke-linejoin', 'round')
          svg.appendChild(p)
          el.appendChild(svg)
        },
      }),
      span({ class: 'cb-mark' }),
    ),
    (label || desc) ? div({ class: 'cb-content', style: 'display:flex;flex-direction:column;gap:2px;min-width:0' },
      label ? span({ class: 'cb-title', style: card ? '' : 'font-size:14px;font-weight:500;line-height:1.4' }, label) : null,
      desc ? span({ class: 'cb-desc' }, desc) : null,
    ) : null,
  )
}

export function Radio(props) {
  const {
    label, desc, checked, onChange, value, name, disabled,
    size = 'md', tone = 'primary', card, button,
    class: cls, style, ...rest
  } = px(props)
  const isControlled = typeof checked !== 'undefined'
  const initOn = isControlled ? (typeof checked === 'function' ? !!checked() : !!checked) : false
  const isDisabled = () => typeof disabled === 'function' ? !!disabled() : !!disabled
  let elRef = null
  return _label({
    class: cx(
      'radio',
      size !== 'md' && size,
      tone !== 'primary' && tone,
      initOn && 'on',
      isDisabled() && 'disabled',
      card && 'card',
      button && 'button',
      cls,
    ),
    style,
    ref: (el) => {
      elRef = el
      el.setAttribute('role', 'radio')
      el.setAttribute('aria-checked', String(initOn))
      el.setAttribute('tabindex', isDisabled() ? '-1' : '0')
      if (name) el.setAttribute('data-name', name)
    },
    ...rest,
    on: {
      click: (e) => {
        if (isDisabled()) return
        e.preventDefault()
        const el = elRef
        if (!el) return
        const wasOn = el.classList.contains('on')
        // 同组互斥：有 name 用 name，没 name 用同父容器
        let siblings
        if (name) {
          siblings = document.querySelectorAll('label.radio[data-name="' + name + '"]')
        } else if (el.parentElement) {
          siblings = el.parentElement.querySelectorAll(':scope > label.radio')
        } else {
          siblings = [el]
        }
        siblings.forEach(r => {
          r.classList.remove('on')
          r.setAttribute('aria-checked', 'false')
        })
        // 点击已选中的 → 取消；否则 → 选中
        if (!wasOn) {
          el.classList.add('on')
          el.setAttribute('aria-checked', 'true')
          onChange && onChange(value, e)
        } else {
          onChange && onChange(null, e)
        }
      },
      keydown: (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); elRef && elRef.click() }
      },
    },
  },
    button
      ? span({ style: 'display:inline-flex;align-items:center;justify-content:center' }, label)
      : null,
    !button && span({ class: 'rd-dot' }, span({ class: 'cb-inner-dot' })),
    !button && (label || desc) ? div({ class: 'cb-content', style: 'display:flex;flex-direction:column;gap:2px;min-width:0' },
      label ? span({ class: 'cb-title', style: card ? '' : 'font-size:14px;font-weight:500;line-height:1.4' }, label) : null,
      desc ? span({ class: 'cb-desc' }, desc) : null,
    ) : null,
  )
}

export function Switch(props) {
  const {
    checked, defaultChecked = false, onChange, disabled, loading,
    size = 'md', onText, offText, tone = 'primary', label, haptic = false,
    class: cls, style, ...rest
  } = px(props)
  let elRef = null
  const isControlled = typeof checked !== 'undefined'
  const initOn = typeof checked === 'function' ? !!checked() : (isControlled ? !!checked : !!defaultChecked)
  const isDisabled = () => {
    const d = typeof disabled === 'function' ? disabled() : disabled
    const l = typeof loading === 'function' ? loading() : loading
    return !!(d || l)
  }
  const isLoading = () => typeof loading === 'function' ? !!loading() : !!loading
  const toggle = (e) => {
    if (isDisabled()) return
    const next = !elRef.classList.contains('on')
    if (haptic && e && e.pointerType === 'touch' && navigator.vibrate) {
      try { navigator.vibrate(8) } catch {}
    }
    if (!isControlled) {
      elRef.classList.toggle('on', next)
      elRef.setAttribute('aria-checked', String(next))
    }
    onChange && onChange(next, e)
  }
  const node = button({
    type: 'button',
    role: 'switch',
    class: cx('switch', size !== 'md' && size, tone !== 'primary' && tone, initOn && 'on', isDisabled() && 'disabled', cls),
    disabled: isDisabled() ? true : undefined,
    style,
    ref: (el) => {
      elRef = el
      el.setAttribute('aria-checked', String(initOn))
    },
    ...rest,
    on: {
      click: toggle,
      keydown: (e) => {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(e) }
      },
    },
  },
    (onText || offText) ? span({ class: 'switch-text on' }, onText || '') : null,
    (onText || offText) ? span({ class: 'switch-text off' }, offText || '') : null,
    span({ class: 'switch-thumb' },
      isLoading() ? span({ class: 'switch-spinner' }) : null,
    ),
  )
  if (!label) return node
  return Row({ gap: 2, align: 'center' },
    node,
    span({
      class: 'switch-label',
      style: 'font-size:13.5px;cursor:pointer;user-select:none',
      on: { click: () => elRef && elRef.click() },
    }, label),
  )
}

export function NumberInput(props) {
  const { label, hint, error, value, onChange, min, max, step = 1, disabled } = px(props)
  const val = typeof value === 'function' ? value() : value
  const clamp = v => { if (min !== undefined && v < min) v = min; if (max !== undefined && v > max) v = max; return v }
  const set = v => {
    if (v === '' || v == null) { onChange && onChange(''); return }
    const n = Number(v)
    if (isNaN(n)) return
    onChange && onChange(clamp(n))
  }
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    Row({ gap: 1, align: 'center' },
      Btn({ size: 'sm', onClick: () => set((val || 0) - step) }, '−'),
      input({ class: cx('input', error && 'error'), type: 'number', min, max, step, disabled: !!disabled, value: typeof value === 'function' ? value : (value || ''), style: { textAlign: 'center', flex: 1 }, on: { input: e => set(e.target.value) } }),
      Btn({ size: 'sm', onClick: () => set((val || 0) + step) }, '+')
    ),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function DatePicker(props) {
  const { label, hint, error, value, onChange, disabled } = px(props)
  const val = typeof value === 'function' ? value() : value
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    input({ class: cx('input', error && 'error'), type: 'date', disabled: !!disabled, value: typeof value === 'function' ? value : (value || ''), on: { change: e => onChange && onChange(e.target.value) } }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function TimePicker(props) {
  const { label, hint, error, value, onChange, disabled } = px(props)
  const val = typeof value === 'function' ? value() : value
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    input({ class: cx('input', error && 'error'), type: 'time', disabled: !!disabled, value: typeof value === 'function' ? value : (value || ''), on: { change: e => onChange && onChange(e.target.value) } }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function SearchInput(props) {
  const { placeholder = '搜索...', value, onChange, onSearch } = px(props)
  const val = typeof value === 'function' ? value() : value
  return div({ style: { position: 'relative' } },
    span({ style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--x-text-mute)', pointerEvents: 'none', display: 'flex' } },
      createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
        createElement('circle', { cx: 11, cy: 11, r: 7 }),
        createElement('path', { d: 'M21 21l-4.35-4.35' })
      )),
    input({ class: 'input', style: { paddingLeft: '36px' }, placeholder, value: typeof value === 'function' ? value : (value || ''), on: { input: e => onChange && onChange(e.target.value), keydown: e => { if (e.key === 'Enter' && onSearch) onSearch(val) } } })
  )
}

export function PasswordStrength(props) {
  const { value } = px(props)
  const val = typeof value === 'function' ? value : () => value
  const score = () => {
    const v = val() || ''
    let s = 0
    if (v.length >= 8) s++
    if (/[a-z]/.test(v)) s++
    if (/[A-Z]/.test(v)) s++
    if (/\d/.test(v)) s++
    if (/[^a-zA-Z0-9]/.test(v)) s++
    return s
  }
  const colors = ['', '#e33', '#f80', '#fc0', '#8c4', '#0a7']
  const labels = ['', '很弱', '弱', '中', '强', '很强']
  return div({ style: { marginTop: '6px' } },
    div({ style: { height: '4px', background: 'var(--x-bg-soft)', borderRadius: '2px', overflow: 'hidden' } },
      div({ style: () => ({ width: (score() * 20) + '%', height: '100%', background: colors[score()], transition: 'all .3s' }) })
    ),
    div({ style: { fontSize: '12px', color: 'var(--x-text-mute)', marginTop: '4px' } }, () => labels[score()])
  )
}

// ===== 表单验证 =====

export function Rate(props) {
  const { value, onChange, max = 5, size = 24 } = px(props)
  const val = typeof value === 'function' ? value : () => value
  const hover = signal(0)
  return Row({ gap: 0 },
    ...Array.from({ length: max }, (_, i) => {
      const idx = i + 1
      return span({
        style: () => ({
          fontSize: size + 'px',
          cursor: 'pointer',
          color: idx <= (hover() || val()) ? 'var(--x-warning)' : 'var(--x-border-strong)',
          transition: 'color .1s',
          lineHeight: '1'
        }),
        on: {
          click: () => onChange && onChange(idx),
          mouseenter: () => hover(idx),
          mouseleave: () => hover(0)
        }
      }, '★')
    })
  )
}

// ===== 分割按钮 =====

export function useForm(initial) {
  const values = signal(initial)
  const errors = signal({})
  const validate = (rules) => {
    const errs = {}
    const v = values()
    for (const k in rules) {
      const err = rules[k](v[k], v)
      if (err) errs[k] = err
    }
    errors(errs)
    return Object.keys(errs).length === 0
  }
  const setField = (k, v) => values({ ...values(), [k]: v })
  return { values, errors, setField, validate }
}
