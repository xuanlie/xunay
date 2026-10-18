// @xunay/kit/charts/line —— 精修版折线图
// 特性：平滑曲线 · 渐变填充 · 数据点动画 · 十字准线 · 
//      跟随 tooltip · 多 series · null 断线 · 标注 · 参考线 · 
//      图例 · 键盘导航 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'ln-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

// 平滑曲线（Catmull-Rom → Bezier）
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

function stepPath(pts) {
  return pts.map((p, i) => i === 0
    ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    : `H ${p.x.toFixed(2)} V ${p.y.toFixed(2)}`).join(' ')
}

function areaPath(pts, baseline, mode, tension) {
  if (!pts.length) return ''
  const top = mode === 'step' ? stepPath(pts)
    : mode === 'smooth' ? smoothPath(pts, tension)
    : linePath(pts)
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${top} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`
}

// nice 刻度
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
  for (let v = niceMin; v <= niceMax + step * 1e-6; v += step) {
    ticks.push(Number(v.toFixed(10)))
  }
  return { min: niceMin, max: niceMax, step, ticks }
}

function defaultFormat(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  if (Math.abs(v) < 1) return v.toFixed(2)
  return String(Math.round(v))
}

export class LineChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container
    if (!this.container) throw new Error('[LineChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,           // 自动
      height: 340,
      padding: { top: 30, right: 24, bottom: 40, left: 52 },
      title: null,
      subtitle: null,
      theme: 'light',        // 'light' | 'dark'
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
      mode: 'smooth',        // 'line' | 'smooth' | 'step'
      tension: 0.35,
      area: true,            // 面积填充
      areaOpacity: [0.28, 0.02],
      pointRadius: 4,
      pointRadiusHover: 6.5,
      strokeWidth: 2.5,
      grid: true,
      gridDash: '3 4',
      crosshair: true,
      tooltip: true,
      legend: true,
      legendPosition: 'top',
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 40 },
      yTicks: 5,
      xTickCount: null,
      yFormat: defaultFormat,
      xFormat: v => String(v),
      tooltipFormat: null,
      onHover: null,
      onPointClick: null,
      annotations: [],       // [{ x, y, text, color }]
      referenceLines: [],    // [{ y, label, color, dash }]
    }, options)

    this.theme = this._makeTheme(this.opts.theme)
    this._series = []
    this._hidden = new Set()
    this._hover = null
    this._animProgress = 1
    this._cancelAnim = null
    this._resizeObs = null
    this._pointEls = []
    this._regionEls = []

    this._build()
    if (options.data || options.series) {
      this.setData(options.series || [{ name: options.name || '数据', data: options.data }])
    }
    this._setupResize()
  }

  _makeTheme(t) {
    if (t === 'dark') {
      return {
        bg: 'transparent',
        text: '#e2e8f0',
        textMuted: '#94a3b8',
        grid: '#1e293b',
        axis: '#334155',
        crosshair: '#64748b',
        tooltipBg: 'rgba(15, 23, 42, 0.96)',
        tooltipColor: '#f8fafc',
        tooltipBorder: 'rgba(148, 163, 184, 0.15)',
        legendBg: 'transparent',
      }
    }
    return {
      bg: 'transparent',
      text: '#0f172a',
      textMuted: '#64748b',
      grid: '#e2e8f0',
      axis: '#cbd5e1',
      crosshair: '#94a3b8',
      tooltipBg: 'rgba(15, 23, 42, 0.96)',
      tooltipColor: '#f8fafc',
      tooltipBorder: 'rgba(255,255,255,0.08)',
      legendBg: 'transparent',
    }
  }

  _build() {
    const c = this.container
    c.innerHTML = ''
    c.style.position = 'relative'
    c.style.width = '100%'
    c.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif'

    // 标题
    if (this.opts.title) {
      const title = document.createElement('div')
      title.style.cssText = `font-size:16px;font-weight:600;color:${this.theme.text};margin-bottom:6px`
      title.textContent = this.opts.title
      c.appendChild(title)
    }
    if (this.opts.subtitle) {
      const sub = document.createElement('div')
      sub.style.cssText = `font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px`
      sub.textContent = this.opts.subtitle
      c.appendChild(sub)
    }

    // 图例
    this.legendEl = document.createElement('div')
    this.legendEl.style.cssText = `display:flex;flex-wrap:wrap;gap:18px;font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px;min-height:0`
    c.appendChild(this.legendEl)

    // 图表区
    this.chartWrap = document.createElement('div')
    this.chartWrap.style.cssText = 'position:relative;width:100%'
    c.appendChild(this.chartWrap)

    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible;width:100%' })
    this.chartWrap.appendChild(this.svg)

    // tooltip
    if (this.opts.tooltip) {
      this.tip = document.createElement('div')
      this.tip.style.cssText = `
        position:absolute;pointer-events:none;opacity:0;
        transition:opacity .12s ease;
        background:${this.theme.tooltipBg};
        color:${this.theme.tooltipColor};
        border:1px solid ${this.theme.tooltipBorder};
        padding:8px 12px;border-radius:8px;
        font-size:12.5px;line-height:1.55;
        box-shadow:0 8px 24px rgba(0,0,0,0.18);
        backdrop-filter:blur(6px);
        white-space:nowrap;z-index:10;
      `
      this.chartWrap.appendChild(this.tip)
    }
  }

  _measure() {
    const rect = this.chartWrap.getBoundingClientRect()
    const w = this.opts.width || Math.max(1, Math.round(rect.width || 640))
    const h = this.opts.height
    this.W = w
    this.H = h
    this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(h))
    this.svg.setAttribute('fill', 'none')
  }

  setData(series) {
    this._series = series.map((s, i) => ({
      name: s.name || `系列 ${i + 1}`,
      color: s.color || this.opts.colors[i % this.opts.colors.length],
      data: (s.data || []).map((d, j) => {
        if (typeof d === 'number') return { x: j, y: d, label: String(j) }
        return {
          x: d.x != null ? d.x : j,
          y: d.y != null ? d.y : (d.value != null ? d.value : null),
          label: d.label != null ? d.label : String(d.x != null ? d.x : j),
        }
      }),
      strokeWidth: s.strokeWidth || this.opts.strokeWidth,
      area: s.area != null ? s.area : this.opts.area,
      mode: s.mode || this.opts.mode,
      tension: s.tension != null ? s.tension : this.opts.tension,
    }))
    this._hidden.clear()
    this.render()
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._makeTheme(o.theme)
    this.render()
    return this
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom
    const p = { x: pad.left, y: pad.top, w: plotW, h: plotH }

    // 清空
    this.svg.innerHTML = ''
    this._pointEls = []
    this._regionEls = []

    // 可见 series
    const visible = this._series.filter((_, i) => !this._hidden.has(i))

    // y 范围
    const ys = visible.flatMap(s => s.data.map(d => d.y)).filter(v => v != null && !isNaN(v))
    let yMin = Math.min(0, ...ys)
    let yMax = Math.max(0, ...ys)
    if (yMin === yMax) yMax = yMin + 1
    const scale = niceScale(yMin, yMax, this.opts.yTicks)
    const yOf = v => p.y + p.h - ((v - scale.min) / (scale.max - scale.min)) * p.h

    // x 位置：以第一 series 的 label 为主
    const refSeries = visible[0] || this._series[0]
    const n = refSeries ? refSeries.data.length : 0
    const xOf = i => p.x + (n <= 1 ? p.w / 2 : (i / (n - 1)) * p.w)

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 网格 + y 刻度
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of scale.ticks) {
        const y = yOf(tick)
        g.appendChild(el('line', {
          x1: p.x, x2: p.x + p.w, y1: y, y2: y,
          stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': tick === scale.min ? '0' : this.opts.gridDash,
        }))
        const t = el('text', {
          x: p.x - 10, y: y + 4,
          'text-anchor': 'end',
          'font-size': 11,
          'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }

    // x 轴刻度
    const xTickStride = this.opts.xTickCount
      ? Math.max(1, Math.ceil(n / this.opts.xTickCount))
      : Math.max(1, Math.ceil(n / 8))
    const xg = el('g')
    for (let i = 0; i < n; i += xTickStride) {
      const x = xOf(i)
      const label = refSeries.data[i]?.label ?? String(i)
      const t = el('text', {
        x, y: p.y + p.h + 22,
        'text-anchor': 'middle',
        'font-size': 11,
        'font-family': 'inherit',
        fill: this.theme.textMuted,
      })
      t.textContent = this.opts.xFormat(label)
      xg.appendChild(t)
    }
    this.svg.appendChild(xg)

    // 轴
    this.svg.appendChild(el('line', {
      x1: p.x, x2: p.x, y1: p.y, y2: p.y + p.h,
      stroke: this.theme.axis, 'stroke-width': 1,
    }))
    this.svg.appendChild(el('line', {
      x1: p.x, x2: p.x + p.w, y1: p.y + p.h, y2: p.y + p.h,
      stroke: this.theme.axis, 'stroke-width': 1,
    }))

    // 参考线
    if (this.opts.referenceLines?.length) {
      const rg = el('g')
      for (const r of this.opts.referenceLines) {
        const y = yOf(r.y)
        rg.appendChild(el('line', {
          x1: p.x, x2: p.x + p.w, y1: y, y2: y,
          stroke: r.color || '#ef4444', 'stroke-width': 1.5,
          'stroke-dasharray': r.dash || '6 4',
        }))
        if (r.label) {
          const t = el('text', {
            x: p.x + p.w - 4, y: y - 4,
            'text-anchor': 'end', 'font-size': 11,
            'font-family': 'inherit',
            fill: r.color || '#ef4444',
          })
          t.textContent = r.label
          rg.appendChild(t)
        }
      }
      this.svg.appendChild(rg)
    }

    // series 组
    const sg = el('g')
    this.svg.appendChild(sg)

    // 渐变定义
    const defs = el('defs')
    this.svg.insertBefore(defs, this.svg.firstChild)

    // 渲染每条 series
    this._series.forEach((s, si) => {
      if (this._hidden.has(si)) return
      const color = s.color
      const gradId = uid()
      const grad = el('linearGradient', {
        id: gradId, x1: '0', y1: '0', x2: '0', y2: '1',
      })
      const [o0, o1] = this.opts.areaOpacity
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': o0 }))
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': o1 }))
      defs.appendChild(grad)

      // 构建 points（含 null 断点）
      const segments = []
      let cur = []
      s.data.forEach((d, i) => {
        if (d.y == null || isNaN(d.y)) {
          if (cur.length) { segments.push(cur); cur = [] }
        } else {
          cur.push({ x: xOf(i), y: yOf(d.y), datum: d, idx: i })
        }
      })
      if (cur.length) segments.push(cur)

      // 面积
      if (s.area) {
        for (const seg of segments) {
          if (seg.length < 2) continue
          const ap = el('path', {
            d: areaPath(seg, p.y + p.h, s.mode, s.tension),
            fill: `url(#${gradId})`,
          })
          sg.appendChild(ap)
        }
      }

      // 线
      const lineEls = []
      for (const seg of segments) {
        if (!seg.length) continue
        let d
        if (s.mode === 'step') d = stepPath(seg)
        else if (s.mode === 'smooth') d = smoothPath(seg, s.tension)
        else d = linePath(seg)
        const path = el('path', {
          d,
          stroke: color,
          'stroke-width': s.strokeWidth,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          fill: 'none',
        })
        sg.appendChild(path)
        lineEls.push({ path, seg })
      }

      // 数据点
      s.data.forEach((d, i) => {
        if (d.y == null || isNaN(d.y)) return
        const cx = xOf(i)
        const cy = yOf(d.y)
        const dot = el('circle', {
          cx, cy, r: this.opts.pointRadius,
          fill: color,
          stroke: this.theme.bg === 'transparent' ? '#fff' : this.theme.bg,
          'stroke-width': 2,
          style: 'cursor:pointer;transition:r .12s ease',
        })
        sg.appendChild(dot)
        this._pointEls.push({ el: dot, seriesIdx: si, dataIdx: i, x: cx, y: cy })
      })

      // 入场动画
      if (animate) {
        lineEls.forEach(({ path }) => {
          const len = path.getTotalLength()
          path.style.strokeDasharray = String(len)
          path.style.strokeDashoffset = String(len)
        })
        this._pointEls
          .filter(pe => pe.seriesIdx === si)
          .forEach(pe => { pe.el.style.opacity = '0'; pe.el.style.transform = 'scale(0)'; pe.el.style.transformOrigin = `${pe.x}px ${pe.y}px` })
      }
    })

    // 标注
    if (this.opts.annotations?.length) {
      const ag = el('g')
      for (const a of this.opts.annotations) {
        const x = xOf(a.x)
        const y = a.y != null ? yOf(a.y) : null
        if (x == null) continue
        ag.appendChild(el('circle', {
          cx: x, cy: y ?? p.y + 20, r: 5,
          fill: a.color || '#ef4444',
          stroke: '#fff', 'stroke-width': 2,
        }))
        if (a.text) {
          const t = el('text', {
            x, y: (y ?? p.y + 20) - 12,
            'text-anchor': 'middle', 'font-size': 11,
            'font-family': 'inherit',
            fill: a.color || '#ef4444',
            'font-weight': 600,
          })
          t.textContent = a.text
          ag.appendChild(t)
        }
      }
      this.svg.appendChild(ag)
    }

    // 十字准线层
    this.crossLayer = el('g', { style: 'pointer-events:none' })
    this.svg.appendChild(this.crossLayer)

    // 图例
    this._renderLegend()

    // 事件层
    this._attachEvents(p, xOf, yOf)

    // 动画启动
    if (animate) {
      this._runAnim(lineEls_, 0)
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
      const item = document.createElement('div')
      const hidden = this._hidden.has(i)
      item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;opacity:${hidden ? 0.35 : 1};transition:opacity .15s`
      const dot = document.createElement('span')
      dot.style.cssText = `display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color}`
      const label = document.createElement('span')
      label.textContent = s.name
      item.appendChild(dot)
      item.appendChild(label)
      item.onclick = () => {
        if (this._hidden.has(i)) this._hidden.delete(i)
        else this._hidden.add(i)
        this.render()
      }
      L.appendChild(item)
    })
  }

  _attachEvents(p, xOf, yOf) {
    // 事件层覆盖整个 plot 区
    const layer = el('rect', {
      x: p.x, y: p.y, width: p.w, height: p.h,
      fill: 'transparent',
      style: 'cursor:crosshair',
    })
    this.svg.appendChild(layer)

    const onMove = (e) => {
      const rect = this.svg.getBoundingClientRect()
      const scaleX = this.W / rect.width
      const mx = (e.clientX - rect.left) * scaleX
      const my = (e.clientY - rect.top) * scaleX
      // 找最近点
      let best = null, bestDist = Infinity
      for (const pe of this._pointEls) {
        const dx = pe.x - mx
        const d = dx * dx
        if (d < bestDist) { bestDist = d; best = pe }
      }
      if (!best || Math.abs(best.x - mx) > p.w / 8) {
        this._hideHover()
        return
      }
      this._showHover(best, p, my)
    }

    const onLeave = () => this._hideHover()

    layer.addEventListener('mousemove', onMove)
    layer.addEventListener('mouseleave', onLeave)

    // 键盘
    if (!this._keyBound) {
      this._keyBound = true
      this.chartWrap.tabIndex = 0
      this.chartWrap.style.outline = 'none'
      this.chartWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this._hideHover()
      })
    }
  }

  _showHover(pe, p, my) {
    const s = this._series[pe.seriesIdx]
    if (!s) return
    this._hover = pe

    // 高亮点
    for (const pt of this._pointEls) {
      const hot = pt === pe
      pt.el.setAttribute('r', hot ? this.opts.pointRadiusHover : this.opts.pointRadius)
      pt.el.setAttribute('opacity', hot ? 1 : 0.55)
    }

    // 十字线
    this.crossLayer.innerHTML = ''
    if (this.opts.crosshair) {
      this.crossLayer.appendChild(el('line', {
        x1: pe.x, x2: pe.x, y1: p.y, y2: p.y + p.h,
        stroke: this.theme.crosshair,
        'stroke-width': 1,
        'stroke-dasharray': '3 4',
        opacity: 0.8,
      }))
    }

    // tooltip
    if (this.tip) {
      const datum = s.data[pe.dataIdx]
      const containerRect = this.chartWrap.getBoundingClientRect()
      const scaleX = this.W / containerRect.width
      let html
      if (this.opts.tooltipFormat) {
        html = this.opts.tooltipFormat({ series: s, datum, seriesIndex: pe.seriesIdx, dataIndex: pe.dataIdx })
      } else {
        html = `
          <div style="opacity:.75;margin-bottom:3px;font-size:11.5px">${this.opts.xFormat(datum.label)}</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.color}"></span>
            <span style="flex:1">${s.name}</span>
            <strong style="font-variant-numeric:tabular-nums">${this.opts.yFormat(datum.y)}</strong>
          </div>
        `
      }
      this.tip.innerHTML = html
      this.tip.style.opacity = '1'
      const tipW = this.tip.offsetWidth
      const tipH = this.tip.offsetHeight
      const x = pe.x / scaleX
      const y = pe.y / scaleX
      let left = x + 14
      let top = y - tipH / 2
      if (left + tipW > containerRect.width - 4) left = x - tipW - 14
      if (top < 0) top = 4
      if (top + tipH > containerRect.height) top = containerRect.height - tipH - 4
      this.tip.style.left = left + 'px'
      this.tip.style.top = top + 'px'
    }

    if (this.opts.onHover) {
      this.opts.onHover({ series: s, datum: s.data[pe.dataIdx], seriesIndex: pe.seriesIdx, dataIndex: pe.dataIdx })
    }
  }

  _hideHover() {
    this._hover = null
    for (const pt of this._pointEls) {
      pt.el.setAttribute('r', this.opts.pointRadius)
      pt.el.setAttribute('opacity', '1')
    }
    if (this.crossLayer) this.crossLayer.innerHTML = ''
    if (this.tip) this.tip.style.opacity = '0'
    if (this.opts.onHover) this.opts.onHover(null)
  }

  _runAnim(lineEls, delay) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const pts = this._pointEls.slice()

    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const e = ease(t)
      // 线绘制
      for (const { path } of (this.svg.querySelectorAll('path[style*="stroke-dasharray"]') || [])) {}
      this.svg.querySelectorAll('path').forEach((path) => {
        if (path.style.strokeDasharray) {
          const len = parseFloat(path.style.strokeDasharray)
          path.style.strokeDashoffset = String(len * (1 - e))
        }
      })
      // 点
      pts.forEach((pe, i) => {
        const d = (i * stagger) / duration
        const tt = Math.max(0, Math.min(1, (t - d) / (1 - d)))
        const ee = ease(tt)
        pe.el.style.opacity = String(ee)
        pe.el.style.transform = `scale(${ee})`
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        // 清动画痕迹
        this.svg.querySelectorAll('path').forEach((path) => {
          path.style.strokeDasharray = ''
          path.style.strokeDashoffset = ''
        })
        pts.forEach(pe => { pe.el.style.opacity = '1'; pe.el.style.transform = '' })
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
      const w = this.chartWrap.clientWidth
      if (w > 0 && w !== last) {
        last = w
        this.render()
      }
    })
    this._resizeObs.observe(this.chartWrap)
    last = this.chartWrap.clientWidth
  }

  replay() { this.render({ animate: true }); return this }
  destroy() {
    if (this._cancelAnim) this._cancelAnim()
    if (this._resizeObs) this._resizeObs.disconnect()
    this.container.innerHTML = ''
  }
}

export default LineChart
