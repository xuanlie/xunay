import { px, cx } from './kit-util.js'
import {div, span, button, input, h1, h2, h3, p, label as _label, img} from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { Btn, Row, Col, Text, Card, Divider, Space, Tag, Badge } from './kit.js'

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
      show(() => url(), () => img( { src: url(), style: { maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' } })),
      show(() => !url(), () => div(null,
        div({ style: { fontSize: '32px', marginBottom: '6px' } }, '🖼️'),
        div({ style: { color: 'var(--x-text-dim)' } }, '点击选择图片')
      ))
    ),
    err() ? div({ class: 'error-msg' }, err()) : null
  )
}

// ===== 日历 =====
