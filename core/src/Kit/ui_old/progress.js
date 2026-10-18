// @xunay/kit/ui/progress —— 精密进度条
// 特色：线/环/多段 3 种 · 渐变色 · 条纹流动 · 光晕 · 圆头 · 数值动画
import { div, span } from '../../element.js'
import { px } from '../../kit-util.js'
import { signal, effect } from '../../core.js'

function cx(...xs) { return xs.filter(Boolean).join(' ') }

export function Progress(props) {
  const {
    value = 0, max = 100,
    variant = 'line',      // line | circle | segments
    size = 'md',           // sm | md | lg | number
    tone = 'primary',      // primary | success | warning | danger | gradient
    showText, textInside, textFormat,
    striped, animated,
    segments,              // variant='segments' 时 [{value,color,label}]
    strokeWidth,
    class: cls, style, ...rest
  } = px(props)

  const SIZES = { sm: 4, md: 8, lg: 12 }
  const sw = typeof size === 'number' ? size : (variant === 'circle' ? 8 : (SIZES[size] || SIZES.md))

  const getValue = () => typeof value === 'function' ? value() : value
  const pct = () => Math.max(0, Math.min(100, (Number(getValue()) / Number(max)) * 100))
  const fmt = () => textFormat ? textFormat(getValue(), max) : `${Math.round(pct())}%`

  const toneColor = () => ({
    primary: 'var(--x-primary,#3b82f6)',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradient: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
  }[tone] || 'var(--x-primary,#3b82f6)')

  // 环
  if (variant === 'circle') {
    const sz = typeof size === 'number' ? size : ({ sm: 40, md: 64, lg: 96 }[size] || 64)
    const r = (sz - sw) / 2
    const c = 2 * Math.PI * r
    const off = c * (1 - pct() / 100)
    const gid = 'x-prog-' + Math.random().toString(36).slice(2, 8)
    return div({
      class: cx('x-progress-circle', cls),
      style: `position:relative;display:inline-flex;align-items:center;justify-content:center;width:${sz}px;height:${sz}px;${style || ''}`,
      ...rest,
    },
      span({ ref: (el) => {
        if (!el || el.__svg) return
        el.__svg = true
        el.innerHTML = ''
        const NS = 'http://www.w3.org/2000/svg'
        const svg = document.createElementNS(NS, 'svg')
        svg.setAttribute('viewBox', `0 0 ${sz} ${sz}`)
        svg.setAttribute('width', sz); svg.setAttribute('height', sz)
        svg.style.cssText = 'transform:rotate(-90deg)'
        const bg = document.createElementNS(NS, 'circle')
        bg.setAttribute('cx', sz/2); bg.setAttribute('cy', sz/2); bg.setAttribute('r', r)
        bg.setAttribute('fill', 'none'); bg.setAttribute('stroke', 'var(--x-border,#e2e8f0)')
        bg.setAttribute('stroke-width', sw)
        const defs = document.createElementNS(NS, 'defs')
        const grad = document.createElementNS(NS, 'linearGradient')
        grad.setAttribute('id', gid); grad.setAttribute('x1','0'); grad.setAttribute('y1','0')
        grad.setAttribute('x2','1'); grad.setAttribute('y2','1')
        for (const [off_, c_] of [['0%','#3b82f6'],['100%','#8b5cf6']]) {
          const stop = document.createElementNS(NS, 'stop')
          stop.setAttribute('offset', off_); stop.setAttribute('stop-color', c_)
          grad.appendChild(stop)
        }
        defs.appendChild(grad)
        const fg = document.createElementNS(NS, 'circle')
        fg.setAttribute('cx', sz/2); fg.setAttribute('cy', sz/2); fg.setAttribute('r', r)
        fg.setAttribute('fill', 'none')
        fg.setAttribute('stroke', tone === 'gradient' ? `url(#${gid})` : toneColor())
        fg.setAttribute('stroke-width', sw)
        fg.setAttribute('stroke-linecap', 'round')
        fg.setAttribute('stroke-dasharray', String(c))
        fg.setAttribute('stroke-dashoffset', String(off))
        fg.style.transition = 'stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)'
        svg.appendChild(defs); svg.appendChild(bg); svg.appendChild(fg)
        el.appendChild(svg)
        // 监听 pct 变化
        const tick = () => {
          const p = pct()
          const o = c * (1 - p/100)
          fg.setAttribute('stroke-dashoffset', String(o))
          requestAnimationFrame(tick)
        }
        tick()
      } }),
      (showText !== false) ? div({
        style: `position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${Math.round(sz*0.22)}px;font-weight:600;color:var(--x-text,#0f172a);font-variant-numeric:tabular-nums`,
      }, fmt()) : null,
    )
  }

  // 多段
  if (variant === 'segments') {
    const list = segments || []
    const total = list.reduce((a, b) => a + (b.value || 0), 0) || 1
    return div({
      class: cx('x-progress-segments', cls),
      style: `display:flex;gap:2px;width:100%;height:${sw}px;border-radius:${sw/2}px;overflow:hidden;background:var(--x-border,#e2e8f0);${style || ''}`,
      ...rest,
    },
      ...list.map(s => span({
        style: `flex:${(s.value / total) * 100};background:${s.color || 'var(--x-primary,#3b82f6)'};transition:flex .4s cubic-bezier(.4,0,.2,1);position:relative`,
        title: s.label || '',
      }))
    )
  }

  // 线
  const stripe = striped ? `background-image:linear-gradient(45deg,rgba(255,255,255,.25) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.25) 50%,rgba(255,255,255,.25) 75%,transparent 75%,transparent);background-size:${sw*2}px ${sw*2}px` : ''
  return div({
    class: cx('x-progress-line', cls),
    style: `display:flex;flex-direction:column;gap:6px;width:100%;${style || ''}`,
    ...rest,
  },
    div({
      style: `display:flex;align-items:center;gap:10px;width:100%`,
    },
      div({
        class: 'x-progress-track',
        style: `flex:1;height:${sw}px;border-radius:${sw/2}px;background:var(--x-border,#e2e8f0);overflow:hidden;position:relative`,
      },
        div({
          class: 'x-progress-fill',
          style: () => [
            `height:100%`,
            `width:${pct()}%`,
            `background:${tone === 'gradient' ? toneColor() : toneColor()}`,
            `background-size:${tone === 'gradient' ? '200% 100%' : 'auto'}`,
            `border-radius:${sw/2}px`,
            `transition:width .6s cubic-bezier(.4,0,.2,1)`,
            `position:relative`,
            `box-shadow:0 0 ${sw}px ${tone === 'gradient' ? 'rgba(139,92,246,.4)' : 'transparent'}`,
            stripe,
            striped && animated ? 'animation:x-progress-stripe 1s linear infinite' : '',
          ].filter(Boolean).join(';'),
        }),
      ),
      (showText !== false) ? span({
        style: `font-size:${Math.max(11, sw+4)}px;font-weight:600;color:var(--x-text,#0f172a);font-variant-numeric:tabular-nums;min-width:44px;text-align:right`,
      }, fmt()) : null,
    )
  )
}
