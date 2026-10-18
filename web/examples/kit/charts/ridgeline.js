// @xunay/kit/charts/ridgeline —— 山脊图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'rg-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Number(v).toFixed(1)).replace(/\.0$/, '')
}
function hexToRgb(h) {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function lerp(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b)
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`
}
function rampColor(stops, t) {
  if (t <= 0) return stops[0]
  if (t >= 1) return stops[stops.length - 1]
  const n = stops.length - 1
  const i = Math.floor(t * n)
  return lerp(stops[i], stops[i + 1], t * n - i)
}
function quantile(sorted, q) {
  if (!sorted.length) return 0
  const idx = (sorted.length - 1) * q
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}
function bandwidth(sorted) {
  const n = sorted.length
  if (n < 2) return 1
  const q1 = quantile(sorted, 0.25), q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const mean = sorted.reduce((a, b) => a + b, 0) / n
  const sd = Math.sqrt(sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / n)
  const a = Math.min(sd, iqr / 1.34) || sd || 1
  return 1.06 * a * Math.pow(n, -0.2)
}
function kde(values, bw, grid) {
  const n = values.length
  if (!n) return grid.map(x => ({ x, y: 0 }))
  const sq2pi = Math.sqrt(2 * Math.PI)
  return grid.map(x => {
    let sum = 0
    for (const v of values) {
      const u = (x - v) / bw
      sum += Math.exp(-0.5 * u * u)
    }
    return { x, y: sum / (n * bw * sq2pi) }
  })
}

export class RidgelineChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Ridgeline] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 460,
      padding: { top: 24, right: 60, bottom: 40, left: 90 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      colorMode: 'palette',     // 'palette' | 'ramp' | 'single'
      ramp: ['#bfdbfe','#3b82f6','#1e3a8a'],
      singleColor: '#6366f1',
      overlap: 0.55,            // 相邻层重叠比例 0-1
      resolution: 80,
      bandwidth: null,
      fillOpacity: 0.72,
      strokeWidth: 1.5,
      // 基线
      baselineColor: null,
      // 中位点
      showMedianDot: true,
      medianDotRadius: 3,
      // 网格
      grid: true,
      gridDash: '3 4',
      xTicks: 5,
      xFormat: v => fmt(v),
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 60 },
      onHover: null,
      onRidgeClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._groups = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._ridgeEls = []
    this._build()
    if (options.data || options.groups) this.setData(options)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', ridgeStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', ridgeStroke: '#ffffff',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(255,255,255,0.08)',
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
        font-size:12px;line-height:1.55;box-shadow:0 8px 24px rgba(0,0,0,.18);
        backdrop-filter:blur(6px);white-space:nowrap;z-index:10;font-variant-numeric:tabular-nums;`
      this.wrap.appendChild(this.tip)
    }
  }
  _measure() {
    const r = this.wrap.getBoundingClientRect()
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 640))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(input) {
    let groups = []
    if (input.groups) {
      groups = input.groups.map((g, i) => ({
        label: g.label != null ? g.label : '组 ' + (i + 1),
        values: (g.values || []).slice(),
        color: g.color,
      }))
    } else if (input.data) {
      if (Array.isArray(input.data[0])) {
        groups = input.data.map((vals, i) => ({
          label: (input.labels && input.labels[i]) || '组 ' + (i + 1),
          values: vals.slice(),
        }))
      } else {
        groups = [{ label: input.label || '数据', values: input.data.slice() }]
      }
    }
    this._groups = groups.map(g => {
      const sorted = g.values.slice().sort((a, b) => a - b)
      const n = sorted.length
      const mean = n ? sorted.reduce((a, b) => a + b, 0) / n : 0
      const med = quantile(sorted, 0.5)
      const bw = this.opts.bandwidth != null ? this.opts.bandwidth : bandwidth(sorted)
      return { ...g, sorted, stats: { n, mean, med, min: sorted[0] || 0, max: sorted[n - 1] || 0, bw } }
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
  _colorOf(grp, i) {
    if (grp.color) return grp.color
    const m = this.opts.colorMode
    if (m === 'single') return this.opts.singleColor
    if (m === 'ramp') return rampColor(this.opts.ramp, this._groups.length <= 1 ? 0.5 : i / (this._groups.length - 1))
    return this.opts.colors[i % this.opts.colors.length]
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._ridgeEls = []
    if (!this._groups.length) return
    const plot = { x: pad.left, y: pad.top, w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }
    // 值范围（X 轴）
    let vMin = Infinity, vMax = -Infinity
    for (const g of this._groups) {
      if (g.stats.min < vMin) vMin = g.stats.min
      if (g.stats.max > vMax) vMax = g.stats.max
    }
    if (!isFinite(vMin)) { vMin = 0; vMax = 1 }
    const padV = (vMax - vMin) * 0.05
    vMin -= padV; vMax += padV
    const xOf = v => plot.x + ((v - vMin) / (vMax - vMin)) * plot.w
    // 每层高度
    const n = this._groups.length
    const layerH = plot.h / (1 + (n - 1) * (1 - this.opts.overlap))
    // 基线（每一层底部的位置）
    const baselineOf = i => plot.y + plot.h - (n - 1 - i) * layerH * (1 - this.opts.overlap)
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格（垂直，X 轴）
    if (this.opts.grid) {
      const g = el('g')
      const ticks = this.opts.xTicks
      for (let k = 0; k <= ticks; k++) {
        const v = vMin + (vMax - vMin) * (k / ticks)
        const x = xOf(v)
        g.appendChild(el('line', {
          x1: x, x2: x, y1: plot.y, y2: plot.y + plot.h,
          stroke: this.theme.grid, 'stroke-width': 1, 'stroke-dasharray': this.opts.gridDash,
        }))
        const t = el('text', {
          x, y: plot.y + plot.h + 22,
          'text-anchor': 'middle', 'font-size': 11, fill: this.theme.textMuted,
        })
        t.textContent = this.opts.xFormat(v)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }
    // 计算密度（用于统一缩放）
    let globalMaxD = 0
    const grid = []
    for (let k = 0; k < this.opts.resolution; k++) {
      grid.push(vMin + (vMax - vMin) * (k / (this.opts.resolution - 1)))
    }
    const densityCache = this._groups.map(grp => {
      const bw = grp.stats.bw || 1
      const dens = kde(grp.sorted, bw, grid)
      const m = Math.max(...dens.map(d => d.y))
      if (m > globalMaxD) globalMaxD = m
      return dens
    })
    // 逐层绘制（从后到前）
    const ridgeLayer = el('g')
    this.svg.appendChild(ridgeLayer)
    this._groups.forEach((grp, i) => {
      const color = this._colorOf(grp, i)
      const baseline = baselineOf(i)
      const dens = densityCache[i]
      const maxH = layerH * 0.92
      // 路径：从左到右画上边界，再拉回底部
      let d = ''
      dens.forEach((p, k) => {
        const x = xOf(p.x)
        const y = baseline - (p.y / globalMaxD) * maxH
        d += (k === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' '
      })
      d += 'L ' + xOf(dens[dens.length - 1].x).toFixed(2) + ' ' + baseline.toFixed(2) + ' '
      d += 'L ' + xOf(dens[0].x).toFixed(2) + ' ' + baseline.toFixed(2) + ' Z'
      const path = el('path', {
        d,
        fill: color,
        'fill-opacity': this.opts.fillOpacity,
        stroke: color,
        'stroke-width': this.opts.strokeWidth,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
        style: 'cursor:pointer;transition:fill-opacity .15s,filter .15s',
      })
      path._meta = { group: grp, index: i, color, baseline, dens, maxH }
      ridgeLayer.appendChild(path)
      this._ridgeEls.push(path)
      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTip(e, grp, i)
      })
      path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, grp, i) })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => { if (this.opts.onRidgeClick) this.opts.onRidgeClick(grp, i, e) })
      // 中位点
      if (this.opts.showMedianDot) {
        const mx = xOf(grp.stats.med)
        const my = baseline - 4
        ridgeLayer.appendChild(el('circle', {
          cx: mx, cy: my, r: this.opts.medianDotRadius,
          fill: this.theme.ridgeStroke,
          stroke: color, 'stroke-width': 1.5,
          style: 'pointer-events:none',
        }))
      }
      // 左侧标签
      const t = el('text', {
        x: plot.x - 12,
        y: baseline - 6,
        'text-anchor': 'end',
        'font-size': 12, 'font-weight': 500,
        fill: this.theme.text,
      })
      t.textContent = grp.label
      ridgeLayer.appendChild(t)
      // 每层基线（横线）
      ridgeLayer.appendChild(el('line', {
        x1: plot.x, x2: plot.x + plot.w,
        y1: baseline, y2: baseline,
        stroke: this.opts.baselineColor || this.theme.axis,
        'stroke-width': 0.6, opacity: 0.5,
        style: 'pointer-events:none',
      }))
    })
    if (animate) this._animate()
    return this
  }
  _applyHover() {
    for (const r of this._ridgeEls) {
      const isHot = r === this._hover
      r.setAttribute('fill-opacity', isHot ? 0.95 : (this._hover ? 0.35 : this.opts.fillOpacity))
      r.style.filter = isHot ? 'brightness(1.08)' : ''
    }
  }
  _moveTip(e, grp, i) {
    if (!this.tip) return
    const s = grp.stats
    const color = this._colorOf(grp, i)
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${grp.label}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px">
        <span style="opacity:.7">样本</span><span style="text-align:right">${s.n}</span>
        <span style="opacity:.7">中位</span><span style="text-align:right;font-weight:600">${fmt(s.med)}</span>
        <span style="opacity:.7">均值</span><span style="text-align:right">${fmt(s.mean)}</span>
        <span style="opacity:.7">范围</span><span style="text-align:right">${fmt(s.min)} ~ ${fmt(s.max)}</span>
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const mx = e.clientX - r.left, my = e.clientY - r.top
    let left = mx + 14, top = my - th - 12
    if (left + tw > r.width - 4) left = mx - tw - 14
    if (top < 0) top = my + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover({ group: grp, index: i, stats: s })
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._ridgeEls.map((r, i) => ({ el: r, d: r.getAttribute('d'), delay: i * stagger / duration }))
    targets.forEach(t => { t.el.setAttribute('fill-opacity', '0'); t.el.setAttribute('stroke-opacity', '0') })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('fill-opacity', String(this.opts.fillOpacity * e))
        tg.el.setAttribute('stroke-opacity', String(e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          tg.el.setAttribute('fill-opacity', String(this.opts.fillOpacity))
          tg.el.setAttribute('stroke-opacity', '1')
        })
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
      if (w > 0 && w !== last) { last = w; this.render() }
    })
    this._resizeObs.observe(this.wrap)
    last = this.wrap.clientWidth
  }
  replay() { this.render({ animate: true }); return this }
  destroy() { if (this._cancelAnim) this._cancelAnim(); if (this._resizeObs) this._resizeObs.disconnect(); this.container.innerHTML = '' }
}
export default RidgelineChart
