// @xunay/kit/charts/chord —— 和弦图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'ch-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Number(v).toFixed(2)).replace(/\.00$/, '')
}
function arcPath(cx, cy, rO, rI, a0, a1) {
  const large = (a1 - a0) > Math.PI ? 1 : 0
  const x0o = cx + rO * Math.cos(a0), y0o = cy + rO * Math.sin(a0)
  const x1o = cx + rO * Math.cos(a1), y1o = cy + rO * Math.sin(a1)
  const x0i = cx + rI * Math.cos(a1), y0i = cy + rI * Math.sin(a1)
  const x1i = cx + rI * Math.cos(a0), y1i = cy + rI * Math.sin(a0)
  return `M ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${rO} ${rO} 0 ${large} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} L ${x0i.toFixed(2)} ${y0i.toFixed(2)} A ${rI} ${rI} 0 ${large} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)} Z`
}
function chordPath(cx, cy, r, a0, a1, b0, b1) {
  // 起点弧 a0→a1，贝塞尔到 b1，目标弧 b1→b0，贝塞尔回 a0
  const x1 = cx + r * Math.cos(a0), y1 = cy + r * Math.sin(a0)
  const x2 = cx + r * Math.cos(a1), y2 = cy + r * Math.sin(a1)
  const x3 = cx + r * Math.cos(b1), y3 = cy + r * Math.sin(b1)
  const x4 = cx + r * Math.cos(b0), y4 = cy + r * Math.sin(b0)
  // 弧跨角判断
  const la1 = Math.abs(a1 - a0) > Math.PI ? 1 : 0
  const la2 = Math.abs(b1 - b0) > Math.PI ? 1 : 0
  return 'M ' + x1.toFixed(2) + ' ' + y1.toFixed(2)
       + ' A ' + r + ' ' + r + ' 0 ' + la1 + ' 1 ' + x2.toFixed(2) + ' ' + y2.toFixed(2)
       + ' Q ' + cx + ' ' + cy + ' ' + x3.toFixed(2) + ' ' + y3.toFixed(2)
       + ' A ' + r + ' ' + r + ' 0 ' + la2 + ' 1 ' + x4.toFixed(2) + ' ' + y4.toFixed(2)
       + ' Q ' + cx + ' ' + cy + ' ' + x1.toFixed(2) + ' ' + y1.toFixed(2)
       + ' Z'
}

export class ChordChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Chord] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 480, padding: 60,
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      innerRadius: 0.72,
      padAngle: 0.02,
      arcOpacity: 0.9,
      chordOpacity: 0.65,
      labelFontSize: 12,
      showLabels: true,
      labelRadius: 1.06,
      tooltip: true,
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 25 },
      onHover: null, onChordClick: null, onArcClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._labels = []
    this._matrix = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._chordEls = []
    this._arcEls = []
    this._build()
    if (options.matrix || options.labels) this.setData(options)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8', arcStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b', arcStroke: '#fff',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 480))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(input) {
    // 支持：
    //   { labels: ['A','B','C'], matrix: [[0,1,2],[3,0,4],[5,6,0]] }
    //   { labels: ['A','B','C'], data: [{source, target, value}] }
    if (input.matrix) {
      this._labels = input.labels || input.matrix.map((_, i) => 'Node ' + (i + 1))
      this._matrix = input.matrix.map(row => row.slice())
    } else if (input.data) {
      const set = new Set()
      for (const d of input.data) { set.add(d.source); set.add(d.target) }
      this._labels = input.labels || Array.from(set)
      const n = this._labels.length
      const map = new Map(this._labels.map((l, i) => [l, i]))
      this._matrix = Array.from({ length: n }, () => new Array(n).fill(0))
      for (const d of input.data) {
        this._matrix[map.get(d.source)][map.get(d.target)] += d.value
      }
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
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H
    this.svg.innerHTML = ''
    this._chordEls = []
    this._arcEls = []
    const n = this._labels.length
    if (!n) return
    const cx = W / 2, cy = H / 2
    const rMax = Math.max(20, Math.min(W, H) / 2 - this.opts.padding)
    const rO = rMax
    const rI = rMax * this.opts.innerRadius
    const startA = -Math.PI / 2
    const fullSweep = Math.PI * 2
    // 计算每个节点总流量（出 + 入）
    const totals = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        totals[i] += this._matrix[i][j]
        if (i !== j) totals[j] += this._matrix[i][j]
      }
    }
    const grand = totals.reduce((a, b) => a + b, 0) || 1
    // 分配角度
    const padA = this.opts.padAngle
    const usedSweep = fullSweep - padA * n
    const groups = []
    let angle = startA
    for (let i = 0; i < n; i++) {
      const span = (totals[i] / grand) * usedSweep
      groups.push({ i, a0: angle, a1: angle + span, total: totals[i] })
      angle += span + padA
    }
    // 每个节点内部子分段（出去 / 进入）
    // 出弧的位置
    for (const g of groups) {
      g.outSegs = []
      g.inSegs = []
      let a = g.a0
      // 先排出（row i 到其他节点）
      for (let j = 0; j < n; j++) {
        if (g.i === j) continue
        const v = this._matrix[g.i][j]
        if (v <= 0) continue
        const span = (v / grand) * usedSweep
        g.outSegs.push({ to: j, v, a0: a, a1: a + span })
        a += span
      }
      // 再排入
      for (let j = 0; j < n; j++) {
        if (g.i === j) continue
        const v = this._matrix[j][g.i]
        if (v <= 0) continue
        const span = (v / grand) * usedSweep
        g.inSegs.push({ from: j, v, a0: a, a1: a + span })
        a += span
      }
    }
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 和弦层（先画，让外弧盖在上面）
    const chordLayer = el('g')
    this.svg.appendChild(chordLayer)
    // 和弦带：对每对 (i,j) 且 i<j，画双向带
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const aij = this._matrix[i][j]
        const aji = this._matrix[j][i]
        if (aij <= 0 && aji <= 0) continue
        const gi = groups[i], gj = groups[j]
        // 从 i 出发到 j 的段
        const segIJ = aij > 0 ? gi.outSegs.find(s => s.to === j) : null
        const segJI = aji > 0 ? gj.outSegs.find(s => s.to === i) : null
        // 从 j 进入 i 的段
        const segIJin = aij > 0 ? gj.inSegs.find(s => s.from === i) : null
        const segJIin = aji > 0 ? gi.inSegs.find(s => s.from === j) : null
        // 单条带（i→j 和 j→i 分别画）
        if (segIJ && segIJin) {
          const path = el('path', {
            d: chordPath(cx, cy, rI, segIJ.a0, segIJ.a1, segIJin.a0, segIJin.a1),
            fill: this.opts.colors[i % this.opts.colors.length],
            'fill-opacity': this.opts.chordOpacity,
            stroke: 'none',
            style: 'cursor:pointer;transition:fill-opacity .15s',
          })
          path._meta = { source: i, target: j, value: aij, direction: 'i2j' }
          chordLayer.appendChild(path)
          this._chordEls.push(path)
          path.addEventListener('mouseenter', (e) => { this._hover = path; this._applyHover(); this._moveTip(e, i, j, aij) })
          path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, i, j, aij) })
          path.addEventListener('mouseleave', () => { this._hover = null; this._applyHover(); if (this.tip) this.tip.style.opacity = '0'; if (this.opts.onHover) this.opts.onHover(null) })
          path.addEventListener('click', (e) => { if (this.opts.onChordClick) this.opts.onChordClick({ source: this._labels[i], target: this._labels[j], value: aij, sourceIndex: i, targetIndex: j }, e) })
        }
        if (segJI && segJIin) {
          const path = el('path', {
            d: chordPath(cx, cy, rI, segJI.a0, segJI.a1, segJIin.a0, segJIin.a1),
            fill: this.opts.colors[j % this.opts.colors.length],
            'fill-opacity': this.opts.chordOpacity,
            stroke: 'none',
            style: 'cursor:pointer;transition:fill-opacity .15s',
          })
          path._meta = { source: j, target: i, value: aji, direction: 'j2i' }
          chordLayer.appendChild(path)
          this._chordEls.push(path)
          path.addEventListener('mouseenter', (e) => { this._hover = path; this._applyHover(); this._moveTip(e, j, i, aji) })
          path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, j, i, aji) })
          path.addEventListener('mouseleave', () => { this._hover = null; this._applyHover(); if (this.tip) this.tip.style.opacity = '0'; if (this.opts.onHover) this.opts.onHover(null) })
          path.addEventListener('click', (e) => { if (this.opts.onChordClick) this.opts.onChordClick({ source: this._labels[j], target: this._labels[i], value: aji, sourceIndex: j, targetIndex: i }, e) })
        }
      }
    }
    // 外弧层
    const arcLayer = el('g')
    this.svg.appendChild(arcLayer)
    for (const g of groups) {
      const color = this.opts.colors[g.i % this.opts.colors.length]
      const arc = el('path', {
        d: arcPath(cx, cy, rO, rI, g.a0, g.a1),
        fill: color,
        stroke: this.theme.arcStroke,
        'stroke-width': 1.5,
        'fill-opacity': this.opts.arcOpacity,
        style: 'cursor:pointer;transition:filter .15s',
      })
      arc._meta = { node: g.i, color, a0: g.a0, a1: g.a1 }
      arcLayer.appendChild(arc)
      this._arcEls.push(arc)
      arc.addEventListener('mouseenter', () => {
        this._hover = arc
        this._applyHover()
        if (this.tip) {
          const inFlow = this._matrix.reduce((a, row, k) => k === g.i ? a : a + row[g.i], 0)
          const outFlow = this._matrix[g.i].reduce((a, v, k) => k === g.i ? a : a + v, 0)
          this.tip.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
              <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
              <strong>${this._labels[g.i]}</strong>
            </div>
            <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
              <span style="opacity:.7">流出</span><span style="text-align:right">${fmt(outFlow)}</span>
              <span style="opacity:.7">流入</span><span style="text-align:right">${fmt(inFlow)}</span>
              <span style="opacity:.7">总量</span><span style="text-align:right">${fmt(g.total)}</span>
            </div>
          `
          this.tip.style.opacity = '1'
        }
        if (this.opts.onHover) this.opts.onHover({ type: 'node', index: g.i, label: this._labels[g.i], total: g.total })
      })
      arc.addEventListener('mousemove', (e) => {
        if (this._hover !== arc) return
        const r = this.wrap.getBoundingClientRect()
        const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
        const mx = e.clientX - r.left, my = e.clientY - r.top
        let left = mx + 14, top = my - th - 10
        if (left + tw > r.width - 4) left = mx - tw - 14
        if (top < 0) top = my + 14
        this.tip.style.left = left + 'px'
        this.tip.style.top = top + 'px'
      })
      arc.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      arc.addEventListener('click', (e) => { if (this.opts.onArcClick) this.opts.onArcClick({ index: g.i, label: this._labels[g.i], total: g.total }, e) })
    }
    // 标签
    if (this.opts.showLabels) {
      const labelLayer = el('g')
      this.svg.appendChild(labelLayer)
      for (const g of groups) {
        const mid = (g.a0 + g.a1) / 2
        const lr = rO * this.opts.labelRadius
        const lx = cx + Math.cos(mid) * lr
        const ly = cy + Math.sin(mid) * lr
        let anchor = 'middle'
        if (Math.abs(Math.cos(mid)) > 0.3) anchor = Math.cos(mid) > 0 ? 'start' : 'end'
        const t = el('text', {
          x: lx, y: ly + 4,
          'text-anchor': anchor,
          'dominant-baseline': 'middle',
          'font-size': this.opts.labelFontSize,
          'font-weight': 500,
          fill: this.theme.text,
          style: 'pointer-events:none;user-select:none',
        })
        t.textContent = this._labels[g.i]
        labelLayer.appendChild(t)
      }
    }
    if (animate) this._animate(groups, cx, cy, rO, rI)
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._chordEls.forEach(c => { c.setAttribute('fill-opacity', this.opts.chordOpacity); c.style.filter = '' })
      this._arcEls.forEach(a => { a.style.filter = ''; a.setAttribute('fill-opacity', this.opts.arcOpacity) })
      return
    }
    const m = hot._meta
    if (m.source != null) {
      // 命中和弦：只高亮此和弦 + 两端弧
      this._chordEls.forEach(c => {
        const cm = c._meta
        const related = c === hot || (cm.source === m.source && cm.target === m.target) || (cm.source === m.target && cm.target === m.source)
        c.setAttribute('fill-opacity', related ? 0.95 : 0.08)
        c.style.filter = c === hot ? 'brightness(1.1)' : ''
      })
      this._arcEls.forEach(a => {
        const am = a._meta
        a.style.filter = (am.node === m.source || am.node === m.target) ? 'brightness(1.15)' : ''
        a.setAttribute('fill-opacity', (am.node === m.source || am.node === m.target) ? 1 : 0.3)
      })
    } else {
      // 命中弧：高亮与此节点相关的所有和弦
      const node = m.node
      this._chordEls.forEach(c => {
        const cm = c._meta
        const related = cm.source === node || cm.target === node
        c.setAttribute('fill-opacity', related ? 0.9 : 0.05)
        c.style.filter = ''
      })
      this._arcEls.forEach(a => {
        const am = a._meta
        a.style.filter = am.node === node ? 'brightness(1.15)' : ''
        a.setAttribute('fill-opacity', am.node === node ? 1 : 0.3)
      })
    }
  }
  _moveTip(e, i, j, v) {
    if (!this.tip) return
    const color = this.opts.colors[i % this.opts.colors.length]
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${this._labels[i]} → ${this._labels[j]}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">流量</span>
        <strong>${fmt(v)}</strong>
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const mx = e.clientX - r.left, my = e.clientY - r.top
    let left = mx + 14, top = my - th - 10
    if (left + tw > r.width - 4) left = mx - tw - 14
    if (top < 0) top = my + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover({ type: 'chord', source: this._labels[i], target: this._labels[j], value: v })
  }
  _animate(groups, cx, cy, rO, rI) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    // 记录每个和弦和弧的最终路径
    const chordTargets = this._chordEls.map((c, i) => ({ el: c, d: c.getAttribute('d'), delay: i * stagger / duration, opacity: c.getAttribute('fill-opacity') }))
    const arcTargets = this._arcEls.map((a, i) => ({ el: a, meta: a._meta, delay: i * stagger / duration }))
    chordTargets.forEach(t => { t.el.style.opacity = '0' })
    arcTargets.forEach(t => {
      const m = t.meta
      t.el.setAttribute('d', arcPath(cx, cy, rO, rI, m.a0, m.a0 + 0.001))
      t.el.style.opacity = '0'
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      arcTargets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const m = tg.meta
        const a1 = m.a0 + (m.a1 - m.a0) * e
        tg.el.setAttribute('d', arcPath(cx, cy, rO, rI, m.a0, a1))
        tg.el.style.opacity = String(e)
      })
      chordTargets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        tg.el.style.opacity = String(ease(tt) * 0.9)
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        arcTargets.forEach(tg => { const m = tg.meta; tg.el.setAttribute('d', arcPath(cx, cy, rO, rI, m.a0, m.a1)); tg.el.style.opacity = '1' })
        chordTargets.forEach(tg => { tg.el.setAttribute('d', tg.d); tg.el.style.opacity = '1' })
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
export default ChordChart
