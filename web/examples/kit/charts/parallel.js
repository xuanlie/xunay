// @xunay/kit/charts/parallel —— 平行坐标图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'pl-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  if (Math.abs(v) < 1 && v !== 0) return v.toFixed(2)
  return String(Number(v).toFixed(1))
}
function linePath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
}
function smoothPath(pts, tension = 0.35) {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : ''
  const t = tension / 3
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

export class ParallelChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Parallel] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 400,
      padding: { top: 44, right: 60, bottom: 44, left: 60 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      dimensions: [],          // [{ key, label, min?, max?, invert? }]
      categoryKey: null,       // 用于分组的字段
      mode: 'smooth',          // 'line' | 'smooth'
      tension: 0.35,
      lineWidth: 2,
      lineOpacity: 0.55,
      lineOpacityHover: 1,
      dimOpacity: 0.08,
      showAxes: true,
      showAxisLabels: true,
      showAxisValues: true,
      axisValuesCount: 5,
      brushable: true,         // 轴刷选
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 8 },
      onHover: null,
      onLineClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._brushes = new Map()   // key -> { min, max }
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._lineEls = []
    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      axis: '#334155', axisText: '#94a3b8', brushFill: 'rgba(59,130,246,0.15)', brushStroke: '#3b82f6',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      axis: '#cbd5e1', axisText: '#64748b', brushFill: 'rgba(59,130,246,0.12)', brushStroke: '#3b82f6',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 720))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    this._data = data || []
    this._brushes.clear()
    // 如果没有配置维度，从第一行自动推导
    if (!this.opts.dimensions.length && this._data.length) {
      const first = this._data[0]
      this.opts.dimensions = Object.keys(first)
        .filter(k => k !== this.opts.categoryKey && typeof first[k] === 'number')
        .map(k => ({ key: k, label: k }))
    }
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _axisStats() {
    const stats = this.opts.dimensions.map(dim => {
      let min = dim.min != null ? dim.min : Infinity
      let max = dim.max != null ? dim.max : -Infinity
      if (dim.min == null || dim.max == null) {
        for (const row of this._data) {
          const v = Number(row[dim.key])
          if (!isFinite(v)) continue
          if (v < min) min = v
          if (v > max) max = v
        }
      }
      if (!isFinite(min)) { min = 0; max = 1 }
      if (min === max) { max = min + 1; }
      return { ...dim, min, max }
    })
    return stats
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H
    this.svg.innerHTML = ''
    this._lineEls = []
    if (!this._data.length || !this.opts.dimensions.length) return
    const pad = this.opts.padding
    const plot = { x: pad.left, y: pad.top, w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }
    const dims = this._axisStats()
    const n = dims.length
    const axisGap = plot.w / (n - 1 || 1)
    const xOf = i => plot.x + i * axisGap
    const yOf = (i, v) => {
      const d = dims[i]
      let t = (v - d.min) / (d.max - d.min)
      if (d.invert) t = 1 - t
      return plot.y + plot.h - t * plot.h
    }
    // 数据范围内的行（受刷选影响）
    const inRange = (row) => {
      for (const [key, b] of this._brushes) {
        const v = Number(row[key])
        if (v < b.min || v > b.max) return false
      }
      return true
    }
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 轴线
    if (this.opts.showAxes) {
      const axisLayer = el('g')
      for (let i = 0; i < n; i++) {
        const d = dims[i]
        const x = xOf(i)
        axisLayer.appendChild(el('line', {
          x1: x, x2: x, y1: plot.y, y2: plot.y + plot.h,
          stroke: this.theme.axis, 'stroke-width': 1,
        }))
        // 轴标题
        if (this.opts.showAxisLabels) {
          const t = el('text', {
            x, y: plot.y - 20,
            'text-anchor': 'middle',
            'font-size': 12,
            'font-weight': 600,
            fill: this.theme.text,
          })
          t.textContent = d.label
          axisLayer.appendChild(t)
        }
        // 轴刻度
        if (this.opts.showAxisValues) {
          const count = this.opts.axisValuesCount
          for (let k = 0; k <= count; k++) {
            const tt = k / count
            const v = d.min + (d.max - d.min) * tt
            const y = plot.y + plot.h - tt * plot.h
            const t = el('text', {
              x: x - 6, y: y + 4,
              'text-anchor': 'end', 'font-size': 10,
              fill: this.theme.axisText,
            })
            t.textContent = fmt(v)
            axisLayer.appendChild(t)
          }
        }
      }
      this.svg.appendChild(axisLayer)
    }
    // 刷选矩形
    if (this.opts.brushable) {
      this._buildBrushes(dims, xOf, yOf, plot)
    }
    // 折线层
    const lineLayer = el('g')
    this.svg.appendChild(lineLayer)
    const visible = this._data.map((row, idx) => ({ row, idx })).filter(({ row }) => inRange(row))
    for (const { row, idx } of visible) {
      const pts = dims.map((d, i) => ({ x: xOf(i), y: yOf(i, Number(row[d.key])) }))
      const d = this.opts.mode === 'smooth' ? smoothPath(pts, this.opts.tension) : linePath(pts)
      const color = row._color || (this.opts.categoryKey && row[this.opts.categoryKey] != null
        ? this.opts.colors[Math.abs(hashCode(String(row[this.opts.categoryKey]))) % this.opts.colors.length]
        : this.opts.colors[idx % this.opts.colors.length])
      const path = el('path', {
        d,
        fill: 'none',
        stroke: color,
        'stroke-width': this.opts.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-opacity': this.opts.lineOpacity,
        style: 'cursor:pointer;transition:stroke-opacity .15s,stroke-width .15s',
      })
      path._meta = { row, idx, color, pts }
      lineLayer.appendChild(path)
      this._lineEls.push(path)
      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTip(e, row)
      })
      path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, row) })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => { if (this.opts.onLineClick) this.opts.onLineClick(row, idx, e) })
    }
    if (animate) this._animate()
    return this
  }
  _buildBrushes(dims, xOf, yOf, plot) {
    const brushLayer = el('g')
    this.svg.appendChild(brushLayer)
    for (let i = 0; i < dims.length; i++) {
      const d = dims[i]
      const x = xOf(i)
      const bw = 12
      const bx = x - bw / 2
      const brushEl = el('rect', {
        x: bx, y: plot.y, width: bw, height: plot.h,
        fill: 'transparent',
        style: 'cursor:ns-resize',
      })
      brushLayer.appendChild(brushEl)
      // 如果已有刷选，显示
      const b = this._brushes.get(d.key)
      if (b) {
        const y1 = yOf(i, b.max)
        const y2 = yOf(i, b.min)
        brushLayer.appendChild(el('rect', {
          x: bx, y: y1, width: bw, height: y2 - y1,
          fill: this.theme.brushFill,
          stroke: this.theme.brushStroke,
          'stroke-width': 1,
          'pointer-events': 'none',
        }))
      }
      // 拖拽
      const onDown = (e) => {
        e.preventDefault()
        const svgRect = this.svg.getBoundingClientRect()
        const startY = e.clientY - svgRect.top
        let curY = startY
        const brushOverlay = el('rect', {
          x: bx, y: startY, width: bw, height: 0,
          fill: this.theme.brushFill,
          stroke: this.theme.brushStroke,
          'stroke-width': 1,
        })
        brushLayer.appendChild(brushOverlay)
        const onMove = (ev) => {
          curY = ev.clientY - svgRect.top
          const y1 = Math.max(plot.y, Math.min(startY, curY))
          const y2 = Math.min(plot.y + plot.h, Math.max(startY, curY))
          brushOverlay.setAttribute('y', String(y1))
          brushOverlay.setAttribute('height', String(Math.max(0, y2 - y1)))
        }
        const onUp = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          brushOverlay.remove()
          const y1 = Math.max(plot.y, Math.min(startY, curY))
          const y2 = Math.min(plot.y + plot.h, Math.max(startY, curY))
          if (y2 - y1 < 4) {
            this._brushes.delete(d.key)
          } else {
            // 反算值
            const t1 = 1 - (y1 - plot.y) / plot.h
            const t2 = 1 - (y2 - plot.y) / plot.h
            const v1 = d.min + (d.max - d.min) * t1
            const v2 = d.min + (d.max - d.min) * t2
            let vmin = Math.min(v1, v2), vmax = Math.max(v1, v2)
            if (d.invert) {
              const rmin = d.min + d.max - vmax
              const rmax = d.min + d.max - vmin
              vmin = rmin; vmax = rmax
            }
            this._brushes.set(d.key, { min: vmin, max: vmax })
          }
          this.render({ animate: false })
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
      }
      brushEl.addEventListener('pointerdown', onDown)
    }
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._lineEls.forEach(l => {
        l.setAttribute('stroke-opacity', this.opts.lineOpacity)
        l.setAttribute('stroke-width', this.opts.lineWidth)
      })
      return
    }
    this._lineEls.forEach(l => {
      const isHot = l === hot
      l.setAttribute('stroke-opacity', isHot ? this.opts.lineOpacityHover : this.opts.dimOpacity)
      l.setAttribute('stroke-width', isHot ? this.opts.lineWidth * 1.5 : this.opts.lineWidth)
    })
  }
  _moveTip(e, row) {
    if (!this.tip) return
    const rows = this.opts.dimensions.map(d => `<div style="display:flex;justify-content:space-between;gap:20px">
      <span style="opacity:.7">${d.label}</span>
      <strong>${fmt(row[d.key])}</strong>
    </div>`).join('')
    const title = this.opts.categoryKey && row[this.opts.categoryKey] != null
      ? `<div style="font-weight:600;margin-bottom:4px">${row[this.opts.categoryKey]}</div>`
      : ''
    this.tip.innerHTML = title + rows
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
    if (this.opts.onHover) this.opts.onHover(row)
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const baseline = this.opts.padding.top + (this.H - this.opts.padding.top - this.opts.padding.bottom)
    const targets = this._lineEls.map((l, i) => {
      const pts = l._meta.pts
      return { el: l, pts, delay: (i * stagger) / duration }
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const flat = tg.pts.map(p => ({ x: p.x, y: baseline + (p.y - baseline) * e }))
        const d = this.opts.mode === 'smooth' ? smoothPath(flat, this.opts.tension) : linePath(flat)
        tg.el.setAttribute('d', d)
        tg.el.setAttribute('stroke-opacity', String(this.opts.lineOpacity * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          const d = this.opts.mode === 'smooth' ? smoothPath(tg.pts, this.opts.tension) : linePath(tg.pts)
          tg.el.setAttribute('d', d)
          tg.el.setAttribute('stroke-opacity', String(this.opts.lineOpacity))
        })
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }
  clearBrush() {
    this._brushes.clear()
    this.render({ animate: false })
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
function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0
  return h
}
export default ParallelChart
