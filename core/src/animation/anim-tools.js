// XuNay 动画工具
import { anim } from './anim.js'

// 动画队列（串行）
export function queue() {
  const items = []
  let running = false
  let cancelFlag = false
  const run = async () => {
    if (running) return
    running = true
    while (items.length && !cancelFlag) {
      const { fn, resolve, reject } = items.shift()
      try {
        const r = fn()
        if (r && r.finished) await r.finished
        else if (r && r.then) await r
        resolve && resolve(r)
      } catch (e) { reject && reject(e) }
    }
    running = false
    cancelFlag = false
  }
  return {
    push(fn) {
      return new Promise((resolve, reject) => {
        items.push({ fn, resolve, reject })
        run()
      })
    },
    clear() { items.length = 0 },
    cancel() { cancelFlag = true; items.length = 0 },
    get size() { return items.length },
    get running() { return running },
  }
}

// 打断管理（新动画取消旧的）
export function interruptable(el) {
  let current = null
  return {
    play(keyframes, options) {
      if (current) { try { current.cancel() } catch (e) {} }
      current = anim(el, keyframes, options)
      current.finished.then(() => { current = null }).catch(() => {})
      return current
    },
    cancel() { if (current) { current.cancel(); current = null } },
    get active() { return !!current },
  }
}

// 关键帧缓存
const _kfCache = new WeakMap()
export function cachedAnim(el, keyframesFactory, options) {
  let kf = _kfCache.get(el)
  if (!kf) {
    kf = keyframesFactory()
    _kfCache.set(el, kf)
  }
  return anim(el, kf, options)
}

// reduced-motion 支持
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// 兼容 reduced-motion 的动画
export function safeAnim(el, keyframes, options = {}) {
  if (prefersReducedMotion()) {
    // 只做即时可见性变化，不做过渡
    const last = keyframes[keyframes.length - 1]
    if (last && el.style) {
      for (const k in last) {
        if (k === 'opacity') el.style.opacity = last[k]
        else if (k === 'transform') el.style.transform = last[k]
      }
    }
    const opts = { ...options, duration: 0 }
    return anim(el, keyframes, opts)
  }
  return anim(el, keyframes, options)
}

// will-change 管理（离开动画时移除）
export function withWillChange(el, props) {
  const val = Array.isArray(props) ? props.join(', ') : props
  el.style.willChange = val
  return () => { el.style.willChange = '' }
}

// 动画组合
export function compose(...fns) {
  return (el, opts = {}) => {
    const results = []
    for (const fn of fns) {
      const r = fn(el, opts)
      if (r) results.push(r)
    }
    return results
  }
}

// 播放一次，忽略后续调用
export function once(fn) {
  let done = false
  return (...args) => {
    if (done) return
    done = true
    return fn(...args)
  }
}

// 延时后播放
export function delayed(fn, ms) {
  return (el, opts = {}) => new Promise(resolve => {
    setTimeout(() => {
      const r = fn(el, opts)
      if (r && r.finished) r.finished.then(resolve)
      else resolve(r)
    }, ms)
  })
}

// 重试
export function retry(fn, times = 3) {
  return (el, opts = {}) => {
    let i = 0
    const run = () => {
      try { return fn(el, opts) }
      catch (e) {
        if (++i >= times) throw e
        return run()
      }
    }
    return run()
  }
}

// 滚动进度映射
export function scrollProgress(el, opts = {}) {
  const { onUpdate, start = 0, end = 1, throttle = true } = opts
  let raf = 0
  const update = () => {
    raf = 0
    const r = el.getBoundingClientRect()
    const winH = window.innerHeight
    const total = r.height + winH
    const passed = winH - r.top
    const progress = Math.max(0, Math.min(1, passed / total))
    if (progress >= start && progress <= end) {
      onUpdate && onUpdate(progress, el)
    }
  }
  const onScroll = throttle
    ? () => { if (!raf) raf = requestAnimationFrame(update) }
    : update
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
  return () => {
    window.removeEventListener('scroll', onScroll)
    if (raf) cancelAnimationFrame(raf)
  }
}

// 视差
export function parallax(el, opts = {}) {
  const { speed = 0.5, axis = 'y', throttle = true } = opts
  let raf = 0
  const update = () => {
    raf = 0
    const r = el.getBoundingClientRect()
    const offset = (window.innerHeight / 2 - (r.top + r.height / 2)) * speed
    el.style.transform = axis === 'y' ? `translateY(${offset}px)` : `translateX(${offset}px)`
  }
  const onScroll = throttle
    ? () => { if (!raf) raf = requestAnimationFrame(update) }
    : update
  window.addEventListener('scroll', onScroll, { passive: true })
  update()
  return () => {
    window.removeEventListener('scroll', onScroll)
    if (raf) cancelAnimationFrame(raf)
  }
}

// 鼠标跟随
export function followMouse(el, opts = {}) {
  const { strength = 0.1, range = 200 } = opts
  let mx = 0, my = 0
  let cx = 0, cy = 0
  let raf
  const onMove = e => {
    mx = (e.clientX - window.innerWidth / 2) * strength
    my = (e.clientY - window.innerHeight / 2) * strength
  }
  const tick = () => {
    cx += (mx - cx) * 0.1
    cy += (my - cy) * 0.1
    el.style.transform = `translate(${Math.max(-range, Math.min(range, cx))}px, ${Math.max(-range, Math.min(range, cy))}px)`
    raf = requestAnimationFrame(tick)
  }
  window.addEventListener('mousemove', onMove)
  tick()
  return () => {
    window.removeEventListener('mousemove', onMove)
    cancelAnimationFrame(raf)
  }
}
