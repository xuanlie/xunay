// @xunay/kit/charts/gauge —— 精修版仪表盘
// 特性：弧/半圆/3/4圆 · 阈值分段 · 刻度 + 指针 · 中心数值 · 
//      多环 · 动画摆动 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'gg-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

function polar(cx, cy, r, a) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function arcPath(cx, cy, r, a0, a1, rInner) {
  const large = (a1 - a0) > Math.PI ? 1 : 0
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  if (rInner == null || rInner <= 0) {
    return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
  }
  const [x2, y2] = polar(cx, cy, rInner, a1)
  const [x3, y3] = polar(cx, cy, rInner, a0)
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${rInner} ${rInner} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`
}

function fmt(v, digits) {
  if (v == null || isNaN(v)) return ''
  if (digits != null) return Number(v).toFixed(digits)
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Number(v).toFixed(Math.abs(v) < 10 ? 1 : 0))
}

export class GaugeChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[GaugeChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 300,
      padding: 24,
      title: null,
      subtitle: null,
      theme: 'light',
      value: 0,
      min: 0,
      max: 100,
      startAngle: 135,      // 度
      sweepAngle: 270,      // 度（270 = 3/4 圆，180 = 半圆，360 = 全圆）
      innerRatio: 0.72,     // 内半径比例
      valueLabel: null,     // 中心标题
      unit: '',             // 单位后缀
      decimals: null,       // 小数位（null = 自动）
      tickCount: 10,        // 大刻度数量
      showTicks: true,
      showTickLabels: true,
      showPointer: true,
      pointerColor: null,
      colorByValue: false,  // 按值变色
      thresholds: [         // 阈值分段
        { to: 60, color: '#10b981' },
        { to: 80, color: '#f59e0b' },
        { to: 100, color: '#ef4444' },
      ],
      color: '#3b82f6',     // 单色（无 thresholds 时）
      trackColor: null,     // 底环颜色
      animation: { duration: 1000, easing: 'easeOutCubic' },
      onHover: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._value = this.opts.value
    this._cancelAnim = null
    this._resizeObs = null

    this._build()
    this.render({ animate: false })
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      track: '#1e293b', pointer: '#e2e8f0', centerText: '#f8fafc',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      track: '#e2e8f0', pointer: '#334155', centerText: '#0f172a',
    }
  }

  _build() {
    const c = this.container
    c.innerHTML = ''
    c.style.position = 'relative'
    c.style.width = '100%'
    c.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif'

    if (this.opts.title) {
      const t = document.createElement('div')
      t.style.cssText = `font-size:16px;font-weight:600;color:${this.theme.text};margin-bottom:6px`
      t.textContent = this.opts.title
      c.appendChild(t)
    }
    if (this.opts.subtitle) {
      const s = document.createElement('div')
      s.style.cssText = `font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px`
      s.textContent = this.opts.subtitle
      c.appendChild(s)
    }

    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'position:relative;width:100%'
    c.appendChild(this.wrap)

    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible;width:100%' })
    this.wrap.appendChild(this.svg)
  }

  _measure() {
    const r = this.wrap.getBoundingClientRect()
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 320))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setValue(v) {
    this._value = v
    this.render({ animate: true })
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    if (o.value != null) this._value = o.value
    this.render({ animate: false })
    return this
  }

  _colorFor(v) {
    const { min, max, thresholds, color } = this.opts
    const pct = ((v - min) / (max - min)) * 100
    if (thresholds && thresholds.length) {
      for (const t of thresholds) {
        if (pct <= t.to) return t.color
      }
      return thresholds[thresholds.length - 1].color
    }
    return color
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding

    this.svg.innerHTML = ''

    const cx = W / 2
    const cy = H / 2 + (this.opts.sweepAngle > 180 ? 4 : 20)
    const rMax = Math.max(20, Math.min(W - pad * 2, H * 2 - pad * 2) / 2)

    const startRad = (this.opts.startAngle) * Math.PI / 180
    const sweepRad = (this.opts.sweepAngle) * Math.PI / 180
    const endRad = startRad + sweepRad

    const rOuter = rMax
    const rInner = rMax * this.opts.innerRatio
    const rMid = (rOuter + rInner) / 2

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const defs = el('defs')
    this.svg.insertBefore(defs, this.svg.firstChild)

    // 底环
    const trackColor = this.opts.trackColor || this.theme.track
    this.svg.appendChild(el('path', {
      d: arcPath(cx, cy, rOuter, startRad, endRad, rInner),
      fill: trackColor,
      opacity: 0.55,
    }))

    // 阈值分段（如果有）
    if (this.opts.thresholds && this.opts.thresholds.length) {
      const { min, max } = this.opts
      let prev = min
      for (const t of this.opts.thresholds) {
        const a0 = startRad + sweepRad * ((prev - min) / (max - min))
        const a1 = startRad + sweepRad * ((t.to - min) / (max - min))
        this.svg.appendChild(el('path', {
          d: arcPath(cx, cy, rOuter, a0, a1, rInner),
          fill: t.color,
          opacity: 0.15,
        }))
        prev = t.to
      }
    }

    // 值弧
    const valueArc = el('path', {
      d: '',
      fill: this._colorFor(this._value),
    })
    this.svg.appendChild(valueArc)

    // 刻度
    if (this.opts.showTicks) {
      const tg = el('g')
      const n = this.opts.tickCount
      for (let i = 0; i <= n; i++) {
        const t = i / n
        const a = startRad + sweepRad * t
        const r1 = rInner + (rOuter - rInner) * 0.15
        const r2 = rInner + (rOuter - rInner) * 0.35
        const [x1, y1] = polar(cx, cy, r1, a)
        const [x2, y2] = polar(cx, cy, r2, a)
        const major = i % Math.max(1, Math.round(n / 5)) === 0
        tg.appendChild(el('line', {
          x1: x1.toFixed(2), y1: y1.toFixed(2),
          x2: x2.toFixed(2), y2: y2.toFixed(2),
          stroke: major ? this.theme.text : this.theme.textMuted,
          'stroke-width': major ? 2 : 1,
          'stroke-linecap': 'round',
          opacity: major ? 1 : 0.5,
        }))

        if (this.opts.showTickLabels && major) {
          const rl = rInner + (rOuter - rInner) * 0.05
          const [lx, ly] = polar(cx, cy, rl, a)
          const val = this.opts.min + (this.opts.max - this.opts.min) * t
          const txt = el('text', {
            x: lx.toFixed(2), y: ly.toFixed(2),
            'text-anchor': 'middle',
            'dominant-baseline': 'middle',
            'font-size': 10.5,
            'font-family': 'inherit',
            fill: this.theme.textMuted,
          })
          txt.textContent = fmt(val, 0)
          tg.appendChild(txt)
        }
      }
      this.svg.appendChild(tg)
    }

    // 指针
    if (this.opts.showPointer) {
      const pointerG = el('g')
      const pointerColor = this.opts.pointerColor || this.theme.pointer
      const pointer = el('path', {
        d: '',
        fill: pointerColor,
        style: 'transition:fill .2s',
      })
      pointerG.appendChild(pointer)
      const hub = el('circle', {
        cx, cy, r: rInner * 0.15,
        fill: pointerColor,
        stroke: this.theme.bg === 'transparent' ? '#fff' : this.theme.bg,
        'stroke-width': 2,
      })
      pointerG.appendChild(hub)
      this.svg.appendChild(pointerG)
      this._pointer = pointer
      this._hub = hub
    }

    // 中心数值
    const centerG = el('g')
    this._centerValue = el('text', {
      x: cx, y: cy - (this.opts.sweepAngle > 180 ? rInner * 0.05 : 0),
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': Math.max(20, rInner * 0.42),
      'font-weight': 700,
      'font-family': 'inherit',
      fill: this.theme.centerText,
      style: 'font-variant-numeric:tabular-nums',
    })
    centerG.appendChild(this._centerValue)

    if (this.opts.valueLabel) {
      const label = el('text', {
        x: cx, y: cy + rInner * 0.32,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': Math.max(11, rInner * 0.16),
        'font-family': 'inherit',
        fill: this.theme.textMuted,
      })
      label.textContent = this.opts.valueLabel
      centerG.appendChild(label)
    }

    this.svg.appendChild(centerG)

    // 动画或直接画
    const { min, max } = this.opts
    const targetPct = Math.max(0, Math.min(1, (this._value - min) / (max - min)))

    if (animate) {
      this._animateArc(valueArc, startRad, sweepRad, targetPct, rOuter, rInner, cx, cy)
    } else {
      valueArc.setAttribute('d', arcPath(
        cx, cy, rOuter,
        startRad,
        startRad + sweepRad * targetPct,
        rInner
      ))
      this._updatePointer(startRad + sweepRad * targetPct, cx, cy, rInner, rOuter)
      this._updateCenter(this._value)
    }
  }

  _updatePointer(angle, cx, cy, rInner, rOuter) {
    if (!this._pointer) return
    const rTip = rOuter * 0.94
    const rBase = rInner * 0.2
    const width = Math.max(2, rOuter * 0.02)
    const [x1, y1] = polar(cx, cy, rTip, angle)
    const [x2, y2] = polar(cx, cy, rBase, angle - Math.PI / 2)
    const [x3, y3] = polar(cx, cy, rBase, angle + Math.PI / 2)
    this._pointer.setAttribute('d',
      `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} Z`)
  }

  _updateCenter(v) {
    if (!this._centerValue) return
    const { decimals, unit } = this.opts
    const text = fmt(v, decimals) + (unit || '')
    this._centerValue.textContent = text
  }

  _animateArc(arc, startRad, sweepRad, targetPct, rOuter, rInner, cx, cy) {
    const { duration, easing } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      if (easing === 'easeOutBack') {
        const c1 = 1.70158, c3 = c1 + 1
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
      }
      return t
    }

    const { min, max } = this.opts
    const fromPct = 0
    const fromVal = min
    const toVal = min + (max - min) * targetPct

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const e = ease(t)
      const pct = fromPct + (targetPct - fromPct) * e
      const val = fromVal + (toVal - fromVal) * e
      arc.setAttribute('d', arcPath(
        cx, cy, rOuter, startRad, startRad + sweepRad * pct, rInner
      ))
      this._updatePointer(startRad + sweepRad * pct, cx, cy, rInner, rOuter)
      this._updateCenter(val)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }

  _setupResize() {
    if (typeof ResizeObserver === 'undefined') return
    let last = 0
    this._resizeObs = new ResizeObserver(() => {
      const w = this.wrap.clientWidth
      if (w > 0 && w !== last) {
        last = w
        this.render()
      }
    })
    this._resizeObs.observe(this.wrap)
    last = this.wrap.clientWidth
  }

  replay() { this.render({ animate: true }); return this }
  destroy() {
    if (this._cancelAnim) this._cancelAnim()
    if (this._resizeObs) this._resizeObs.disconnect()
    this.container.innerHTML = ''
  }
}

export default GaugeChart
