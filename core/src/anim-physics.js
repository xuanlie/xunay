// XuNay 物理动画
import { anim } from './anim.js'

// 弹簧链
export function springChain(els, opts = {}) {
  const { stiffness = 200, damping = 20, mass = 1 } = opts
  return els.map((el, i) => {
    let target = 0
    const spring = { pos: 0, vel: 0 }
    let raf
    const tick = () => {
      const force = -stiffness * (spring.pos - target)
      const dampingForce = -damping * spring.vel
      spring.vel += (force + dampingForce) / mass * 0.016
      spring.pos += spring.vel * 0.016
      el.style.transform = `translateY(${spring.pos}px)`
      if (Math.abs(spring.vel) > 0.01 || Math.abs(spring.pos - target) > 0.01) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return {
      cancel: () => cancelAnimationFrame(raf),
      set: v => { target = v }
    }
  })
}

// 惯性拖拽
export function inertia(el, opts = {}) {
  const { friction = 0.95, minVelocity = 0.1, bounds = null } = opts
  let pos = { x: 0, y: 0 }
  let vel = { x: 0, y: 0 }
  let last = { x: 0, y: 0 }
  let dragging = false
  let raf

  const onDown = e => {
    dragging = true
    last.x = e.clientX; last.y = e.clientY
    vel.x = 0; vel.y = 0
    cancelAnimationFrame(raf)
    el.style.cursor = 'grabbing'
  }
  const onMove = e => {
    if (!dragging) return
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    last.x = e.clientX; last.y = e.clientY
    pos.x += dx; pos.y += dy
    vel.x = dx; vel.y = dy
    el.style.transform = `translate(${pos.x}px, ${pos.y}px)`
  }
  const onUp = () => {
    dragging = false
    el.style.cursor = 'grab'
    const tick = () => {
      vel.x *= friction; vel.y *= friction
      if (Math.abs(vel.x) < minVelocity && Math.abs(vel.y) < minVelocity) return
      pos.x += vel.x; pos.y += vel.y
      if (bounds) {
        if (pos.x < bounds.left) { pos.x = bounds.left; vel.x *= -0.3 }
        if (pos.x > bounds.right) { pos.x = bounds.right; vel.x *= -0.3 }
        if (pos.y < bounds.top) { pos.y = bounds.top; vel.y *= -0.3 }
        if (pos.y > bounds.bottom) { pos.y = bounds.bottom; vel.y *= -0.3 }
      }
      el.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      raf = requestAnimationFrame(tick)
    }
    tick()
  }
  el.style.cursor = 'grab'
  el.style.touchAction = 'none'
  el.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  return () => {
    el.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    cancelAnimationFrame(raf)
  }
}

// 粒子爆发
export function particles(container, opts = {}) {
  const { count = 20, duration = 800, color = '#58a6ff', size = 6, distance = 100 } = opts
  const origin = container.getBoundingClientRect()
  const cx = origin.width / 2
  const cy = origin.height / 2
  const parts = []
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};pointer-events:none`
    container.style.position = container.style.position || 'relative'
    container.appendChild(p)
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
    const dist = distance * (0.6 + Math.random() * 0.4)
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist
    anim(p, [
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(${dx - 50}%,${dy - 50}%) scale(0)`, opacity: 0 }
    ], { duration, fill: 'forwards', onFinish: () => p.remove() })
    parts.push(p)
  }
  return parts
}

// 拖尾
export function trail(el, opts = {}) {
  const { count = 5, interval = 50, duration = 600, color = null } = opts
  let raf
  const ghosts = []
  const spawn = () => {
    const r = el.getBoundingClientRect()
    const g = document.createElement('div')
    const bg = color || getComputedStyle(el).backgroundColor
    g.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:${bg};border-radius:${getComputedStyle(el).borderRadius};pointer-events:none;z-index:-1`
    document.body.appendChild(g)
    anim(g, [{ opacity: 0.6 }, { opacity: 0 }], { duration, fill: 'forwards', onFinish: () => g.remove() })
    ghosts.push(g)
  }
  const id = setInterval(spawn, interval)
  return () => { clearInterval(id); ghosts.forEach(g => g.remove()) }
}
