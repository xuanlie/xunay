import { px, cx } from './kit-util.js'
import {div, span, button, input, h1, h2, h3, p, label as _label, li, table, tbody, td, th, thead, tr, ul} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { swipe } from './mobile.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './kit.js'

export function Table(props) {
  const { columns = [], data = [], keyFn, empty, wrap = true } = px(props)
  const tbl = table( { class: 'table' },
    thead( null,
      tr( null,
        ...columns.map(c => th( { style: c.width ? { width: c.width } : {} }, c.title))
      )
    ),
    tbody( null,
      ...(data.length === 0
        ? [tr( null,
            td( { colspan: columns.length, style: { textAlign: 'center', color: '#999', padding: '32px' } }, empty || '暂无数据')
          )]
        : data.map((row, i) => tr( { key: keyFn ? keyFn(row) : i },
            ...columns.map(c => td( null, c.render ? c.render(row) : row[c.key]))
          ))
      )
    )
  )
  // wrap 时包一层，移动端可横滑
  return wrap ? div({ class: 'table-wrap' }, tbl) : tbl
}

export function List(props) {
  const { items = [], keyFn, hover, render } = px(props)
  return ul( { class: cx('list', hover && 'list-hover') },
    ...items.map((item, i) => li( { class: 'list-item', key: keyFn ? keyFn(item) : i }, render(item, i)))
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

// ===== 拖拽上传 =====

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

  return div({
    class: 'card',
    style: { maxWidth: '340px' },
    ref: el => {
      if (!el) return
      swipe(el, {
        onSwipeLeft: () => next(),
        onSwipeRight: () => prev(),
      })
    }
  },
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

export function SplitPane(props) {
  const { left, right, direction = 'horizontal', initial = 50 } = px(props)
  const size = signal(initial)
  const dragging = signal(false)

  const onMouseDown = (ev) => {
    if (ev && ev.touches) ev.preventDefault()
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
      on: { mousedown: onMouseDown, touchstart: onMouseDown }
    }),
    div({ style: { flex: 1, overflow: 'auto' } }, right)
  )
}

// ===== 卡片列表（带操作） =====
