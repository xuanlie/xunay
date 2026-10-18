// @xunay/kit/charts/slope —— 斜率图（前后对比）
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'sl-' + (++_uid).toString(36)

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
  if (Math.abs(v) < 1 && v !== 0) return v.toFixed(2)
  return String(Number(v).toFixed(Math.abs(v) < 10 ? 1 : 0))
}
function niceScale(min, max, count = 5) {
  if (max === min) max = min + 1
  const range = max - min
  const rough = range / count
  const exp = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / exp
  let step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10
  step *= exp
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks = []
  for (let v = niceMin; v <= niceMax + step * 1e-6; v += step) ticks.push(Number(v.toFixed(10)))
  return { min: niceMin, max: niceMax, ticks }
}

export class SlopeChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Slope] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 460,
      padding: { top: 60, right: 160, bottom: 40, left: 160 },
      title: null, subtitle: null, theme: 'light',
      // 阶段名（左、右列标签）
      leftLabel: '之前',
      rightLabel: '之后',
      // 颜色
      upColor: '#10b981',      // 上升（绿）
      downColor: '#ef4444',    // 下降（红）
      flatColor: '#94a3b8',    // 持平（灰）
      // 线
      lineWidth: 2.5,
      lineWidthHover: 4,
      lineOpacity: 0.7,
      dimOpacity: 0.1,
      // 圆点
      dotRadius: 6,
      dotRadiusHover: 9,
      dotStroke: true,
      // 标签
      showLeftLabels: true,
      showRightLabels: true,
      showValues: true,
      valueFormat: fmt,
      valueDecimals: null,
      // 显示变化
      showDelta: false,
      deltaFormat: (a, b) => {
        const d = b - a
        const p = a !== 0 ? (d / Math.abs(a)) * 100 : 0
        return (d >= 0 ? '+' : '') + p.toFixed(0) + '%'
      },
      // 排序（可选）
      sort: 'none',            // 'none' | 'up' | 'down'
      // 交互
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 30 },
      onHover: null,
      onLineClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
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
      columnLine: '#334155',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
      dotStroke: '#0a0e17',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      columnLine: '#cbd5e1',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(255,255,255,0.08)',
      dotStroke: '#fff',
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
  setData(data) {
    let items = (data || []).map((d, i) => ({
      label: d.label != null ? d.label : (d.name != null ? d.name : String(i)),
      a: +(d.a ?? d.from ?? d.valueA ?? 0),
      b: +(d.b ?? d.to ?? d.valueB ?? 0),
      color: d.color,
    }))
    if (this.opts.sort === 'up') items.sort((x, y) => (y.b - y.a) - (x.b - x.a))
    else if (this.opts.sort === 'down') items.sort((x, y) => (x.b - x.a) - (y.b - y.a))
    this._data = items
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _colorOf(item) {
    if (item.color) return item.color
    const d = item.b - item.a
    if (Math.abs(d) < 1e-6) return this.opts.flatColor
    return d > 0 ? this.opts.upColor : this.opts.downColor
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._lineEls = []
    if (!this._data.length) return
    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    // 值范围
    let vMin = Infinity, vMax = -Infinity
    for (const d of this._data) {
      if (d.a < vMin) vMin = d.a
      if (d.b < vMin) vMin = d.b
      if (d.a > vMax) vMax = d.a
      if (d.b > vMax) vMax = d.b
    }
    if (!isFinite(vMin)) { vMin = 0; vMax = 1 }
    const scale = niceScale(vMin, vMax, 5)
    const yOf = v => plot.y + plot.h - ((v - scale.min) / (scale.max - scale.min)) * plot.h
    const xL = plot.x
    const xR = plot.x + plot.w
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 两列垂直线
    this.svg.appendChild(el('line', {
      x1: xL, x2: xL, y1: plot.y, y2: plot.y + plot.h,
      stroke: this.theme.columnLine, 'stroke-width': 1, 'stroke-dasharray': '3 4',
    }))
    this.svg.appendChild(el('line', {
      x1: xR, x2: xR, y1: plot.y, y2: plot.y + plot.h,
      stroke: this.theme.columnLine, 'stroke-width': 1, 'stroke-dasharray': '3 4',
    }))
    // 顶部阶段名
    const t1 = el('text', {
      x: xL, y: plot.y - 20,
      'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600,
      fill: this.theme.text,
    })
    t1.textContent = this.opts.leftLabel
    this.svg.appendChild(t1)
    const t2 = el('text', {
      x: xR, y: plot.y - 20,
      'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600,
      fill: this.theme.text,
    })
    t2.textContent = this.opts.rightLabel
    this.svg.appendChild(t2)
    // Y 轴网格
    for (const tick of scale.ticks) {
      const y = yOf(tick)
      this.svg.appendChild(el('line', {
        x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
        stroke: this.theme.columnLine, 'stroke-width': 1, opacity: 0.3, 'stroke-dasharray': '2 4',
      }))
    }
    // 绘制斜线
    const lineG = el('g')
    this.svg.appendChild(lineG)
    // 排序：让相邻的值不会太挤 — 按 a 值排序对左边合理，但我们不改变数据顺序
    // 直接画，让视觉自然
    const lineW = this.opts.lineWidth
    const dotR = this.opts.dotRadius
    this._data.forEach((item, i) => {
      const color = this._colorOf(item)
      const yA = yOf(item.a)
      const yB = yOf(item.b)
      const line = el('line', {
        x1: xL, y1: yA, x2: xR, y2: yB,
        stroke: color,
        'stroke-width': lineW,
        'stroke-linecap': 'round',
        opacity: this.opts.lineOpacity,
        style: 'cursor:pointer;transition:stroke-width .15s,opacity .15s',
      })
      line._meta = { item, index: i, color, yA, yB }
      lineG.appendChild(line)
      this._lineEls.push(line)
      // 左圆点
      const dotA = el('circle', {
        cx: xL, cy: yA, r: dotR,
        fill: color,
        stroke: this.opts.dotStroke ? this.theme.dotStroke : 'none',
        'stroke-width': this.opts.dotStroke ? 2 : 0,
        style: 'pointer-events:none;transition:r .15s',
      })
      lineG.appendChild(dotA)
      // 右圆点
      const dotB = el('circle', {
        cx: xR, cy: yB, r: dotR,
        fill: color,
        stroke: this.opts.dotStroke ? this.theme.dotStroke : 'none',
        'stroke-width': this.opts.dotStroke ? 2 : 0,
        style: 'pointer-events:none;transition:r .15s',
      })
      lineG.appendChild(dotB)
      line._dotA = dotA
      line._dotB = dotB
      // 左侧标签（分类名）
      if (this.opts.showLeftLabels) {
        const t = el('text', {
          x: xL - 12, y: yA + 4,
          'text-anchor': 'end', 'font-size': 12, 'font-weight': 500,
          fill: this.theme.text,
          style: 'pointer-events:none',
        })
        t.textContent = item.label.length > 14 ? item.label.slice(0, 12) + '…' : item.label
        lineG.appendChild(t)
      }
      // 左侧值
      if (this.opts.showValues) {
        const t = el('text', {
          x: xL + 12, y: yA + 4,
          'text-anchor': 'start', 'font-size': 11.5, 'font-weight': 600,
          fill: color,
          style: 'font-variant-numeric:tabular-nums;pointer-events:none',
        })
        t.textContent = this.opts.valueFormat(item.a, this.opts.valueDecimals)
        lineG.appendChild(t)
      }
      // 右侧标签
      if (this.opts.showRightLabels) {
        const t = el('text', {
          x: xR - 12, y: yB + 4,
          'text-anchor': 'end', 'font-size': 12, 'font-weight': 500,
          fill: this.theme.text,
          style: 'pointer-events:none',
        })
        t.textContent = item.label.length > 14 ? item.label.slice(0, 12) + '…' : item.label
        lineG.appendChild(t)
      }
      // 右侧值 + delta
      if (this.opts.showValues) {
        const t = el('text', {
          x: xR + 12, y: yB + 4,
          'text-anchor': 'start', 'font-size': 11.5, 'font-weight': 600,
          fill: color,
          style: 'font-variant-numeric:tabular-nums;pointer-events:none',
        })
        t.textContent = this.opts.valueFormat(item.b, this.opts.valueDecimals)
        lineG.appendChild(t)
      }
      if (this.opts.showDelta) {
        const d = item.b - item.a
        const t = el('text', {
          x: xR + 76, y: yB + 4,
          'text-anchor': 'start', 'font-size': 11, 'font-weight': 500,
          fill: Math.abs(d) < 1e-6 ? this.theme.textMuted : (d > 0 ? this.opts.upColor : this.opts.downColor),
          style: 'font-variant-numeric:tabular-nums;pointer-events:none',
        })
        t.textContent = this.opts.deltaFormat(item.a, item.b)
        lineG.appendChild(t)
      }
      // 事件
      line.addEventListener('mouseenter', (e) => {
        this._hover = line
        this._applyHover()
        this._moveTip(e, item, color)
      })
      line.addEventListener('mousemove', (e) => { if (this._hover === line) this._moveTip(e, item, color) })
      line.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      line.addEventListener('click', (e) => { if (this.opts.onLineClick) this.opts.onLineClick(item, i, e) })
    })
    if (animate) this._animate(plot)
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._lineEls.forEach(l => {
        l.setAttribute('stroke-width', String(this.opts.lineWidth))
        l.setAttribute('opacity', String(this.opts.lineOpacity))
        if (l._dotA) l._dotA.setAttribute('r', String(this.opts.dotRadius))
        if (l._dotB) l._dotB.setAttribute('r', String(this.opts.dotRadius))
      })
      return
    }
    for (const l of this._lineEls) {
      const isHot = l === hot
      l.setAttribute('stroke-width', String(isHot ? this.opts.lineWidthHover : this.opts.lineWidth))
      l.setAttribute('opacity', String(isHot ? 1 : this.opts.dimOpacity))
      if (l._dotA) l._dotA.setAttribute('r', String(isHot ? this.opts.dotRadiusHover : this.opts.dotRadius))
      if (l._dotB) l._dotB.setAttribute('r', String(isHot ? this.opts.dotRadiusHover : this.opts.dotRadius))
    }
  }
  _moveTip(e, item, color) {
    if (!this.tip) return
    const d = item.b - item.a
    const pct = item.a !== 0 ? ((d / Math.abs(item.a)) * 100) : 0
    const sign = d >= 0 ? '+' : ''
    this.tip.innerHTML = `
      <div style="font-weight:600;margin-bottom:5px">${item.label}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">${this.opts.leftLabel}</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(item.a, this.opts.valueDecimals)}</span>
        <span style="opacity:.7">${this.opts.rightLabel}</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(item.b, this.opts.valueDecimals)}</span>
        <span style="opacity:.7">变化</span><span style="text-align:right;color:${d >= 0 ? this.opts.upColor : this.opts.downColor};font-weight:600">${sign}${this.opts.valueFormat(d, this.opts.valueDecimals)} (${sign}${pct.toFixed(0)}%)</span>
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
    if (this.opts.onHover) this.opts.onHover(item)
  }
  _animate(plot) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const xL = plot.x
    const xR = plot.x + plot.w
    const targets = this._lineEls.map((l, i) => ({
      el: l, meta: l._meta,
      dotA: l._dotA, dotB: l._dotB,
      delay: i * stagger / duration,
    }))
    // 起始：线起点在 xL，终点也在 xL
    targets.forEach(tg => {
      const m = tg.meta
      tg.el.setAttribute('x2', String(xL))
      tg.dotB.setAttribute('cx', String(xL))
      tg.dotB.setAttribute('r', '0')
      tg.el.setAttribute('opacity', '0')
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const m = tg.meta
        const cx = xL + (xR - xL) * e
        const cy = m.yA + (m.yB - m.yA) * e
        tg.el.setAttribute('x2', String(cx))
        tg.el.setAttribute('y2', String(cy))
        tg.dotB.setAttribute('cx', String(cx))
        tg.dotB.setAttribute('cy', String(cy))
        tg.dotB.setAttribute('r', String(this.opts.dotRadius * e))
        tg.el.setAttribute('opacity', String(this.opts.lineOpacity * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          const m = tg.meta
          tg.el.setAttribute('x2', String(xR))
          tg.el.setAttribute('y2', String(m.yB))
          tg.dotB.setAttribute('cx', String(xR))
          tg.dotB.setAttribute('cy', String(m.yB))
          tg.dotB.setAttribute('r', String(this.opts.dotRadius))
          tg.el.setAttribute('opacity', String(this.opts.lineOpacity))
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
export default SlopeChart
