// @xunay/kit/charts/voronoi —— 泰森多边形图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'vo-' + (++_uid).toString(36)

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
// Sutherland-Hodgman 半平面裁剪：保留 ax+by+c <= 0 的部分
function clipHalfPlane(polygon, a, b, c) {
  if (!polygon.length) return polygon
  const out = []
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const cur = polygon[i]
    const next = polygon[(i + 1) % n]
    const curVal = a * cur.x + b * cur.y + c
    const nextVal = a * next.x + b * next.y + c
    const curIn = curVal <= 0
    const nextIn = nextVal <= 0
    if (curIn) out.push(cur)
    if (curIn !== nextIn) {
      const t = curVal / (curVal - nextVal)
      out.push({
        x: cur.x + t * (next.x - cur.x),
        y: cur.y + t * (next.y - cur.y),
      })
    }
  }
  return out
}
// 计算单个种子的 Voronoi 单元（用所有其他点做半平面裁剪）
function voronoiCell(site, others, bounds) {
  let poly = [
    { x: bounds.x, y: bounds.y },
    { x: bounds.x + bounds.w, y: bounds.y },
    { x: bounds.x + bounds.w, y: bounds.y + bounds.h },
    { x: bounds.x, y: bounds.y + bounds.h },
  ]
  for (const other of others) {
    // 半平面：所有离 site 更近的点
    // (other - site)·X <= (|other|² - |site|²) / 2
    const dx = other.x - site.x
    const dy = other.y - site.y
    const a = dx
    const b = dy
    const c = -((other.x * other.x + other.y * other.y) - (site.x * site.x + site.y * site.y)) / 2
    poly = clipHalfPlane(poly, a, b, c)
    if (!poly.length) break
  }
  return poly
}

export class VoronoiChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Voronoi] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 460,
      padding: 20,
      title: null, subtitle: null, theme: 'light',
      // 单元填充
      fillMode: 'value',       // 'value'（按值配色）| 'uniform'（统一色）
      colorRamp: ['#f0f9ff','#bae6fd','#38bdf8','#0284c7','#082f49'],
      colorRampDark: ['#082f49','#0284c7','#38bdf8','#bae6fd','#f0f9ff'],
      uniformColor: '#dbeafe',
      fillOpacity: 0.75,
      // 边
      showEdges: true,
      edgeColor: null,
      edgeWidth: 1.5,
      hoverEdgeWidth: 2.5,
      // 种子点
      showSites: true,
      siteRadius: 3.5,
      siteRadiusHover: 7,
      siteColor: null,
      // 标签（可选，用点的 label）
      showLabels: false,
      labelMinArea: 2000,
      labelFontSize: 11,
      labelMaxChars: 8,
      // 数值标签
      showValues: false,
      valueFormat: fmt,
      valuePosition: 'site',   // 'site' | 'centroid'
      // 图例
      legend: true,
      legendSteps: 5,
      // 交互
      tooltip: true,
      dimOpacity: 0.15,
      // 动画
      animation: { duration: 600, easing: 'easeOutCubic', stagger: 6 },
      onHover: null,
      onCellClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._points = []
    this._cells = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._cellEls = []
    this._siteEls = []
    this._build()
    if (options.data || options.points) this.setData(options.data || options.points)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      edge: '#0a0e17', site: '#f8fafc', siteStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      edge: '#ffffff', site: '#1f2937', siteStroke: '#ffffff',
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
    let pts = []
    if (Array.isArray(data)) {
      pts = data.map((d, i) => {
        if (Array.isArray(d)) return { x: +d[0], y: +d[1], value: 1, label: String(i) }
        return {
          x: +(d.x ?? 0),
          y: +(d.y ?? 0),
          value: +(d.value ?? 1),
          label: d.label != null ? String(d.label) : (d.name != null ? String(d.name) : String(i)),
          color: d.color,
        }
      })
    }
    this._points = pts.filter(p => isFinite(p.x) && isFinite(p.y))
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
    this._cellEls = []
    this._siteEls = []
    this._cells = []
    if (!this._points.length) return
    // 值范围
    const values = this._points.map(p => p.value).filter(v => isFinite(v))
    const vMin = values.length ? Math.min(...values) : 0
    const vMax = values.length ? Math.max(...values) : 1
    const span = vMax - vMin || 1
    // 布局：数据坐标 -> 画布坐标
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity
    for (const p of this._points) {
      if (p.x < xMin) xMin = p.x
      if (p.x > xMax) xMax = p.x
      if (p.y < yMin) yMin = p.y
      if (p.y > yMax) yMax = p.y
    }
    const dRangeX = xMax - xMin || 1
    const dRangeY = yMax - yMin || 1
    const plot = {
      x: pad, y: pad,
      w: W - pad * 2,
      h: H - pad * 2,
    }
    // 保持数据比例
    const aspect = dRangeX / dRangeY
    let actualW = plot.w, actualH = plot.h
    if (aspect > plot.w / plot.h) {
      actualH = plot.w / aspect
    } else {
      actualW = plot.h * aspect
    }
    const offsetX = plot.x + (plot.w - actualW) / 2
    const offsetY = plot.y + (plot.h - actualH) / 2
    const tx = v => offsetX + ((v - xMin) / dRangeX) * actualW
    const ty = v => offsetY + actualH - ((v - yMin) / dRangeY) * actualH
    const bounds = { x: offsetX, y: offsetY, w: actualW, h: actualH }
    // 计算画布坐标
    const sites = this._points.map((p, i) => ({
      ...p,
      cx: tx(p.x),
      cy: ty(p.y),
      _index: i,
    }))
    // Voronoi 计算
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i]
      const others = sites.filter((_, j) => j !== i)
      const cell = voronoiCell({ x: site.cx, y: site.cy }, others, bounds)
      this._cells.push({ site, polygon: cell, index: i })
    }
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    const ramp = this.opts.theme === 'dark' ? this.opts.colorRampDark : this.opts.colorRamp
    const colorOf = (p) => {
      if (p.color) return p.color
      if (this.opts.fillMode === 'uniform') return this.opts.uniformColor
      const t = (p.value - vMin) / span
      return rampColor(ramp, t)
    }
    // 逐 cell 渲染
    const cellG = el('g')
    this.svg.appendChild(cellG)
    for (const c of this._cells) {
      if (!c.polygon.length) continue
      const color = colorOf(c.site)
      const d = 'M ' + c.polygon.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ') + ' Z'
      const path = el('path', {
        d,
        fill: color,
        'fill-opacity': this.opts.fillOpacity,
        stroke: this.opts.edgeColor || this.theme.edge,
        'stroke-width': this.opts.showEdges ? this.opts.edgeWidth : 0,
        'stroke-linejoin': 'round',
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      path._meta = c
      cellG.appendChild(path)
      this._cellEls.push(path)
      // 标签
      if (this.opts.showLabels || this.opts.showValues) {
        // 计算 cell 质心
        let sx = 0, sy = 0
        for (const p of c.polygon) { sx += p.x; sy += p.y }
        const centroid = { x: sx / c.polygon.length, y: sy / c.polygon.length }
        // 面积估算
        let area = 0
        for (let k = 0; k < c.polygon.length; k++) {
          const a = c.polygon[k]
          const b = c.polygon[(k + 1) % c.polygon.length]
          area += a.x * b.y - b.x * a.y
        }
        area = Math.abs(area) / 2
        if (area > this.opts.labelMinArea) {
          const lines = []
          if (this.opts.showLabels) lines.push(c.site.label)
          if (this.opts.showValues) lines.push(this.opts.valueFormat(c.site.value))
          const lx = this.opts.valuePosition === 'site' ? c.site.cx : centroid.x
          const ly = this.opts.valuePosition === 'site' ? c.site.cy : centroid.y
          // 有种子点时，标签上移
          const siteOffset = (this.opts.showSites && this.opts.valuePosition === 'site') ? -12 : 0
          lines.forEach((line, k) => {
            const t = el('text', {
              x: lx,
              y: ly + (k === 0 && lines.length > 1 ? -6 + siteOffset : (k === 1 ? 12 + siteOffset : 4 + siteOffset)),
              'text-anchor': 'middle',
              'font-size': this.opts.labelFontSize,
              'font-weight': 600,
              fill: this.theme.text,
              style: 'pointer-events:none;user-select:none',
            })
            const maxChars = this.opts.labelMaxChars
            t.textContent = line.length > maxChars ? line.slice(0, maxChars - 1) + '…' : line
            cellG.appendChild(t)
          })
        }
      }
    }
    // 种子点
    if (this.opts.showSites) {
      const siteG = el('g', { style: 'pointer-events:none' })
      this.svg.appendChild(siteG)
      for (const site of sites) {
        const circle = el('circle', {
          cx: site.cx, cy: site.cy, r: this.opts.siteRadius,
          fill: this.opts.siteColor || this.theme.site,
          stroke: this.theme.siteStroke,
          'stroke-width': 1.5,
        })
        circle._meta = site
        siteG.appendChild(circle)
        this._siteEls.push(circle)
      }
    }
    // 图例
    if (this.opts.legend && this.opts.fillMode === 'value') {
      this._renderLegend(ramp, vMin, vMax, W, H)
    }
    // 全局 SVG 鼠标事件（用最近种子点判定，避免 viewBox 缩放导致的偏移）
    this._bindGlobalHover()
    if (animate) this._animate()
    return this
  }

  _bindGlobalHover() {
    if (this._hoverBound && this._hoverBoundSvg === this.svg) return
    // 换 SVG 时（每次 render 会重建 svg 元素？不，svg 是持久的）
    // 首次绑定
    if (this._hoverBound) return
    this._hoverBound = true
    this._hoverBoundSvg = this.svg

    const svg = this.svg
    let rafId = 0

    const toSvgCoords = (e) => {
      const ctm = svg.getScreenCTM()
      if (!ctm) return null
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const p = pt.matrixTransform(ctm.inverse())
      return { x: p.x, y: p.y }
    }

    const findNearest = (p) => {
      let best = null, bestD = Infinity
      for (const c of this._cells) {
        const dx = c.site.cx - p.x
        const dy = c.site.cy - p.y
        const d = dx * dx + dy * dy
        if (d < bestD) { bestD = d; best = c }
      }
      return best
    }

    const onMove = (e) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        const p = toSvgCoords(e)
        if (!p) return
        const cell = findNearest(p)
        if (!cell) return
        const idx = this._cells.indexOf(cell)
        const path = this._cellEls[idx]
        if (path !== this._hover) {
          this._hover = path
          this._applyHover()
        }
        this._moveTip(e, cell.site)
      })
    }

    const onLeave = () => {
      this._hover = null
      this._applyHover()
      if (this.tip) this.tip.style.opacity = '0'
      if (this.opts.onHover) this.opts.onHover(null)
    }

    const onClick = (e) => {
      const p = toSvgCoords(e)
      if (!p) return
      const cell = findNearest(p)
      if (cell && this.opts.onCellClick) {
        this.opts.onCellClick(cell.site, cell.index, e)
      }
    }

    svg.addEventListener('mousemove', onMove)
    svg.addEventListener('mouseleave', onLeave)
    svg.addEventListener('click', onClick)
  }
  _renderLegend(ramp, vMin, vMax, W, H) {
    const lg = el('g')
    const steps = this.opts.legendSteps
    const cellW = 22
    const cellH = 10
    const legendW = steps * cellW
    const lx = W - this.opts.padding - legendW - 30
    const ly = H - this.opts.padding - cellH - 4
    for (let k = 0; k < steps; k++) {
      const t = k / (steps - 1 || 1)
      const color = rampColor(ramp, t)
      lg.appendChild(el('rect', {
        x: lx + k * cellW, y: ly,
        width: cellW, height: cellH,
        fill: color,
        'fill-opacity': this.opts.fillOpacity,
      }))
    }
    const t0 = el('text', { x: lx - 6, y: ly + cellH - 2, 'text-anchor': 'end', 'font-size': 10.5, fill: this.theme.textMuted })
    t0.textContent = fmt(vMin)
    lg.appendChild(t0)
    const t1 = el('text', { x: lx + legendW + 4, y: ly + cellH - 2, 'text-anchor': 'start', 'font-size': 10.5, fill: this.theme.textMuted })
    t1.textContent = fmt(vMax)
    lg.appendChild(t1)
    this.svg.appendChild(lg)
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._cellEls.forEach(c => { c.style.filter = ''; c.style.opacity = '1'; c.setAttribute('stroke-width', String(this.opts.showEdges ? this.opts.edgeWidth : 0)) })
      this._siteEls.forEach(s => {
        s.setAttribute('r', String(this.opts.siteRadius))
        s.setAttribute('opacity', '1')
      })
      return
    }
    for (const c of this._cellEls) {
      const isHot = c === hot
      c.style.filter = isHot ? 'brightness(1.12)' : ''
      c.style.opacity = isHot ? '1' : String(this.opts.dimOpacity)
      c.setAttribute('stroke-width', String(isHot ? this.opts.hoverEdgeWidth : (this.opts.showEdges ? this.opts.edgeWidth : 0)))
    }
    const hotIdx = hot._meta.index
    this._siteEls.forEach(s => {
      const isHot = s._meta._index === hotIdx
      s.setAttribute('r', String(isHot ? this.opts.siteRadiusHover : this.opts.siteRadius))
      s.setAttribute('opacity', isHot ? '1' : '0.35')
    })
  }
  _moveTip(e, site) {
    if (!this.tip) return
    this.tip.innerHTML = `
      <div style="font-weight:600;margin-bottom:5px">${site.label}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">X</span><span style="text-align:right;font-variant-numeric:tabular-nums">${fmt(site.x)}</span>
        <span style="opacity:.7">Y</span><span style="text-align:right;font-variant-numeric:tabular-nums">${fmt(site.y)}</span>
        <span style="opacity:.7">值</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(site.value)}</span>
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
    if (this.opts.onHover) this.opts.onHover(site)
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._cellEls.map((c, i) => {
      const m = c._meta
      const cx = m.site.cx, cy = m.site.cy
      return { el: c, cx, cy, delay: i * stagger / duration }
    })
    targets.forEach(tg => {
      tg.el.setAttribute('transform', `translate(${tg.cx} ${tg.cy}) scale(0.01) translate(${-tg.cx} ${-tg.cy})`)
      tg.el.style.opacity = '0'
    })
    this._siteEls.forEach(s => s.setAttribute('r', '0'))
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
      this._siteEls.forEach(s => s.setAttribute('r', String(this.opts.siteRadius * ease(t))))
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => { tg.el.removeAttribute('transform'); tg.el.style.opacity = '1' })
        this._siteEls.forEach(s => s.setAttribute('r', String(this.opts.siteRadius)))
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
export default VoronoiChart
