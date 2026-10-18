// @xunay/kit/charts/area —— 精修版面积图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'ar-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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
  if (Math.abs(v) < 1 && v !== 0) return v.toFixed(2)
  return String(Math.round(v))
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

function stepPath(pts) {
  return pts.map((p, i) => i === 0
    ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    : `H ${p.x.toFixed(2)} V ${p.y.toFixed(2)}`).join(' ')
}

function topPath(pts, mode, tension) {
  if (!pts.length) return ''
  if (mode === 'smooth') return smoothPath(pts, tension)
  if (mode === 'step') return stepPath(pts)
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
}

function areaPath(topPts, botPts, mode, tension) {
  if (!topPts.length) return ''
  const top = topPath(topPts, mode, tension)
  // 底边：反向走
  const rev = botPts.slice().reverse()
  let bot
  if (mode === 'smooth') {
    bot = smoothPath(rev, tension).replace(/^M/, 'L')
  } else if (mode === 'step') {
    bot = rev.map((p, i) => i === 0
      ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
      : `H ${p.x.toFixed(2)} V ${p.y.toFixed(2)}`).join(' ').replace(/^M/, 'L')
  } else {
    bot = rev.map(p => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  }
  return top + ' ' + bot + ' Z'
}

export class AreaChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[AreaChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 340,
      padding: { top: 24, right: 24, bottom: 40, left: 52 },
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      mode: 'smooth',          // 'line' | 'smooth' | 'step'
      tension: 0.35,
      layout: 'stacked',       // 'stacked' | 'overlap' | 'percent'
      opacityTop: 0.75,
      opacityBottom: 0.1,
      strokeWidth: 2,
      showPoints: false,
      pointRadius: 3,
      grid: true,
      gridDash: '3 4',
      yTicks: 5,
      xTickCount: null,
      crosshair: true,
      tooltip: true,
      legend: true,
      xFormat: v => String(v),
      yFormat: fmt,
      animation: { duration: 850, easing: 'easeOutCubic', stagger: 35 },
      onHover: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._series = []
    this._labels = []
    this._hidden = new Set()
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._areaEls = []

    this._build()
    if (options.data || options.series) this.setData(options)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', crosshair: '#64748b', pointStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', crosshair: '#94a3b8', pointStroke: '#fff',
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

    this.legendEl = document.createElement('div')
    this.legendEl.style.cssText = `display:flex;flex-wrap:wrap;gap:16px;font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px`
    c.appendChild(this.legendEl)

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
        font-size:12.5px;line-height:1.6;
        box-shadow:0 8px 24px rgba(0,0,0,.18);
        backdrop-filter:blur(6px);white-space:nowrap;z-index:10;
        font-variant-numeric:tabular-nums;
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

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding
    const n = this._labels.length
    if (!n) return

    this.svg.innerHTML = ''
    this._areaEls = []

    const plot = { x: pad.left, y: pad.top, w: W - pad.left - pad.right, h: H - pad.top - pad.bottom }
    const visible = this._series.filter((_, i) => !this._hidden.has(i))

    const stacked = this.opts.layout === 'stacked' || this.opts.layout === 'percent'
    const isPercent = this.opts.layout === 'percent'

    // 计算每个 series 的 top/bot
    const seriesY = []
    if (stacked) {
      const accum = new Array(n).fill(0)
      for (const s of visible) {
        const top = [], bot = []
        for (let i = 0; i < n; i++) {
          const v = s.data[i]?.value || 0
          bot.push(accum[i])
          accum[i] += v
          top.push(accum[i])
        }
        seriesY.push({ s, top, bot })
      }
      if (isPercent) {
        for (let i = 0; i < n; i++) {
          const total = accum[i] || 1
          for (const sy of seriesY) {
            sy.top[i] = sy.top[i] / total * 100
            sy.bot[i] = sy.bot[i] / total * 100
          }
        }
      }
    } else {
      for (const s of visible) {
        seriesY.push({ s, top: s.data.map(d => d.value), bot: new Array(n).fill(0) })
      }
    }

    let yMax = 0
    for (const sy of seriesY) for (const v of sy.top) if (v > yMax) yMax = v
    if (isPercent) yMax = 100
    const yScale = niceScale(0, yMax, this.opts.yTicks)

    const xOf = i => plot.x + (n <= 1 ? plot.w / 2 : (i / (n - 1)) * plot.w)
    const yOf = v => plot.y + plot.h - ((v - yScale.min) / (yScale.max - yScale.min)) * plot.h

    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 网格 + y 轴
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of yScale.ticks) {
        const y = yOf(tick)
        g.appendChild(el('line', {
          x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y,
          stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': tick === 0 ? '0' : this.opts.gridDash,
        }))
        const t = el('text', {
          x: plot.x - 10, y: y + 4,
          'text-anchor': 'end', 'font-size': 11, 'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = isPercent ? tick + '%' : this.opts.yFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }

    // x 轴
    const stride = this.opts.xTickCount ? Math.max(1, Math.ceil(n / this.opts.xTickCount)) : Math.max(1, Math.ceil(n / 8))
    const xg = el('g')
    for (let i = 0; i < n; i += stride) {
      const t = el('text', {
        x: xOf(i), y: plot.y + plot.h + 22,
        'text-anchor': 'middle', 'font-size': 11, 'font-family': 'inherit',
        fill: this.theme.textMuted,
      })
      t.textContent = this.opts.xFormat(this._labels[i])
      xg.appendChild(t)
    }
    this.svg.appendChild(xg)

    this.svg.appendChild(el('line', {
      x1: plot.x, x2: plot.x, y1: plot.y, y2: plot.y + plot.h,
      stroke: this.theme.axis, 'stroke-width': 1,
    }))
    this.svg.appendChild(el('line', {
      x1: plot.x, x2: plot.x + plot.w, y1: plot.y + plot.h, y2: plot.y + plot.h,
      stroke: this.theme.axis, 'stroke-width': 1,
    }))

    const defs = el('defs')
    this.svg.insertBefore(defs, this.svg.firstChild)

    const areasLayer = el('g')
    this.svg.appendChild(areasLayer)

    // 面积
    for (const { s, top, bot } of seriesY) {
      const color = s.color
      const gid = uid()
      const grad = el('linearGradient', { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' })
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': this.opts.opacityTop }))
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': this.opts.opacityBottom }))
      defs.appendChild(grad)

      const topPts = [], botPts = []
      for (let i = 0; i < n; i++) {
        topPts.push({ x: xOf(i), y: yOf(top[i]) })
        botPts.push({ x: xOf(i), y: yOf(bot[i]) })
      }
      const d = areaPath(topPts, botPts, this.opts.mode, this.opts.tension)

      const area = el('path', {
        d,
        fill: `url(#${gid})`,
        stroke: color,
        'stroke-width': this.opts.strokeWidth,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      })
      areasLayer.appendChild(area)
      this._areaEls.push({ el: area, series: s, topPts, botPts, color })

      // 数据点
      if (this.opts.showPoints) {
        for (let i = 0; i < n; i++) {
          const dot = el('circle', {
            cx: xOf(i), cy: yOf(top[i]), r: this.opts.pointRadius,
            fill: color, stroke: this.theme.pointStroke, 'stroke-width': 2,
            style: 'pointer-events:none',
          })
          areasLayer.appendChild(dot)
        }
      }
    }

    // 悬停剖面层
    this.profileLayer = el('g', { style: 'pointer-events:none' })
    this.svg.appendChild(this.profileLayer)

    // 事件层
    const layer = el('rect', {
      x: plot.x, y: plot.y, width: plot.w, height: plot.h,
      fill: 'transparent', style: 'cursor:crosshair',
    })
    this.svg.appendChild(layer)

    const onMove = (e) => {
      const rect = this.svg.getBoundingClientRect()
      const scaleX = this.W / rect.width
      const mx = (e.clientX - rect.left) * scaleX
      let idx = n <= 1 ? 0 : Math.round((mx - plot.x) / (plot.w / (n - 1)))
      idx = Math.max(0, Math.min(n - 1, idx))
      if (this._hover !== idx) {
        this._hover = idx
        this._applyProfile(idx, seriesY, plot, xOf, yOf)
      }
      this._moveTip(e, idx, seriesY, isPercent)
    }
    const onLeave = () => {
      this._hover = null
      if (this.profileLayer) this.profileLayer.innerHTML = ''
      if (this.tip) this.tip.style.opacity = '0'
      if (this.opts.onHover) this.opts.onHover(null)
    }

    layer.addEventListener('mousemove', onMove)
    layer.addEventListener('mouseleave', onLeave)

    if (animate) this._animate(seriesY, xOf, yOf, plot)

    this._renderLegend()
    return this
  }

  _applyProfile(idx, seriesY, plot, xOf, yOf) {
    if (!this.profileLayer) return
    this.profileLayer.innerHTML = ''
    const x = xOf(idx)
    if (this.opts.crosshair) {
      this.profileLayer.appendChild(el('line', {
        x1: x, x2: x, y1: plot.y, y2: plot.y + plot.h,
        stroke: this.theme.crosshair, 'stroke-width': 1,
        'stroke-dasharray': '3 4', opacity: 0.8,
      }))
    }
    for (const { s, top } of seriesY) {
      this.profileLayer.appendChild(el('circle', {
        cx: x, cy: yOf(top[idx]), r: 5,
        fill: s.color, stroke: this.theme.pointStroke, 'stroke-width': 2,
      }))
    }
  }

  _moveTip(e, idx, seriesY, isPercent) {
    if (!this.tip) return
    const rows = []
    let total = 0
    for (const { s, top, bot } of seriesY) {
      const v = top[idx] - bot[idx]
      total += isPercent ? v / 100 : v
      const display = isPercent ? (top[idx] - bot[idx]).toFixed(1) + '%' : this.opts.yFormat(v)
      rows.push(`<div style="display:flex;justify-content:space-between;gap:20px">
        <span style="display:flex;align-items:center;gap:6px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.color}"></span>
          ${s.name}
        </span>
        <strong>${display}</strong>
      </div>`)
    }
    const title = this.opts.xFormat(this._labels[idx])
    let html = `<div style="font-weight:600;margin-bottom:5px">${title}</div>`
    html += rows.join('')
    if (seriesY.length > 1 && !isPercent) {
      html += `<div style="display:flex;justify-content:space-between;gap:20px;border-top:1px solid rgba(255,255,255,0.1);margin-top:5px;padding-top:5px">
        <span style="opacity:.8">总计</span>
        <strong>${this.opts.yFormat(total)}</strong>
      </div>`
    }
    this.tip.innerHTML = html
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    let left = cx + 14
    let top = cy - th / 2
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = 4
    if (top + th > r.height) top = r.height - th - 4
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) {
      this.opts.onHover({ index: idx, label: this._labels[idx], series: seriesY.map(sy => ({ series: sy.s, value: sy.top[idx] - sy.bot[idx] })) })
    }
  }

  _renderLegend() {
    const L = this.legendEl
    L.innerHTML = ''
    if (!this.opts.legend || this._series.length <= 1) {
      L.style.display = 'none'
      return
    }
    L.style.display = 'flex'
    this._series.forEach((s, i) => {
      const hidden = this._hidden.has(i)
      const item = document.createElement('div')
      item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;opacity:${hidden ? 0.35 : 1}`
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color}"></span><span>${s.name}</span>`
      item.onclick = () => {
        if (this._hidden.has(i)) this._hidden.delete(i)
        else this._hidden.add(i)
        this.render()
      }
      L.appendChild(item)
    })
  }

  _animate(seriesY, xOf, yOf, plot) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }
    const baseline = plot.y + plot.h

    const targets = this._areaEls.map((a, i) => ({
      el: a.el,
      topPts: a.topPts,
      botPts: a.botPts,
      delay: (i * stagger) / duration,
      series: a.series,
    }))

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const top = tg.topPts.map(p => ({ x: p.x, y: baseline + (p.y - baseline) * e }))
        const bot = tg.botPts.map(p => ({ x: p.x, y: baseline + (p.y - baseline) * e }))
        tg.el.setAttribute('d', areaPath(top, bot, this.opts.mode, this.opts.tension))
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          tg.el.setAttribute('d', areaPath(tg.topPts, tg.botPts, this.opts.mode, this.opts.tension))
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

export default AreaChart
