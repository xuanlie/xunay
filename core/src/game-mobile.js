// XuNay 游戏移动端抽象
// 虚拟摇杆 / 震动 / 方向锁 / 手势拦截 / 安全区
import { signal } from './core.js'

// ============================================================
// 1. 虚拟摇杆 — DOM 实现, 输出归一化向量 signal
// ============================================================
export function createVirtualJoystick(opts = {}) {
  if (typeof document === 'undefined') {
    return { vector: signal([0, 0]), show() {}, hide() {}, dispose() {} }
  }
  const size = opts.size ?? 140
  const knobSize = opts.knobSize ?? 60
  const color = opts.color || '#66ccff'
  const maxDist = (size - knobSize) / 2 - 4
  const container = opts.container || document.body
  const vector = signal([0, 0])
  const active = signal(false)

  const root = document.createElement('div')
  root.style.cssText = `
    position:fixed; left:20px; bottom:calc(20px + env(safe-area-inset-bottom, 0px));
    width:${size}px; height:${size}px; border-radius:50%;
    background:rgba(14,14,22,.5);
    border:2px solid ${color}40;
    backdrop-filter:blur(8px);
    z-index:${opts.zIndex ?? 50};
    touch-action:none; user-select:none;
    display:none;
    pointer-events:auto;
  `
  const knob = document.createElement('div')
  knob.style.cssText = `
    position:absolute; top:50%; left:50%;
    width:${knobSize}px; height:${knobSize}px;
    margin:-${knobSize/2}px 0 0 -${knobSize/2}px;
    border-radius:50%;
    background:radial-gradient(circle at 30% 30%, ${color}e6, ${color}99);
    box-shadow:0 4px 20px ${color}66;
    pointer-events:none;
    transition:transform 0.05s;
  `
  root.appendChild(knob)
  container.appendChild(root)

  let centerX = 0, centerY = 0

  function onStart(e) {
    e.preventDefault()
    active(true)
    const r = root.getBoundingClientRect()
    centerX = r.left + r.width / 2
    centerY = r.top + r.height / 2
    onMove(e)
  }
  function onMove(e) {
    if (!active()) return
    e.preventDefault()
    const t = e.touches ? e.touches[0] : e
    let dx = t.clientX - centerX
    let dy = t.clientY - centerY
    const len = Math.hypot(dx, dy) || 1
    const k = Math.min(len, maxDist) / len
    dx *= k; dy *= k
    knob.style.transform = `translate(${dx}px, ${dy}px)`
    vector([dx / maxDist, dy / maxDist])
  }
  function onEnd(e) {
    e.preventDefault()
    active(false)
    knob.style.transform = 'translate(0,0)'
    vector([0, 0])
  }

  root.addEventListener('touchstart', onStart, { passive: false })
  root.addEventListener('touchmove', onMove, { passive: false })
  root.addEventListener('touchend', onEnd, { passive: false })
  root.addEventListener('touchcancel', onEnd, { passive: false })

  return {
    vector,
    active,
    show() { root.style.display = 'block' },
    hide() { root.style.display = 'none' },
    dispose() {
      root.removeEventListener('touchstart', onStart)
      root.removeEventListener('touchmove', onMove)
      root.removeEventListener('touchend', onEnd)
      root.removeEventListener('touchcancel', onEnd)
      root.remove()
    },
  }
}

// ============================================================
// 2. 震动反馈
// ============================================================
export function createHaptics() {
  const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator
  return {
    light() { if (supported) navigator.vibrate(10) },
    medium() { if (supported) navigator.vibrate(25) },
    heavy() { if (supported) navigator.vibrate(50) },
    custom(pattern) { if (supported) navigator.vibrate(pattern) },
    get supported() { return supported },
  }
}

// ============================================================
// 3. 屏幕方向锁定 (需全屏环境)
// ============================================================
export async function lockOrientation(mode = 'landscape') {
  if (typeof screen === 'undefined' || !screen.orientation) return false
  try {
    // 先请求全屏 (移动浏览器要求)
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen()
    }
    await screen.orientation.lock(mode)
    return true
  } catch (e) {
    return false
  }
}

export function unlockOrientation() {
  if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock() } catch {}
  }
}

// ============================================================
// 4. 手势拦截 — 禁双击缩放/长按菜单/滚动回弹
// ============================================================
export function preventGestures(target = document.body) {
  if (typeof document === 'undefined') return () => {}
  const handlers = {
    touchmove: (e) => { if (e.touches.length > 1) e.preventDefault() },
    gesturestart: (e) => e.preventDefault(),
    contextmenu: (e) => e.preventDefault(),
    dblclick: (e) => e.preventDefault(),
  }
  for (const [evt, fn] of Object.entries(handlers)) {
    target.addEventListener(evt, fn, { passive: false })
  }
  return () => {
    for (const [evt, fn] of Object.entries(handlers)) {
      target.removeEventListener(evt, fn)
    }
  }
}

// ============================================================
// 5. 安全区 — 读取 env(safe-area-inset-*)
// ============================================================
export function safeArea() {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0);left:env(safe-area-inset-left,0);'
  document.body.appendChild(el)
  const cs = getComputedStyle(el)
  const r = {
    top: parseFloat(cs.top) || 0,
    left: parseFloat(cs.left) || 0,
    bottom: 0, right: 0,
  }
  el.remove()
  return r
}

// ============================================================
// 6. 移动端预设 — 一揽子应用
// ============================================================
export function applyMobileDefaults(opts = {}) {
  if (typeof window === 'undefined') return
  // 1. 拦手势
  preventGestures()
  // 2. viewport 加固 (如果 HTML 里没设好)
  let vp = document.querySelector('meta[name=viewport]')
  if (!vp) {
    vp = document.createElement('meta')
    vp.name = 'viewport'
    document.head.appendChild(vp)
  }
  vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'
  // 3. iOS 全屏
  if (opts.iosFullscreen !== false) {
    const apple = document.createElement('meta')
    apple.name = 'apple-mobile-web-app-capable'
    apple.content = 'yes'
    document.head.appendChild(apple)
  }
}

// ============================================================
// 7. 设备信息
// ============================================================
export function deviceInfo() {
  if (typeof window === 'undefined') return {}
  const ua = navigator.userAgent
  return {
    mobile: /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    ios: /iPhone|iPad|iPod/i.test(ua),
    android: /Android/i.test(ua),
    touch: 'ontouchstart' in window,
    dpr: window.devicePixelRatio || 1,
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  }
}

export default {
  createVirtualJoystick, createHaptics,
  lockOrientation, unlockOrientation,
  preventGestures, safeArea, applyMobileDefaults, deviceInfo,
}
