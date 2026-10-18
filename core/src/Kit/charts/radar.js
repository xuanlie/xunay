// @xunay/kit/charts/radar —— 精修版雷达图
// 特性：多边形/圆形网格 · 多系列对比 · 面积渐变 · 悬停高亮 · 
//      轴标签 · tooltip · 图例 · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'radar-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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

export class RadarChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[RadarChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 360,
      padding: 40,
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
      shape: 'polygon',         // 'polygon' | 'circle'
      levels: 5,                // 网格层数
      areaOpacity: 0.22,
      strokeWidth: 2,
      pointRadius: 4,
      pointRadiusHover: 7,
      showAxisLabels: true,
      axisLabelRadius: 1.12,
      labelFontSize: 12,
      max: null,                // 手动指定最大值，否则自动
      grid: true,
      gridDash: null,           // null = 实线
      tooltip: true,
      legend: true,
      yFormat: fmt,
      animation: { duration: 850, easing: 'easeOutCubic', stagger: 80 },
      onHover: null,
      onPointClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._indicators = []
    this._series = []
    this._hidden = new Set()
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._areaEls = []
    this._pointEls = []
    this._hitEls = []

    this._build()
    if (options.data || options.series || options.indicators || options.labels) {
      this.setData(options)
    }
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1',
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
    this.legendEl.style.cssText = `display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px`
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
        font-size:12.5px;line-height:1.55;
        box-shadow:0 8px 24px rgba(0,0,0,.18);
        backdrop-filter:blur(6px);white-space:nowrap;z-index:10;
      `
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
    // indicators：['性能','易用','功能'] 或 [{ name, max }]
    this._indicators = (input.indicators || input.labels || []).map(x =>
      typeof x === 'string' ? { name: x, max: input.max || null }
        : { name: x.name ?? x.label ?? '', max: x.max ?? input.max ?? null })

    // series：支持 [{ name, data: [90,70,85] }] 或 [{ name, data: [{value}] }]
    this._series = (input.series || (input.data ? [{ name: input.name || '数据', data: input.data }] : []))
      .map((s, i) => ({
        name: s.name || `系列 ${i + 1}`,
        color: s.color || this.opts.colors[i % this.opts.colors.length],
        values: (s.data || []).map(d => {
          if (typeof d === 'number') return d
          return d.value != null ? d.value : (d.y != null ? d.y : 0)
        }),
      }))

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

    this.svg.innerHTML = ''
    this._areaEls = []
    this._pointEls = []
    this._hitEls = []

    const n = this._indicators.length
    if (n < 3) {
      this._legend()
      return
    }

    const cx = W / 2
    const cy = H / 2
    const rMax = Math.max(20, Math.min(W - pad * 2, H - pad * 2) / 2)

    // 每轴最大值
    const axisMax = this._indicators.map((ind, i) => {
      if (ind.max != null) return ind.max
      if (this.opts.max != null) return this.opts.max
      const all = this._series
        .filter((_, si) => !this._hidden.has(si))
        .map(s => s.values[i] ?? 0)
      return Math.max(1, ...all)
    })

    const angleOf = i => -Math.PI / 2 + (i / n) * Math.PI * 2
    const pointAt = (i, ratio) => {
      const a = angleOf(i)
      return { x: cx + Math.cos(a) * rMax * ratio, y: cy + Math.sin(a) * rMax * ratio }
    }

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // ===== 网格 =====
    if (this.opts.grid) {
      const g = el('g')
      const levels = this.opts.levels
      for (let lv = 1; lv <= levels; lv++) {
        const ratio = lv / levels
        if (this.opts.shape === 'circle') {
          g.appendChild(el('circle', {
            cx, cy, r: rMax * ratio,
            stroke: this.theme.grid, 'stroke-width': 1,
            'stroke-dasharray': this.opts.gridDash || '0',
            fill: 'none',
          }))
        } else {
          const pts = []
          for (let i = 0; i < n; i++) {
            const p = pointAt(i, ratio)
            pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`)
          }
          g.appendChild(el('polygon', {
            points: pts.join(' '),
            stroke: this.theme.grid, 'stroke-width': 1,
            'stroke-dasharray': this.opts.gridDash || '0',
            fill: 'none',
          }))
        }
      }
      // 轴线
      for (let i = 0; i < n; i++) {
        const p = pointAt(i, 1)
        g.appendChild(el('line', {
          x1: cx, y1: cy, x2: p.x, y2: p.y,
          stroke: this.theme.grid, 'stroke-width': 1,
        }))
      }
      this.svg.appendChild(g)
    }

    // ===== 轴标签 =====
    if (this.opts.showAxisLabels) {
      const lg = el('g')
      for (let i = 0; i < n; i++) {
        const a = angleOf(i)
        const rl = rMax * this.opts.axisLabelRadius
        const x = cx + Math.cos(a) * rl
        const y = cy + Math.sin(a) * rl
        let anchor = 'middle'
        if (Math.abs(Math.cos(a)) > 0.3) anchor = Math.cos(a) > 0 ? 'start' : 'end'
        const t = el('text', {
          x, y: y + 4,
          'text-anchor': anchor,
          'dominant-baseline': 'middle',
          'font-size': this.opts.labelFontSize,
          'font-family': 'inherit',
          fill: this.theme.text,
          'font-weight': 500,
        })
        t.textContent = this._indicators[i].name
        lg.appendChild(t)
      }
      this.svg.appendChild(lg)
    }

    // ===== 渐变定义 =====
    const defs = el('defs')
    this.svg.insertBefore(defs, this.svg.firstChild)

    // ===== 主体层 =====
    const sg = el('g')
    this.svg.appendChild(sg)

    const visibleSeries = this._series
      .map((s, i) => ({ s, i }))
      .filter(({ i }) => !this._hidden.has(i))

    visibleSeries.forEach(({ s, i }) => {
      const color = s.color
      const gid = uid()
      const grad = el('radialGradient', {
        id: gid, cx: '50%', cy: '50%', r: '50%',
      })
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': this.opts.areaOpacity * 0.4 }))
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': this.opts.areaOpacity }))
      defs.appendChild(grad)

      // 计算点
      const pts = s.values.slice(0, n).map((v, idx) => {
        const ratio = Math.min(1, Math.max(0, v / axisMax[idx]))
        return { ...pointAt(idx, ratio), value: v, idx }
      })

      // 面积
      if (pts.length >= 3) {
        const d = 'M ' + pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ') + ' Z'
        const area = el('path', {
          d,
          fill: `url(#${gid})`,
          stroke: color,
          'stroke-width': this.opts.strokeWidth,
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
        })
        sg.appendChild(area)
        this._areaEls.push({ el: area, seriesIdx: i, pts })
      }

      // 数据点
      pts.forEach((p, idx) => {
        const dot = el('circle', {
          cx: p.x, cy: p.y, r: this.opts.pointRadius,
          fill: color,
          stroke: this.theme.bg === 'transparent' ? '#fff' : this.theme.bg,
          'stroke-width': 2,
          style: 'cursor:pointer;transition:r .12s ease',
        })
        sg.appendChild(dot)
        this._pointEls.push({ el: dot, x: p.x, y: p.y, seriesIdx: i, dataIdx: idx, series: s, value: p.value })
      })
    })

    // ===== 悬停命中层（透明小圆）=====
    const hg = el('g')
    this.svg.appendChild(hg)
    this._series.forEach((s, si) => {
      if (this._hidden.has(si)) return
      s.values.slice(0, n).forEach((v, idx) => {
        const ratio = Math.min(1, Math.max(0, v / axisMax[idx]))
        const p = pointAt(idx, ratio)
        const hit = el('circle', {
          cx: p.x, cy: p.y, r: 14,
          fill: 'transparent',
          style: 'cursor:pointer',
        })
        hit._meta = { seriesIdx: si, dataIdx: idx, x: p.x, y: p.y, series: s, value: v }
        hit.addEventListener('mouseenter', (e) => {
          this._hover = hit
          this._applyHover()
          this._moveTip(e, hit)
        })
        hit.addEventListener('mousemove', (e) => {
          if (this._hover === hit) this._moveTip(e, hit)
        })
        hit.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        hit.addEventListener('click', (e) => {
          if (this.opts.onPointClick) {
            this.opts.onPointClick(
              { indicator: this._indicators[idx].name, value: v, series: s.name },
              si, idx, e
            )
          }
        })
        hg.appendChild(hit)
        this._hitEls.push(hit)
      })
    })

    // 动画
    if (animate) this._animate(cx, cy, rMax, axisMax, n)

    this._legend()
  }

  _animate(cx, cy, rMax, axisMax, n) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      if (easing === 'easeOutBack') {
        const c1 = 1.70158, c3 = c1 + 1
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
      }
      return t
    }

    const targets = this._areaEls.map(({ pts }, si) => ({
      pts,
      delay: si * stagger / duration,
    }))

    // 初始：中心
    this._areaEls.forEach(({ el: e }) => { e.style.opacity = '0' })
    this._pointEls.forEach(p => { p.el.style.opacity = '0'; p.el.style.transform = 'scale(0)'; p.el.style.transformOrigin = `${p.x}px ${p.y}px` })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)

      this._areaEls.forEach(({ el: e, pts }, si) => {
        const tg = targets[si]
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const ee = ease(tt)
        const scaled = pts.map(p => ({
          x: cx + (p.x - cx) * ee,
          y: cy + (p.y - cy) * ee,
        }))
        const d = 'M ' + scaled.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ') + ' Z'
        e.setAttribute('d', d)
        e.style.opacity = String(ee)
      })

      this._pointEls.forEach(p => {
        const tg = targets[p.seriesIdx]
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const ee = ease(tt)
        const x = cx + (p.x - cx) * ee
        const y = cy + (p.y - cy) * ee
        p.el.setAttribute('cx', x)
        p.el.setAttribute('cy', y)
        p.el.style.opacity = String(ee)
        p.el.style.transform = `scale(${ee})`
      })

      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        this._areaEls.forEach(({ el: e, pts }) => {
          e.setAttribute('d', 'M ' + pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ') + ' Z')
          e.style.opacity = '1'
        })
        this._pointEls.forEach(p => {
          p.el.setAttribute('cx', p.x)
          p.el.setAttribute('cy', p.y)
          p.el.style.opacity = '1'
          p.el.style.transform = ''
        })
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }

  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._pointEls.forEach(p => {
        p.el.setAttribute('r', this.opts.pointRadius)
        p.el.setAttribute('opacity', '1')
      })
      this._areaEls.forEach(a => { a.el.style.opacity = '1' })
      return
    }
    const meta = hot._meta
    this._pointEls.forEach(p => {
      const isHot = p.seriesIdx === meta.seriesIdx && p.dataIdx === meta.dataIdx
      p.el.setAttribute('r', isHot ? this.opts.pointRadiusHover : this.opts.pointRadius)
      p.el.setAttribute('opacity', isHot ? '1' : '0.5')
    })
    this._areaEls.forEach(a => {
      a.el.style.opacity = a.seriesIdx === meta.seriesIdx ? '1' : '0.35'
    })
  }

  _moveTip(e, hit) {
    if (!this.tip) return
    const meta = hit._meta
    const ind = this._indicators[meta.dataIdx]
    this.tip.innerHTML = `
      <div style="opacity:.75;margin-bottom:3px;font-size:11.5px">${ind.name}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${meta.series.color}"></span>
        <span style="flex:1">${meta.series.name}</span>
        <strong style="font-variant-numeric:tabular-nums">${this.opts.yFormat(meta.value)}</strong>
      </div>
    `
    this.tip.style.opacity = '1'
    const rect = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    let left = cx + 14
    let top = cy - th / 2
    if (left + tw > rect.width - 4) left = cx - tw - 14
    if (top < 0) top = 4
    if (top + th > rect.height) top = rect.height - th - 4
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) {
      this.opts.onHover({
        indicator: ind.name,
        series: meta.series.name,
        value: meta.value,
        seriesIndex: meta.seriesIdx,
        dataIndex: meta.dataIdx,
      })
    }
  }

  _legend() {
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
      item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;opacity:${hidden ? 0.35 : 1};transition:opacity .15s`
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color}"></span><span>${s.name}</span>`
      item.onclick = () => {
        if (this._hidden.has(i)) this._hidden.delete(i)
        else this._hidden.add(i)
        this.render()
      }
      L.appendChild(item)
    })
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

export default RadarChart
