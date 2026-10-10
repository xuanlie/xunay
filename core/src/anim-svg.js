// XuNay SVG 动画
import { anim } from './anim.js'

// SVG 描边绘制
export function drawPath(el, opts = {}) {
  const { duration = 1500, delay = 0, reverse = false, onFinish } = opts
  const length = el.getTotalLength ? el.getTotalLength() : 1000
  el.style.strokeDasharray = String(length)
  el.style.strokeDashoffset = reverse ? String(-length) : String(length)
  const from = reverse ? -length : length
  const to = 0
  return anim(el, [
    { strokeDashoffset: from },
    { strokeDashoffset: to }
  ], { duration, delay, fill: 'forwards', onFinish })
}

// SVG 路径跟随
export function followPath(el, path, opts = {}) {
  const { duration = 2000, rotate = true, delay = 0, onFinish } = opts
  if (!path.getTotalLength) return
  const length = path.getTotalLength()
  const start = performance.now()
  let raf
  const tick = now => {
    const t = Math.min((now - start) / duration, 1)
    const p = path.getPointAtLength(length * t)
    let transform = `translate(${p.x}px, ${p.y}px)`
    if (rotate) {
      const p1 = path.getPointAtLength(length * Math.min(t + 0.001, 1))
      const angle = Math.atan2(p1.y - p.y, p1.x - p.x) * 180 / Math.PI
      transform += ` rotate(${angle}deg)`
    }
    el.style.transform = transform
    if (t < 1) raf = requestAnimationFrame(tick)
    else onFinish && onFinish()
  }
  raf = requestAnimationFrame(tick)
  return { cancel: () => cancelAnimationFrame(raf) }
}

// 形状变形（同数量点）
export function morph(el, fromPath, toPath, opts = {}) {
  const { duration = 800, onFinish } = opts
  return anim(el, [
    { d: `path("${fromPath}")` },
    { d: `path("${toPath}")` }
  ], { duration, fill: 'forwards', onFinish })
}

// 遮罩揭示
export function maskReveal(el, opts = {}) {
  const { direction = 'left', duration = 800, delay = 0 } = opts
  const from = { left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)', top: 'inset(0 0 100% 0)', bottom: 'inset(100% 0 0 0)' }[direction]
  return anim(el, [
    { clipPath: from },
    { clipPath: 'inset(0 0 0 0)' }
  ], { duration, delay, fill: 'forwards' })
}

// 遮罩隐藏
export function maskHide(el, opts = {}) {
  const { direction = 'right', duration = 800, delay = 0 } = opts
  const to = { left: 'inset(0 100% 0 0)', right: 'inset(0 0 0 100%)', top: 'inset(0 0 100% 0)', bottom: 'inset(100% 0 0 0)' }[direction]
  return anim(el, [
    { clipPath: 'inset(0 0 0 0)' },
    { clipPath: to }
  ], { duration, delay, fill: 'forwards' })
}

// 渐变流动
export function gradientFlow(el, opts = {}) {
  const { duration = 3000 } = opts
  if (el.style) {
    el.style.backgroundSize = '200% 200%'
    el.style.backgroundImage = el.style.backgroundImage || 'linear-gradient(90deg,#58a6ff,#7ee787,#58a6ff)'
    el.style.backgroundClip = 'text'
    el.style.webkitBackgroundClip = 'text'
    el.style.color = 'transparent'
  }
  return anim(el, [
    { backgroundPosition: '0% 50%' },
    { backgroundPosition: '100% 50%' },
    { backgroundPosition: '0% 50%' }
  ], { duration, iterations: Infinity })
}

// FLIP 布局动画
export function flip(container, mutate, opts = {}) {
  const { duration = 300, easing = 'cubic-bezier(.4,0,.2,1)' } = opts
  const before = new Map()
  for (const el of container.children) {
    before.set(el, el.getBoundingClientRect())
  }
  mutate()
  for (const el of container.children) {
    const a = before.get(el)
    if (!a) continue
    const b = el.getBoundingClientRect()
    const dx = a.left - b.left, dy = a.top - b.top
    if (!dx && !dy) continue
    el.animate(
      [{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }],
      { duration, easing }
    )
  }
}

// 共享元素过渡辅助
export function sharedElement(fromEl, toEl, opts = {}) {
  const { duration = 400 } = opts
  const a = fromEl.getBoundingClientRect()
  const b = toEl.getBoundingClientRect()
  const dx = a.left - b.left, dy = a.top - b.top
  const sx = a.width / b.width, sy = a.height / b.height
  return anim(toEl, [
    { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, transformOrigin: 'top left' },
    { transform: 'none', transformOrigin: 'top left' }
  ], { duration })
}


// 视差 SVG 滚动
export function parallaxSVG(el, opts = {}) {
  const { speed = 0.3 } = opts
  const update = () => {
    const r = el.getBoundingClientRect()
    const y = (window.innerHeight / 2 - (r.top + r.height / 2)) * speed
    el.style.transform = `translateY(${y}px)`
  }
  window.addEventListener('scroll', update, { passive: true })
  update()
  return () => window.removeEventListener('scroll', update)
}

// 圆形进度环
export function ringProgress(el, opts = {}) {
  const { value = 0, duration = 800, size = 100, stroke = 8, color = '#1f6feb' } = opts
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  el.setAttribute('viewBox', `0 0 ${size} ${size}`)
  el.innerHTML = `
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${stroke}"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"
      transform="rotate(-90 ${size/2} ${size/2})"/>
  `
  const circle = el.querySelectorAll('circle')[1]
  return anim(circle, [
    { strokeDashoffset: c },
    { strokeDashoffset: c - (c * Math.max(0, Math.min(100, value)) / 100) }
  ], { duration, fill: 'forwards' })
}

// SVG 图形变形（简单实现）
export function svgMorph(el, toPath, opts = {}) {
  const { duration = 800 } = opts
  return anim(el, [
    { d: el.getAttribute('d') ? `path("${el.getAttribute('d')}")` : 'none' },
    { d: `path("${toPath}")` }
  ], { duration, fill: 'forwards' })
}

// 3D 卡片透视跟随鼠标
export function tiltCard(el, opts = {}) {
  const { max = 15, scale = 1.02 } = opts
  const move = e => {
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale(${scale})`
  }
  const leave = () => {
    el.style.transition = 'transform .3s'
    el.style.transform = 'none'
    setTimeout(() => el.style.transition = '', 300)
  }
  el.style.transformStyle = 'preserve-3d'
  el.addEventListener('mousemove', move)
  el.addEventListener('mouseleave', leave)
  return () => {
    el.removeEventListener('mousemove', move)
    el.removeEventListener('mouseleave', leave)
  }
}
