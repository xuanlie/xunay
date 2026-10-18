// @xunay/kit/charts/waterfall —— 瀑布图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'wf-' + (++_uid).toString(36)

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
  const r = max - min, rough = r / count
  const exp = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / exp
  let s = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  s *= exp
  const nMin = Math.floor(min / s) * s, nMax = Math.ceil(max / s) * s
  const ticks = []
  for (let v = nMin; v <= nMax + s * 1e-6; v += s) ticks.push(Number(v.toFixed(10)))
  return { min: nMin, max: nMax, ticks }
}

export class WaterfallChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Waterfall] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 340,
      padding: { top: 24, right: 20, bottom: 48, left: 56 },
      title: null, subtitle: null, theme: 'light',
      increaseColor: '#10b981',
      decreaseColor: '#ef4444',
      totalColor: '#3b82f6',
      barWidth: 0.62, radius: 4,
      showValue: true,
      showConnector: true,
      connectorColor: null,
      grid: true, gridDash: '3 4', yTicks: 5,
      xFormat: v => String(v), yFormat: fmt,
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 60 },
      onHover: null, onBarClick: null,
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
      grid: '#1e293b', axis: '#334155', barStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', barStroke: '#fff',
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
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    this._data = (data || []).map((d, i) => ({
      label: d.label != null ? d.label : String(i),
      value: +d.value || 0,
      type: d.type || (i === 0 && d.isStart ? 'total' : (d.isTotal ? 'total' : (d.value >= 0 ? 'increase' : 'decrease'))),
    }))
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _computeBars() {
    // 计算每根的 bottom / top 值
    let acc = 0
    const bars = []
    for (const d of this._data) {
      const isTotal = d.type === 'total'
      let top, bot
      if (isTotal) {
        bot = 0; top = d.value
        acc = d.value
      } else {
        bot = acc
        acc += d.value
        top = acc
      }
      bars.push({ ...d, bot, top, isTotal })
    }
    return bars
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._barEls = []
    if (!this._data.length) return
    const bars = this._computeBars()
    const plot = { x: pad.left, y: pad.top, w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }
    // 范围
    let yMin = 0, yMax = 0
    for (const b of bars) {
      if (b.bot < yMin) yMin = b.bot
      if (b.top < yMin) yMin = b.top
      if (b.top > yMax) yMax = b.top
      if (b.bot > yMax) yMax = b.bot
    }
    const yScale = niceScale(yMin, yMax, this.opts.yTicks)
    const yOf = v => plot.y + plot.h - ((v - yScale.min) / (yScale.max - yScale.min)) * plot.h
    const slot = plot.w / bars.length
    const bw = slot * this.opts.barWidth
    const xOf = i => plot.x + slot * (i + 0.5)
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of yScale.ticks) {
        const y = yOf(tick)
        g.appendChild(el('line', { x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y, stroke: this.theme.grid, 'stroke-width': 1, 'stroke-dasharray': tick === 0 ? '0' : this.opts.gridDash }))
        const t = el('text', { x: plot.x - 10, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: this.theme.textMuted })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }
    this.svg.appendChild(el('line', { x1: plot.x, x2: plot.x, y1: plot.y, y2: plot.y + plot.h, stroke: this.theme.axis, 'stroke-width': 1 }))
    this.svg.appendChild(el('line', { x1: plot.x, x2: plot.x + plot.w, y1: yOf(0), y2: yOf(0), stroke: this.theme.axis, 'stroke-width': 1 }))
    // 连接线
    if (this.opts.showConnector) {
      for (let i = 0; i < bars.length - 1; i++) {
        const cur = bars[i]
        const next = bars[i + 1]
        const y = yOf(cur.isTotal ? cur.top : cur.top)
        const x1 = xOf(i) + bw / 2
        const x2 = xOf(i + 1) - bw / 2
        this.svg.appendChild(el('line', { x1, y1: y, x2, y2: y, stroke: this.opts.connectorColor || this.theme.axis, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.7 }))
      }
    }
    const g = el('g')
    this.svg.appendChild(g)
    bars.forEach((b, i) => {
      const color = b.isTotal ? this.opts.totalColor : (b.value >= 0 ? this.opts.increaseColor : this.opts.decreaseColor)
      const y1 = yOf(Math.max(b.bot, b.top))
      const y2 = yOf(Math.min(b.bot, b.top))
      const height = Math.max(1, y2 - y1)
      const x = xOf(i) - bw / 2
      const rect = el('rect', {
        x, y: y1, width: bw, height,
        rx: Math.min(this.opts.radius, bw / 2, height / 2),
        fill: color, stroke: this.theme.barStroke, 'stroke-width': 1,
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      rect._meta = { bar: b, index: i, color, x, y: y1, w: bw, h: height }
      g.appendChild(rect)
      this._barEls.push(rect)
      if (this.opts.showValue) {
        const ty = b.isTotal || b.value >= 0 ? y1 - 6 : y2 + 14
        const t = el('text', { x: xOf(i), y: ty, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: this.theme.text })
        t.textContent = (b.isTotal ? '' : b.value > 0 ? '+' : '') + this.opts.yFormat(b.value)
        g.appendChild(t)
      }
      rect.addEventListener('mouseenter', (e) => {
        this._hover = rect
        this._applyHover()
        this._moveTip(e, b)
      })
      rect.addEventListener('mousemove', (e) => { if (this._hover === rect) this._moveTip(e, b) })
      rect.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      rect.addEventListener('click', (e) => { if (this.opts.onBarClick) this.opts.onBarClick(b, i, e) })
    })
    // x 轴标签
    const xg = el('g')
    for (let i = 0; i < bars.length; i++) {
      const t = el('text', { x: xOf(i), y: plot.y + plot.h + 22, 'text-anchor': 'middle', 'font-size': 11, fill: this.theme.textMuted })
      t.textContent = this.opts.xFormat(bars[i].label)
      xg.appendChild(t)
    }
    this.svg.appendChild(xg)
    if (animate) this._animate(bars, yOf)
    return this
  }
  _applyHover() {
    for (const r of this._barEls) {
      const hot = r === this._hover
      r.style.filter = hot ? 'brightness(1.15)' : ''
      r.style.opacity = this._hover ? (hot ? '1' : '0.55') : '1'
    }
  }
  _moveTip(e, b) {
    if (!this.tip) return
    const color = b.isTotal ? this.opts.totalColor : (b.value >= 0 ? this.opts.increaseColor : this.opts.decreaseColor)
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${b.label}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">${b.isTotal ? '总计' : '变化'}</span>
        <strong>${b.isTotal ? '' : b.value > 0 ? '+' : ''}${fmt(b.value)}</strong>
      </div>
      ${!b.isTotal ? `<div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">累计</span>
        <strong>${fmt(b.top)}</strong>
      </div>` : ''}
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const cx = e.clientX - r.left, cy = e.clientY - r.top
    let left = cx + 14, top = cy - th / 2
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = 4
    if (top + th > r.height) top = r.height - th - 4
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover(b)
  }
  _animate(bars, yOf) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const zeroY = yOf(0)
    this._barEls.forEach(r => { r.setAttribute('height', '0'); r.setAttribute('y', String(zeroY)) })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      this._barEls.forEach((r, i) => {
        const tt = Math.max(0, Math.min(1, (t - i * stagger / duration) / (1 - i * stagger / duration || 1)))
        const e = ease(tt)
        const meta = r._meta
        const targetY = meta.y
        const targetH = meta.h
        const cy = targetY + targetH / 2
        r.setAttribute('y', String(meta.y))
        r.setAttribute('height', String(targetH * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else { this._barEls.forEach(r => { r.setAttribute('y', String(r._meta.y)); r.setAttribute('height', String(r._meta.h)) }); this._cancelAnim = null }
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
export default WaterfallChart
