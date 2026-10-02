// XuNay Kit · 不写 class，直接调组件
import { div, span, button, input, h1, h2, h3, p, label as _label } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal } from './core.js'

function px(p) { return p || {} }
function cx(...args) { return args.filter(Boolean).join(' ') }

export function Btn(props, ...children) {
  const { type = 'default', size = '', block, disabled, onClick, icon } = px(props)
  const isDisabled = () => typeof disabled === 'function' ? !!disabled() : !!disabled
  return button({
    class: cx('btn', type !== 'default' && 'btn-' + type, size && 'btn-' + size, block && 'btn-block'),
    disabled: () => isDisabled() ? true : undefined,
    on: { click: e => { if (!isDisabled()) onClick && onClick(e) } }
  }, ...(icon ? [icon, ...children] : children))
}

export function Input(props) {
  const { label, hint, error, type = 'text', value, onChange, placeholder, size, disabled, name } = px(props)
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    input({
      class: cx('input', size && 'input-' + size, error && 'error'),
      type, name,
      placeholder: placeholder || '',
      disabled: !!disabled,
      value: typeof value === 'function' ? value() : (value || ''),
      on: { input: e => onChange && onChange(e.target.value, e) }
    }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function Textarea(props) {
  const { label, hint, error, value, onChange, placeholder, rows = 4 } = px(props)
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    createElement('textarea', {
      class: cx('textarea', error && 'error'), rows,
      placeholder: placeholder || '',
      value: typeof value === 'function' ? value() : (value || ''),
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
    createElement('select', {
      class: cx('select', size && 'input-' + size, error && 'error'),
      disabled: !!disabled,
      value: val,
      on: { change: e => onChange && onChange(e.target.value) }
    },
      placeholder ? createElement('option', { value: '' }, placeholder) : null,
      ...options.map(o => createElement('option', { value: o.value, selected: o.value === val ? true : undefined }, o.label))
    ),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function Checkbox(props) {
  const { label, checked, onChange, disabled } = px(props)
  const val = typeof checked === 'function' ? checked() : checked
  return _label({ class: 'checkbox' },
    input({ type: 'checkbox', checked: !!val, disabled: !!disabled, on: { change: e => onChange && onChange(e.target.checked) } }),
    span(null, label || '')
  )
}

export function Radio(props) {
  const { label, checked, onChange, name, disabled } = px(props)
  const val = typeof checked === 'function' ? checked() : checked
  return _label({ class: 'radio' },
    input({ type: 'radio', name, checked: !!val, disabled: !!disabled, on: { change: () => onChange && onChange() } }),
    span(null, label || '')
  )
}

export function Switch(props) {
  const { label, checked, onChange, disabled } = px(props)
  const val = typeof checked === 'function' ? checked() : checked
  return Row({ gap: 2, align: 'center' },
    _label({ class: 'switch' },
      input({ type: 'checkbox', checked: !!val, disabled: !!disabled, on: { change: e => onChange && onChange(e.target.checked) } }),
      span({ class: 'switch-slider' })
    ),
    label ? span(null, label) : null
  )
}

export function Card(props, ...children) {
  const { title, desc, footer, flat, hover } = px(props)
  return div({ class: cx('card', flat && 'card-flat', hover && 'card-hover') },
    title ? div({ class: 'card-header' },
      div({ class: 'card-title' }, title),
      desc ? div({ class: 'card-desc' }, desc) : null
    ) : null,
    ...children,
    footer ? div({ class: 'card-footer' }, footer) : null
  )
}

export function Row(props, ...children) {
  const { gap = 4, align, justify, wrap } = px(props)
  return div({ class: cx('flex', 'gap-' + gap, align && 'items-' + align, justify && 'justify-' + justify, wrap && 'flex-wrap') }, ...children)
}

export function Col(props, ...children) {
  const { gap = 4, align } = px(props)
  return div({ class: cx('flex', 'flex-col', 'gap-' + gap, align && 'items-' + align) }, ...children)
}

export function Text(props, ...children) {
  const { size, dim, bold, center, tag = 'p' } = px(props)
  const cls = cx(size && 'text-' + size, dim && 'text-dim', bold && 'font-' + (bold === true ? 'bold' : bold), center && 'text-center')
  const Tag = { p, span, h1, h2, h3 }[tag] || p
  return Tag({ class: cls }, ...children)
}

export function Badge(props, ...children) {
  const { type } = px(props)
  return span({ class: cx('badge', type && 'badge-' + type) }, ...children)
}

export function Alert(props, ...children) {
  const { type = 'info', title } = px(props)
  return div({ class: cx('alert', 'alert-' + type) },
    title ? div({ class: 'alert-title' }, title) : null,
    ...children
  )
}

export function Modal(props, ...children) {
  const { open, onClose, title, footer, width } = px(props)
  const isOpen = typeof open === 'function' ? open : () => open
  return div({
    class: 'modal-overlay',
    style: () => isOpen() ? { display: 'flex' } : { display: 'none' },
    on: { click: e => e.target.classList.contains('modal-overlay') && onClose && onClose() }
  },
    div({ class: 'modal', style: width ? { maxWidth: width } : {} },
      title ? div({ class: 'modal-header' },
        h3({ class: 'modal-title' }, title),
        button({ class: 'modal-close', on: { click: onClose } }, '×')
      ) : null,
      div({ class: 'modal-body' }, ...children),
      footer ? div({ class: 'modal-footer' }, footer) : null
    )
  )
}

export function Table(props) {
  const { columns = [], data = [], keyFn, empty } = px(props)
  return createElement('table', { class: 'table' },
    createElement('thead', null,
      createElement('tr', null,
        ...columns.map(c => createElement('th', { style: c.width ? { width: c.width } : {} }, c.title))
      )
    ),
    createElement('tbody', null,
      ...(data.length === 0
        ? [createElement('tr', null,
            createElement('td', { colspan: columns.length, style: { textAlign: 'center', color: '#999', padding: '32px' } }, empty || '暂无数据')
          )]
        : data.map((row, i) => createElement('tr', { key: keyFn ? keyFn(row) : i },
            ...columns.map(c => createElement('td', null, c.render ? c.render(row) : row[c.key]))
          ))
      )
    )
  )
}

export function List(props) {
  const { items = [], keyFn, hover, render } = px(props)
  return createElement('ul', { class: cx('list', hover && 'list-hover') },
    ...items.map((item, i) => createElement('li', { class: 'list-item', key: keyFn ? keyFn(item) : i }, render(item, i)))
  )
}

export function Tabs(props) {
  const { items = [], active, onChange } = px(props)
  const isActive = typeof active === 'function' ? active : () => active
  return div({ class: 'tabs' },
    ...items.map(it => button({
      class: () => cx('tab', isActive() === it.key && 'active'),
      on: { click: () => onChange && onChange(it.key) }
    }, it.title))
  )
}

export function Spinner(props) {
  const { size = 20 } = px(props)
  return div({ style: { display: 'inline-block', width: size + 'px', height: size + 'px', border: '2px solid var(--x-border)', borderTopColor: 'var(--x-primary)', borderRadius: '50%', animation: 'x-spin .6s linear infinite' } })
}

export function Empty(props) {
  const { text = '暂无数据', icon = '📭' } = px(props)
  return div({ style: { textAlign: 'center', padding: '60px 20px', color: 'var(--x-text-mute)' } },
    div({ style: { fontSize: '48px', marginBottom: '12px' } }, icon),
    div({ style: { fontSize: '14px' } }, text)
  )
}

export function Divider(props) {
  const { text } = px(props)
  if (!text) return div({ class: 'divider' })
  return div({ style: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0', color: 'var(--x-text-mute)', fontSize: '13px' } },
    div({ style: { flex: 1, height: '1px', background: 'var(--x-border)' } }),
    span(null, text),
    div({ style: { flex: 1, height: '1px', background: 'var(--x-border)' } })
  )
}

export function Space(props) {
  const { size = 16 } = px(props)
  return div({ style: { height: size + 'px' } })
}

export function Progress(props) {
  const { value = 0, max = 100, size, showText, color } = px(props)
  const val = typeof value === 'function' ? value() : value
  const pct = Math.min(100, Math.max(0, (val / max) * 100))
  return div({ class: 'field' },
    Row({ gap: 2, align: 'center' },
      div({ class: cx('progress', size && 'progress-' + size), style: { flex: 1 } },
        div({ class: 'progress-bar', style: { width: pct + '%', background: color || undefined } })
      ),
      showText ? Text({ size: 'sm', dim: true }, Math.round(pct) + '%') : null
    )
  )
}

export function Avatar(props) {
  const { src, text, size = 'md' } = px(props)
  const cls = cx('avatar', size === 'sm' && 'avatar-sm', size === 'lg' && 'avatar-lg')
  if (src) return div({ class: cls }, createElement('img', { src }))
  return div({ class: cls }, String(text || '?').slice(0, 1).toUpperCase())
}

export function Tag(props, ...children) {
  const { type, closable, onClose } = px(props)
  return span({ class: cx('badge', type && 'badge-' + type), style: { paddingRight: closable ? '4px' : '8px' } },
    ...children,
    closable ? span({ style: { marginLeft: '4px', cursor: 'pointer', opacity: .7 }, on: { click: onClose } }, '×') : null
  )
}

export function Breadcrumb(props) {
  const { items = [], separator = '/' } = px(props)
  const out = []
  items.forEach((it, i) => {
    out.push(span({ style: { color: i === items.length - 1 ? 'var(--x-text)' : 'var(--x-text-dim)', cursor: it.onClick ? 'pointer' : 'default' }, on: { click: it.onClick } }, it.label))
    if (i < items.length - 1) out.push(span({ style: { margin: '0 8px', color: 'var(--x-text-mute)' } }, separator))
  })
  return Row({ gap: 0, align: 'center' }, ...out)
}

export function Pagination(props) {
  const { page, total, pageSize = 20, onChange } = px(props)
  const cur = typeof page === 'function' ? page() : page
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const jump = p => { if (p >= 1 && p <= pages && onChange) onChange(p) }
  const nums = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    const out = [1]
    if (cur > 3) out.push('...')
    for (let i = Math.max(2, cur - 1); i <= Math.min(pages - 1, cur + 1); i++) out.push(i)
    if (cur < pages - 2) out.push('...')
    out.push(pages)
    return out
  }
  return Row({ gap: 1, align: 'center' },
    Btn({ size: 'sm', disabled: cur <= 1, onClick: () => jump(cur - 1) }, '‹'),
    ...nums().map(p => typeof p === 'number'
      ? Btn({ size: 'sm', type: cur === p ? 'primary' : 'default', onClick: () => jump(p) }, String(p))
      : span({ style: { padding: '0 4px', color: 'var(--x-text-mute)' } }, '...')
    ),
    Btn({ size: 'sm', disabled: cur >= pages, onClick: () => jump(cur + 1) }, '›')
  )
}

export function Steps(props) {
  const { steps = [], current = 0 } = px(props)
  return Row({ gap: 3, align: 'center' },
    ...steps.map((s, i) =>
      Row({ gap: 2, align: 'center' },
        div({ style: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', background: i < current ? 'var(--x-success)' : i === current ? 'var(--x-primary)' : 'var(--x-bg-soft)', color: i <= current ? '#fff' : 'var(--x-text-mute)' } }, i < current ? '✓' : String(i + 1)),
        span({ style: { fontSize: '14px', color: i <= current ? 'var(--x-text)' : 'var(--x-text-mute)', fontWeight: i === current ? '600' : '400' } }, s.label || s),
        i < steps.length - 1 ? div({ style: { width: '40px', height: '1px', background: 'var(--x-border)' } }) : null
      )
    )
  )
}

export function Result(props) {
  const { status = 'info', title, subTitle, extra } = px(props)
  const icons = { success: '✓', error: '✗', warning: '!', info: 'i' }
  const colors = { success: 'var(--x-success)', error: 'var(--x-danger)', warning: 'var(--x-warning)', info: 'var(--x-primary)' }
  return div({ style: { textAlign: 'center', padding: '40px 20px' } },
    div({ style: { width: '64px', height: '64px', borderRadius: '50%', background: colors[status], color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px' } }, icons[status]),
    div({ style: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' } }, title || ''),
    subTitle ? div({ style: { color: 'var(--x-text-dim)', marginBottom: '20px' } }, subTitle) : null,
    extra || null
  )
}

export function Skeleton(props) {
  const { lines = 3 } = px(props)
  return Col({ gap: 2 },
    div({ class: 'skeleton skeleton-title' }),
    ...Array.from({ length: lines }, () => div({ class: 'skeleton skeleton-text' }))
  )
}

export function Count(props) {
  const { value = 0, max = 99, type = 'danger' } = px(props)
  const val = typeof value === 'function' ? value() : value
  if (val <= 0) return null
  return span({ class: 'badge badge-' + type, style: { marginLeft: '6px' } }, val > max ? max + '+' : String(val))
}

export function Stat(props) {
  const { label, value, unit, trend, color } = px(props)
  const val = typeof value === 'function' ? value() : value
  return Card(null,
    div({ style: { fontSize: '13px', color: 'var(--x-text-dim)', marginBottom: '8px' } }, label),
    Row({ gap: 1, align: 'center' },
      div({ style: { fontSize: '28px', fontWeight: '700', color: color || 'var(--x-text)' } }, val),
      unit ? span({ style: { fontSize: '14px', color: 'var(--x-text-dim)' } }, unit) : null,
      trend ? span({ style: { fontSize: '13px', marginLeft: '8px', color: trend > 0 ? 'var(--x-success)' : 'var(--x-danger)' } }, (trend > 0 ? '↑ ' : '↓ ') + Math.abs(trend) + '%') : null
    )
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
      input({ class: cx('input', error && 'error'), type: 'number', min, max, step, disabled: !!disabled, value: val, style: { textAlign: 'center', flex: 1 }, on: { input: e => set(e.target.value) } }),
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
    input({ class: cx('input', error && 'error'), type: 'date', disabled: !!disabled, value: val, on: { change: e => onChange && onChange(e.target.value) } }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function TimePicker(props) {
  const { label, hint, error, value, onChange, disabled } = px(props)
  const val = typeof value === 'function' ? value() : value
  return div({ class: 'field' },
    label ? _label({ class: 'label' }, label) : null,
    input({ class: cx('input', error && 'error'), type: 'time', disabled: !!disabled, value: val, on: { change: e => onChange && onChange(e.target.value) } }),
    error ? div({ class: 'error-msg' }, error) : (hint ? div({ class: 'hint' }, hint) : null)
  )
}

export function SearchInput(props) {
  const { placeholder = '搜索...', value, onChange, onSearch } = px(props)
  const val = typeof value === 'function' ? value() : value
  return div({ style: { position: 'relative' } },
    span({ style: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--x-text-mute)', pointerEvents: 'none' } }, '🔍'),
    input({ class: 'input', style: { paddingLeft: '36px' }, placeholder, value: val, on: { input: e => onChange && onChange(e.target.value), keydown: e => { if (e.key === 'Enter' && onSearch) onSearch(val) } } })
  )
}

export function Accordion(props) {
  const { items = [], defaultOpen = 0 } = px(props)
  const openIdx = signal(defaultOpen)
  return Col({ gap: 0 },
    ...items.map((it, i) =>
      div({ style: { border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', marginBottom: '8px', overflow: 'hidden' } },
        div({ style: { padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: openIdx() === i ? 'var(--x-bg-soft)' : 'transparent', fontWeight: '500' }, on: { click: () => openIdx(openIdx() === i ? -1 : i) } },
          span(null, it.title),
          span({ style: { transition: 'transform .2s', transform: openIdx() === i ? 'rotate(90deg)' : 'none', color: 'var(--x-text-mute)' } }, '›')
        ),
        div({ style: { padding: '12px 16px', borderTop: '1px solid var(--x-border)', display: openIdx() === i ? 'block' : 'none' } }, it.content)
      )
    )
  )
}

export function Timeline(props) {
  const { items = [] } = px(props)
  return Col({ gap: 0 },
    ...items.map((it, i) =>
      Row({ gap: 3, align: 'start' },
        Col({ gap: 0, align: 'center' },
          div({ style: { width: '10px', height: '10px', borderRadius: '50%', background: it.color || 'var(--x-primary)', marginTop: '6px' } }),
          i < items.length - 1 ? div({ style: { width: '2px', flex: 1, minHeight: '30px', background: 'var(--x-border)', marginTop: '4px' } }) : null
        ),
        Col({ gap: 1 },
          div({ style: { fontSize: '12px', color: 'var(--x-text-mute)' } }, it.time || ''),
          div({ style: { fontWeight: '500' } }, it.title || ''),
          it.desc ? div({ style: { fontSize: '13px', color: 'var(--x-text-dim)' } }, it.desc) : null
        )
      )
    )
  )
}

export function Tree(props) {
  const { data = [], render } = px(props)
  const Node = (node, depth) => {
    const open = signal(true)
    const hasChildren = node.children && node.children.length > 0
    return div(null,
      div({ style: { padding: '6px 8px', paddingLeft: (8 + depth * 16) + 'px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }, on: { click: () => hasChildren ? open(!open()) : (node.onClick && node.onClick()) } },
        hasChildren ? span({ style: { transition: 'transform .15s', display: 'inline-block', transform: open() ? 'rotate(90deg)' : 'none', color: 'var(--x-text-mute)', fontSize: '12px' } }, '›') : span({ style: { width: '12px' } }),
        span(null, render ? render(node) : node.label)
      ),
      hasChildren && open() ? div(null, ...node.children.map(c => Node(c, depth + 1))) : null
    )
  }
  return Col({ gap: 0 }, ...data.map(n => Node(n, 0)))
}

if (typeof document !== 'undefined' && !document.getElementById('x-kit-style')) {
  const s = document.createElement('style')
  s.id = 'x-kit-style'
  s.textContent = '@keyframes x-spin { to { transform: rotate(360deg) } }'
  document.head.appendChild(s)
}

// ===== 图表 =====
function setupCanvas(canvas, w, h) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  return ctx
}

export function BarChart(props) {
  const { data = [], labels = [], height = 200, color = '#1f6feb', showValue = true } = px(props)
  const w = 600, h = height
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const cw = w - padding.left - padding.right
  const ch = h - padding.top - padding.bottom
  const max = Math.max(...data, 1)
  const barW = cw / data.length * 0.6
  const gap = cw / data.length
  return createElement('canvas', {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, w, h)
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + ch - (ch * i / 4)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(w - padding.right, y)
        ctx.stroke()
      }
      data.forEach((v, i) => {
        const barH = (v / max) * ch
        const x = padding.left + gap * i + (gap - barW) / 2
        const y = padding.top + ch - barH
        const g = ctx.createLinearGradient(0, y, 0, y + barH)
        g.addColorStop(0, color)
        g.addColorStop(1, color + 'aa')
        ctx.fillStyle = g
        ctx.fillRect(x, y, barW, barH)
        if (labels[i]) {
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(labels[i], x + barW / 2, h - 10)
        }
        if (showValue) {
          ctx.fillStyle = '#111'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(String(v), x + barW / 2, y - 4)
        }
      })
    }
  })
}

export function LineChart(props) {
  const { data = [], labels = [], height = 200, color = '#1f6feb', fill = true } = px(props)
  const w = 600, h = height
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const cw = w - padding.left - padding.right
  const ch = h - padding.top - padding.bottom
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  return createElement('canvas', {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, w, h)
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#e5e7eb'
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + ch - (ch * i / 4)
        ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke()
      }
      const step = data.length > 1 ? cw / (data.length - 1) : 0
      const pts = data.map((v, i) => ({ x: padding.left + step * i, y: padding.top + ch - ((v - min) / range) * ch }))
      if (fill) {
        const g = ctx.createLinearGradient(0, padding.top, 0, padding.top + ch)
        g.addColorStop(0, color + '55')
        g.addColorStop(1, color + '00')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(pts[0].x, padding.top + ch)
        pts.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(pts[pts.length-1].x, padding.top + ch)
        ctx.closePath()
        ctx.fill()
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.stroke()
      pts.forEach((p, i) => {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
        if (labels[i]) {
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(labels[i], p.x, h - 10)
        }
      })
    }
  })
}

export function PieChart(props) {
  const { data = [], size = 200, donut = false } = px(props)
  const COLORS = ['#1f6feb','#7c3aed','#e11d48','#ea580c','#16a34a','#0891b2','#db2777','#ca8a04']
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1
  return createElement('canvas', {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, size, size)
      ctx.clearRect(0, 0, size, size)
      let start = -Math.PI / 2
      const cx = size / 2, cy = size / 2, r = size / 2 - 10
      data.forEach((d, i) => {
        const angle = (d.value / total) * Math.PI * 2
        ctx.fillStyle = d.color || COLORS[i % COLORS.length]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, r, start, start + angle)
        ctx.closePath()
        ctx.fill()
        start += angle
      })
      if (donut) {
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#fff'
        ctx.beginPath()
        ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  })
}

export function Sparkline(props) {
  const { data = [], width = 100, height = 30, color = '#1f6feb' } = px(props)
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')
  return createElement('canvas', {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, width, height)
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * height
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  })
}

// ===== 虚拟滚动 =====
export function VirtualList(props) {
  const { items = [], itemHeight = 40, height = 400, overscan = 5, render, keyFn } = px(props)
  const scrollTop = signal(0)
  const start = () => Math.max(0, Math.floor(scrollTop() / itemHeight) - overscan)
  const end = () => Math.min(items.length, Math.ceil((scrollTop() + height) / itemHeight) + overscan)
  const offset = () => start() * itemHeight
  const visible = () => items.slice(start(), end())
  return div({
    style: { height: height + 'px', overflowY: 'auto', position: 'relative', border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)' },
    on: { scroll: e => scrollTop(e.target.scrollTop) }
  },
    div({ style: { height: (items.length * itemHeight) + 'px', position: 'relative' } },
      div({ style: () => ({ transform: 'translateY(' + offset() + 'px)', willChange: 'transform' }) },
        ...visible().map((item, i) =>
          div({ key: keyFn ? keyFn(item) : start() + i, style: { height: itemHeight + 'px', display: 'flex', alignItems: 'center', padding: '0 12px', borderBottom: '1px solid var(--x-border)' } },
            render ? render(item, start() + i) : String(item)
          )
        )
      )
    )
  )
}

// ===== 拖拽排序 =====
export function Sortable(props) {
  const { items = [], onChange, render, keyFn } = px(props)
  const dragIdx = signal(-1)
  const overIdx = signal(-1)
  const move = (from, to) => {
    if (from === to || from < 0 || to < 0) return
    const arr = [...items]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    onChange && onChange(arr)
  }
  return Col({ gap: 0 },
    ...items.map((item, i) =>
      div({
        draggable: true,
        style: () => ({
          padding: '10px 14px',
          margin: '4px 0',
          background: dragIdx() === i ? 'var(--x-primary-soft)' : 'var(--x-bg-elev)',
          border: '1px solid ' + (overIdx() === i && dragIdx() !== i ? 'var(--x-primary)' : 'var(--x-border)'),
          borderRadius: 'var(--x-radius)',
          cursor: 'grab',
          transition: 'all .15s',
          opacity: dragIdx() === i ? '.5' : '1'
        }),
        on: {
          dragstart: e => { dragIdx(i); e.dataTransfer.effectAllowed = 'move' },
          dragend: () => { dragIdx(-1); overIdx(-1) },
          dragover: e => { e.preventDefault(); overIdx(i) },
          drop: e => { e.preventDefault(); move(dragIdx(), i); dragIdx(-1); overIdx(-1) }
        }
      }, render ? render(item, i) : String(item))
    )
  )
}

// ===== 无限滚动 =====
export function InfiniteList(props) {
  const { items = [], itemHeight = 50, height = 400, loadMore, render, loading } = px(props)
  const scrollTop = signal(0)
  const trigger = () => {
    if (loadMore && !loading) loadMore()
  }
  return div({
    style: { height: height + 'px', overflowY: 'auto', border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)' },
    on: {
      scroll: e => {
        scrollTop(e.target.scrollTop)
        const el = e.target
        if (el.scrollHeight - el.scrollTop - el.clientHeight < 100) trigger()
      }
    }
  },
    ...items.map((item, i) =>
      div({ style: { height: itemHeight + 'px', display: 'flex', alignItems: 'center', padding: '0 14px', borderBottom: '1px solid var(--x-border)' } },
        render ? render(item, i) : String(item)
      )
    ),
    show(() => loading, () => div({ style: { padding: '16px', textAlign: 'center' } }, '加载中...'))
  )
}

// ===== 拖拽上传 =====
export function DragUpload(props) {
  const { onFiles, accept, multiple = true, text = '拖拽文件到此处或点击上传' } = px(props)
  const hovering = signal(false)
  const handle = files => {
    const list = Array.from(files || [])
    onFiles && onFiles(multiple ? list : list[0])
  }
  return _label({
    style: () => ({
      display: 'block',
      border: '2px dashed ' + (hovering() ? 'var(--x-primary)' : 'var(--x-border-strong)'),
      borderRadius: 'var(--x-radius-lg)',
      padding: '40px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      background: hovering() ? 'var(--x-primary-soft)' : 'transparent',
      transition: 'all .15s'
    }),
    on: {
      dragover: e => { e.preventDefault(); hovering(true) },
      dragleave: () => hovering(false),
      drop: e => { e.preventDefault(); hovering(false); handle(e.dataTransfer.files) }
    }
  },
    input({ type: 'file', accept, multiple, style: { display: 'none' }, on: { change: e => handle(e.target.files) } }),
    div({ style: { fontSize: '40px', marginBottom: '10px' } }, '📁'),
    div({ style: { color: 'var(--x-text-dim)' } }, text)
  )
}

// ===== 图片上传预览 =====
export function ImageUpload(props) {
  const { onFile, maxSize = 5 * 1024 * 1024 } = px(props)
  const url = signal('')
  const err = signal('')
  return div(null,
    _label({
      style: { display: 'block', border: '2px dashed var(--x-border-strong)', borderRadius: 'var(--x-radius-lg)', padding: '20px', textAlign: 'center', cursor: 'pointer' }
    },
      input({
        type: 'file',
        accept: 'image/*',
        style: { display: 'none' },
        on: {
          change: e => {
            const file = e.target.files[0]
            if (!file) return
            if (file.size > maxSize) { err('文件超过 ' + Math.round(maxSize / 1024 / 1024) + 'MB'); return }
            err('')
            url(URL.createObjectURL(file))
            onFile && onFile(file)
          }
        }
      }),
      show(() => url(), () => createElement('img', { src: url(), style: { maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' } })),
      show(() => !url(), () => div(null,
        div({ style: { fontSize: '32px', marginBottom: '6px' } }, '🖼️'),
        div({ style: { color: 'var(--x-text-dim)' } }, '点击选择图片')
      ))
    ),
    err() ? div({ class: 'error-msg' }, err()) : null
  )
}

// ===== 日历 =====
export function Calendar(props) {
  const { value, onChange, month: initMonth } = px(props)
  const today = new Date()
  const year = signal((initMonth ? new Date(initMonth) : today).getFullYear())
  const month = signal((initMonth ? new Date(initMonth) : today).getMonth())
  const selected = typeof value === 'function' ? value : () => value

  const days = () => {
    const y = year(), m = month()
    const firstDay = new Date(y, m, 1).getDay()
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const out = []
    for (let i = 0; i < firstDay; i++) out.push(null)
    for (let i = 1; i <= daysInMonth; i++) out.push(i)
    return out
  }

  const fmt = d => {
    const y = year(), m = String(month() + 1).padStart(2, '0'), dd = String(d).padStart(2, '0')
    return y + '-' + m + '-' + dd
  }

  const prev = () => {
    if (month() === 0) { month(11); year(year() - 1) }
    else month(month() - 1)
  }
  const next = () => {
    if (month() === 11) { month(0); year(year() + 1) }
    else month(month() + 1)
  }

  return div({ class: 'card', style: { maxWidth: '340px' } },
    Row({ gap: 2, align: 'center', justify: 'between' },
      Btn({ size: 'sm', onClick: prev }, '‹'),
      div({ style: { fontWeight: '600' } }, () => year() + ' 年 ' + (month() + 1) + ' 月'),
      Btn({ size: 'sm', onClick: next }, '›')
    ),
    Space({ size: 12 }),
    div({ style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' } },
      ...['日','一','二','三','四','五','六'].map(d =>
        div({ style: { textAlign: 'center', fontSize: '12px', color: 'var(--x-text-mute)', padding: '4px' } }, d)
      ),
      ...days().map(d => {
        if (d === null) return div()
        const dateStr = fmt(d)
        const isSelected = selected() === dateStr
        const isToday = dateStr === today.toISOString().slice(0, 10)
        return div({
          style: () => ({
            textAlign: 'center',
            padding: '8px 0',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            background: isSelected ? 'var(--x-primary)' : isToday ? 'var(--x-primary-soft)' : 'transparent',
            color: isSelected ? '#fff' : isToday ? 'var(--x-primary)' : 'var(--x-text)',
            fontWeight: isSelected || isToday ? '600' : '400',
            transition: 'all .1s'
          }),
          on: {
            click: () => onChange && onChange(dateStr),
            mouseenter: e => { if (!isSelected) e.currentTarget.style.background = 'var(--x-bg-soft)' },
            mouseleave: e => { if (!isSelected && !isToday) e.currentTarget.style.background = 'transparent' }
          }
        }, String(d))
      })
    )
  )
}

// ===== 树选择 =====
export function TreeSelect(props) {
  const { data = [], value, onChange, placeholder = '请选择' } = px(props)
  const open = signal(false)
  const selected = typeof value === 'function' ? value : () => value
  const label = signal('')

  const findLabel = (nodes, val) => {
    for (const n of nodes) {
      if (n.value === val) return n.label
      if (n.children) {
        const r = findLabel(n.children, val)
        if (r) return r
      }
    }
    return ''
  }

  const Node = (node, depth) => {
    const hasChildren = node.children && node.children.length > 0
    const isOpen = signal(true)
    return div(null,
      div({
        style: { padding: '8px 12px', paddingLeft: (12 + depth * 16) + 'px', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' },
        on: {
          click: () => {
            if (hasChildren) isOpen(!isOpen())
            else { onChange && onChange(node.value); label(node.label); open(false) }
          },
          mouseenter: e => e.currentTarget.style.background = 'var(--x-bg-soft)',
          mouseleave: e => e.currentTarget.style.background = 'transparent'
        }
      },
        hasChildren ? span({ style: { fontSize: '11px', color: 'var(--x-text-mute)', display: 'inline-block', transform: isOpen() ? 'rotate(90deg)' : 'none', transition: 'transform .15s' } }, '›') : span({ style: { width: '11px' } }),
        span(null, node.label)
      ),
      hasChildren && isOpen() ? div(null, ...node.children.map(c => Node(c, depth + 1))) : null
    )
  }

  if (!label() && selected()) label(findLabel(data, selected()))

  return div({ style: { position: 'relative' } },
    div({
      class: 'input',
      style: { cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
      on: { click: () => open(!open()) }
    },
      span({ style: { color: label() ? 'var(--x-text)' : 'var(--x-text-mute)' } }, () => label() || placeholder),
      span({ style: { color: 'var(--x-text-mute)', fontSize: '12px' } }, '▾')
    ),
    show(open, () =>
      div({
        style: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--x-bg-elev)', border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', boxShadow: 'var(--x-shadow-md)', maxHeight: '300px', overflowY: 'auto', padding: '4px', zIndex: 100 }
      }, ...data.map(n => Node(n, 0)))
    )
  )
}

// ===== 分隔面板 =====
export function SplitPane(props) {
  const { left, right, direction = 'horizontal', initial = 50 } = px(props)
  const size = signal(initial)
  const dragging = signal(false)

  const onMouseDown = () => {
    dragging(true)
    const move = e => {
      if (!dragging()) return
      const container = e.currentTarget.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const pct = direction === 'horizontal'
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100
      size(Math.max(10, Math.min(90, pct)))
    }
    const up = () => {
      dragging(false)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  const isH = direction === 'horizontal'
  return div({
    style: { display: 'flex', flexDirection: isH ? 'row' : 'column', height: '100%', gap: '4px' }
  },
    div({ style: () => isH ? { width: size() + '%', overflow: 'auto' } : { height: size() + '%', overflow: 'auto' } }, left),
    div({
      style: () => ({
        flex: '0 0 6px',
        background: dragging() ? 'var(--x-primary)' : 'var(--x-border)',
        cursor: isH ? 'col-resize' : 'row-resize',
        borderRadius: '3px',
        transition: 'background .15s'
      }),
      on: { mousedown: onMouseDown }
    }),
    div({ style: { flex: 1, overflow: 'auto' } }, right)
  )
}

// ===== 卡片列表（带操作） =====
export function ItemCard(props) {
  const { title, desc, avatar, actions, onClick } = px(props)
  return div({
    class: 'card',
    style: { display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: onClick ? 'pointer' : 'default' },
    on: { click: onClick }
  },
    avatar || null,
    Col({ gap: 1, style: { flex: 1 } },
      div({ style: { fontWeight: '600', fontSize: '15px' } }, title),
      desc ? div({ style: { fontSize: '13px', color: 'var(--x-text-dim)' } }, desc) : null
    ),
    actions ? Row({ gap: 1 }, ...(Array.isArray(actions) ? actions : [actions])) : null
  )
}

// ===== 描述列表 =====
export function Descriptions(props) {
  const { items = [], columns = 2, bordered = false } = px(props)
  return div({
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + columns + ', 1fr)',
      gap: bordered ? '0' : '16px',
      border: bordered ? '1px solid var(--x-border)' : 'none',
      borderRadius: bordered ? 'var(--x-radius)' : '0',
      overflow: 'hidden'
    }
  },
    ...items.map(it =>
      div({
        style: {
          padding: bordered ? '10px 14px' : '0',
          borderBottom: bordered ? '1px solid var(--x-border)' : 'none',
          display: bordered ? 'flex' : 'block',
          gap: bordered ? '12px' : '0'
        }
      },
        div({ style: { fontSize: '13px', color: 'var(--x-text-dim)', minWidth: bordered ? '80px' : 'auto', marginBottom: bordered ? '0' : '4px' } }, it.label),
        div({ style: { fontSize: '14px' } }, it.value)
      )
    )
  )
}

// ===== 二维码（用 API） =====
export function QRCode(props) {
  const { text, size = 200 } = px(props)
  return createElement('img', {
    src: 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&data=' + encodeURIComponent(typeof text === 'function' ? text() : text),
    width: size,
    height: size,
    style: { borderRadius: '8px' }
  })
}

// ===== 星级评分 =====
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
export function SplitButton(props) {
  const { text, onClick, items = [] } = px(props)
  const open = signal(false)
  return div({ style: { position: 'relative', display: 'inline-block' } },
    Row({ gap: 0 },
      Btn({ type: 'primary', onClick }, text),
      Btn({ type: 'primary', onClick: () => open(!open()), style: { borderLeft: '1px solid rgba(255,255,255,.2)' } }, '▾')
    ),
    show(open, () =>
      div({
        style: { position: 'absolute', top: 'calc(100% + 4px)', right: 0, background: 'var(--x-bg-elev)', border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', boxShadow: 'var(--x-shadow-md)', minWidth: '140px', padding: '4px', zIndex: 100 }
      },
        ...items.map(it =>
          div({
            style: { padding: '8px 12px', fontSize: '14px', cursor: 'pointer', borderRadius: '6px' },
            on: {
              click: () => { it.onClick && it.onClick(); open(false) },
              mouseenter: e => e.currentTarget.style.background = 'var(--x-bg-soft)',
              mouseleave: e => e.currentTarget.style.background = 'transparent'
            }
          }, it.label)
        )
      )
    )
  )
}

// ===== 代码编辑器 =====
if (typeof document !== 'undefined' && !document.getElementById('x-code-style')) {
  const THEMES = {
    onedark: { bg:'#282c34', ln:'#21252b', lnfg:'#495162', fg:'#abb2bf', k:'#c678dd', s:'#98c379', c:'#5c6370', n:'#d19a66', f:'#61afef', t:'#e5c07b', m:'#56b6c2', caret:'#528bff', bd:'#3e4451', sel:'rgba(82,139,255,.25)' },
    dracula: { bg:'#282a36', ln:'#21222c', lnfg:'#6272a4', fg:'#f8f8f2', k:'#ff79c6', s:'#f1fa8c', c:'#6272a4', n:'#bd93f9', f:'#50fa7b', t:'#8be9fd', m:'#ffb86c', caret:'#f8f8f0', bd:'#44475a', sel:'rgba(255,121,198,.25)' },
    monokai: { bg:'#272822', ln:'#1e1f1c', lnfg:'#75715e', fg:'#f8f8f2', k:'#f92672', s:'#e6db74', c:'#75715e', n:'#ae81ff', f:'#a6e22e', t:'#66d9ef', m:'#fd971f', caret:'#f8f8f0', bd:'#3e3d32', sel:'rgba(249,38,114,.25)' },
    'github-dark': { bg:'#0d1117', ln:'#161b22', lnfg:'#484f58', fg:'#c9d1d9', k:'#ff7b72', s:'#a5d6ff', c:'#8b949e', n:'#79c0ff', f:'#d2a8ff', t:'#ffa657', m:'#7ee787', caret:'#58a6ff', bd:'#30363d', sel:'rgba(88,166,255,.25)' },
    'github-light': { bg:'#ffffff', ln:'#f6f8fa', lnfg:'#8c959f', fg:'#24292f', k:'#cf222e', s:'#0a3069', c:'#6e7781', n:'#0550ae', f:'#8250df', t:'#953800', m:'#116329', caret:'#0969da', bd:'#d0d7de', sel:'rgba(9,105,218,.15)' },
    nord: { bg:'#2e3440', ln:'#3b4252', lnfg:'#616e88', fg:'#d8dee9', k:'#81a1c1', s:'#a3be8c', c:'#616e88', n:'#b48ead', f:'#88c0d0', t:'#ebcb8b', m:'#8fbcbb', caret:'#88c0d0', bd:'#434c5e', sel:'rgba(136,192,208,.25)' },
    'solarized-dark': { bg:'#002b36', ln:'#073642', lnfg:'#586e75', fg:'#839496', k:'#859900', s:'#2aa198', c:'#586e75', n:'#d33682', f:'#268bd2', t:'#b58900', m:'#cb4b16', caret:'#93a1a1', bd:'#073642', sel:'rgba(38,139,210,.25)' },
    'solarized-light': { bg:'#fdf6e3', ln:'#eee8d5', lnfg:'#93a1a1', fg:'#657b83', k:'#859900', s:'#2aa198', c:'#93a1a1', n:'#d33682', f:'#268bd2', t:'#b58900', m:'#cb4b16', caret:'#586e75', bd:'#eee8d5', sel:'rgba(38,139,210,.15)' },
    'tokyo-night': { bg:'#1a1b26', ln:'#16161e', lnfg:'#3b4261', fg:'#a9b1d6', k:'#bb9af7', s:'#9ece6a', c:'#565f89', n:'#ff9e64', f:'#7aa2f7', t:'#e0af68', m:'#7dcfff', caret:'#c0caf5', bd:'#292e42', sel:'rgba(122,162,247,.25)' },
    catppuccin: { bg:'#1e1e2e', ln:'#181825', lnfg:'#45475a', fg:'#cdd6f4', k:'#cba6f7', s:'#a6e3a1', c:'#6c7086', n:'#fab387', f:'#89b4fa', t:'#f9e2af', m:'#94e2d5', caret:'#f5e0dc', bd:'#313244', sel:'rgba(203,166,247,.25)' }
  }
  let themesCSS = ''
  for (const name in THEMES) {
    const t = THEMES[name]
    themesCSS += '.x-code[data-theme="' + name + '"]{--bg:' + t.bg + ';--ln:' + t.ln + ';--lnfg:' + t.lnfg + ';--fg:' + t.fg + ';--k:' + t.k + ';--s:' + t.s + ';--c:' + t.c + ';--n:' + t.n + ';--f:' + t.f + ';--t:' + t.t + ';--m:' + t.m + ';--caret:' + t.caret + ';--bd:' + t.bd + ';--sel:' + t.sel + '}\n'
  }
  const s = document.createElement('style')
  s.id = 'x-code-style'
  s.textContent = `
.x-code{
  --bg:#282c34;--ln:#21252b;--lnfg:#495162;--fg:#abb2bf;
  --k:#c678dd;--s:#98c379;--c:#5c6370;--n:#d19a66;
  --f:#61afef;--t:#e5c07b;--m:#56b6c2;--caret:#528bff;
  --bd:#3e4451;--sel:rgba(82,139,255,.25);
  display:flex;border:1px solid var(--bd);border-radius:12px;overflow:hidden;
  font-family:"JetBrains Mono","Fira Code",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:13.5px;background:var(--bg);color:var(--fg);
  box-shadow:0 8px 32px rgba(0,0,0,.25);line-height:1.65;
  transition:background .2s,border-color .2s;
}
.x-code-wrap{position:relative;flex:1;min-width:0}
.x-code-pre{
  position:absolute;inset:0;margin:0;padding:14px 16px;
  overflow:auto;pointer-events:none;background:transparent;
  line-height:1.65;white-space:pre;counter-reset:xln;
  font-family:inherit;font-size:inherit;color:var(--fg);
  transition:color .2s;
}
.x-code-pre code{
  display:block;background:transparent!important;border:none!important;padding:0!important;
  font-family:inherit;font-size:inherit;color:inherit;
}
.x-line{
  display:block;
  min-height:1.65em;
  counter-increment:xln;
  padding-left:56px;
  position:relative;
  white-space:pre;
}
.x-line::before{
  content:counter(xln);
  position:absolute;
  left:0;
  width:40px;
  text-align:right;
  color:var(--lnfg);
  user-select:none;
  font-size:12.5px;
  padding-right:14px;
  border-right:1px solid var(--bd);
  margin-right:12px;
  height:100%;
  top:0;
}
.x-code-ta{
  position:absolute;inset:0;margin:0;padding:14px 16px;
  padding-left:72px;
  background:transparent;color:transparent;
  caret-color:var(--caret);
  border:none;outline:none;resize:none;
  font-family:inherit;font-size:inherit;line-height:1.65;
  white-space:pre;overflow:auto;tab-size:2;
}
.x-code-ta::selection{background:var(--sel)}
.h-k{color:var(--k);transition:color .2s}
.h-s{color:var(--s);transition:color .2s}
.h-c{color:var(--c);font-style:italic;transition:color .2s}
.h-n{color:var(--n);transition:color .2s}
.h-f{color:var(--f);transition:color .2s}
.h-t{color:var(--t);transition:color .2s}
.h-m{color:var(--m);transition:color .2s}
` + themesCSS
  document.head.appendChild(s)
}

import { highlight } from './hl.js'

export function CodeEditor(props) {
  const { value, onChange, language = 'js', height = 300, theme = 'onedark', readOnly, lineNumbers = true } = px(props)
  const val = typeof value === 'function' ? value : () => value
  let preEl = null, codeEl = null, taEl = null, lnEl = null
  let lastText = ''
  let lastLang = ''
  let rafId = 0
  let cacheLang = ''
  const cache = new Map()

  const highlightCached = (text, lang) => {
    if (lang !== cacheLang) { cache.clear(); cacheLang = lang }
    const lines = text.split('\n')
    const out = new Array(lines.length)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      let h = cache.get(line)
      if (h === undefined) {
        h = highlight(line, lang) || '&#8203;'
        cache.set(line, h)
      }
      out[i] = h
    }
    return out.join('\n')
  }

  const doRender = () => {
    if (!codeEl) return
    const text = val() || ''
    if (text === lastText && language === lastLang) return
    lastText = text
    lastLang = language
    codeEl.innerHTML = highlightCached(text, language) + '\n'
    if (lnEl) {
      const n = text.split('\n').length
      let h = ''
      for (let i = 1; i <= n; i++) h += i + '\n'
      lnEl.textContent = h
    }
  }

  const scheduleRender = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => { rafId = 0; doRender() })
  }

  const onInput = e => { onChange && onChange(e.target.value); scheduleRender() }

  const onScroll = () => {
    if (preEl && taEl) { preEl.scrollTop = taEl.scrollTop; preEl.scrollLeft = taEl.scrollLeft }
    if (lnEl && taEl) lnEl.scrollTop = taEl.scrollTop
  }

  const onKeyDown = e => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = taEl.selectionStart, en = taEl.selectionEnd
      const v = taEl.value
      taEl.value = v.slice(0, s) + '  ' + v.slice(en)
      taEl.selectionStart = taEl.selectionEnd = s + 2
      onChange && onChange(taEl.value)
      scheduleRender()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') e.preventDefault()
  }

  return div({ class: 'x-code', 'data-theme': theme, style: { height: height + 'px' } },
    lineNumbers ? div({ class: 'x-code-ln', ref: el => { lnEl = el; scheduleRender() } }) : null,
    div({ class: 'x-code-wrap' },
      createElement('pre', { class: 'x-code-pre', ref: el => { preEl = el } },
        createElement('code', { ref: el => { codeEl = el } })
      ),
      createElement('textarea', {
        class: 'x-code-ta',
        ref: el => {
          taEl = el
          scheduleRender()
          el.addEventListener('scroll', onScroll, { passive: true })
        },
        value: val(),
        readOnly: !!readOnly,
        spellcheck: false,
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        on: { input: onInput, keydown: onKeyDown }
      })
    )
  )
}

// ===== 快捷键监听 =====
export function useHotkey(combo, handler) {
  if (typeof window === 'undefined') return
  const parts = combo.toLowerCase().split('+')
  const needCtrl = parts.includes('ctrl') || parts.includes('cmd') || parts.includes('meta')
  const needShift = parts.includes('shift')
  const needAlt = parts.includes('alt')
  const key = parts.filter(p => !['ctrl','cmd','meta','shift','alt'].includes(p))[0]
  const fn = e => {
    const ctrl = e.ctrlKey || e.metaKey
    if (needCtrl !== ctrl) return
    if (needShift !== e.shiftKey) return
    if (needAlt !== e.altKey) return
    if (e.key.toLowerCase() !== key) return
    e.preventDefault()
    handler(e)
  }
  window.addEventListener('keydown', fn)
  return () => window.removeEventListener('keydown', fn)
}

// ===== 富文本（contenteditable） =====
export function RichText(props) {
  const { value, onChange, placeholder = '输入内容...' } = px(props)
  const val = typeof value === 'function' ? value : () => value
  const exec = cmd => document.execCommand(cmd, false, null)
  return div({ style: { border: '1px solid var(--x-border)', borderRadius: 'var(--x-radius)', overflow: 'hidden' } },
    Row({ gap: 0, style: { background: 'var(--x-bg-soft)', borderBottom: '1px solid var(--x-border)', padding: '4px' } },
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('bold') }, 'B'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('italic') }, 'I'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('underline') }, 'U'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('insertUnorderedList') }, '•'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('insertOrderedList') }, '1.'),
      Btn({ size: 'sm', type: 'ghost', onClick: () => exec('removeFormat') }, '清')
    ),
    div({
      contenteditable: true,
      style: { padding: '12px', minHeight: '120px', outline: 'none', fontSize: '14px', lineHeight: '1.6' },
      html: val(),
      on: { input: e => onChange && onChange(e.target.innerHTML) }
    })
  )
}

// ===== 复制按钮 =====
export function CopyButton(props) {
  const { text, label = '复制', copied = '已复制' } = px(props)
  const state = signal(label)
  const copy = () => {
    const t = typeof text === 'function' ? text() : text
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(ok, fail)
    } else {
      const ta = document.createElement('textarea')
      ta.value = t; ta.style.position = 'fixed'; ta.style.left = '-9999px'
      document.body.appendChild(ta); ta.select()
      document.execCommand('copy') ? ok() : fail()
      document.body.removeChild(ta)
    }
  }
  const ok = () => { state(copied); setTimeout(() => state(label), 1200) }
  const fail = () => { state('失败'); setTimeout(() => state(label), 1200) }
  return Btn({ size: 'sm', onClick: copy }, () => state())
}

// ===== 密码强度 =====
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
