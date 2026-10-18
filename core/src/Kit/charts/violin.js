// @xunay/kit/charts/violin —— 小提琴图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'vn-' + (++_uid).toString(36)

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
function quantile(sorted, q) {
  if (!sorted.length) return 0
  const idx = (sorted.length - 1) * q
  const lo = Math.floor(idx), hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}
// 高斯核密度估计
function kde(values, bandwidth, grid) {
  const n = values.length
  if (!n) return grid.map(x => ({ x, y: 0 }))
  const sq2pi = Math.sqrt(2 * Math.PI)
  return grid.map(x => {
    let sum = 0
    for (const v of values) {
      const u = (x - v) / bandwidth
      sum += Math.exp(-0.5 * u * u)
    }
    return { x, y: sum / (n * bandwidth * sq2pi) }
  })
}
// 计算带宽（Silverman's rule of thumb）
function bandwidth(sorted) {
  const n = sorted.length
  if (n < 2) return 1
  const q1 = quantile(sorted, 0.25)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const sd = Math.sqrt(sorted.reduce((a, b) => a + (b - sorted.reduce((x, y) => x + y, 0) / n) ** 2, 0) / n)
  const a = Math.min(sd, iqr / 1.34) || sd || 1
  return 1.06 * a * Math.pow(n, -0.2)
}

export class ViolinChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Violin] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 400,
      padding: { top: 24, right: 24, bottom: 48, left: 52 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      direction: 'vertical',      // 'vertical' | 'horizontal'
      widthRatio: 0.8,            // 相对 slot
      resolution: 80,             // 密度曲线采样点数
      bandwidth: null,            // null = Silverman 自动
      fillOpacity: 0.55,
      strokeWidth: 1.5,
      // 内部箱线
      showBox: true,
      boxWidth: 0.16,
      boxColor: null,             // null = 用 series 色深一点的
      showMedian: true,
      medianColor: '#fff',
      showMean: false,
      meanColor: '#fff',
      // 原始点抖动
      showJitter: false,
      jitterRadius: 1.5,
      // 网格
      grid: true,
      gridDash: '3 4',
      yTicks: 5,
      yFormat: v => fmt(v),
      xFormat: v => String(v),
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 80 },
      onHover: null,
      onViolinClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._groups = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._violinEls = []
    this._build()
    if (options.data || options.groups) this.setData(options)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1',
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
    let groups = []
    if (input.groups) {
      groups = input.groups.map((g, i) => ({
        label: g.label != null ? g.label : '组 ' + (i + 1),
        values: (g.values || []).slice(),
        color: g.color,
      }))
    } else if (input.data) {
      if (Array.isArray(input.data[0])) {
        groups = input.data.map((vals, i) => ({
          label: (input.labels && input.labels[i]) || '组 ' + (i + 1),
          values: vals.slice(),
        }))
      } else {
        groups = [{ label: input.label || '数据', values: input.data.slice() }]
      }
    }
    this._groups = groups.map(g => {
      const sorted = g.values.slice().sort((a, b) => a - b)
      const n = sorted.length
      const mean = n ? sorted.reduce((a, b) => a + b, 0) / n : 0
      const q1 = quantile(sorted, 0.25)
      const med = quantile(sorted, 0.5)
      const q3 = quantile(sorted, 0.75)
      const iqr = q3 - q1
      const loFence = q1 - 1.5 * iqr
      const hiFence = q3 + 1.5 * iqr
      let whiskLow = sorted[0] || 0, whiskHigh = sorted[n - 1] || 0
      for (const v of sorted) if (v >= loFence) { whiskLow = v; break }
      for (let i = n - 1; i >= 0; i--) if (sorted[i] <= hiFence) { whiskHigh = sorted[i]; break }
      const bw = this.opts.bandwidth != null ? this.opts.bandwidth : bandwidth(sorted)
      return { ...g, sorted, stats: { n, mean, q1, med, q3, iqr, whiskLow, whiskHigh, min: sorted[0] || 0, max: sorted[n - 1] || 0, bw } }
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
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._violinEls = []
    if (!this._groups.length) return
    const horizontal = this.opts.direction === 'horizontal'
    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    // 值范围
    let vMin = Infinity, vMax = -Infinity
    for (const g of this._groups) {
      if (g.stats.min < vMin) vMin = g.stats.min
      if (g.stats.max > vMax) vMax = g.stats.max
    }
    if (!isFinite(vMin)) { vMin = 0; vMax = 1 }
    const vScale = niceScale(vMin, vMax, this.opts.yTicks)
    const vOf = v => horizontal
      ? plot.x + ((v - vScale.min) / (vScale.max - vScale.min)) * plot.w
      : plot.y + plot.h - ((v - vScale.min) / (vScale.max - vScale.min)) * plot.h
    const slot = (horizontal ? plot.h : plot.w) / this._groups.length
    const violinW = slot * this.opts.widthRatio
    const centerOf = i => (horizontal ? plot.y : plot.x) + slot * (i + 0.5)
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格 + 刻度
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of vScale.ticks) {
        const p = vOf(tick)
        g.appendChild(el('line', horizontal
          ? { x1: p, x2: p, y1: plot.y, y2: plot.y + plot.h }
          : { x1: plot.x, x2: plot.x + plot.w, y1: p, y2: p },
          { stroke: this.theme.grid, 'stroke-width': 1, 'stroke-dasharray': this.opts.gridDash }))
        const t = el('text', {
          x: horizontal ? p : plot.x - 10,
          y: horizontal ? plot.y + plot.h + 22 : p + 4,
          'text-anchor': horizontal ? 'middle' : 'end',
          'font-size': 11, fill: this.theme.textMuted,
        })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }
    // 轴
    this.svg.appendChild(el('line', horizontal
      ? { x1: plot.x, x2: plot.x, y1: plot.y, y2: plot.y + plot.h }
      : { x1: plot.x, x2: plot.x + plot.w, y1: plot.y + plot.h, y2: plot.y + plot.h },
      { stroke: this.theme.axis, 'stroke-width': 1 }))
    // 每个小提琴
    const g = el('g')
    this.svg.appendChild(g)
    const { resolution } = this.opts
    // 全局最大密度（用于跨组统一缩放，让对比公平）
    let globalMaxDensity = 0
    const densityCache = this._groups.map(grp => {
      const bw = grp.stats.bw || 1
      const lo = vScale.min
      const hi = vScale.max
      const grid = []
      for (let k = 0; k < resolution; k++) {
        grid.push(lo + (hi - lo) * (k / (resolution - 1)))
      }
      const dens = kde(grp.sorted, bw, grid)
      const maxD = Math.max(...dens.map(d => d.y))
      if (maxD > globalMaxDensity) globalMaxDensity = maxD
      return dens
    })
    this._groups.forEach((grp, i) => {
      const color = grp.color || this.opts.colors[i % this.opts.colors.length]
      const center = centerOf(i)
      const dens = densityCache[i]
      // 生成对称路径
      const left = [], right = []
      dens.forEach(d => {
        const w = (d.y / globalMaxDensity) * (violinW / 2)
        const x = vOf(d.x)
        if (horizontal) {
          left.push({ x: center - w, y: x })
          right.push({ x: center + w, y: x })
        } else {
          left.push({ x: center - w, y: x })
          right.push({ x: center + w, y: x })
        }
      })
      // 小提琴轮廓：上边 → 右边 → 下边 → 左边
      const top = left[0]
      const bot = left[left.length - 1]
      let d = ''
      // 左边缘从上到下
      d = 'M ' + left[0].x.toFixed(2) + ' ' + left[0].y.toFixed(2)
      for (let k = 1; k < left.length; k++) {
        d += ' L ' + left[k].x.toFixed(2) + ' ' + left[k].y.toFixed(2)
      }
      // 右边缘从下到上
      for (let k = right.length - 1; k >= 0; k--) {
        d += ' L ' + right[k].x.toFixed(2) + ' ' + right[k].y.toFixed(2)
      }
      d += ' Z'
      const path = el('path', {
        d,
        fill: color,
        'fill-opacity': this.opts.fillOpacity,
        stroke: color,
        'stroke-width': this.opts.strokeWidth,
        'stroke-linejoin': 'round',
        style: 'cursor:pointer;transition:fill-opacity .15s,filter .15s',
      })
      path._meta = { group: grp, index: i, color, center }
      g.appendChild(path)
      this._violinEls.push(path)
      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTip(e, grp, i)
      })
      path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, grp, i) })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => { if (this.opts.onViolinClick) this.opts.onViolinClick(grp, i, e) })
      // 内部箱线
      if (this.opts.showBox) {
        const boxW = violinW * this.opts.boxWidth
        const boxColor = this.opts.boxColor || color
        const q1p = vOf(grp.stats.q1)
        const q3p = vOf(grp.stats.q3)
        const medp = vOf(grp.stats.med)
        const meanp = vOf(grp.stats.mean)
        const wloP = vOf(grp.stats.whiskLow)
        const whiP = vOf(grp.stats.whiskHigh)
        if (horizontal) {
          // 箱体
          g.appendChild(el('rect', {
            x: Math.min(q1p, q3p), y: center - boxW / 2,
            width: Math.max(1, Math.abs(q3p - q1p)), height: boxW,
            fill: color, opacity: 0.9,
            style: 'pointer-events:none',
          }))
          // 中位线
          if (this.opts.showMedian) {
            g.appendChild(el('line', {
              x1: medp, x2: medp, y1: center - boxW / 2, y2: center + boxW / 2,
              stroke: this.opts.medianColor, 'stroke-width': 2,
              style: 'pointer-events:none',
            }))
          }
          // 均值
          if (this.opts.showMean) {
            const d2 = 3
            g.appendChild(el('circle', {
              cx: meanp, cy: center, r: d2,
              fill: this.opts.meanColor || '#fff',
              stroke: color, 'stroke-width': 1,
              style: 'pointer-events:none',
            }))
          }
          // 胡须
          g.appendChild(el('line', {
            x1: wloP, x2: q1p, y1: center, y2: center,
            stroke: color, 'stroke-width': 1.5, style: 'pointer-events:none',
          }))
          g.appendChild(el('line', {
            x1: q3p, x2: whiP, y1: center, y2: center,
            stroke: color, 'stroke-width': 1.5, style: 'pointer-events:none',
          }))
        } else {
          g.appendChild(el('rect', {
            x: center - boxW / 2, y: Math.min(q1p, q3p),
            width: boxW, height: Math.max(1, Math.abs(q3p - q1p)),
            fill: color, opacity: 0.9, style: 'pointer-events:none',
          }))
          if (this.opts.showMedian) {
            g.appendChild(el('line', {
              x1: center - boxW / 2, x2: center + boxW / 2, y1: medp, y2: medp,
              stroke: this.opts.medianColor, 'stroke-width': 2, style: 'pointer-events:none',
            }))
          }
          if (this.opts.showMean) {
            const d2 = 3
            g.appendChild(el('circle', {
              cx: center, cy: meanp, r: d2,
              fill: this.opts.meanColor || '#fff',
              stroke: color, 'stroke-width': 1, style: 'pointer-events:none',
            }))
          }
          g.appendChild(el('line', {
            x1: center, x2: center, y1: wloP, y2: q1p,
            stroke: color, 'stroke-width': 1.5, style: 'pointer-events:none',
          }))
          g.appendChild(el('line', {
            x1: center, x2: center, y1: q3p, y2: whiP,
            stroke: color, 'stroke-width': 1.5, style: 'pointer-events:none',
          }))
        }
      }
      // 抖动散点
      if (this.opts.showJitter) {
        const jw = violinW * 0.6
        for (const v of grp.values) {
          const jitter = (Math.random() - 0.5) * jw
          const p = vOf(v)
          const dot = el('circle', {
            cx: horizontal ? p : center + jitter,
            cy: horizontal ? center + jitter : p,
            r: this.opts.jitterRadius,
            fill: color, opacity: 0.5,
            style: 'pointer-events:none',
          })
          g.appendChild(dot)
        }
      }
      // X 轴标签
      const label = el('text', {
        x: horizontal ? plot.x - 10 : center,
        y: horizontal ? center + 4 : plot.y + plot.h + 22,
        'text-anchor': horizontal ? 'end' : 'middle',
        'font-size': 11.5, fill: this.theme.textMuted,
      })
      label.textContent = this.opts.xFormat(grp.label)
      g.appendChild(label)
    })
    if (animate) this._animate(vOf)
    return this
  }
  _applyHover() {
    for (const v of this._violinEls) {
      const isHot = v === this._hover
      v.setAttribute('fill-opacity', isHot ? 0.85 : (this._hover ? 0.3 : this.opts.fillOpacity))
      v.style.filter = isHot ? 'brightness(1.05)' : ''
    }
  }
  _moveTip(e, grp, i) {
    if (!this.tip) return
    const s = grp.stats
    const color = grp.color || this.opts.colors[i % this.opts.colors.length]
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${grp.label}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px">
        <span style="opacity:.7">样本数</span><span style="text-align:right">${s.n}</span>
        <span style="opacity:.7">中位数</span><span style="text-align:right;font-weight:600">${fmt(s.med)}</span>
        <span style="opacity:.7">均值</span><span style="text-align:right">${fmt(s.mean)}</span>
        <span style="opacity:.7">Q1 / Q3</span><span style="text-align:right">${fmt(s.q1)} / ${fmt(s.q3)}</span>
        <span style="opacity:.7">范围</span><span style="text-align:right">${fmt(s.min)} ~ ${fmt(s.max)}</span>
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
    if (this.opts.onHover) this.opts.onHover({ group: grp, index: i, stats: s })
  }
  _animate(vOf) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._violinEls.map((v, i) => ({
      el: v, d: v.getAttribute('d'), delay: i * stagger / duration,
    }))
    targets.forEach(t => { t.el.setAttribute('fill-opacity', '0'); t.el.setAttribute('stroke-opacity', '0') })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('fill-opacity', String(this.opts.fillOpacity * e))
        tg.el.setAttribute('stroke-opacity', String(e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          tg.el.setAttribute('fill-opacity', String(this.opts.fillOpacity))
          tg.el.setAttribute('stroke-opacity', '1')
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
export default ViolinChart
