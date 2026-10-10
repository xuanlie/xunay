import { px, cx } from './kit-util.js'
import {div, span, button, input, label as _label, textarea} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Row, Col, Btn } from './kit.js'

export function ColorPicker(props) {
  const { value, onChange, showText = true } = px(props)
  const val = () => typeof value === 'function' ? value() : value
  return Row({ gap: 2, align: 'center' },
    input({
      type: 'color', value: val() || '#000000',
      style: { width: '40px', height: '32px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', padding: 0 },
      on: { input: e => onChange && onChange(e.target.value) }
    }),
    showText ? span({ style: { fontSize: '12px', fontFamily: 'monospace', color: '#6b7280' } }, () => val() || '#000000') : null
  )
}

export function Slider(props) {
  const { value, onChange, min = 0, max = 100, step = 1, disabled } = px(props)
  const val = () => typeof value === 'function' ? value() : (value || 0)
  return input({
    type: 'range', min, max, step, disabled: !!disabled,
    value: val(),
    style: { width: '100%', cursor: disabled ? 'not-allowed' : 'pointer' },
    on: { input: e => onChange && onChange(Number(e.target.value)) }
  })
}

export function Mentions(props) {
  const { value, onChange, options = [], placeholder } = px(props)
  const val = () => typeof value === 'function' ? value() : (value || '')
  const filtered = signal([])
  const showList = signal(false)
  return div({ style: { position: 'relative' } },
    textarea( {
      class: 'input', rows: 3, placeholder: placeholder || '输入 @ 提及他人',
      value: val(),
      on: {
        input: e => {
          const v = e.target.value
          onChange && onChange(v)
          const m = v.match(/@(\w*)$/)
          if (m) {
            const k = m[1].toLowerCase()
            const list = options.filter(o => o.toLowerCase().includes(k))
            filtered(list)
            showList(list.length > 0)
          } else {
            showList(false)
          }
        }
      }
    }),
    show(showList, () => div({
      style: {
        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,.1)', marginTop: '4px', maxHeight: '150px', overflow: 'auto'
      }
    },
      ...filtered().map(o => div({
        style: { padding: '8px 12px', cursor: 'pointer', fontSize: '13px' },
        on: {
          click: () => {
            const v = val().replace(/@(\w*)$/, '@' + o + ' ')
            onChange && onChange(v)
            showList(false)
          },
          mouseenter: e => e.currentTarget.style.background = '#f3f4f6',
          mouseleave: e => e.currentTarget.style.background = 'transparent'
        }
      }, o))
    ))
  )
}

export function Transfer(props) {
  const { data = [], value = [], onChange, titles = ['源列表', '已选'] } = px(props)
  const left = signal(data.filter(d => !value.includes(d.key)))
  const right = signal(data.filter(d => value.includes(d.key)))
  const selL = signal([])
  const selR = signal([])
  const Item = (it, side) => div({
    style: {
      padding: '6px 10px', fontSize: '13px', cursor: 'pointer', borderRadius: '4px',
      background: (side === 'L' ? selL() : selR()).includes(it.key) ? '#eff6ff' : 'transparent'
    },
    on: { click: () => {
      const s = side === 'L' ? selL : selR
      const arr = s()
      s(arr.includes(it.key) ? arr.filter(k => k !== it.key) : [...arr, it.key])
    } }
  }, it.label)
  const move = (from, to) => {
    const s = from === 'L' ? selL : selR
    const keys = s()
    if (!keys.length) return
    const fromArr = from === 'L' ? left() : right()
    const toArr = from === 'L' ? right() : left()
    const moving = fromArr.filter(d => keys.includes(d.key))
    const newFrom = fromArr.filter(d => !keys.includes(d.key))
    from === 'L' ? (left(newFrom), right([...toArr, ...moving])) : (right(newFrom), left([...toArr, ...moving]))
    s([])
    onChange && onChange((from === 'L' ? right() : left()).map(d => d.key))
  }
  const Box = (title, arr, side) => div({
    style: { flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column' }
  },
    div({ style: { padding: '8px 12px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: '12px', fontWeight: '600' } }, title),
    div({ style: { flex: 1, padding: '8px', maxHeight: '240px', overflow: 'auto' } },
      ...arr().map(it => Item(it, side)))
  )
  return Row({ gap: 2, align: 'center' },
    Box(titles[0], left, 'L'),
    Col({ gap: 1 },
      Btn({ size: 'sm', onClick: () => move('L', 'R') }, '→'),
      Btn({ size: 'sm', onClick: () => move('R', 'L') }, '←')
    ),
    Box(titles[1], right, 'R')
  )
}

export function Cascader(props) {
  const { options = [], value, onChange, placeholder = '请选择' } = px(props)
  const val = () => typeof value === 'function' ? value() : value
  const open = signal(false)
  const path = signal([])
  const cur = () => {
    let arr = options
    const res = []
    for (const k of path()) {
      const found = arr.find(o => o.value === k)
      if (!found) break
      res.push(found)
      arr = found.children || []
    }
    return { list: arr, chosen: res }
  }
  return div({ style: { position: 'relative' } },
    div({
      class: 'input', style: { cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
      on: { click: () => open(!open()) }
    },
      span({ style: { color: val() ? '#111' : '#9ca3af' } }, () => val() ? val().join(' / ') : placeholder),
      span({ style: { color: '#9ca3af', fontSize: '12px' } }, '▾')
    ),
    show(open, () => div({
      style: {
        position: 'absolute', top: '100%', left: 0, zIndex: 100, marginTop: '4px',
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,.1)', display: 'flex', minWidth: '240px'
      }
    },
      div({ style: { minWidth: '120px', borderRight: '1px solid #f3f4f6', padding: '4px' } },
        ...cur().chosen.map((c, i) => div({
          style: { padding: '6px 10px', fontSize: '13px', cursor: 'pointer' },
          on: { click: () => path(path().slice(0, i)) }
        }, c.label))
      ),
      div({ style: { minWidth: '120px', padding: '4px' } },
        ...cur().list.map(o => div({
          style: { padding: '6px 10px', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' },
          on: {
            click: () => {
              if (o.children) path([...path(), o.value])
              else { onChange && onChange([...path(), o.value], o); open(false) }
            },
            mouseenter: e => e.currentTarget.style.background = '#f3f4f6',
            mouseleave: e => e.currentTarget.style.background = 'transparent'
          }
        }, o.label, o.children ? span({ style: { color: '#9ca3af' } }, '›') : null))
      )
    ))
  )
}
