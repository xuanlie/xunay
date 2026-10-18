// @xunay/kit/charts/bullet —— 子弹图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'bt-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmt(v, d) {
  if (v == null || isNaN(v)) return ''
  if (d != null) return Number(v).toFixed(d)
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Math.round(v))
}

export class BulletChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Bullet] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null,
      height: null,           // 自动按行数
      rowHeight: 62,
      padding: { top: 30, right: 90, bottom: 26, left: 120 },
      title: null, subtitle: null, theme: 'light',
      direction: 'horizontal', // 'horizontal' | 'vertical'
      max: null,              // 全局最大值，或每行 own max
      ranges: null,           // 全局定性区间 [0.4, 0.7, 1]，相对 max 的比例
      rangeColors: ['#e5e7eb', '#d1d5db', '#9ca3af'],  // 由浅到深
      barColor: '#3b82f6',
      barHeight: 0.42,        // 相对 rowHeight
      targetColor: '#1f2937',
      targetWidth: 3,
      showTarget: true,
      showValue: true,
      showLabels: true,
      labelWidth: 110,
      valueFormat: fmt,
      valueDecimals: null,
      grid: true,
      gridDash: '3 4',
      tooltip: true,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 50 },
      onHover: null,
      onBarClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._barEls = []
    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      axis: '#334155',
      rangeColors: ['#1e293b', '#334155', '#475569'],
      targetColor: '#f8fafc',
      rowAlt: 'rgba(148,163,184,0.04)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      axis: '#cbd5e1',
      rangeColors: ['#e5e7eb', '#d1d5db', '#9ca3af'],
      targetColor: '#1f2937',
      rowAlt: 'rgba(15,23,42,0.02)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
    }
  }
  _build() {
    const c = this.container
    c.innerHTML = ''
    c.style.cssText = 'position:relative;width:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC",sans-serif'
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
    if (this.opts.tooltip) {
      this.tip = document.createElement('div')
      this.tip.style.cssText = `
        position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;
        background:${this.theme.tipBg};color:${this.theme.tipColor};
        border:1px solid ${this.theme.tipBorder};padding:8px 12px;border-radius:8px;
        font-size:12.5px;line-height:1.55;box-shadow:0 8px 24px rgba(0,0,0,.18);
        backdrop-filter:blur(6px);white-space:nowrap;z-index:10;font-variant-numeric:tabular-nums;`
      this.wrap.appendChild(this.tip)
    }
  }
  _measure() {
    const r = this.wrap.getBoundingClientRect()
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 640))
    const rows = this._data.length || 1
    const pad = this.opts.padding
    this.H = this.opts.height || Math.max(100, pad.top + pad.bottom + rows * this.opts.rowHeight)
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    this._data = (data || []).map((d, i) => {
      const max = d.max != null ? d.max : (this.opts.max != null ? this.opts.max : 100)
      const ranges = d.ranges || this.opts.ranges || [max * 0.4, max * 0.7, max]
      return {
        label: d.label != null ? d.label : 'KPI ' + (i + 1),
        value: +d.value || 0,
        target: d.target != null ? +d.target : null,
        max,
        ranges: ranges.slice(),
        color: d.color,
        unit: d.unit || '',
        _i: i,
      }
    })
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._barEls = []
    if (!this._data.length) return
    const horizontal = this.opts.direction === 'horizontal'
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    const plot = {
      x: pad.left,
      y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    const rowH = plot.h / this._data.length
    const barH = rowH * this.opts.barHeight
    // 全局 max
    const globalMax = Math.max(...this._data.map(d => d.max))
    // 画每行
    this._data.forEach((d, i) => {
      const cy = plot.y + rowH * i + rowH / 2
      const rangeColors = this.theme.rangeColors
      // 定性区间（多层背景）
      const ranges = d.ranges.slice().sort((a, b) => a - b)
      let prev = 0
      const nRanges = ranges.length
      ranges.forEach((r, ri) => {
        const x1 = plot.x + (prev / d.max) * plot.w
        const x2 = plot.x + (r / d.max) * plot.w
        const color = (this.opts.rangeColors && this.opts.rangeColors[ri]) || rangeColors[Math.min(ri, rangeColors.length - 1)]
        this.svg.appendChild(el('rect', {
          x: x1, y: cy - barH / 2,
          width: Math.max(0, x2 - x1),
          height: barH,
          fill: color,
        }))
        prev = r
      })
      // 主条（值）
      const valueColor = d.color || this.opts.barColor
      const barW = Math.min(plot.w, (d.value / d.max) * plot.w)
      const barY = cy - barH * 0.28
      const barHeight = barH * 0.56
      const bar = el('rect', {
        x: plot.x, y: barY,
        width: Math.max(0, barW),
        height: barHeight,
        rx: Math.min(4, barHeight / 2),
        fill: valueColor,
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      bar._meta = { datum: d, index: i, x: plot.x, y: barY, w: barW, h: barHeight, color: valueColor }
      this.svg.appendChild(bar)
      this._barEls.push(bar)
      // 目标
      if (this.opts.showTarget && d.target != null) {
        const tx = plot.x + (d.target / d.max) * plot.w
        this.svg.appendChild(el('line', {
          x1: tx, x2: tx,
          y1: cy - barH * 0.45,
          y2: cy + barH * 0.45,
          stroke: this.opts.targetColor || this.theme.targetColor,
          'stroke-width': this.opts.targetWidth,
          'stroke-linecap': 'round',
        }))
      }
      // 左侧标签
      if (this.opts.showLabels) {
        const t = el('text', {
          x: plot.x - 10, y: cy + 4,
          'text-anchor': 'end',
          'font-size': 12.5,
          'font-weight': 500,
          fill: this.theme.text,
        })
        t.textContent = d.label
        this.svg.appendChild(t)
      }
      // 右侧值
      if (this.opts.showValue) {
        const v = d.value
        const vText = this.opts.valueFormat(v, this.opts.valueDecimals) + (d.unit || '')
        const t = el('text', {
          x: plot.x + plot.w + 10, y: cy + 4,
          'text-anchor': 'start',
          'font-size': 12.5,
          'font-weight': 600,
          fill: this.theme.text,
          style: 'font-variant-numeric:tabular-nums',
        })
        t.textContent = vText
        this.svg.appendChild(t)
        // 目标对比
        if (d.target != null) {
          const pct = ((v - d.target) / d.target * 100)
          const sign = pct >= 0 ? '+' : ''
          const color = pct >= 0 ? '#10b981' : '#ef4444'
          const t2 = el('text', {
            x: plot.x + plot.w + 10, y: cy + 18,
            'text-anchor': 'start',
            'font-size': 10.5,
            fill: color,
          })
          t2.textContent = sign + pct.toFixed(0) + '%'
          this.svg.appendChild(t2)
        }
      }
      // 事件
      bar.addEventListener('mouseenter', (e) => {
        this._hover = bar
        this._applyHover()
        this._moveTip(e, d)
      })
      bar.addEventListener('mousemove', (e) => { if (this._hover === bar) this._moveTip(e, d) })
      bar.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      bar.addEventListener('click', (e) => { if (this.opts.onBarClick) this.opts.onBarClick(d, i, e) })
    })
    // 分隔线
    if (this.opts.grid) {
      for (let i = 1; i < this._data.length; i++) {
        const y = plot.y + rowH * i
        this.svg.appendChild(el('line', {
          x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
          stroke: this.theme.axis, 'stroke-width': 1, opacity: 0.4,
        }))
      }
    }
    if (animate) this._animate(plot)
    return this
  }
  _applyHover() {
    const hot = this._hover
    for (const b of this._barEls) {
      const isHot = b === hot
      b.style.filter = isHot ? 'brightness(1.15)' : ''
      b.style.opacity = this._hover ? (isHot ? '1' : '0.4') : '1'
    }
  }
  _moveTip(e, d) {
    if (!this.tip) return
    const color = d.color || this.opts.barColor
    const pct = d.target != null ? ((d.value - d.target) / d.target * 100) : null
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${d.label}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">实际值</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(d.value, this.opts.valueDecimals)}${d.unit || ''}</span>
        ${d.target != null ? `<span style="opacity:.7">目标</span><span style="text-align:right">${this.opts.valueFormat(d.target, this.opts.valueDecimals)}${d.unit || ''}</span>` : ''}
        ${pct != null ? `<span style="opacity:.7">达成</span><span style="text-align:right;color:${pct >= 0 ? '#10b981' : '#ef4444'};font-weight:600">${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%</span>` : ''}
        <span style="opacity:.7">满分</span><span style="text-align:right">${this.opts.valueFormat(d.max, this.opts.valueDecimals)}</span>
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const mx = e.clientX - r.left, my = e.clientY - r.top
    let left = mx + 14, top = my - th / 2
    if (left + tw > r.width - 4) left = mx - tw - 14
    if (top < 0) top = 4
    if (top + th > r.height) top = r.height - th - 4
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover(d)
  }
  _animate(plot) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._barEls.map((b, i) => ({
      el: b, w: b._meta.w, delay: (i * stagger) / duration,
    }))
    targets.forEach(tg => { tg.el.setAttribute('width', '0') })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('width', String(tg.w * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else { targets.forEach(tg => tg.el.setAttribute('width', String(tg.w))); this._cancelAnim = null }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }
  _setupResize() {
    if (typeof ResizeObserver === 'undefined') return
    let last = 0
    this._resizeObs = new ResizeObserver(() => {
      const w = this.wrap.clientWidth
      if (w > 0 && w !== last) { last = w; this.render() }
    })
    this._resizeObs.observe(this.wrap)
    last = this.wrap.clientWidth
  }
  replay() { this.render({ animate: true }); return this }
  destroy() { if (this._cancelAnim) this._cancelAnim(); if (this._resizeObs) this._resizeObs.disconnect(); this.container.innerHTML = '' }
}
export default BulletChart
