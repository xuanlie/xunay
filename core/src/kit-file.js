import { px, cx } from './kit-util.js'
import { div, span, button, input, a, img } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal } from './core.js'
import { Row, Col, Card, Btn } from './kit.js'
import { Progress, Empty } from './kit-display.js'

export function Upload(props, ...children) {
  const { onFiles, accept, multiple = true, maxSize = 10 * 1024 * 1024 } = px(props)
  const files = signal([])
  const handle = list => {
    const arr = Array.from(list || [])
    const valid = arr.filter(f => f.size <= maxSize)
    files([...files(), ...valid])
    onFiles && onFiles(multiple ? valid : valid[0])
  }
  return div(null,
    children.length ? children : div({
      style: { display: 'inline-block', padding: '10px 20px', background: '#1f6feb', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
      on: { click: e => e.currentTarget.querySelector('input').click() }
    }, '选择文件', input({ type: 'file', accept, multiple, style: { display: 'none' }, on: { change: e => handle(e.target.files) } })),
    files().length ? div({ style: { marginTop: '12px' } },
      ...files().map(f => div({ style: { padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' } },
        span(null, f.name),
        span({ style: { color: '#9ca3af' } }, (f.size / 1024).toFixed(1) + ' KB')
      ))
    ) : null
  )
}

export function FileList(props) {
  const { files = [], onRemove, onPreview } = px(props)
  return div(null,
    ...files.map(f => div({
      style: { padding: '10px 14px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }
    },
      span({ style: { fontSize: '18px' } }, f.type?.startsWith('image/') ? '🖼️' : '📄'),
      Col({ gap: 0, style: { flex: 1, minWidth: 0 } },
        div({ style: { fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, f.name),
        span({ style: { fontSize: '11px', color: '#9ca3af' } }, (f.size / 1024).toFixed(1) + ' KB')
      ),
      onPreview ? Btn({ size: 'sm', onClick: () => onPreview(f) }, '预览') : null,
      onRemove ? Btn({ size: 'sm', onClick: () => onRemove(f) }, '删除') : null
    ))
  )
}

export function Dropzone(props, ...children) {
  const { onFiles, accept, multiple = true } = px(props)
  const hovering = signal(false)
  const handle = list => onFiles && onFiles(multiple ? Array.from(list) : list[0])
  return div({
    style: () => ({
      border: '2px dashed ' + (hovering() ? '#1f6feb' : '#d1d5db'),
      borderRadius: '12px', padding: '40px 20px', textAlign: 'center',
      cursor: 'pointer', transition: 'all .15s',
      background: hovering() ? '#eff6ff' : 'transparent'
    }),
    on: {
      dragover: e => { e.preventDefault(); hovering(true) },
      dragleave: () => hovering(false),
      drop: e => { e.preventDefault(); hovering(false); handle(e.dataTransfer.files) },
      click: e => e.currentTarget.querySelector('input')?.click()
    }
  },
    input({ type: 'file', accept, multiple, style: { display: 'none' }, on: { change: e => handle(e.target.files) } }),
    ...(children.length ? children : [
      div({ style: { fontSize: '40px', marginBottom: '12px' } }, '📁'),
      div({ style: { color: '#6b7280' } }, '拖拽文件到此处，或点击上传')
    ])
  )
}

export function FilePreview(props) {
  const { file, onClose } = px(props)
  if (!file) return null
  const isImage = file.type?.startsWith('image/')
  const url = file.url || (typeof URL !== 'undefined' && file instanceof Blob ? URL.createObjectURL(file) : '')
  return div({
    style: { position: 'fixed', inset: 0, zIndex: 5000, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    on: { click: e => e.target.style.position === 'fixed' && onClose && onClose() }
  },
    div({ style: { background: '#fff', borderRadius: '10px', padding: '20px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' } },
      Row({ gap: 2, align: 'center', justify: 'between', style: { marginBottom: '12px' } },
        div({ style: { fontWeight: '600' } }, file.name),
        Btn({ size: 'sm', onClick: onClose }, '关闭')
      ),
      isImage
        ? img({ src: url, style: { maxWidth: '100%', maxHeight: '70vh', display: 'block' } })
        : div({ style: { padding: '40px', textAlign: 'center', color: '#9ca3af' } }, '不支持预览此类型')
    )
  )
}
