import { px, cx } from './kit-util.js'
import {div, span, button, input, img, video} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { swipe } from './mobile.js'
import { Row, Col, Card, Btn } from './kit.js'

export function Carousel(props, ...children) {
  const { auto = false, interval = 3000, height = '300px' } = px(props)
  const items = Array.isArray(children[0]) ? children[0] : children
  const idx = signal(0)
  effect(() => {
    if (!auto) return
    const t = setInterval(() => idx((idx() + 1) % items.length), interval)
    onCleanup(() => clearInterval(t))
  })
  return div({
    style: { position: 'relative', overflow: 'hidden', height, borderRadius: '8px' },
    ref: el => {
      if (!el || typeof swipe !== 'function') return
      swipe(el, {
        onSwipeLeft: () => idx((idx() + 1) % items.length),
        onSwipeRight: () => idx((idx() - 1 + items.length) % items.length),
      })
    }
  },
    div({
      style: () => ({ display: 'flex', transition: 'transform .4s', transform: `translateX(-${idx() * 100}%)`, height: '100%' })
    }, ...items.map(c => div({ style: { minWidth: '100%', height: '100%' } }, c))),
    div({ style: { position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' } },
      ...items.map((_, i) => span({
        style: () => ({
          width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
          background: idx() === i ? '#fff' : 'rgba(255,255,255,.5)'
        }),
        on: { click: () => idx(i) }
      }))
    ),
    button({
      style: { position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.4)', color: '#fff', border: 0, width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' },
      on: { click: () => idx((idx() - 1 + items.length) % items.length) }
    }, '‹'),
    button({
      style: { position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,.4)', color: '#fff', border: 0, width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' },
      on: { click: () => idx((idx() + 1) % items.length) }
    }, '›')
  )
}

export function Image(props) {
  const { src, alt = '', fallback, preview = true, width, height } = px(props)
  const err = signal(false)
  const showPreview = signal(false)
  return span({ style: { display: 'inline-block', position: 'relative' } },
    err() && fallback
      ? fallback
      : img( {
          src, alt, width, height,
          style: { display: 'block', maxWidth: '100%', cursor: preview ? 'zoom-in' : 'default' },
          on: {
            error: () => err(true),
            click: () => preview && showPreview(true)
          }
        }),
    show(showPreview, () => div({
      style: { position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' },
      on: { click: () => showPreview(false) }
    }, img( { src, style: { maxWidth: '90vw', maxHeight: '90vh' } })))
  )
}

export function VirtualTable(props) {
  const { columns = [], data = [], rowHeight = 40, height = 400 } = px(props)
  const scrollTop = signal(0)
  const overscan = 5
  const start = () => Math.max(0, Math.floor(scrollTop() / rowHeight) - overscan)
  const end = () => Math.min(data.length, Math.ceil((scrollTop() + height) / rowHeight) + overscan)
  const visible = () => data.slice(start(), end())
  const offset = () => start() * rowHeight
  return div({
    style: { height: height + 'px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' },
    on: { scroll: e => scrollTop(e.target.scrollTop) }
  },
    div({ style: { display: 'flex', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 1 } },
      ...columns.map(c => div({ style: { flex: 1, padding: '10px 12px', fontWeight: '600', fontSize: '13px' } }, c.title))),
    div({ style: { height: (data.length * rowHeight) + 'px', position: 'relative' } },
      div({ style: { transform: `translateY(${offset()}px)` } },
        ...visible().map(row => div({
          style: { display: 'flex', height: rowHeight + 'px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }
        }, ...columns.map(c => div({ style: { flex: 1, padding: '0 12px', fontSize: '13px' } }, c.render ? c.render(row) : String(row[c.key] || ''))))
        )
      )
    )
  )
}

export function Kanban(props) {
  const { columns = [], items = [], onMove } = px(props)
  const [drag, setDrag] = [signal(null), v => drag(v)]
  return div({ style: { display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px' } },
    ...columns.map(col => div({
      style: { minWidth: '260px', background: '#f9fafb', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
      on: {
        dragover: e => e.preventDefault(),
        drop: e => {
          e.preventDefault()
          const id = drag()
          if (id != null && onMove) onMove(id, col.key)
          setDrag(null)
        }
      }
    },
      div({ style: { fontWeight: '600', fontSize: '14px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' } },
        span(null, col.title),
        span({ style: { color: '#9ca3af', fontSize: '12px' } }, String(items.filter(i => i.status === col.key).length))
      ),
      ...items.filter(i => i.status === col.key).map(item =>
        div({
          draggable: true,
          style: { background: '#fff', padding: '10px 12px', borderRadius: '6px', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,.06)', fontSize: '13px' },
          on: {
            dragstart: () => setDrag(item.id),
            dragend: () => setDrag(null)
          }
        }, item.title)
      )
    ))
  )
}

export function Gantt(props) {
  const { tasks = [], startDate, days = 30 } = px(props)
  const start = startDate ? new Date(startDate) : new Date()
  const cellW = 40
  const dayDiff = d => Math.floor((new Date(d) - start) / 86400000)
  return div({ style: { overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' } },
    div({ style: { display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', minWidth: days * cellW + 'px' } },
      ...Array.from({ length: days }, (_, i) => div({ style: { width: cellW + 'px', padding: '8px 0', textAlign: 'center', fontSize: '11px', color: '#6b7280', borderRight: '1px solid #f3f4f6' } }, String(i + 1)))
    ),
    ...tasks.map(t => div({ style: { display: 'flex', borderBottom: '1px solid #f3f4f6', minWidth: days * cellW + 'px', position: 'relative' } },
      div({
        style: {
          position: 'absolute', top: '8px', height: '24px',
          left: (dayDiff(t.start) * cellW) + 'px',
          width: ((dayDiff(t.end) - dayDiff(t.start) + 1) * cellW - 8) + 'px',
          background: t.color || '#1f6feb', borderRadius: '4px',
          color: '#fff', fontSize: '12px', padding: '0 8px', lineHeight: '24px', whiteSpace: 'nowrap', overflow: 'hidden'
        }
      }, t.title)
    ))
  )
}

export function QRScanner(props) {
  const { onScan } = px(props)
  const video = typeof document !== 'undefined' ? document.createElement('video') : null
  effect(() => {
    if (!video || !navigator.mediaDevices) return
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => { video.srcObject = s; video.play() })
      .catch(() => {})
    onCleanup(() => { const s = video.srcObject; if (s) s.getTracks().forEach(t => t.stop()) })
  })
  return div({ style: { position: 'relative', width: '100%', maxWidth: '400px', borderRadius: '8px', overflow: 'hidden' } },
    video
      ? video( { ref: el => { el && (el.srcObject = video.srcObject); video.onplay = () => el.play() }, style: { width: '100%', display: 'block' } })
      : div({ style: { padding: '40px', textAlign: 'center', color: '#9ca3af' } }, '浏览器不支持摄像头')
  )
}
