// @xunay/kit/charts/candlestick —— 精修版 K 线图
// 特性：涨跌配色 · 影线 + 实体 · 成交量副图 · MA 均线 · 
//      十字准线 + tooltip · 悬停高亮 · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'cd-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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
  if (Math.abs(v) < 1) return v.toFixed(3)
  return String(Number(v).toFixed(2))
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

function movingAverage(data, period) {
  const out = new Array(data.length).fill(null)
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    sum += data[i].close
    if (i >= period) sum -= data[i - period].close
    if (i >= period - 1) out[i] = sum / period
  }
  return out
}

export class CandlestickChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[CandlestickChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 460,
      padding: { top: 20, right: 60, bottom: 30, left: 20 },
      title: null,
      subtitle: null,
      theme: 'light',
      // 涨跌配色
      upColor: '#10b981',
      downColor: '#ef4444',
      upFill: '#10b981',
      downFill: '#ef4444',
      candleWidth: 0.68,       // 相对 slot 宽度
      wickWidth: 1.5,
      bodyRadius: 1,
      // 成交量
      showVolume: true,
      volumeHeight: 0.22,      // 相对总高度比例
      volumeUpColor: 'rgba(16,185,129,0.4)',
      volumeDownColor: 'rgba(239,68,68,0.4)',
      // MA 均线
      maLines: [
        { period: 5, color: '#3b82f6' },
        { period: 10, color: '#f59e0b' },
        { period: 20, color: '#8b5cf6' },
      ],
      showMA: true,
      // 网格
      grid: true,
      gridDash: '3 4',
      yTicks: 5,
      // 交互
      crosshair: true,
      tooltip: true,
      showLegend: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 8 },
      yFormat: v => fmt(v),
      onHover: null,
      onClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._candleEls = []
    this._maEls = []

    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', crosshair: '#64748b',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
      upColor: '#10b981', downColor: '#ef4444',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', crosshair: '#94a3b8',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
      upColor: '#10b981', downColor: '#ef4444',
    }
  }

  _build() {
    const c = this.container
    c.innerHTML = ''
    c.style.position = 'relative'
    c.style.width = '100%'
    c.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif'

    const head = document.createElement('div')
    head.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:8px;flex-wrap:wrap'
    c.appendChild(head)

    const left = document.createElement('div')
    head.appendChild(left)

    if (this.opts.title) {
      const t = document.createElement('div')
      t.style.cssText = `font-size:16px;font-weight:600;color:${this.theme.text}`
      t.textContent = this.opts.title
      left.appendChild(t)
    }
    if (this.opts.subtitle) {
      const s = document.createElement('div')
      s.style.cssText = `font-size:12.5px;color:${this.theme.textMuted};margin-top:2px`
      s.textContent = this.opts.subtitle
      left.appendChild(s)
    }

    // 图例
    if (this.opts.showLegend && this.opts.showMA) {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = `display:flex;gap:14px;font-size:12px;color:${this.theme.textMuted};flex-wrap:wrap`
      head.appendChild(this.legendEl)
    }

    // 实时信息条
    this.infoEl = document.createElement('div')
    this.infoEl.style.cssText = `display:flex;gap:14px;font-size:12px;font-family:inherit;color:${this.theme.textMuted};margin-bottom:8px;min-height:18px;flex-wrap:wrap`
    c.appendChild(this.infoEl)

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
        font-size:12px;line-height:1.6;
        box-shadow:0 8px 24px rgba(0,0,0,.18);
        backdrop-filter:blur(6px);white-space:nowrap;z-index:10;
        font-variant-numeric:tabular-nums;
      `
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
    // data: [{ label, open, close, high, low, volume? }]
    this._data = (data || []).map((d, i) => {
      const open = Number(d.open ?? d.o ?? d.close ?? 0)
      const close = Number(d.close ?? d.c ?? open)
      const high = Number(d.high ?? d.h ?? Math.max(open, close))
      const low = Number(d.low ?? d.l ?? Math.min(open, close))
      return {
        label: d.label != null ? d.label : String(i),
        open, close, high, low,
        volume: Number(d.volume ?? d.v ?? 0),
        _i: i,
      }
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

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding
    const n = this._data.length
    if (!n) return

    this.svg.innerHTML = ''
    this._candleEls = []
    this._maEls = []

    // 布局：主图 + 成交量副图
    const volH = this.opts.showVolume ? (H - pad.top - pad.bottom) * this.opts.volumeHeight : 0
    const gap = this.opts.showVolume ? 14 : 0
    const mainH = H - pad.top - pad.bottom - volH - gap

    const plot = {
      x: pad.left,
      y: pad.top,
      w: W - pad.left - pad.right,
      h: mainH,
    }
    const volPlot = this.opts.showVolume ? {
      x: pad.left,
      y: pad.top + mainH + gap,
      w: W - pad.left - pad.right,
      h: volH,
    } : null

    // 价格范围
    let pMin = Infinity, pMax = -Infinity
    let vMax = 0
    for (const d of this._data) {
      if (d.low < pMin) pMin = d.low
      if (d.high > pMax) pMax = d.high
      if (d.volume > vMax) vMax = d.volume
    }
    if (!isFinite(pMin)) { pMin = 0; pMax = 1 }
    if (vMax === 0) vMax = 1
    const pPad = (pMax - pMin) * 0.05
    const pScale = niceScale(pMin - pPad, pMax + pPad, this.opts.yTicks)
    const vScale = niceScale(0, vMax * 1.1, 2)

    const yOf = v => plot.y + plot.h - ((v - pScale.min) / (pScale.max - pScale.min)) * plot.h
    const yVolOf = v => volPlot ? volPlot.y + volPlot.h - (v / vScale.max) * volPlot.h : 0

    // slot
    const slot = plot.w / n
    const cw = slot * this.opts.candleWidth
    const xOf = i => plot.x + slot * (i + 0.5)

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // ===== 网格 =====
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of pScale.ticks) {
        const y = yOf(tick)
        if (y < plot.y - 1 || y > plot.y + plot.h + 1) continue
        g.appendChild(el('line', {
          x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
          stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': this.opts.gridDash,
        }))
        const t = el('text', {
          x: plot.x + plot.w + 8, y: y + 4,
          'text-anchor': 'start',
          'font-size': 11,
          'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      // 成交量网格线
      if (volPlot) {
        g.appendChild(el('line', {
          x1: volPlot.x, x2: volPlot.x + volPlot.w, y1: volPlot.y + volPlot.h, y2: volPlot.y + volPlot.h,
          stroke: this.theme.axis, 'stroke-width': 1,
        }))
      }
      this.svg.appendChild(g)
    }

    // ===== 蜡烛 =====
    const cg = el('g')
    this.svg.appendChild(cg)

    this._data.forEach((d, i) => {
      const x = xOf(i)
      const up = d.close >= d.open
      const color = up ? this.theme.upColor : this.theme.downColor
      const fill = up ? (this.opts.upFill || color) : (this.opts.downFill || color)
      const yHigh = yOf(d.high)
      const yLow = yOf(d.low)
      const yOpen = yOf(d.open)
      const yClose = yOf(d.close)

      const g = el('g', { style: 'cursor:pointer' })
      g._meta = { datum: d, index: i, x, up, color }

      // 影线
      g.appendChild(el('line', {
        x1: x, x2: x,
        y1: yHigh, y2: yLow,
        stroke: color, 'stroke-width': this.opts.wickWidth,
        'stroke-linecap': 'round',
      }))

      // 实体
      const bodyY = Math.min(yOpen, yClose)
      const bodyH = Math.max(1, Math.abs(yClose - yOpen))
      const rect = el('rect', {
        x: x - cw / 2,
        y: bodyY,
        width: cw,
        height: bodyH,
        rx: Math.min(this.opts.bodyRadius, cw / 2),
        fill: up ? fill : fill,
        stroke: color,
        'stroke-width': 1,
      })
      g.appendChild(rect)
      this._candleEls.push({ el: g, meta: g._meta, x, yHigh, yLow, bodyY, bodyH, color, up, rect })

      cg.appendChild(g)

      // 成交量
      if (volPlot && d.volume > 0) {
        const vy = yVolOf(d.volume)
        const vh = volPlot.y + volPlot.h - vy
        cg.appendChild(el('rect', {
          x: x - cw / 2,
          y: vy,
          width: cw,
          height: Math.max(1, vh),
          fill: up ? this.opts.volumeUpColor : this.opts.volumeDownColor,
        }))
      }

    })

    // ===== MA 均线 =====
    if (this.opts.showMA && this.opts.maLines.length) {
      const mg = el('g')
      this.svg.appendChild(mg)
      for (const line of this.opts.maLines) {
        const ma = movingAverage(this._data, line.period)
        const pts = []
        ma.forEach((v, i) => {
          if (v == null) return
          pts.push(`${xOf(i).toFixed(2)},${yOf(v).toFixed(2)}`)
        })
        if (pts.length < 2) continue
        const path = el('polyline', {
          points: pts.join(' '),
          fill: 'none',
          stroke: line.color,
          'stroke-width': 1.5,
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
          opacity: 0.9,
        })
        mg.appendChild(path)
        this._maEls.push({ el: path, line })
      }
    }

    // ===== 十字准线层 =====
    this.crossLayer = el('g', { style: 'pointer-events:none' })
    this.svg.appendChild(this.crossLayer)

    // ===== 事件层（唯一交互入口）=====
    const layer = el('rect', {
      x: plot.x, y: plot.y, width: plot.w, height: plot.h,
      fill: 'transparent',
      style: 'cursor:crosshair;pointer-events:all',
    })
    this.svg.appendChild(layer)

    const onMove = (e) => {
      const rect = this.svg.getBoundingClientRect()
      const scaleX = this.W / rect.width
      const mx = (e.clientX - rect.left) * scaleX
      let idx = Math.floor((mx - plot.x) / slot)
      idx = Math.max(0, Math.min(this._data.length - 1, idx))
      if (idx !== this._hover) {
        this._hover = idx
        this._applyHover()
        this._updateInfo(this._data[idx])
      }
      this._moveTip(e, this._data[idx], idx)
    }
    const onLeave = () => {
      this._hover = null
      this._applyHover()
      if (this.tip) this.tip.style.opacity = '0'
      if (this.crossLayer) this.crossLayer.innerHTML = ''
      this._updateInfo(null)
      if (this.opts.onHover) this.opts.onHover(null)
    }
    const onClick = (e) => {
      const rect = this.svg.getBoundingClientRect()
      const scaleX = this.W / rect.width
      const mx = (e.clientX - rect.left) * scaleX
      let idx = Math.floor((mx - plot.x) / slot)
      idx = Math.max(0, Math.min(this._data.length - 1, idx))
      if (this.opts.onClick) this.opts.onClick(this._data[idx], idx, e)
    }

    layer.addEventListener('mousemove', onMove)
    layer.addEventListener('mouseleave', onLeave)
    layer.addEventListener('click', onClick)
    // 触屏
    layer.addEventListener('touchstart', (e) => {
      if (e.touches[0]) onMove(e.touches[0])
    }, { passive: true })
    layer.addEventListener('touchmove', (e) => {
      if (e.touches[0]) onMove(e.touches[0])
    }, { passive: true })
    layer.addEventListener('touchend', () => {
      onLeave()
    })

    this._eventLayer = layer

    if (animate) this._animate(xOf, yOf)

    // 图例
    this._renderLegend()

    return this
  }

  _renderLegend() {
    if (!this.legendEl) return
    this.legendEl.innerHTML = ''
    if (!this.opts.showMA) return
    for (const line of this.opts.maLines) {
      const item = document.createElement('span')
      item.style.cssText = 'display:flex;align-items:center;gap:4px'
      item.innerHTML = `<span style="display:inline-block;width:14px;height:2px;background:${line.color}"></span><span>MA${line.period}</span>`
      this.legendEl.appendChild(item)
    }
  }

  _applyHover() {
    for (const c of this._candleEls) {
      const hot = c.meta.index === this._hover
      c.el.style.opacity = this._hover == null ? '1' : (hot ? '1' : '0.35')
    }
    for (const m of this._maEls) {
      m.el.style.opacity = this._hover == null ? '0.9' : '0.35'
    }
  }

  _updateInfo(d) {
    if (!this.infoEl) return
    if (!d) { this.infoEl.innerHTML = ''; return }
    const chg = d.close - d.open
    const pct = d.open !== 0 ? (chg / d.open * 100) : 0
    const up = chg >= 0
    const color = up ? this.theme.upColor : this.theme.downColor
    const arrow = up ? '▲' : '▼'
    this.infoEl.innerHTML = `
      <span style="color:${this.theme.text};font-weight:600">${d.label}</span>
      <span style="color:${this.theme.textMuted}">开 <b style="color:${this.theme.text}">${fmt(d.open)}</b></span>
      <span style="color:${this.theme.textMuted}">高 <b style="color:${this.theme.text}">${fmt(d.high)}</b></span>
      <span style="color:${this.theme.textMuted}">低 <b style="color:${this.theme.text}">${fmt(d.low)}</b></span>
      <span style="color:${this.theme.textMuted}">收 <b style="color:${this.theme.text}">${fmt(d.close)}</b></span>
      <span style="color:${color};font-weight:600">${arrow} ${chg >= 0 ? '+' : ''}${fmt(chg)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)</span>
      ${d.volume > 0 ? `<span style="color:${this.theme.textMuted}">量 <b style="color:${this.theme.text}">${fmt(d.volume)}</b></span>` : ''}
    `
  }

  _moveTip(e, d, i) {
    if (!this.tip) return
    const chg = d.close - d.open
    const pct = d.open !== 0 ? (chg / d.open * 100) : 0
    const up = chg >= 0
    const color = up ? this.theme.upColor : this.theme.downColor
    this.tip.innerHTML = `
      <div style="font-weight:600;margin-bottom:4px">${d.label}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px">
        <span style="opacity:.7">开</span><span style="text-align:right;color:${this.theme.text}">${fmt(d.open)}</span>
        <span style="opacity:.7">高</span><span style="text-align:right;color:${this.theme.text}">${fmt(d.high)}</span>
        <span style="opacity:.7">低</span><span style="text-align:right;color:${this.theme.text}">${fmt(d.low)}</span>
        <span style="opacity:.7">收</span><span style="text-align:right;color:${this.theme.text}">${fmt(d.close)}</span>
        <span style="opacity:.7">涨跌</span><span style="text-align:right;color:${color};font-weight:600">${chg >= 0 ? '+' : ''}${fmt(chg)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)</span>
        ${d.volume > 0 ? `<span style="opacity:.7">量</span><span style="text-align:right;color:${this.theme.text}">${fmt(d.volume)}</span>` : ''}
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    let left = cx + 14
    let top = cy - th - 10
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = cy + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    // 十字准线
    if (this.crossLayer) {
      this.crossLayer.innerHTML = ''
      const c = this._candleEls[i]
      if (c && this.opts.crosshair) {
        // 竖线
        this.crossLayer.appendChild(el('line', {
          x1: c.x, x2: c.x,
          y1: this.opts.padding.top,
          y2: this.H - this.opts.padding.bottom,
          stroke: this.theme.crosshair,
          'stroke-width': 1,
          'stroke-dasharray': '3 4',
          opacity: 0.7,
        }))
      }
    }

    if (this.opts.onHover) this.opts.onHover({ datum: d, index: i })
  }

  _animate(xOf, yOf) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }

    const midY = this.opts.padding.top + (this.H - this.opts.padding.top - this.opts.padding.bottom) / 2

    const targets = this._candleEls.map((c, i) => ({
      el: c.el,
      rect: c.rect,
      bodyY: c.bodyY,
      bodyH: c.bodyH,
      yHigh: c.yHigh,
      yLow: c.yLow,
      delay: (i * stagger) / duration,
    }))

    this._candleEls.forEach(c => {
      c.rect.setAttribute('y', midY)
      c.rect.setAttribute('height', 0)
      c.el.style.opacity = '0.3'
    })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach((tg, i) => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const cy = tg.bodyY + tg.bodyH / 2
        const curY = midY + (cy - midY) * e
        const curH = tg.bodyH * e
        tg.rect.setAttribute('y', String(curY - curH / 2))
        tg.rect.setAttribute('height', String(Math.max(0.5, curH)))
        tg.el.style.opacity = String(0.3 + 0.7 * e)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          tg.rect.setAttribute('y', String(tg.bodyY))
          tg.rect.setAttribute('height', String(Math.max(0.5, tg.bodyH)))
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

export default CandlestickChart
