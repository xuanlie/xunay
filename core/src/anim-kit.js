// XuNay 动画组件
import { div } from './element.js'
import { list } from './render.js'
import { show } from './misc.js'
import { presets, fadeIn } from './anim.js'

function px(p) { return p || {} }

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

export function Transition(props, ...children) {
  const { show: visible, enter = 'fadeIn', duration } = px(props)
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

export function AnimatedList(props) {
  const { items, keyFn, render, enter = 'fadeIn', stagger: staggerMs = 30 } = px(props)
  return list(items, keyFn, (item, i) => {
    return div({
      ref: el => {
        if (!el) return
        const fn = presets[enter] || fadeIn
        requestAnimationFrame(() => fn(el, { delay: i * staggerMs }))
      }
    }, render(item))
  })
}

export function AnimatedValue(props, ...children) {
  const { value, type = 'pulse' } = px(props)
  const val = typeof value === 'function' ? value : () => value
  let prev = val()
  return div({
    ref: el => {
      if (!el) return
      const check = () => {
        const v = val()
        if (v !== prev) {
          prev = v
          const fn = presets[type] || presets.pulse
          fn(el, {})
        }
        requestAnimationFrame(check)
      }
      check()
    }
  }, ...children)
}
