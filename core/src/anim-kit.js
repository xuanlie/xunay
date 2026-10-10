// XuNay 动画组件
import { div, span } from './element.js'
import { list } from './render.js'
import { show } from './misc.js'
import { signal, effect } from './core.js'
import { presets, fadeIn } from './anim-presets.js'
import { anim } from './anim.js'

function px(p) { return p || {} }

// 进入动画
export function Entrance(props, ...children) {
  const { type = 'fadeIn', delay = 0, duration } = px(props)
  return div({
    ref: el => {
      if (!el) return
      const fn = presets[type] || fadeIn
      requestAnimationFrame(() => fn(el, { delay, duration }))
    }
  }, ...children)
}

// 条件切换
export function Transition(props, ...children) {
  const { show: visible, enter = 'fadeIn', leave = 'fadeOut', duration } = px(props)
  const isShow = typeof visible === 'function' ? visible : () => visible
  return show(isShow, () =>
    div({
      ref: el => {
        if (!el) return
        const fn = presets[enter] || fadeIn
        requestAnimationFrame(() => fn(el, { duration }))
      }
    }, ...children)
  )
}

// 列表错开进入
export function AnimatedList(props) {
  const { items, keyFn, render, enter = 'fadeInUp', stagger: staggerMs = 40 } = px(props)
  return list(items, keyFn, (item, i) => div({
    ref: el => {
      if (!el) return
      const fn = presets[enter] || presets.fadeInUp
      requestAnimationFrame(() => fn(el, { delay: i * staggerMs }))
    }
  }, render(item)))
}

// 值变化时脉冲
export function AnimatedValue(props, ...children) {
  const { value, type = 'pulse' } = px(props)
  const val = typeof value === 'function' ? value : () => value
  return div({
    ref: el => {
      if (!el) return
      let prev = val()
      // effect 会自动注册到 runtime.currentScope.effects
      // 组件卸载时 scope 会清掉它，不需要手动 onCleanup
      effect(() => {
        const v = val()
        if (v !== prev) {
          prev = v
          const fn = presets[type] || presets.pulse
          fn(el, {})
        }
      })
    }
  }, ...children)
}

// 数字滚动
export function AnimatedNumber(props) {
  const { value, duration = 600, format = n => String(Math.round(n)) } = px(props)
  const val = typeof value === 'function' ? value : () => value
  let prev = 0
  let raf
  const el = span({
    ref: node => {
      if (!node) return
      prev = val()
      node.textContent = format(prev)
      effect(() => {
        const target = val()
        if (target === prev) return
        const from = prev
        prev = target
        const start = performance.now()
        cancelAnimationFrame(raf)
        const tick = now => {
          const t = Math.min((now - start) / duration, 1)
          const v = from + (target - from) * (1 - Math.pow(1 - t, 3))
          node.textContent = format(v)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      })
    }
  })
  return el
}

// 跑马灯
export function Marquee(props, ...children) {
  const { duration = 8000, direction = 'left' } = px(props)
  return div({
    style: { overflow: 'hidden', whiteSpace: 'nowrap' },
    ref: el => {
      if (!el) return
      const inner = el.firstChild
      if (!inner) return
      const from = direction === 'left' ? 'translateX(0)' : 'translateX(-100%)'
      const to = direction === 'left' ? 'translateX(-100%)' : 'translateX(0)'
      anim(inner, [{ transform: from }, { transform: to }], { duration, iterations: Infinity })
    }
  }, div({ style: { display: 'inline-block' } }, ...children))
}

// 打字机
export function Typewriter(props) {
  const { text, speed = 50, onFinish } = px(props)
  const displayed = signal('')
  let i = 0
  const el = span({
    ref: node => {
      if (!node) return
      const tick = () => {
        if (i >= text.length) { onFinish && onFinish(); return }
        displayed(displayed() + text[i++])
        node.textContent = displayed()
        setTimeout(tick, speed)
      }
      tick()
    }
  })
  return el
}

// 滚动到视口才播
export function Reveal(props, ...children) {
  const { type = 'fadeInUp', threshold = 0.15, delay = 0 } = px(props)
  return div({
    ref: el => {
      if (!el || typeof IntersectionObserver === 'undefined') return
      el.style.opacity = '0'
      const obs = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const fn = presets[type] || presets.fadeInUp
            fn(el, { delay })
            obs.unobserve(el)
          }
        }
      }, { threshold })
      obs.observe(el)
    }
  }, ...children)
}
