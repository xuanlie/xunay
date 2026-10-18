// @xunay/kit/charts/bump —— 凹凸图（排名变化）
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'bp-' + (++_uid).toString(36)

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
  return String(Math.round(v))
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
function linePath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
}

export class BumpChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Bump] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 400,
      padding: { top: 40, right: 100, bottom: 40, left: 60 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      mode: 'smooth',
      tension: 0.35,
      lineWidth: 3,
      lineOpacityHover: 1,
      dimOpacity: 0.15,
      showLabels: true,          // 左右两侧显示名字
      showRanks: true,           // 每侧显示排名数字
      showValues: false,         // 节点处显示原始值
      valueFormat: fmt,
      // 排名方向
      reverse: false,            // false = 1 在顶部
      // 节点
      showNodes: true,
      nodeRadius: 5,
      nodeRadiusHover: 8,
      // 交互
      crosshair: true,
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 40 },
      onHover: null,
      onPointClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._series = []
    this._labels = []
    this._hidden = new Set()
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._lineEls = []
    this._pointEls = []
    this._build()
    if (options.data || options.series) this.setData(options)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', crosshair: '#64748b',
      pointStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', crosshair: '#94a3b8',
      pointStroke: '#fff',
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
        font-size:12.5px;line-height:1.55;box-shadow:0 8px 24px rgba(0,0,0,.18);
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
  setData(input) {
    let series = []
    if (input.series) {
      series = input.series.map((s, i) => ({
        name: s.name || `系列 ${i + 1}`,
        color: s.color || this.opts.colors[i % this.opts.colors.length],
        data: (s.data || []).map((d, j) => typeof d === 'number'
          ? { value: d, label: String(j) }
          : { value: +(d.value ?? d.y ?? 0), label: d.label ?? String(j) }),
      }))
    } else if (input.data) {
      series = [{
        name: input.name || '数据',
        color: input.color || this.opts.colors[0],
        data: input.data.map((d, j) => typeof d === 'number'
          ? { value: d, label: String(j) }
          : { value: +(d.value ?? d.y ?? 0), label: d.label ?? String(j) }),
      }]
    }
    this._series = series
    this._labels = input.labels || (series[0]?.data || []).map(d => d.label)
    this._hidden.clear()
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _computeRanks() {
    const n = this._labels.length
    const ranks = []  // ranks[j][i] = 第 j 个时间点，系列 i 的排名（1-based）
    for (let j = 0; j < n; j++) {
      const pairs = this._series.map((s, i) => ({ i, v: s.data[j]?.value ?? 0 }))
      pairs.sort((a, b) => b.v - a.v)
      const row = new Array(this._series.length)
      pairs.forEach((p, r) => { row[p.i] = r + 1 })
      ranks.push(row)
    }
    return ranks
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._lineEls = []
    this._pointEls = []
    const n = this._labels.length
    const m = this._series.length
    if (!n || !m) return
    const visible = this._series.map((s, i) => ({ ...s, _i: i })).filter(s => !this._hidden.has(s._i))
    if (!visible.length) return
    const plot = { x: pad.left, y: pad.top, w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }
    // 排名
    const ranks = this._computeRanks()
    const maxRank = m
    const xOf = j => plot.x + (n <= 1 ? plot.w / 2 : (j / (n - 1)) * plot.w)
    const yOf = r => {
      const t = (r - 1) / Math.max(1, maxRank - 1)
      const tt = this.opts.reverse ? 1 - t : t
      return plot.y + tt * plot.h
    }
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格（按排名）
    const gridG = el('g')
    for (let r = 1; r <= maxRank; r++) {
      const y = yOf(r)
      gridG.appendChild(el('line', {
        x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
        stroke: this.theme.grid, 'stroke-width': 1,
        'stroke-dasharray': '3 4', opacity: 0.7,
      }))
      if (this.opts.showRanks) {
        // 左侧数字
        const t = el('text', {
          x: plot.x - 8, y: y + 4,
          'text-anchor': 'end', 'font-size': 11, fill: this.theme.textMuted,
        })
        t.textContent = '#' + r
        gridG.appendChild(t)
        // 右侧数字
        const t2 = el('text', {
          x: plot.x + plot.w + 8, y: y + 4,
          'text-anchor': 'start', 'font-size': 11, fill: this.theme.textMuted,
        })
        t2.textContent = '#' + r
        gridG.appendChild(t2)
      }
    }
    this.svg.appendChild(gridG)
    // X 轴标签
    const xg = el('g')
    for (let j = 0; j < n; j++) {
      const t = el('text', {
        x: xOf(j), y: plot.y + plot.h + 22,
        'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 500, fill: this.theme.text,
      })
      t.textContent = this._labels[j]
      xg.appendChild(t)
    }
    this.svg.appendChild(xg)
    // 垂直线
    for (let j = 0; j < n; j++) {
      this.svg.appendChild(el('line', {
        x1: xOf(j), x2: xOf(j), y1: plot.y, y2: plot.y + plot.h,
        stroke: this.theme.grid, 'stroke-width': 1, opacity: 0.4,
      }))
    }
    // 系列线
    const lineG = el('g')
    this.svg.appendChild(lineG)
    const visSet = new Set(visible.map(s => s._i))
    visible.forEach((s) => {
      const i = s._i
      const pts = []
      for (let j = 0; j < n; j++) {
        pts.push({ x: xOf(j), y: yOf(ranks[j][i]), rank: ranks[j][i], value: s.data[j]?.value ?? 0, j })
      }
      const d = this.opts.mode === 'smooth' ? smoothPath(pts, this.opts.tension) : linePath(pts)
      const path = el('path', {
        d,
        fill: 'none',
        stroke: s.color,
        'stroke-width': this.opts.lineWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        style: 'cursor:pointer;transition:stroke-opacity .15s,stroke-width .15s',
      })
      path._meta = { series: s, index: i, pts }
      lineG.appendChild(path)
      this._lineEls.push(path)
      path.addEventListener('mouseenter', () => {
        this._hover = { type: 'line', i }
        this._applyHover()
      })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
    })
    // 节点
    const nodeG = el('g')
    this.svg.appendChild(nodeG)
    visible.forEach((s) => {
      const i = s._i
      for (let j = 0; j < n; j++) {
        const cx = xOf(j)
        const cy = yOf(ranks[j][i])
        const val = s.data[j]?.value ?? 0
        const dot = el('circle', {
          cx, cy, r: this.opts.nodeRadius,
          fill: s.color,
          stroke: this.theme.pointStroke,
          'stroke-width': 1.5,
          style: 'cursor:pointer;transition:r .15s',
        })
        dot._meta = { series: s, index: i, j, rank: ranks[j][i], value: val, cx, cy, color: s.color }
        nodeG.appendChild(dot)
        this._pointEls.push(dot)
        dot.addEventListener('mouseenter', (e) => {
          this._hover = { type: 'point', i, j }
          this._applyHover()
          this._moveTip(e, dot._meta)
        })
        dot.addEventListener('mousemove', (e) => {
          if (this._hover && this._hover.type === 'point' && this._hover.j === j && this._hover.i === i) {
            this._moveTip(e, dot._meta)
          }
        })
        dot.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        dot.addEventListener('click', (e) => {
          if (this.opts.onPointClick) {
            this.opts.onPointClick({
              series: s, index: i, stepIndex: j, step: this._labels[j],
              rank: ranks[j][i], value: val,
            }, e)
          }
        })
      }
    })
    // 系列标签（左右两侧）
    if (this.opts.showLabels) {
      const lastJ = n - 1
      visible.forEach((s) => {
        const i = s._i
        const r0 = ranks[0][i]
        const r1 = ranks[lastJ][i]
        // 左
        const t0 = el('text', {
          x: xOf(0) - 12, y: yOf(r0) + 4,
          'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 500,
          fill: s.color,
        })
        t0.textContent = s.name.length > 8 ? s.name.slice(0, 7) + '…' : s.name
        nodeG.appendChild(t0)
        // 右
        const t1 = el('text', {
          x: xOf(lastJ) + 12, y: yOf(r1) + 4,
          'text-anchor': 'start', 'font-size': 11.5, 'font-weight': 500,
          fill: s.color,
        })
        t1.textContent = s.name.length > 8 ? s.name.slice(0, 7) + '…' : s.name
        nodeG.appendChild(t1)
      })
    }
    if (animate) this._animate()
    return this
  }
  _applyHover() {
    const h = this._hover
    if (!h) {
      this._lineEls.forEach(l => l.setAttribute('stroke-opacity', '1'))
      this._pointEls.forEach(p => p.setAttribute('r', this.opts.nodeRadius))
      return
    }
    if (h.type === 'line') {
      const hi = h.i
      this._lineEls.forEach(l => {
        const isHot = l._meta.index === hi
        l.setAttribute('stroke-opacity', isHot ? '1' : this.opts.dimOpacity)
        l.setAttribute('stroke-width', isHot ? this.opts.lineWidth * 1.5 : this.opts.lineWidth)
      })
      this._pointEls.forEach(p => {
        p.setAttribute('r', p._meta.index === hi ? this.opts.nodeRadiusHover : this.opts.nodeRadius)
      })
    } else {
      const { i, j } = h
      this._lineEls.forEach(l => {
        l.setAttribute('stroke-opacity', l._meta.index === i ? '1' : this.opts.dimOpacity)
      })
      this._pointEls.forEach(p => {
        const isHot = p._meta.index === i && p._meta.j === j
        p.setAttribute('r', isHot ? this.opts.nodeRadiusHover : this.opts.nodeRadius)
      })
    }
  }
  _moveTip(e, meta) {
    if (!this.tip) return
    const { series, j, rank, value } = meta
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${series.color}"></span>
        <strong>${series.name}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">阶段</span><span style="text-align:right">${this._labels[j]}</span>
        <span style="opacity:.7">排名</span><span style="text-align:right;font-weight:600">#${rank}</span>
        <span style="opacity:.7">数值</span><span style="text-align:right">${this.opts.valueFormat(value)}</span>
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
    if (this.opts.onHover) {
      this.opts.onHover({
        series, stepIndex: j, step: this._labels[j], rank, value,
      })
    }
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._lineEls.map((l, i) => ({ el: l, d: l.getAttribute('d'), delay: i * stagger / duration }))
    const nodeTargets = this._pointEls.map(p => ({ el: p, r: this.opts.nodeRadius }))
    targets.forEach(t => { t.el.style.strokeDasharray = String(t.el.getTotalLength()); t.el.style.strokeDashoffset = String(t.el.getTotalLength()) })
    nodeTargets.forEach(t => t.el.setAttribute('r', '0'))
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const len = parseFloat(tg.el.style.strokeDasharray || '0')
        tg.el.style.strokeDashoffset = String(len * (1 - e))
      })
      nodeTargets.forEach(tg => {
        const e = ease(t)
        tg.el.setAttribute('r', String(tg.r * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => { tg.el.style.strokeDasharray = ''; tg.el.style.strokeDashoffset = '' })
        nodeTargets.forEach(tg => tg.el.setAttribute('r', String(tg.r)))
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
export default BumpChart
