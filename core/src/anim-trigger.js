// XuNay 动画触发工具
import { anim } from './anim.js'

// 进入视口时播放（IntersectionObserver）
export function inView(target, fn, opts = {}) {
  const { threshold = 0.15, once = true, rootMargin = '0px' } = opts
  if (typeof IntersectionObserver === 'undefined') {
    if (typeof fn === 'function') fn(target)
    return () => {}
  }
  let done = false
  const obs = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (e.isIntersecting) {
        if (done && once) continue
        done = true
        if (typeof fn === 'function') fn(e.target, e)
        if (once) obs.unobserve(e.target)
      } else if (!once) {
        done = false
      }
    }
  }, { threshold, rootMargin })
  if (typeof target === 'string') {
    document.querySelectorAll(target).forEach(el => obs.observe(el))
  } else if (target.forEach) {
    target.forEach(el => obs.observe(el))
  } else {
    obs.observe(target)
  }
  return () => obs.disconnect()
}

// 滚动触发
export function onScroll(fn, opts = {}) {
  const { throttle = 16, useRaf = true } = opts
  let last = 0
  let raf = 0
  const handler = () => {
    if (useRaf) {
      // 用 rAF 节流：每帧最多一次
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        fn(window.scrollY, window)
      })
    } else {
      const now = performance.now()
      if (now - last < throttle) return
      last = now
      fn(window.scrollY, window)
    }
  }
  window.addEventListener('scroll', handler, { passive: true })
  handler()
  return () => {
    window.removeEventListener('scroll', handler)
    if (raf) cancelAnimationFrame(raf)
  }
}

// 悬停触发
export function onHover(el, enterFn, leaveFn) {
  const onEnter = () => enterFn && enterFn(el)
  const onLeave = () => leaveFn && leaveFn(el)
  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)
  return () => {
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
  }
}

// 定时循环
export function onInterval(fn, ms) {
  const id = setInterval(fn, ms)
  return () => clearInterval(id)
}

// 元素可见性变化
export function onVisible(el, onShow, onHide) {
  if (typeof document === 'undefined' || !document.hidden !== undefined) return () => {}
  const handler = () => {
    if (document.hidden) onHide && onHide()
    else onShow && onShow()
  }
  document.addEventListener('visibilitychange', handler)
  return () => document.removeEventListener('visibilitychange', handler)
}

// 播放一次
export function once(el, fn) {
  let done = false
  return (...args) => {
    if (done) return
    done = true
    return fn(...args)
  }
}
