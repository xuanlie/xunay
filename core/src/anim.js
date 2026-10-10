// XuNay 动画核心
export function anim(el, keyframes, options = {}) {
  const { onFinish, onCancel, onStart, ...rest } = options
  if (onStart) onStart()
  const a = el.animate(keyframes, {
    duration: 300,
    easing: 'cubic-bezier(.4,0,.2,1)',
    fill: 'both',
    ...rest
  })
  if (onFinish) a.addEventListener('finish', onFinish)
  if (onCancel) a.addEventListener('cancel', onCancel)
  return a
}

// 时间线：链式动画
export function timeline() {
  const steps = []
  const api = {
    add(fn, delay = 300) { steps.push({ fn, delay }); return api },
    wait(ms) { steps.push({ fn: null, delay: ms }); return api },
    play(onDone) {
      let t = 0
      const ids = []
      for (const s of steps) {
        if (s.fn) ids.push(setTimeout(s.fn, t))
        t += s.delay
      }
      if (onDone) ids.push(setTimeout(onDone, t))
      return { cancel: () => ids.forEach(clearTimeout) }
    }
  }
  return api
}

// 弹簧物理动画
export function spring(el, opts = {}) {
  const { from = 0, to = 1, stiffness = 100, damping = 10, mass = 1, onUpdate, onFinish, apply } = opts
  const start = performance.now()
  const duration = opts.duration || 800
  let raf
  const w0 = Math.sqrt(stiffness / mass)
  const zeta = damping / (2 * Math.sqrt(stiffness * mass))
  const tick = now => {
    const t = Math.min((now - start) / duration, 1)
    let v
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta)
      v = to - (to - from) * Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t))
    } else {
      v = to - (to - from) * Math.exp(-w0 * t) * (1 + w0 * t)
    }
    if (apply) apply(el, v)
    if (onUpdate) onUpdate(v, t)
    if (t < 1) raf = requestAnimationFrame(tick)
    else if (onFinish) onFinish()
  }
  raf = requestAnimationFrame(tick)
  return { cancel: () => cancelAnimationFrame(raf) }
}

// 顺序播放
export function sequence(items) {
  let i = 0
  const next = () => {
    if (i >= items.length) return
    const it = items[i++]
    if (typeof it === 'function') {
      const r = it()
      if (r && r.finished) r.finished.then(next)
      else next()
    } else {
      setTimeout(next, it || 0)
    }
  }
  next()
}

// 并行动画
export function parallel(fns) {
  return Promise.all(fns.map(fn => {
    const r = fn()
    return r && r.finished ? r.finished : r
  }))
}

// 错开
export function stagger(els, fn, delay = 50) {
  els.forEach((el, i) => fn(el, { delay: i * delay }))
}

// 等待
export function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// 取消所有动画
export function cancelAll(el) {
  if (el && el.getAnimations) el.getAnimations().forEach(a => a.cancel())
  else if (el && el.animate) el.getAnimations && el.getAnimations().forEach(a => a.cancel())
}

// 缓动函数全集
const _bounceOut = t => {
  const n1 = 7.5625, d1 = 2.75
  if (t < 1 / d1) return n1 * t * t
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + .75
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + .9375
  return n1 * (t -= 2.625 / d1) * t + .984375
}

export const easings = {
  linear: t => t,
  ease: 'cubic-bezier(.25,.1,.25,1)',
  easeIn: 'cubic-bezier(.42,0,1,1)',
  easeOut: 'cubic-bezier(0,0,.58,1)',
  easeInOut: 'cubic-bezier(.42,0,.58,1)',
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInQuad: t => t * t,
  easeOutQuad: t => 1 - (1 - t) * (1 - t),
  easeInOutQuad: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeInQuint: t => t * t * t * t * t,
  easeOutQuint: t => 1 - Math.pow(1 - t, 5),
  easeInOutQuint: t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  easeInCirc: t => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: t => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: t => t < .5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,
  easeInBack: t => 2.70158 * t * t * t - 1.70158 * t * t,
  easeOutBack: t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  easeInOutBack: t => t < .5 ? (Math.pow(2 * t, 2) * ((2.5949095 + 1) * 2 * t - 2.5949095)) / 2 : (Math.pow(2 * t - 2, 2) * ((2.5949095 + 1) * (t * 2 - 2) + 2.5949095) + 2) / 2,
  easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3)),
  easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * ((2 * Math.PI) / 3)) + 1,
  easeInBounce: t => 1 - _bounceOut(1 - t),
  easeOutBounce: _bounceOut,
  easeInOutBounce: t => t < .5 ? (1 - _bounceOut(1 - 2 * t)) / 2 : (1 + _bounceOut(2 * t - 1)) / 2,
  easeInQuadAlt: t => t * (2 - t),
  easeOutQuadAlt: t => t * (2 - t),
  easeInOutQuadAlt: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubicAlt: t => t * t * t,
  easeOutCubicAlt: t => --t * t * t + 1,
  easeInOutCubicAlt: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
}

export const ease = easings

// enter / leave 过渡助手
export function trans(duration = 200) {
  return {
    enter(el) {
      el.style.transition = `opacity ${duration}ms ease`
      el.style.opacity = '0'
      requestAnimationFrame(() => { el.style.opacity = '1' })
    },
    leave(el, done) {
      el.style.transition = `opacity ${duration}ms ease`
      el.style.opacity = '0'
      setTimeout(() => done && done(), duration)
    }
  }
}
