import { signal } from './core.js'
// XuNay Mobile · 移动端辅助
import { effect } from './core.js'

// 滚动锁定
let lockCount = 0
export function lockScroll() {
  if (typeof document === 'undefined') return () => {}
  if (lockCount === 0) {
    const top = window.scrollY
    document.body.style.setProperty('--x-scroll-top', `-${top}px`)
    document.body.classList.add('x-scroll-lock')
  }
  lockCount++
  return () => {
    lockCount--
    if (lockCount <= 0) {
      lockCount = 0
      const top = parseInt(document.body.style.getPropertyValue('--x-scroll-top') || '0', 10)
      document.body.classList.remove('x-scroll-lock')
      document.body.style.removeProperty('--x-scroll-top')
      window.scrollTo(0, -top)
    }
  }
}

// 检测移动端
export function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches)
}

// 检测触摸
export function isTouch() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || (navigator.maxTouchPoints > 0)
}

// 响应式断点
export function breakpoint(opts = {}) {
  const { sm = 640, md = 768, lg = 1024, xl = 1280 } = opts
  const update = () => {
    const w = window.innerWidth
    const v = w < sm ? 'xs' : w < md ? 'sm' : w < lg ? 'md' : w < xl ? 'lg' : 'xl'
    if (bp() !== v) bp(v)
  }
  const bp = signal('md')
  update()
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', update)
  }
  return bp
}

// 滑动手势
export function swipe(el, handlers = {}) {
  let sx = 0, sy = 0, st = 0
  const { onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50, timeLimit = 800 } = handlers
  const down = e => {
    const t = e.touches ? e.touches[0] : e
    sx = t.clientX; sy = t.clientY; st = Date.now()
  }
  const up = e => {
    const t = e.changedTouches ? e.changedTouches[0] : e
    const dx = t.clientX - sx, dy = t.clientY - sy
    const dt = Date.now() - st
    if (dt > timeLimit) return
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) onSwipeRight && onSwipeRight(e)
      else onSwipeLeft && onSwipeLeft(e)
      onSwipe && onSwipe(dx > 0 ? 'right' : 'left', e)
    } else {
      if (dy > 0) onSwipeDown && onSwipeDown(e)
      else onSwipeUp && onSwipeUp(e)
      onSwipe && onSwipe(dy > 0 ? 'down' : 'up', e)
    }
  }
  el.addEventListener('touchstart', down, { passive: true })
  el.addEventListener('touchend', up, { passive: true })
  return () => {
    el.removeEventListener('touchstart', down)
    el.removeEventListener('touchend', up)
  }
}

// 长按
export function longpress(el, handler, ms = 500) {
  let timer = null
  const down = () => { timer = setTimeout(() => handler(), ms) }
  const up = () => { clearTimeout(timer); timer = null }
  el.addEventListener('touchstart', down, { passive: true })
  el.addEventListener('touchend', up, { passive: true })
  el.addEventListener('touchmove', up, { passive: true })
  return () => {
    el.removeEventListener('touchstart', down)
    el.removeEventListener('touchend', up)
    el.removeEventListener('touchmove', up)
  }
}
