// @xunay/kit/charts/scatter —— 精修版散点图
// 特性：回归线 · 气泡大小 · 分组配色 · 象限分割 · 悬停高亮 · 
//      目标区域 · tooltip · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'sc-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  if (Math.abs(v) < 1) return v.toFixed(2)
  return String(Number(v).toFixed(1))
}

function niceScale(min, max, count = 5) {
  if (max === min) max = min + 1
  const range = max - min
  const rough = range / count
  const exp = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / exp
  let step
  if (norm < 1.5) step = 1
  else if (norm < 3) step = 2
  else if (norm < 7) step = 5
  else step = 10
  step *= exp
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks = []
  for (let v = niceMin; v <= niceMax + step * 1e-6; v += step) ticks.push(Number(v.toFixed(10)))
  return { min: niceMin, max: niceMax, step, ticks }
}

// 最小二乘法线性回归
function linearRegression(points) {
  const n = points.length
  if (n < 2) return null
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0
  for (const p of points) {
    sx += p.x; sy += p.y
    sxx += p.x * p.x
    sxy += p.x * p.y
    syy += p.y * p.y
  }
  const denom = n * sxx - sx * sx
  if (Math.abs(denom) < 1e-12) return null
  const slope = (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / n
  // R²
  const yMean = sy / n
  let ssRes = 0, ssTot = 0
  for (const p of points) {
    const pred = slope * p.x + intercept
    ssRes += (p.y - pred) ** 2
    ssTot += (p.y - yMean) ** 2
  }
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0
  return { slope, intercept, r2 }
}

export class ScatterChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[ScatterChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 400,
      padding: { top: 20, right: 24, bottom: 44, left: 52 },
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      pointRadius: 5,
      pointRadiusHover: 9,
      pointOpacity: 0.75,
      pointStroke: true,       // 白边
      // 气泡模式
      bubble: false,
      minR: 4,
      maxR: 28,
      // 回归线
      showRegression: false,
      regressionColor: null,   // null 用 series 色
      regressionDash: null,    // null 用实线
      showR2: true,            // 显示 R²
      // 象限分割
      quadrant: null,          // null | { x, y } 分割点
      quadrantLabels: false,   // 显示象限标签
      // 目标区域
      targetZone: null,        // { x1, y1, x2, y2, label, color }
      // 网格
      grid: true,
      gridDash: '3 4',
      xTicks: 5,
      yTicks: 5,
      // 标签
      showLabels: false,       // 显示点标签
      labelMinRadius: 0,
      // tooltip
      tooltip: true,
      xFormat: fmt,
      yFormat: fmt,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 8 },
      onHover: null,
      onPointClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._series = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._pointEls = []

    this._build()
    if (options.data || options.series) this.setData(options)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', pointStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', pointStroke: '#fff',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
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

    if (this.opts.tooltip) {
      this.tip = document.createElement('div')
      this.tip.style.cssText = `
        position:absolute;pointer-events:none;opacity:0;
        transition:opacity .12s ease;
        background:${this.theme.tipBg};color:${this.theme.tipColor};
        border:1px solid ${this.theme.tipBorder};
        padding:8px 12px;border-radius:8px;
        font-size:12.5px;line-height:1.55;
        box-shadow:0 8px 24px rgba(0,0,0,.18);
        backdrop-filter:blur(6px);white-space:nowrap;z-index:10;
      `
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
    let series = []
    if (input.series) {
      series = input.series.map((s, i) => ({
        name: s.name || `系列 ${i + 1}`,
        color: s.color || this.opts.colors[i % this.opts.colors.length],
        data: (s.data || []).map((d, j) => {
          if (typeof d === 'object' && d.x != null && d.y != null) {
            return { x: +d.x, y: +d.y, r: d.r != null ? +d.r : (d.value != null ? +d.value : null), label: d.label }
          }
          return { x: j, y: 0, label: String(j) }
        }),
      }))
    } else if (input.data) {
      series = [{
        name: input.name || '数据',
        color: input.color || this.opts.colors[0],
        data: input.data.map((d, j) => ({
          x: typeof d === 'object' ? +d.x : j,
          y: typeof d === 'object' ? +d.y : +d,
          r: typeof d === 'object' && d.r != null ? +d.r : null,
          label: typeof d === 'object' && d.label != null ? d.label : String(j),
        })),
      }]
    }
    this._series = series
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

    const W = this.W, H = this.H
    const pad = this.opts.padding

    this.svg.innerHTML = ''
    this._pointEls = []

    const all = this._series.flatMap(s => s.data)
    if (!all.length) return

    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }

    // 范围
    let xMin = Infinity, xMax = -Infinity
    let yMin = Infinity, yMax = -Infinity
    let rMax = 1
    for (const s of this._series) {
      for (const d of s.data) {
        if (d.x < xMin) xMin = d.x
        if (d.x > xMax) xMax = d.x
        if (d.y < yMin) yMin = d.y
        if (d.y > yMax) yMax = d.y
        if (d.r != null && d.r > rMax) rMax = d.r
      }
    }
    if (!isFinite(xMin)) { xMin = 0; xMax = 1; yMin = 0; yMax = 1 }

    const xScale = niceScale(xMin, xMax, this.opts.xTicks)
    const yScale = niceScale(yMin, yMax, this.opts.yTicks)

    const xOf = v => plot.x + ((v - xScale.min) / (xScale.max - xScale.min)) * plot.w
    const yOf = v => plot.y + plot.h - ((v - yScale.min) / (yScale.max - yScale.min)) * plot.h

    // 半径映射
    const rOf = (d, s) => {
      if (this.opts.bubble && d.r != null) {
        const t = d.r / rMax
        return this.opts.minR + t * (this.opts.maxR - this.opts.minR)
      }
      return this.opts.pointRadius
    }

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 网格 + 刻度
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of yScale.ticks) {
        const y = yOf(tick)
        if (y < plot.y - 1 || y > plot.y + plot.h + 1) continue
        g.appendChild(el('line', {
          x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
          stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': this.opts.gridDash,
        }))
        const t = el('text', {
          x: plot.x - 10, y: y + 4,
          'text-anchor': 'end',
          'font-size': 11, 'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      for (const tick of xScale.ticks) {
        const x = xOf(tick)
        if (x < plot.x - 1 || x > plot.x + plot.w + 1) continue
        g.appendChild(el('line', {
          x1: x, x2: x, y1: plot.y, y2: plot.y + plot.h,
          stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': this.opts.gridDash,
        }))
        const t = el('text', {
          x, y: plot.y + plot.h + 22,
          'text-anchor': 'middle',
          'font-size': 11, 'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = this.opts.xFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }

    // 轴
    this.svg.appendChild(el('line', {
      x1: plot.x, x2: plot.x, y1: plot.y, y2: plot.y + plot.h,
      stroke: this.theme.axis, 'stroke-width': 1,
    }))
    this.svg.appendChild(el('line', {
      x1: plot.x, x2: plot.x + plot.w, y1: plot.y + plot.h, y2: plot.y + plot.h,
      stroke: this.theme.axis, 'stroke-width': 1,
    }))

    // ===== 象限 =====
    if (this.opts.quadrant) {
      const { x: qx, y: qy } = this.opts.quadrant
      const cx = xOf(qx)
      const cy = yOf(qy)
      const qg = el('g')
      // 分割线
      qg.appendChild(el('line', {
        x1: cx, x2: cx, y1: plot.y, y2: plot.y + plot.h,
        stroke: this.theme.axis, 'stroke-width': 1.5, 'stroke-dasharray': '6 4',
      }))
      qg.appendChild(el('line', {
        x1: plot.x, x2: plot.x + plot.w, y1: cy, y2: cy,
        stroke: this.theme.axis, 'stroke-width': 1.5, 'stroke-dasharray': '6 4',
      }))
      if (this.opts.quadrantLabels) {
        const labels = [
          { x: cx + 8, y: plot.y + 18, text: 'Ⅱ', anchor: 'start' },
          { x: plot.x + plot.w - 8, y: plot.y + 18, text: 'Ⅰ', anchor: 'end' },
          { x: plot.x + 8, y: plot.y + plot.h - 8, text: 'Ⅲ', anchor: 'start' },
          { x: plot.x + plot.w - 8, y: plot.y + plot.h - 8, text: 'Ⅳ', anchor: 'end' },
        ]
        for (const l of labels) {
          const t = el('text', {
            x: l.x, y: l.y,
            'text-anchor': l.anchor,
            'font-size': 12,
            'font-family': 'inherit',
            fill: this.theme.textMuted,
            'font-weight': 600,
            opacity: 0.6,
          })
          t.textContent = l.text
          qg.appendChild(t)
        }
      }
      this.svg.appendChild(qg)
    }

    // ===== 目标区域 =====
    if (this.opts.targetZone) {
      const z = this.opts.targetZone
      const x1 = xOf(Math.min(z.x1, z.x2))
      const x2 = xOf(Math.max(z.x1, z.x2))
      const y1 = yOf(Math.max(z.y1, z.y2))
      const y2 = yOf(Math.min(z.y1, z.y2))
      const zg = el('g')
      zg.appendChild(el('rect', {
        x: x1, y: y1, width: x2 - x1, height: y2 - y1,
        fill: z.color || '#10b981',
        'fill-opacity': 0.1,
        stroke: z.color || '#10b981',
        'stroke-width': 1.5,
        'stroke-dasharray': '6 4',
      }))
      if (z.label) {
        const t = el('text', {
          x: (x1 + x2) / 2, y: y1 - 6,
          'text-anchor': 'middle',
          'font-size': 11,
          'font-family': 'inherit',
          fill: z.color || '#10b981',
          'font-weight': 600,
        })
        t.textContent = z.label
        zg.appendChild(t)
      }
      this.svg.appendChild(zg)
    }

    // ===== 回归线（每个系列一条） =====
    if (this.opts.showRegression) {
      for (const s of this._series) {
        if (s.data.length < 2) continue
        const reg = linearRegression(s.data)
        if (!reg) continue
        const x1 = xScale.min
        const x2 = xScale.max
        const y1 = reg.slope * x1 + reg.intercept
        const y2 = reg.slope * x2 + reg.intercept
        const color = this.opts.regressionColor || s.color

        this.svg.appendChild(el('line', {
          x1: xOf(x1), y1: yOf(y1), x2: xOf(x2), y2: yOf(y2),
          stroke: color, 'stroke-width': 2,
          'stroke-dasharray': this.opts.regressionDash || '0',
          opacity: 0.85,
        }))

        if (this.opts.showR2) {
          const t = el('text', {
            x: plot.x + plot.w - 8,
            y: plot.y + 16 + this._series.indexOf(s) * 16,
            'text-anchor': 'end',
            'font-size': 11.5,
            'font-family': 'inherit',
            fill: color,
            'font-weight': 600,
          })
          t.textContent = `${s.name}: R² = ${reg.r2.toFixed(3)}`
          this.svg.appendChild(t)
        }
      }
    }

    // ===== 数据点 =====
    const pointsLayer = el('g')
    this.svg.appendChild(pointsLayer)

    for (const s of this._series) {
      for (let i = 0; i < s.data.length; i++) {
        const d = s.data[i]
        const cx = xOf(d.x)
        const cy = yOf(d.y)
        const r = rOf(d, s)

        const circle = el('circle', {
          cx, cy, r,
          fill: s.color,
          'fill-opacity': this.opts.pointOpacity,
          stroke: this.opts.pointStroke ? this.theme.pointStroke : 'none',
          'stroke-width': this.opts.pointStroke ? 1.5 : 0,
          style: 'cursor:pointer;transition:r .15s ease,fill-opacity .15s',
        })
        circle._meta = { series: s, datum: d, cx, cy, r, seriesIndex: this._series.indexOf(s), dataIndex: i }
        pointsLayer.appendChild(circle)
        this._pointEls.push(circle)

        circle.addEventListener('mouseenter', (e) => {
          this._hover = circle
          this._applyHover()
          this._moveTip(e, circle)
        })
        circle.addEventListener('mousemove', (e) => {
          if (this._hover === circle) this._moveTip(e, circle)
        })
        circle.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        circle.addEventListener('click', (e) => {
          if (this.opts.onPointClick) {
            this.opts.onPointClick(d, this._series.indexOf(s), i, e)
          }
        })
      }
    }

    // 标签
    if (this.opts.showLabels) {
      for (const c of this._pointEls) {
        const m = c._meta
        if (m.r < this.opts.labelMinRadius) continue
        if (!m.datum.label) continue
        const t = el('text', {
          x: m.cx, y: m.cy - m.r - 4,
          'text-anchor': 'middle',
          'font-size': 11,
          'font-family': 'inherit',
          fill: this.theme.text,
          style: 'pointer-events:none',
        })
        t.textContent = m.datum.label
        pointsLayer.appendChild(t)
      }
    }

    if (animate) this._animate()

    return this
  }

  _applyHover() {
    const hot = this._hover
    if (!hot) {
      for (const c of this._pointEls) {
        c.setAttribute('r', c._meta.r)
        c.setAttribute('fill-opacity', this.opts.pointOpacity)
      }
      return
    }
    const hm = hot._meta
    for (const c of this._pointEls) {
      const m = c._meta
      const sameSeries = m.series === hm.series
      const isHot = c === hot
      const isNeighbor = !isHot && sameSeries && Math.abs(m.dataIndex - hm.dataIndex) <= 1
      if (isHot) {
        c.setAttribute('r', this.opts.pointRadiusHover)
        c.setAttribute('fill-opacity', '1')
      } else if (isNeighbor) {
        c.setAttribute('r', m.r * 1.1)
        c.setAttribute('fill-opacity', '1')
      } else {
        c.setAttribute('r', m.r)
        c.setAttribute('fill-opacity', '0.15')
      }
    }
  }

  _moveTip(e, circle) {
    if (!this.tip) return
    const m = circle._meta
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${m.series.color}"></span>
        <strong>${m.series.name}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        ${m.datum.label ? `<span style="opacity:.7">标签</span><span style="text-align:right;font-weight:600">${m.datum.label}</span>` : ''}
        <span style="opacity:.7">X</span><span style="text-align:right;font-variant-numeric:tabular-nums">${this.opts.xFormat(m.datum.x)}</span>
        <span style="opacity:.7">Y</span><span style="text-align:right;font-variant-numeric:tabular-nums">${this.opts.yFormat(m.datum.y)}</span>
        ${m.datum.r != null ? `<span style="opacity:.7">大小</span><span style="text-align:right;font-variant-numeric:tabular-nums">${fmt(m.datum.r)}</span>` : ''}
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    let left = cx + 14
    let top = cy - th - 12
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = cy + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) {
      this.opts.onHover({
        series: m.series, datum: m.datum,
        seriesIndex: m.seriesIndex, dataIndex: m.dataIndex,
      })
    }
  }

  _animate() {
    const { duration, easing, stagger } = this.opts.animation
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

    const cx0 = this.W / 2
    const cy0 = this.H / 2

    const targets = this._pointEls.map((c, i) => ({
      el: c,
      cx: c._meta.cx,
      cy: c._meta.cy,
      r: c._meta.r,
      delay: (i * stagger) / duration,
    }))

    // 初始：中心 + 半径 0
    targets.forEach(tg => {
      tg.el.setAttribute('cx', cx0)
      tg.el.setAttribute('cy', cy0)
      tg.el.setAttribute('r', '0')
      tg.el.style.opacity = '0'
    })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('cx', cx0 + (tg.cx - cx0) * e)
        tg.el.setAttribute('cy', cy0 + (tg.cy - cy0) * e)
        tg.el.setAttribute('r', String(tg.r * e))
        tg.el.style.opacity = String(e)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          tg.el.setAttribute('cx', tg.cx)
          tg.el.setAttribute('cy', tg.cy)
          tg.el.setAttribute('r', String(tg.r))
          tg.el.style.opacity = '1'
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

export default ScatterChart
