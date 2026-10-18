// @xunay/kit/charts/stream —— 流图（主题河流）
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'st-' + (++_uid).toString(36)

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

export class StreamChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Stream] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 340,
      padding: { top: 24, right: 24, bottom: 36, left: 24 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      mode: 'smooth',           // 'smooth' | 'line'
      tension: 0.35,
      baseline: 'wiggle',       // 'wiggle' | 'silhouette' | 'zero' | 'expand'
      offset: 0.5,              // 'silhouette' 模式的对称度
      opacity: 0.85,
      strokeWidth: 0,
      showGrid: false,
      showAxis: true,
      xTicks: null,
      yTicks: 5,
      labels: [],
      showTooltip: true,
      legend: true,
      legendPosition: 'bottom',
      xFormat: v => String(v),
      yFormat: fmt,
      animation: { duration: 850, easing: 'easeOutCubic', stagger: 40 },
      onHover: null,
      onStreamClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._series = []
    this._labels = []
    this._hidden = new Set()
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._streamEls = []
    this._build()
    if (options.data || options.series) this.setData(options)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', crosshair: '#64748b',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', crosshair: '#94a3b8',
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
    if (this.opts.legend && this.opts.legendPosition === 'top') {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;margin-bottom:12px'
      c.appendChild(this.legendEl)
    }
    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'position:relative;width:100%'
    c.appendChild(this.wrap)
    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible;width:100%' })
    this.wrap.appendChild(this.svg)
    if (this.opts.legend && this.opts.legendPosition === 'bottom') {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-size:12.5px;margin-top:12px'
      c.appendChild(this.legendEl)
    }
    if (this.opts.showTooltip) {
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
  // 计算基线（各层底部）
  _computeOffsets(matrix) {
    const n = this._labels.length
    const m = this._series.length
    const baseline = this.opts.baseline
    // 各点总量
    const totals = new Array(n).fill(0)
    for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) totals[j] += matrix[i][j]
    // 基线数组（各点最低层底部）
    const b = new Array(n).fill(0)
    // 各层累积底部
    const offsets = Array.from({ length: m + 1 }, () => new Array(n).fill(0))

    if (baseline === 'zero') {
      for (let j = 0; j < n; j++) {
        let acc = 0
        for (let i = 0; i < m; i++) {
          offsets[i][j] = acc
          acc += matrix[i][j]
        }
        offsets[m][j] = acc
      }
      return offsets
    }
    if (baseline === 'expand') {
      // 归一化到 100%
      for (let j = 0; j < n; j++) {
        let acc = 0
        const t = totals[j] || 1
        for (let i = 0; i < m; i++) {
          offsets[i][j] = acc / t
          acc += matrix[i][j]
        }
        offsets[m][j] = acc / t
      }
      return offsets
    }
    if (baseline === 'silhouette') {
      // 居中：以总量的 50% 为中心，上下分层
      for (let j = 0; j < n; j++) {
        const half = totals[j] / 2
        let acc = -half
        for (let i = 0; i < m; i++) {
          offsets[i][j] = acc
          acc += matrix[i][j]
        }
        offsets[m][j] = acc
      }
      return offsets
    }
    // 'wiggle'：Byron & Wattenberg 算法，最小化斜率变化
    // 首尾基线为 0
    for (let i = 0; i < m; i++) {
      offsets[i][0] = 0
      offsets[i][n - 1] = 0
    }
    offsets[m][0] = totals[0]
    offsets[m][n - 1] = totals[n - 1]
    // 用第一个系列在中间的所有点做基线
    // 简化：按经典 wiggle 递推公式（数值求解较复杂，这里用近似）
    // 使用更实用的方法：对每个中间点，让 i+1 的底部 = i 的顶部 - 一半的增量
    for (let j = 1; j < n - 1; j++) {
      for (let i = 0; i < m; i++) {
        const topPrev = offsets[i][j - 1] + matrix[i][j - 1]
        const nextTop = offsets[i + 1] ? offsets[i + 1][j - 1] : 0
        offsets[i][j] = (offsets[i][j - 1] + topPrev - (offsets[i + 1] ? (offsets[i + 1][j - 1] - offsets[i][j - 1]) : 0)) / 2
      }
    }
    // 归一化最后把顶层设为总量
    for (let j = 0; j < n; j++) {
      let acc = offsets[0][j]
      for (let i = 0; i < m; i++) {
        offsets[i][j] = acc
        acc += matrix[i][j]
      }
      offsets[m][j] = acc
    }
    return offsets
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._streamEls = []
    const n = this._labels.length
    if (!n) return
    // 可见系列
    const visible = this._series.map((s, i) => ({ ...s, _i: i })).filter(s => !this._hidden.has(s._i))
    if (!visible.length) return
    // 矩阵
    const matrix = visible.map(s => s.data.map(d => Math.max(0, d.value || 0)))
    const offsets = this._computeOffsets(matrix)
    const nVis = visible.length
    // 值范围
    let vMin = Infinity, vMax = -Infinity
    for (let j = 0; j < n; j++) {
      if (offsets[0][j] < vMin) vMin = offsets[0][j]
      if (offsets[nVis][j] > vMax) vMax = offsets[nVis][j]
    }
    if (!isFinite(vMin)) { vMin = 0; vMax = 1 }
    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    const xOf = i => plot.x + (n <= 1 ? plot.w / 2 : (i / (n - 1)) * plot.w)
    const yOf = v => plot.y + plot.h - ((v - vMin) / (vMax - vMin)) * plot.h
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格
    if (this.opts.showGrid) {
      const g = el('g')
      for (let k = 0; k <= this.opts.yTicks; k++) {
        const t = k / this.opts.yTicks
        const v = vMin + (vMax - vMin) * t
        const y = yOf(v)
        g.appendChild(el('line', { x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
          stroke: this.theme.grid, 'stroke-width': 1, 'stroke-dasharray': '3 4' }))
        const tx = el('text', { x: plot.x - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: this.theme.textMuted })
        tx.textContent = this.opts.yFormat(v)
        g.appendChild(tx)
      }
      this.svg.appendChild(g)
    }
    // x 轴标签
    if (this.opts.showAxis) {
      const stride = this.opts.xTicks ? Math.max(1, Math.ceil(n / this.opts.xTicks)) : Math.max(1, Math.ceil(n / 8))
      for (let i = 0; i < n; i += stride) {
        const t = el('text', {
          x: xOf(i), y: plot.y + plot.h + 20,
          'text-anchor': 'middle', 'font-size': 11, fill: this.theme.textMuted,
        })
        t.textContent = this.opts.xFormat(this._labels[i])
        this.svg.appendChild(t)
      }
    }
    // 层
    const layer = el('g')
    this.svg.appendChild(layer)
    visible.forEach((s, vi) => {
      const top = offsets[vi + 1]
      const bot = offsets[vi]
      const topPts = []
      const botPts = []
      for (let j = 0; j < n; j++) {
        topPts.push({ x: xOf(j), y: yOf(top[j]) })
        botPts.push({ x: xOf(j), y: yOf(bot[j]) })
      }
      // 路径：顶从上到下，底从下到上
      let d
      const mode = this.opts.mode
      const tension = this.opts.tension
      const topPath = mode === 'smooth' ? smoothPath(topPts, tension) : linePath(topPts)
      const botPath = mode === 'smooth' ? smoothPath(botPts.slice().reverse(), tension) : linePath(botPts.slice().reverse())
      d = topPath + ' ' + botPath.replace(/^M/, 'L') + ' Z'
      const path = el('path', {
        d,
        fill: s.color,
        'fill-opacity': this.opts.opacity,
        stroke: this.opts.strokeWidth > 0 ? s.color : 'none',
        'stroke-width': this.opts.strokeWidth,
        'stroke-linejoin': 'round',
        style: 'cursor:pointer;transition:fill-opacity .15s,filter .15s',
      })
      path._meta = { series: s, index: vi, realIndex: s._i, top, bot, color: s.color }
      layer.appendChild(path)
      this._streamEls.push(path)
      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTip(e, path._meta)
      })
      path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, path._meta) })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => { if (this.opts.onStreamClick) this.opts.onStreamClick(s, s._i, e) })
    })
    // 悬停剖面层
    this.profileLayer = el('g', { style: 'pointer-events:none' })
    this.svg.appendChild(this.profileLayer)
    // 事件层：用来捕获剖面
    const layer2 = el('rect', {
      x: plot.x, y: plot.y, width: plot.w, height: plot.h,
      fill: 'transparent', style: 'cursor:crosshair',
    })
    this.svg.appendChild(layer2)
    const onMove = (e) => {
      const rect = this.svg.getBoundingClientRect()
      const scaleX = this.W / rect.width
      const mx = (e.clientX - rect.left) * scaleX
      let idx = n <= 1 ? 0 : Math.round((mx - plot.x) / (plot.w / (n - 1)))
      idx = Math.max(0, Math.min(n - 1, idx))
      // 显示垂直线
      this.profileLayer.innerHTML = ''
      this.profileLayer.appendChild(el('line', {
        x1: xOf(idx), x2: xOf(idx), y1: plot.y, y2: plot.y + plot.h,
        stroke: this.theme.crosshair, 'stroke-width': 1,
        'stroke-dasharray': '3 4', opacity: 0.6,
      }))
      // 剖面 tooltip
      if (this.tip) {
        const rows = []
        let total = 0
        for (let vi = 0; vi < visible.length; vi++) {
          const v = matrix[vi][idx]
          total += v
          rows.push(`<div style="display:flex;justify-content:space-between;gap:20px">
            <span style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${visible[vi].color}"></span>
              ${visible[vi].name}
            </span>
            <strong>${this.opts.yFormat(v)}</strong>
          </div>`)
        }
        this.tip.innerHTML = `
          <div style="font-weight:600;margin-bottom:5px">${this._labels[idx]}</div>
          ${rows.join('')}
          ${visible.length > 1 ? `<div style="display:flex;justify-content:space-between;gap:20px;border-top:1px solid rgba(255,255,255,.1);margin-top:4px;padding-top:4px"><span style="opacity:.8">总计</span><strong>${this.opts.yFormat(total)}</strong></div>` : ''}
        `
        this.tip.style.opacity = '1'
        const r = this.wrap.getBoundingClientRect()
        const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
        const my = e.clientY - r.top
        let left = (xOf(idx) / scaleX) + 14, top = my - th / 2
        if (left + tw > r.width - 4) left = (xOf(idx) / scaleX) - tw - 14
        if (top < 0) top = 4
        if (top + th > r.height) top = r.height - th - 4
        this.tip.style.left = left + 'px'
        this.tip.style.top = top + 'px'
        if (this.opts.onHover) {
          this.opts.onHover({ index: idx, label: this._labels[idx], total, series: visible.map((s, vi) => ({ series: s, value: matrix[vi][idx] })) })
        }
      }
    }
    const onLeave = () => {
      if (this.profileLayer) this.profileLayer.innerHTML = ''
      if (this.tip) this.tip.style.opacity = '0'
      if (this.opts.onHover) this.opts.onHover(null)
    }
    layer2.addEventListener('mousemove', onMove)
    layer2.addEventListener('mouseleave', onLeave)
    if (animate) this._animate(plot)
    this._renderLegend(visible)
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._streamEls.forEach(s => { s.setAttribute('fill-opacity', this.opts.opacity); s.style.filter = '' })
      return
    }
    for (const s of this._streamEls) {
      const isHot = s === hot
      s.setAttribute('fill-opacity', isHot ? 1 : 0.35)
      s.style.filter = isHot ? 'brightness(1.08)' : ''
    }
  }
  _moveTip(e, meta) {
    if (!this.tip) return
    // 层 hover 时，显示此层信息
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${meta.color}"></span>
        <strong>${meta.series.name}</strong>
      </div>
    `
    this.tip.style.opacity = '1'
  }
  _renderLegend(visible) {
    if (!this.legendEl) return
    this.legendEl.innerHTML = ''
    this._series.forEach((s, i) => {
      const hidden = this._hidden.has(i)
      const item = document.createElement('div')
      item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;opacity:${hidden ? 0.35 : 1};color:${this.theme.textMuted}`
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color}"></span><span>${s.name}</span>`
      item.onclick = () => {
        if (this._hidden.has(i)) this._hidden.delete(i)
        else this._hidden.add(i)
        this.render()
      }
      this.legendEl.appendChild(item)
    })
  }
  _animate(plot) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const baseline = plot.y + plot.h
    const targets = this._streamEls.map((s, i) => ({
      el: s, meta: s._meta, delay: i * stagger / duration,
    }))
    // 保存原始路径
    const origs = targets.map(t => t.el.getAttribute('d'))
    // 起始：全部塌陷到基线
    targets.forEach((tg, i) => {
      tg.el.setAttribute('fill-opacity', '0')
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach((tg, i) => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('fill-opacity', String(this.opts.opacity * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => tg.el.setAttribute('fill-opacity', String(this.opts.opacity)))
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
export default StreamChart
