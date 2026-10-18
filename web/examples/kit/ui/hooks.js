// 通用浮层 hook
import { signal, effect, onCleanup } from '../../core.js'

export function usePopup(opts = {}) {
  const { closeOnOutside = true, closeOnEscape = true, onClose } = opts
  const visible = signal(false)

  const open = () => visible(true)
  const close = () => { visible(false); onClose && onClose() }
  const toggle = () => visible() ? close() : open()

  effect(() => {
    if (!visible()) return
    const handlers = []
    if (closeOnOutside) {
      const h = e => {
        // 延迟一拍，避免打开时的点击立即触发关闭
        if (e.__xPopupJustOpened) return
        close()
      }
      setTimeout(() => document.addEventListener('click', h), 0)
      handlers.push(() => document.removeEventListener('click', h))
    }
    if (closeOnEscape) {
      const h = e => { if (e.key === 'Escape') close() }
      document.addEventListener('keydown', h)
      handlers.push(() => document.removeEventListener('keydown', h))
    }
    onCleanup(() => handlers.forEach(fn => fn()))
  })

  return { visible, open, close, toggle }
}
