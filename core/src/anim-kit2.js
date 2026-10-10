import { div, span, img } from './element.js'
import { signal, effect } from './core.js'
import { anim } from './anim.js'
import { presets } from './anim-presets.js'
import { splitText, typewriterIn, countUp, typewriter } from './anim-text.js'

function px(p) { return p || {} }

// 涟漪点击
export function Ripple(props, ...children) {
  const { color = 'rgba(255,255,255,.5)' } = px(props)
  return div({
    style: { position: 'relative', overflow: 'hidden', display: 'inline-block' },
    on: {
      click: e => {
        const r = e.currentTarget.getBoundingClientRect()
        const span = document.createElement('span')
        const size = Math.max(r.width, r.height)
        span.style.cssText = `position:absolute;left:${e.clientX - r.left - size/2}px;top:${e.clientY - r.top - size/2}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none`
        e.currentTarget.appendChild(span)
        anim(span, [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(2)', opacity: 0 }], { duration: 600, onFinish: () => span.remove() })
      }
    }
  }, ...children)
}

// 卡片翻转
export function FlipCard(props) {
  const { front, back, width = '200px', height = '260px' } = px(props)
  const flipped = signal(false)
  return div({
    style: () => ({
      width, height, perspective: '1000px', cursor: 'pointer'
    }),
    on: { click: () => flipped(!flipped()) }
  },
    div({
      style: () => ({
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: flipped() ? 'rotateY(180deg)' : 'rotateY(0)',
        transition: 'transform .6s'
      })
    },
      div({ style: { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' } }, front),
      div({ style: { position: 'absolute', inset: 0, backfaceVisibility: 'hidden', background: '#1f6feb', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', transform: 'rotateY(180deg)' } }, back)
    )
  )
}

// 打字机组件
export function TypewriterText(props) {
  const { text = '', speed = 50, cursor = true } = px(props)
  return span({
    ref: el => {
      if (!el) return
      typewriter(el, { text, speed, cursor: cursor ? '|' : '' })
    }
  })
}

// 计数滚动
export function Counter(props) {
  const { value, duration = 1000, format } = px(props)
  const val = typeof value === 'function' ? value : () => value
  let prev = val()
  return span({
    ref: el => {
      if (!el) return
      countUp(el, { from: 0, to: prev, duration, format })
      effect(() => {
        const v = val()
        if (v !== prev) {
          countUp(el, { from: prev, to: v, duration, format })
          prev = v
        }
      })
    }
  })
}

// 逐字进入
export function SplitTextIn(props, ...children) {
  const { mode = 'char', stagger = 40, type = 'fadeInUp', duration = 400 } = px(props)
  return span({
    ref: el => {
      if (!el) return
      typewriterIn(el, { mode, stagger, type, duration })
    }
  }, ...children)
}

// 渐变文字
export function GradientText(props, ...children) {
  const { from = '#58a6ff', to = '#7ee787', duration = 4000 } = px(props)
  return span({
    style: () => ({
      backgroundImage: `linear-gradient(90deg, ${from}, ${to}, ${from})`,
      backgroundSize: '200% 100%',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      color: 'transparent',
      animation: `x-gradient-flow ${duration}ms linear infinite`
    })
  }, ...children)
}

// 发光文字
export function NeonText(props, ...children) {
  const { color = '#58a6ff' } = px(props)
  return span({
    style: () => ({
      color,
      textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 30px ${color}`
    })
  }, ...children)
}

// 描边文字
export function OutlineText(props, ...children) {
  const { color = '#58a6ff', width = '2px' } = px(props)
  return span({
    style: () => ({
      color: 'transparent',
      WebkitTextStroke: `${width} ${color}`
    })
  }, ...children)
}

// 高亮
export function Marker(props, ...children) {
  const { color = '#fef08a' } = px(props)
  return span({
    style: () => ({
      background: `linear-gradient(transparent 60%, ${color} 60%)`,
      padding: '0 2px'
    })
  }, ...children)
}

// 图片懒加载 + 淡入
export function LazyImage(props) {
  const { src, alt = '', placeholder } = px(props)
  const loaded = signal(false)
  return div({ style: { position: 'relative', overflow: 'hidden' } },
    placeholder ? div({ style: () => loaded() ? { display: 'none' } : {} }, placeholder) : null,
    img({
      src, alt,
      style: () => ({
        display: 'block', maxWidth: '100%',
        opacity: loaded() ? '1' : '0',
        transition: 'opacity .4s'
      }),
      on: { load: e => loaded(true) }
    })
  )
}

// 进度环
export function ProgressRing(props) {
  const { value = 0, size = 100, stroke = 8, color = '#1f6feb' } = px(props)
  const val = typeof value === 'function' ? value : () => value
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return div({ style: { width: size + 'px', height: size + 'px', position: 'relative' } },
    span({
      ref: el => {
        if (!el) return
        const svg = `<svg width="${size}" height="${size}">
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="${stroke}"/>
          <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
            stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}"
            transform="rotate(-90 ${size/2} ${size/2})"/>
        </svg>`
        el.innerHTML = svg
        const circle = el.querySelectorAll('circle')[1]
        effect(() => {
          const v = Math.max(0, Math.min(100, val()))
          circle.style.transition = 'stroke-dashoffset .4s'
          circle.setAttribute('stroke-dashoffset', String(c - (c * v / 100)))
        })
      }
    })
  )
}
