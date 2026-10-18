// @xunay/kit/charts/hexbin —— 六边形分箱图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'hb-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Math.round(v))
}
function niceScale(min, max, count = 5) {
  if (max === min) max = min + 1
  const range = max - min
  const rough = range / count
  const exp = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / exp
  let step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  step *= exp
  const nMin = Math.floor(min / step) * step
  const nMax = Math.ceil(max / step) * step
  const ticks = []
  for (let v = nMin; v <= nMax + step * 1e-6; v += step) ticks.push(Number(v.toFixed(10)))
  return { min: nMin, max: nMax, ticks }
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
// 六边形顶点（尖顶向上）
function hexPath(cx, cy, r, rotate = 0) {
  const pts = []
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 3 * k + rotate
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return 'M ' + pts.map(p => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L ') + ' Z'
}

export class HexbinChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Hexbin] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 460,
      padding: { top: 24, right: 24, bottom: 48, left: 56 },
      title: null, subtitle: null, theme: 'light',
      // 六边形数量（横向上大约几个）
      bins: 16,
      // 色阶
      colorRamp: ['#f0f9ff', '#bae6fd', '#38bdf8', '#0284c7', '#082f49'],
      colorRampDark: ['#082f49', '#0284c7', '#38bdf8', '#bae6fd', '#f0f9ff'],
      // 空箱是否显示
      showEmpty: false,
      emptyColor: null,
      // 六边形描边
      hexStroke: true,
      hexStrokeWidth: 1,
      // 网格
      grid: true,
      gridDash: '3 4',
      xTicks: 5,
      yTicks: 5,
      xFormat: fmt,
      yFormat: fmt,
      // 图例
      legend: true,
      legendSteps: 5,
      // 交互
      tooltip: true,
      tooltipFormat: null,
      animation: { duration: 600, easing: 'easeOutCubic', stagger: 3 },
      onHover: null,
      onHexClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._points = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._hexEls = []
    this._build()
    if (options.data || options.points) this.setData(options.data || options.points)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', hexStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', hexStroke: '#ffffff',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 640))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    this._points = (data || []).map((d, i) => {
      if (Array.isArray(d)) return { x: +d[0], y: +d[1] }
      return { x: +(d.x ?? 0), y: +(d.y ?? 0) }
    }).filter(p => isFinite(p.x) && isFinite(p.y))
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _bin() {
    const pad = this.opts.padding
    const plot = {
      x: pad.left, y: pad.top,
      w: this.W - pad.left - pad.right,
      h: this.H - pad.top - pad.bottom,
    }
    // 数据范围
    let xMin = Infinity, xMax = -Infinity
    let yMin = Infinity, yMax = -Infinity
    for (const p of this._points) {
      if (p.x < xMin) xMin = p.x
      if (p.x > xMax) xMax = p.x
      if (p.y < yMin) yMin = p.y
      if (p.y > yMax) yMax = p.y
    }
    if (!isFinite(xMin)) { xMin = 0; xMax = 1; yMin = 0; yMax = 1 }
    const xScale = niceScale(xMin, xMax, this.opts.xTicks)
    const yScale = niceScale(yMin, yMax, this.opts.yTicks)
    // 六边形尺寸：横向 bins 个
    const N = this.opts.bins
    const hexR = plot.w / (N * Math.sqrt(3)) * 1.0
    const hexW = Math.sqrt(3) * hexR    // 横向宽度
    const hexH = 2 * hexR                // 纵向高度
    const colStep = hexW
    const rowStep = hexH * 0.75
    const cols = Math.floor(plot.w / colStep) + 2
    const rows = Math.floor(plot.h / rowStep) + 2
    const xOf = v => plot.x + ((v - xScale.min) / (xScale.max - xScale.min)) * plot.w
    const yOf = v => plot.y + plot.h - ((v - yScale.min) / (yScale.max - yScale.min)) * plot.h
    // 六边形中心点
    const hexes = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = r % 2 === 1 ? colStep / 2 : 0
        const cx = plot.x - colStep / 2 + c * colStep + offset
        const cy = plot.y - rowStep / 2 + r * rowStep + hexR
        hexes.push({ cx, cy, row: r, col: c, count: 0, points: [] })
      }
    }
    // 分箱：找每个点所属的六边形
    // 用近似方法：找最近的六边形中心
    for (const p of this._points) {
      const x = xOf(p.x)
      const y = yOf(p.y)
      let bestHex = null
      let bestD = Infinity
      // 只搜索附近的行列
      const r0 = Math.max(0, Math.floor((y - plot.y - hexR + rowStep / 2) / rowStep) - 1)
      const r1 = Math.min(rows - 1, r0 + 3)
      for (let r = r0; r <= r1; r++) {
        const offset = r % 2 === 1 ? colStep / 2 : 0
        const c0 = Math.max(0, Math.floor((x - plot.x + colStep / 2 - offset) / colStep) - 1)
        const c1 = Math.min(cols - 1, c0 + 3)
        for (let c = c0; c <= c1; c++) {
          const h = hexes[r * cols + c]
          const dx = h.cx - x
          const dy = h.cy - y
          const d = dx * dx + dy * dy
          if (d < bestD) { bestD = d; bestHex = h }
        }
      }
      if (bestHex && Math.sqrt(bestD) <= hexR * 1.05) {
        bestHex.count++
        bestHex.points.push(p)
      }
    }
    // 最大计数
    let maxCount = 0
    for (const h of hexes) if (h.count > maxCount) maxCount = h.count
    return { plot, xScale, yScale, hexes, hexR, maxCount, cols, rows }
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._hexEls = []
    if (!this._points.length) return
    const bin = this._bin()
    const { plot, xScale, yScale, hexes, hexR, maxCount } = bin
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of yScale.ticks) {
        const y = plot.y + plot.h - ((tick - yScale.min) / (yScale.max - yScale.min)) * plot.h
        g.appendChild(el('line', { x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y, stroke: this.theme.grid, 'stroke-width': 1, 'stroke-dasharray': this.opts.gridDash }))
        const t = el('text', { x: plot.x - 10, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: this.theme.textMuted })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      for (const tick of xScale.ticks) {
        const x = plot.x + ((tick - xScale.min) / (xScale.max - xScale.min)) * plot.w
        g.appendChild(el('line', { x1: x, x2: x, y1: plot.y, y2: plot.y + plot.h, stroke: this.theme.grid, 'stroke-width': 1, 'stroke-dasharray': this.opts.gridDash }))
        const t = el('text', { x, y: plot.y + plot.h + 22, 'text-anchor': 'middle', 'font-size': 11, fill: this.theme.textMuted })
        t.textContent = this.opts.xFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }
    // 轴
    this.svg.appendChild(el('line', { x1: plot.x, x2: plot.x, y1: plot.y, y2: plot.y + plot.h, stroke: this.theme.axis, 'stroke-width': 1 }))
    this.svg.appendChild(el('line', { x1: plot.x, x2: plot.x + plot.w, y1: plot.y + plot.h, y2: plot.y + plot.h, stroke: this.theme.axis, 'stroke-width': 1 }))
    // 色阶
    const ramp = this.opts.theme === 'dark' ? this.opts.colorRampDark : this.opts.colorRamp
    const colorOf = (count) => {
      if (count === 0) return this.opts.emptyColor || (this.opts.theme === 'dark' ? '#0f172a' : '#f8fafc')
      const t = maxCount > 0 ? count / maxCount : 0
      return rampColor(ramp, Math.pow(t, 0.5))
    }
    // 剪裁
    const clipId = uid()
    const defs = el('defs')
    const clip = el('clipPath', { id: clipId })
    clip.appendChild(el('rect', { x: plot.x, y: plot.y, width: plot.w, height: plot.h }))
    defs.appendChild(clip)
    this.svg.insertBefore(defs, this.svg.firstChild)
    // 六边形
    const g = el('g', { 'clip-path': `url(#${clipId})` })
    this.svg.appendChild(g)
    for (const h of hexes) {
      if (!this.opts.showEmpty && h.count === 0) continue
      const d = hexPath(h.cx, h.cy, hexR, 0)
      const path = el('path', {
        d,
        fill: colorOf(h.count),
        stroke: this.opts.hexStroke ? this.theme.hexStroke : 'none',
        'stroke-width': this.opts.hexStroke ? this.opts.hexStrokeWidth : 0,
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      path._meta = { hex: h, count: h.count, cx: h.cx, cy: h.cy, color: colorOf(h.count) }
      g.appendChild(path)
      this._hexEls.push(path)
      if (h.count > 0) {
        path.addEventListener('mouseenter', (e) => {
          this._hover = path
          this._applyHover()
          this._moveTip(e, h, bin)
        })
        path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, h, bin) })
        path.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        path.addEventListener('click', (e) => { if (this.opts.onHexClick) this.opts.onHexClick(h, h.points, e) })
      }
    }
    // 图例
    if (this.opts.legend) {
      this._renderLegend(ramp, maxCount, W, H)
    }
    if (animate) this._animate()
    return this
  }
  _renderLegend(ramp, maxCount, W, H) {
    const lg = el('g')
    const steps = this.opts.legendSteps
    const cellW = 14
    const cellH = 12
    const legendW = steps * (cellW + 2)
    const lx = W - this.opts.padding.right - legendW - 40
    const ly = H - 20
    const t0 = el('text', { x: lx - 8, y: ly + cellH - 2, 'text-anchor': 'end', 'font-size': 10.5, fill: this.theme.textMuted })
    t0.textContent = '少'
    lg.appendChild(t0)
    for (let k = 0; k < steps; k++) {
      const t = k / (steps - 1 || 1)
      const color = rampColor(ramp, t)
      lg.appendChild(el('rect', {
        x: lx + k * (cellW + 2), y: ly,
        width: cellW, height: cellH, rx: 2,
        fill: color,
        stroke: this.theme.hexStroke, 'stroke-width': 0.5,
      }))
    }
    const t1 = el('text', { x: lx + legendW + 4, y: ly + cellH - 2, 'text-anchor': 'start', 'font-size': 10.5, fill: this.theme.textMuted })
    t1.textContent = '多'
    lg.appendChild(t1)
    // 最大值
    const t2 = el('text', {
      x: W - this.opts.padding.right,
      y: ly + cellH - 2,
      'text-anchor': 'end', 'font-size': 10.5, fill: this.theme.textMuted,
    })
    t2.textContent = `最大 ${maxCount} 点`
    lg.appendChild(t2)
    this.svg.appendChild(lg)
  }
  _applyHover() {
    const hot = this._hover
    for (const h of this._hexEls) {
      const isHot = h === hot
      h.style.filter = isHot ? 'brightness(1.15)' : ''
      h.style.opacity = (hot && !isHot) ? '0.55' : '1'
      h.setAttribute('stroke-width', isHot ? '2' : String(this.opts.hexStroke ? this.opts.hexStrokeWidth : 0))
      h.setAttribute('stroke', isHot ? this.theme.text : this.theme.hexStroke)
    }
  }
  _moveTip(e, hex, bin) {
    if (!this.tip) return
    const { xScale, yScale, plot, hexR } = bin
    // 六边形中心对应的数据坐标
    const dvx = xScale.min + ((hex.cx - plot.x) / plot.w) * (xScale.max - xScale.min)
    const dvy = yScale.min + ((plot.y + plot.h - hex.cy) / plot.h) * (yScale.max - yScale.min)
    let html
    if (this.opts.tooltipFormat) {
      html = this.opts.tooltipFormat({ count: hex.count, x: dvx, y: dvy, points: hex.points })
    } else {
      html = `
        <div style="font-weight:600;margin-bottom:4px">${hex.count} 个点</div>
        <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:11.5px">
          <span style="opacity:.7">中心 X</span><span style="text-align:right">${fmt(dvx)}</span>
          <span style="opacity:.7">中心 Y</span><span style="text-align:right">${fmt(dvy)}</span>
        </div>
      `
    }
    this.tip.innerHTML = html
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const mx = e.clientX - r.left, my = e.clientY - r.top
    let left = mx + 14, top = my - th - 12
    if (left + tw > r.width - 4) left = mx - tw - 14
    if (top < 0) top = my + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover({ count: hex.count, x: dvx, y: dvy, points: hex.points })
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._hexEls.map((h, i) => {
      const m = h._meta
      return { el: h, cx: m.cx, cy: m.cy, delay: (i * stagger) / duration }
    })
    targets.forEach(tg => {
      tg.el.setAttribute('transform', `translate(${tg.cx} ${tg.cy}) scale(0.01) translate(${-tg.cx} ${-tg.cy})`)
      tg.el.style.opacity = '0'
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const scale = 0.01 + 0.99 * e
        tg.el.setAttribute('transform', scale >= 0.999 ? '' : `translate(${tg.cx} ${tg.cy}) scale(${scale}) translate(${-tg.cx} ${-tg.cy})`)
        tg.el.style.opacity = String(e)
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => { tg.el.removeAttribute('transform'); tg.el.style.opacity = '1' })
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
export default HexbinChart
