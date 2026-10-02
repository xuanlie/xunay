// 列表 FLIP 过渡——applyList 增删前后调用
export function flip(container, mutate) {
  const before = new Map()
  for (const el of container.children) {
    before.set(el, el.getBoundingClientRect())
  }
  mutate()
  for (const el of container.children) {
    const a = before.get(el); if (!a) continue
    const b = el.getBoundingClientRect()
    const dx = a.left - b.left, dy = a.top - b.top
    if (!dx && !dy) continue
    el.animate(
      [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }],
      { duration: 200, easing: 'ease-out' }
    )
  }
}

export function enter(el, opts = {}) {
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: opts.duration || 150 })
}

export function leave(el, done, opts = {}) {
  const a = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: opts.duration || 150 })
  a.onfinish = done
}

// TODO: 在 render.js 的 applyList 里包一层 flip(holder, () => { ...原逻辑... })

