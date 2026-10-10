import { px, cx } from './kit-util.js'
import {div, span, button, input, pre, code, textarea} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Row, Col, Card, Btn } from './kit.js'

export function Markdown(props) {
  const { value, onChange, preview = true, height = '300px' } = px(props)
  const val = () => typeof value === 'function' ? value() : (value || '')
  const parse = md => String(md)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
  return Row({ gap: 2, style: { height } },
    div({ style: { flex: 1, display: 'flex', flexDirection: 'column' } },
      div({ style: { fontSize: '11px', color: '#9ca3af', padding: '6px 0' } }, '编辑'),
      textarea( {
        style: { flex: 1, width: '100%', padding: '12px', fontFamily: 'ui-monospace,monospace', fontSize: '13px', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'none', outline: 'none' },
        value: val(),
        on: { input: e => onChange && onChange(e.target.value) }
      })
    ),
    preview ? div({ style: { flex: 1, display: 'flex', flexDirection: 'column' } },
      div({ style: { fontSize: '11px', color: '#9ca3af', padding: '6px 0' } }, '预览'),
      div({ style: { flex: 1, padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'auto', fontSize: '14px', lineHeight: 1.6 }, html: () => parse(val()) })
    ) : null
  )
}

export function JSONViewer(props) {
  const { data, indent = 2, collapsed = false } = px(props)
  const val = () => typeof data === 'function' ? data() : data
  let text = ''
  try { text = JSON.stringify(val(), null, indent) } catch (e) { text = String(val()) }
  return pre({ style: { background: '#0d1117', color: '#e6edf3', padding: '14px 16px', borderRadius: '8px', fontSize: '13px', fontFamily: 'ui-monospace,monospace', lineHeight: 1.6, overflow: 'auto', margin: 0 } }, text)
}

export function DiffViewer(props) {
  const { oldText = '', newText = '' } = px(props)
  const oldLines = String(oldText).split('\n')
  const newLines = String(newText).split('\n')
  const max = Math.max(oldLines.length, newLines.length)
  const rows = []
  for (let i = 0; i < max; i++) {
    const o = oldLines[i], n = newLines[i]
    if (o === n) rows.push({ type: 'same', text: n || '' })
    else {
      if (o !== undefined) rows.push({ type: 'del', text: o })
      if (n !== undefined) rows.push({ type: 'add', text: n })
    }
  }
  const bg = { same: 'transparent', del: '#ffebe9', add: '#e6ffec' }
  const prefix = { same: ' ', del: '-', add: '+' }
  return pre({ style: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 0', fontSize: '13px', fontFamily: 'ui-monospace,monospace', overflow: 'auto', margin: 0 } },
    ...rows.map(r => div({
      style: { padding: '2px 16px', background: bg[r.type], whiteSpace: 'pre' }
    }, prefix[r.type] + ' ' + r.text))
  )
}

export function Terminal(props) {
  const { lines = [], prompt = '$', onCommand, height = '300px' } = px(props)
  const history = signal(lines.slice())
  const inputVal = signal('')
  const submit = e => {
    if (e.key !== 'Enter') return
    const cmd = inputVal()
    if (!cmd.trim()) return
    history([...history(), prompt + ' ' + cmd])
    inputVal('')
    if (onCommand) {
      const out = onCommand(cmd)
      if (out) history([...history(), String(out)])
    }
  }
  return div({ style: { background: '#0d1117', color: '#e6edf3', borderRadius: '8px', padding: '12px 16px', height, overflow: 'auto', fontFamily: 'ui-monospace,monospace', fontSize: '13px', lineHeight: 1.6 } },
    ...history().map(l => div(null, l)),
    Row({ gap: 1, align: 'center' },
      span({ style: { color: '#7ee787' } }, prompt),
      input({
        style: { flex: 1, background: 'transparent', border: 0, outline: 0, color: '#e6edf3', fontFamily: 'inherit', fontSize: 'inherit' },
        value: inputVal(),
        on: { input: e => inputVal(e.target.value), keydown: submit }
      })
    )
  )
}

export function CommandPalette(props) {
  const { open, items = [], onSelect, placeholder = '输入命令...' } = px(props)
  const isOpen = typeof open === 'function' ? open : () => open
  const query = signal('')
  const filtered = () => items.filter(it => (it.label || '').toLowerCase().includes(query().toLowerCase()))
  const idx = signal(0)
  effect(() => {
    if (!isOpen()) return
    const key = e => {
      if (e.key === 'Escape') onSelect && onSelect(null)
      else if (e.key === 'ArrowDown') { e.preventDefault(); idx(Math.min(idx() + 1, filtered().length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); idx(Math.max(idx() - 1, 0)) }
      else if (e.key === 'Enter') onSelect && onSelect(filtered()[idx()])
    }
    document.addEventListener('keydown', key)
    onCleanup(() => document.removeEventListener('keydown', key))
  })
  return show(isOpen, () => div({
    style: { position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' },
    on: { click: e => e.target.style.position === 'fixed' && onSelect && onSelect(null) }
  },
    div({
      style: { background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,.3)', overflow: 'hidden' },
      on: { click: e => e.stopPropagation() }
    },
      input({
        style: { width: '100%', padding: '16px 20px', border: 0, borderBottom: '1px solid #f3f4f6', outline: 0, fontSize: '15px' },
        placeholder, value: query(),
        on: { input: e => { query(e.target.value); idx(0) } }
      }),
      div({ style: { maxHeight: '300px', overflow: 'auto' } },
        ...filtered().map((it, i) => div({
          style: () => ({ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', background: idx() === i ? '#eff6ff' : 'transparent' }),
          on: {
            click: () => onSelect && onSelect(it),
            mouseenter: () => idx(i)
          }
        }, it.label))
      )
    )
  ))
}

export function ContextMenu(props, ...children) {
  const { items = [], onSelect } = px(props)
  const visible = signal(false)
  const pos = signal({ x: 0, y: 0 })
  effect(() => {
    if (!visible()) return
    const close = () => visible(false)
    document.addEventListener('click', close)
    onCleanup(() => document.removeEventListener('click', close))
  })
  return span({
    on: {
      contextmenu: e => {
        e.preventDefault()
        pos({ x: e.clientX, y: e.clientY })
        visible(true)
      }
    }
  },
    ...children,
    show(visible, () => div({
      style: () => ({
        position: 'fixed', left: pos().x + 'px', top: pos().y + 'px',
        zIndex: 6000, background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,.15)',
        minWidth: '150px', padding: '4px'
      })
    },
      ...items.map(it => div({
        style: { padding: '8px 14px', fontSize: '13px', cursor: 'pointer', borderRadius: '6px' },
        on: {
          click: () => { onSelect && onSelect(it); visible(false) },
          mouseenter: e => e.currentTarget.style.background = '#f3f4f6',
          mouseleave: e => e.currentTarget.style.background = 'transparent'
        }
      }, it.label))
    ))
  )
}
