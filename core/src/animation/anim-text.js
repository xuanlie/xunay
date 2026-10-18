// XuNay 文本动画
import { anim } from './anim.js'
import { presets } from './anim-presets.js'

// 拆分文本
export function splitText(el, mode = 'char') {
  const text = el.textContent || ''
  el.textContent = ''
  const wrap = (s, cls) => {
    const span = document.createElement('span')
    span.className = cls
    span.style.display = 'inline-block'
    span.textContent = s
    return span
  }
  if (mode === 'word') {
    text.split(/(\s+)/).forEach(w => {
      if (!w) return
      if (/^\s+$/.test(w)) el.appendChild(document.createTextNode(w))
      else el.appendChild(wrap(w, 'x-char'))
    })
  } else if (mode === 'line') {
    text.split('\n').forEach((l, i, arr) => {
      el.appendChild(wrap(l, 'x-char'))
      if (i < arr.length - 1) el.appendChild(document.createElement('br'))
    })
  } else {
    [...text].forEach(c => el.appendChild(wrap(c === ' ' ? '\u00A0' : c, 'x-char')))
  }
  return el.querySelectorAll('.x-char')
}

// 逐字淡入
export function typewriterIn(el, opts = {}) {
  const { mode = 'char', duration = 400, stagger = 40, type = 'fadeInUp', split } = opts
  const parts = split || splitText(el, mode)
  if (!parts.length) return
  const fn = presets[type] || presets.fadeInUp
  parts.forEach((p, i) => {
    p.style.opacity = '0'
    setTimeout(() => { p.style.opacity = ''; fn(p, { duration }) }, i * stagger)
  })
}

// 逐字淡出
export function typewriterOut(el, opts = {}) {
  const { mode = 'char', duration = 400, stagger = 40, type = 'fadeOut' } = opts
  const parts = splitText(el, mode)
  const fn = presets[type] || presets.fadeOut
  parts.forEach((p, i) => {
    setTimeout(() => fn(p, { duration }), i * stagger)
  })
}

// 打字机（含光标）
export function typewriter(el, opts = {}) {
  const { text = el.textContent, speed = 50, cursor = '|', onFinish } = opts
  el.textContent = ''
  const cursorEl = document.createElement('span')
  cursorEl.textContent = cursor
  cursorEl.style.cssText = 'animation:x-blink 1s steps(2) infinite'
  el.appendChild(cursorEl)
  let i = 0
  const tick = () => {
    if (i >= text.length) {
      if (cursor) cursorEl.remove()
      onFinish && onFinish()
      return
    }
    cursorEl.insertAdjacentText('beforebegin', text[i++])
    setTimeout(tick, speed)
  }
  tick()
}

// 数字滚动
export function countUp(el, opts = {}) {
  const { from = 0, to = 100, duration = 1000, format = n => Math.round(n).toLocaleString(), onFinish } = opts
  const start = performance.now()
  const tick = now => {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    el.textContent = format(from + (to - from) * eased)
    if (t < 1) requestAnimationFrame(tick)
    else onFinish && onFinish()
  }
  requestAnimationFrame(tick)
}

// 逐词高亮
export function highlightWords(el, opts = {}) {
  const { mode = 'word', duration = 400, stagger = 80, color = '#fef08a' } = opts
  const parts = splitText(el, mode)
  parts.forEach((p, i) => {
    setTimeout(() => {
      p.style.background = color
      p.style.borderRadius = '3px'
      p.style.transition = 'background .3s'
      setTimeout(() => { p.style.background = '' }, duration)
    }, i * stagger)
  })
}

// 光标闪烁 CSS
if (typeof document !== 'undefined' && !document.getElementById('__x-blink')) {
  const s = document.createElement('style')
  s.id = '__x-blink'
  s.textContent = '@keyframes x-blink{0%,50%{opacity:1}51%,100%{opacity:0}}'
  document.head.appendChild(s)
}
