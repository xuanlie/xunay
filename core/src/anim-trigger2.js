export { onScroll, inView, onHover, onInterval, onVisible, once } from './anim-trigger.js'

// 节流触发
export function throttle(fn, ms) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last < ms) return
    last = now
    return fn(...args)
  }
}

// 防抖触发
export function debounce(fn, ms) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

// 鼠标位置
export function onMouseMove(fn, opts = {}) {
  const { throttle: ms = 16 } = opts
  const handler = throttle(e => fn(e.clientX, e.clientY, e), ms)
  window.addEventListener('mousemove', handler)
  return () => window.removeEventListener('mousemove', handler)
}

// 键盘
export function onKey(key, fn) {
  const handler = e => {
    if (e.key === key) fn(e)
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}

// 元素大小变化
export function onResize(el, fn) {
  if (typeof ResizeObserver === 'undefined') return () => {}
  const obs = new ResizeObserver(entries => {
    for (const e of entries) fn(e.contentRect, e)
  })
  obs.observe(el)
  return () => obs.disconnect()
}

// 动画结束
export function onAnimationEnd(el, fn) {
  const handler = e => { if (e.target === el) fn(e) }
  el.addEventListener('animationend', handler)
  el.addEventListener('transitionend', handler)
  return () => {
    el.removeEventListener('animationend', handler)
    el.removeEventListener('transitionend', handler)
  }
}

// 触摸滑动方向
export function onSwipe(el, dirs) {
  let sx = 0, sy = 0
  const down = e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY }
  const up = e => {
    const t = e.changedTouches[0]
    const dx = t.clientX - sx, dy = t.clientY - sy
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 50 && dirs.right) dirs.right(e)
      else if (dx < -50 && dirs.left) dirs.left(e)
    } else {
      if (dy > 50 && dirs.down) dirs.down(e)
      else if (dy < -50 && dirs.up) dirs.up(e)
    }
  }
  el.addEventListener('touchstart', down, { passive: true })
  el.addEventListener('touchend', up, { passive: true })
  return () => {
    el.removeEventListener('touchstart', down)
    el.removeEventListener('touchend', up)
  }
}

// 拖拽
export function onDrag(el, opts = {}) {
  const { onStart, onMove, onEnd } = opts
  const down = e => { onStart && onStart(e); el.setPointerCapture?.(e.pointerId) }
  const move = e => { if (e.buttons) onMove && onMove(e) }
  const up = e => { onEnd && onEnd(e) }
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
  }
}

// 观察元素出现一次
export function observeOnce(el, fn) {
  if (typeof IntersectionObserver === 'undefined') return () => {}
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) { fn(e.target); obs.unobserve(e.target) }
    }
  })
  obs.observe(el)
  return () => obs.disconnect()
}
