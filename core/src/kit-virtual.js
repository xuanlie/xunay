// XuNay 虚拟列表 / 拖拽组件（独立文件，按需加载）
import { div } from './element.js'
import { signal } from './core.js'
import { px } from './kit-util.js'

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
          touchstart: e => { dragIdx(i); overIdx(i) },
          touchmove: e => {
            const t = e.touches[0]
            const el = document.elementFromPoint(t.clientX, t.clientY)
            const idx = [...el.closest('div').parentNode.children].indexOf(el.closest('div'))
            if (idx >= 0) overIdx(idx)
          },
          touchend: () => { move(dragIdx(), overIdx()); dragIdx(-1); overIdx(-1) },
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
