import { px, cx } from './kit-util.js'
import {div, span, button, input, h1, h2, h3, p, label as _label, option, select, textarea} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './kit.js'

export function Input(props) {
  const { label, hint, error, type = 'text', value, onChange, placeholder, size, disabled, name } = px(props)
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    input({
      class: cx('input', size && 'input-' + size, error && 'error'),
      type, name,
      placeholder: placeholder || '',
      disabled: !!disabled,
      value: typeof value === 'function' ? value : (value || ''),
      on: { input: e => onChange && onChange(e.target.value, e) }
    }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
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
  const { label, checked, onChange, disabled } = px(props)
  return _label({ class: 'checkbox' },
    input({ type: 'checkbox', checked: typeof checked === 'function' ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: e => onChange && onChange(e.target.checked) } }),
    span(null, label || '')
  )
}

export function Radio(props) {
  const { label, checked, onChange, name, disabled } = px(props)
  return _label({ class: 'radio' },
    input({ type: 'radio', name, checked: typeof checked === 'function' ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: () => onChange && onChange() } }),
    span(null, label || '')
  )
}

export function Switch(props) {
  const { label, checked, onChange, disabled } = px(props)
  return Row({ gap: 2, align: 'center' },
    _label({ class: 'switch' },
      input({ type: 'checkbox', checked: typeof checked === 'function' ? () => !!checked() : !!checked, disabled: !!disabled, on: { change: e => onChange && onChange(e.target.checked) } }),
      span({ class: 'switch-slider' })
    ),
    label ? span(null, label) : null
  )
}

export function NumberInput(props) {
  const { label, hint, error, value, onChange, min, max, step = 1, disabled } = px(props)
  const val = typeof value === 'function' ? value() : value
  const clamp = v => { if (min !== undefined && v < min) v = min; if (max !== undefined && v > max) v = max; return v }
  const set = v => onChange && onChange(clamp(Number(v) || 0))
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
    span({ style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--x-text-mute)', pointerEvents: 'none' } }, '🔍'),
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
          color: idx <= (hover() || val()) ? '#f59e0b' : 'var(--x-border-strong)',
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
