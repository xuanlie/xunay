import { px, cx } from './kit-util.js'
import { div, span, button } from './element.js'
import { createElement } from './element.js'
import { show } from './misc.js'
import { signal, effect, onCleanup } from './core.js'
import { isTouch } from './mobile.js'
import { lockScroll, swipe } from './mobile.js'
import { Btn } from './kit.js'

export function Tooltip(props, ...children) {
  const { text, position = 'top', trigger } = px(props)
  const visible = signal(false)
  // 移动端触摸设备自动改用点击
  const useClick = trigger === 'click' || (trigger !== 'hover' && isTouch())
  const evts = useClick
    ? { click: e => { e.stopPropagation(); visible(!visible()) } }
    : { mouseenter: () => visible(true), mouseleave: () => visible(false) }
  // 点击模式下，点外部关闭
  effect(() => {
    if (!useClick || !visible()) return
    const close = () => visible(false)
    document.addEventListener('click', close)
    onCleanup(() => document.removeEventListener('click', close))
  })
  return span({ style: { position: 'relative', display: 'inline-block' }, on: evts },
    ...children,
    show(visible, () => span({
      style: {
        position: 'absolute', zIndex: 1000, whiteSpace: 'nowrap',
        background: '#101828', color: '#fff', padding: '6px 10px',
        borderRadius: '6px', fontSize: '12px',
        left: '50%', transform: 'translateX(-50%)',
        top: position === 'bottom' ? 'calc(100% + 6px)' : 'auto',
        bottom: position === 'top' ? 'calc(100% + 6px)' : 'auto',
        pointerEvents: 'none'
      }
    }, text))
  )
}

export function Popover(props, ...children) {
  const { content, title, position = 'bottom', trigger } = px(props)
  // 默认：触摸设备用 click，鼠标设备用 hover
  const useTrigger = trigger || (isTouch() ? 'click' : 'hover')
  const visible = signal(false)
  const evts = useTrigger === 'hover'
    ? { mouseenter: () => visible(true), mouseleave: () => visible(false) }
    : { click: e => { e.stopPropagation(); visible(!visible()) } }
  return span({ style: { position: 'relative', display: 'inline-block' }, on: evts },
    ...children,
    show(visible, () => div({
      style: {
        position: 'absolute', zIndex: 1000, background: '#fff',
        border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,.1)', minWidth: '200px',
        left: '50%', transform: 'translateX(-50%)',
        top: position === 'bottom' ? 'calc(100% + 8px)' : 'auto',
        bottom: position === 'top' ? 'calc(100% + 8px)' : 'auto'
      }
    },
      title ? div({ style: { fontWeight: '600', marginBottom: '6px', fontSize: '13px' } }, title) : null,
      content
    ))
  )
}

export function Dropdown(props, ...children) {
  const { items = [], onSelect } = px(props)
  const visible = signal(false)
  effect(() => {
    if (!visible()) return
    const close = () => visible(false)
    document.addEventListener('click', close)
    onCleanup(() => document.removeEventListener('click', close))
  })
  return span({ style: { position: 'relative', display: 'inline-block' },
    on: { click: e => { e.stopPropagation(); visible(!visible()) } } },
    ...children,
    show(visible, () => div({
      style: {
        position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 1000,
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,.1)', minWidth: '140px', padding: '4px'
      }
    },
      ...items.map(it => div({
        style: { padding: '8px 12px', fontSize: '14px', cursor: 'pointer', borderRadius: '6px' },
        on: {
          click: () => { onSelect && onSelect(it); visible(false) },
          mouseenter: e => e.currentTarget.style.background = '#f3f4f6',
          mouseleave: e => e.currentTarget.style.background = 'transparent'
        }
      }, it.label || it))
    ))
  )
}

export function Drawer(props, ...children) {
  const { open, onClose, title, width = '320px', position = 'right', swipeClose = true } = px(props)
  const isOpen = typeof open === 'function' ? open : () => open
  let unlock = null
  effect(() => {
    if (isOpen()) {
      if (!unlock) unlock = lockScroll()
    } else {
      if (unlock) { unlock(); unlock = null }
    }
  })
  effect(() => {
    if (!isOpen()) return
    const esc = e => { if (e.key === 'Escape') onClose && onClose() }
    document.addEventListener('keydown', esc)
    onCleanup(() => document.removeEventListener('keydown', esc))
  })
  return show(isOpen, () => div({
    style: {
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,.4)', display: 'flex',
      justifyContent: position === 'left' ? 'flex-start' : 'flex-end'
    },
    on: { click: e => e.target.style.position === 'fixed' && onClose && onClose() }
  },
    div({
      style: {
        background: '#fff', width: position === 'top' || position === 'bottom' ? '100%' : width,
        height: position === 'top' || position === 'bottom' ? width : '100%',
        display: 'flex', flexDirection: 'column'
      },
      on: { click: e => e.stopPropagation() }
    },
      div({ style: { padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
        div({ style: { fontWeight: '600', fontSize: '15px' } }, title || ''),
        button({ style: { border: 0, background: 'transparent', cursor: 'pointer', fontSize: '20px', color: '#6b7280' },
          on: { click: onClose } }, '×')
      ),
      div({ style: { flex: 1, overflow: 'auto', padding: '20px' } }, ...children)
    )
  ))
}

export function Popconfirm(props, ...children) {
  const { title = '确定要执行吗？', onConfirm, onCancel, okText = '确定', cancelText = '取消' } = px(props)
  const visible = signal(false)
  return span({ style: { position: 'relative', display: 'inline-block' } },
    span({ on: { click: e => { e.stopPropagation(); visible(!visible()) } } }, ...children),
    show(visible, () => div({
      style: {
        position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 1000,
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px',
        padding: '12px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', minWidth: '200px'
      }
    },
      div({ style: { fontSize: '14px', marginBottom: '12px' } }, title),
      Row({ gap: 1, justify: 'end' },
        Btn({ size: 'sm', onClick: () => { visible(false); onCancel && onCancel() } }, cancelText),
        Btn({ size: 'sm', type: 'primary', onClick: () => { visible(false); onConfirm && onConfirm() } }, okText)
      )
    ))
  )
}

const msgContainer = typeof document !== 'undefined' ? (() => {
  const el = document.createElement('div')
  el.id = '__xunay-msg'
  el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999;pointer-events:none'
  document.body && document.body.appendChild(el)
  return el
})() : null

function pushMessage(text, type, duration = 2000) {
  if (!msgContainer) return
  const el = document.createElement('div')
  const colors = { info: '#1f6feb', success: '#10b981', warning: '#f59e0b', error: '#ef4444' }
  el.style.cssText = `background:#fff;padding:10px 16px;border-radius:8px;margin-bottom:8px;
    box-shadow:0 4px 12px rgba(0,0,0,.15);font-size:14px;color:${colors[type] || colors.info};
    border-left:3px solid ${colors[type] || colors.info};animation:slideIn .2s`
  el.textContent = text
  msgContainer.appendChild(el)
  setTimeout(() => el.remove(), duration)
}

export const Message = {
  info: (t, d) => pushMessage(t, 'info', d),
  success: (t, d) => pushMessage(t, 'success', d),
  warning: (t, d) => pushMessage(t, 'warning', d),
  error: (t, d) => pushMessage(t, 'error', d),
}

const notiContainer = typeof document !== 'undefined' ? (() => {
  const el = document.createElement('div')
  el.id = '__xunay-noti'
  el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;width:340px'
  document.body && document.body.appendChild(el)
  return el
})() : null

function pushNotification({ title, desc, type = 'info', duration = 4000 }) {
  if (!notiContainer) return
  const colors = { info: '#1f6feb', success: '#10b981', warning: '#f59e0b', error: '#ef4444' }
  const el = document.createElement('div')
  el.style.cssText = `background:#fff;padding:14px 16px;border-radius:8px;margin-bottom:10px;
    box-shadow:0 8px 24px rgba(0,0,0,.15);border-left:3px solid ${colors[type]};animation:slideIn .2s`
  el.innerHTML = `<div style="font-weight:600;font-size:14px;margin-bottom:4px">${title || ''}</div>
    <div style="font-size:13px;color:#6b7280">${desc || ''}</div>`
  notiContainer.appendChild(el)
  setTimeout(() => el.remove(), duration)
}

export const Notification = {
  info: o => pushNotification({ ...o, type: 'info' }),
  success: o => pushNotification({ ...o, type: 'success' }),
  warning: o => pushNotification({ ...o, type: 'warning' }),
  error: o => pushNotification({ ...o, type: 'error' }),
}

export function Tour(props) {
  const { steps = [], current, onChange, onFinish } = px(props)
  const idx = signal(0)
  const cur = () => typeof current === 'function' ? current() : (current !== undefined ? current : idx())
  const step = () => steps[cur()] || {}
  return show(() => steps.length > 0 && cur() < steps.length, () => div({
    style: {
      position: 'fixed', inset: 0, zIndex: 3000,
      background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }
  },
    div({ style: { background: '#fff', borderRadius: '10px', padding: '20px', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,.2)' } },
      div({ style: { fontWeight: '600', fontSize: '16px', marginBottom: '8px' } }, () => step().title || ''),
      div({ style: { fontSize: '14px', color: '#6b7280', marginBottom: '16px' } }, () => step().desc || ''),
      Row({ gap: 1, justify: 'between', align: 'center' },
        span({ style: { fontSize: '13px', color: '#9ca3af' } }, () => (cur() + 1) + ' / ' + steps.length),
        Row({ gap: 1 },
          Btn({ size: 'sm', onClick: () => { const n = cur() - 1; if (n < 0) return; onChange ? onChange(n) : idx(n) } }, '上一步'),
          Btn({ size: 'sm', type: 'primary', onClick: () => {
            const n = cur() + 1
            if (n >= steps.length) { onFinish && onFinish(); return }
            onChange ? onChange(n) : idx(n)
          } }, () => cur() === steps.length - 1 ? '完成' : '下一步')
        )
      )
    )
  ))
}

if (typeof document !== 'undefined' && !document.getElementById('__xunay-anim')) {
  const s = document.createElement('style')
  s.id = '__xunay-anim'
  s.textContent = '@keyframes slideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}'
  document.head.appendChild(s)
}
