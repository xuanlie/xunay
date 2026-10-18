// @xunay/kit/charts/dumbbell —— 哑铃图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'db-' + (++_uid).toString(36)

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

export class DumbbellChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Dumbbell] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: null,
      rowHeight: 36,
      padding: { top: 24, right: 90, bottom: 30, left: 120 },
      title: null, subtitle: null, theme: 'light',
      // 两个点的颜色
      colorA: '#3b82f6',       // 起点（左）
      colorB: '#f59e0b',       // 终点（右）
      colorAgree: '#10b981',   // 无变化（相同或几乎相同）
      // 圆点
      dotRadius: 8,
      dotRadiusHover: 11,
      dotStroke: true,
      dotStrokeWidth: 2,
      // 连接条
      barWidth: 4,
      barRadius: 2,
      barOpacity: 0.5,
      // 方向
      direction: 'horizontal', // 'horizontal' | 'vertical'
      // 显示
      showValueA: true,
      showValueB: true,
      showDelta: true,         // 显示差值百分比
      valueFormat: fmt,
      valueDecimals: null,
      deltaFormat: (a, b) => {
        if (a === b) return '持平'
        const p = ((b - a) / Math.abs(a || 1)) * 100
        return (p >= 0 ? '+' : '') + p.toFixed(1) + '%'
      },
      // 标签
      showLabels: true,
      // 网格
      grid: true,
      gridDash: '3 4',
      xTicks: 5,
      // 排序
      sort: 'none',            // 'none' | 'absAsc' | 'absDesc' | 'deltaAsc' | 'deltaDesc'
      // 交互
      tooltip: true,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 50 },
      onHover: null,
      onDotClick: null,
      onRowClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._rowEls = []
    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', dotStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', dotStroke: '#fff',
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
    // 图例
    this.legendEl = document.createElement('div')
    this.legendEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:16px;font-size:12.5px;margin-bottom:12px'
    c.appendChild(this.legendEl)
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
    const rows = this._data.length || 1
    const pad = this.opts.padding
    this.H = this.opts.height || Math.max(100, pad.top + pad.bottom + rows * this.opts.rowHeight)
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    let items = (data || []).map((d, i) => {
      const a = +(d.a ?? d.from ?? d.valueA ?? d.value1 ?? d.value ?? 0)
      const b = +(d.b ?? d.to ?? d.valueB ?? d.value2 ?? a)
      return {
        label: d.label != null ? d.label : (d.name != null ? d.name : String(i)),
        a, b,
        colorA: d.colorA,
        colorB: d.colorB,
        _raw: d,
      }
    })
    if (this.opts.sort === 'absAsc') items.sort((x, y) => Math.max(x.a, x.b) - Math.max(y.a, y.b))
    else if (this.opts.sort === 'absDesc') items.sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b))
    else if (this.opts.sort === 'deltaAsc') items.sort((x, y) => (x.b - x.a) - (y.b - y.a))
    else if (this.opts.sort === 'deltaDesc') items.sort((x, y) => (y.b - y.a) - (x.b - x.a))
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
  _renderLegend() {
    if (!this.legendEl) return
    this.legendEl.innerHTML = ''
    const mk = (color, label) => {
      const s = document.createElement('div')
      s.style.cssText = 'display:flex;align-items:center;gap:6px;color:' + this.theme.textMuted
      s.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span><span>${label}</span>`
      return s
    }
    // 从数据中提取起点/终点标签（若有）
    const nameA = this._data[0]?._raw?.labelA || '之前'
    const nameB = this._data[0]?._raw?.labelB || '之后'
    this.legendEl.appendChild(mk(this.opts.colorA, nameA))
    this.legendEl.appendChild(mk(this.opts.colorB, nameB))
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._rowEls = []
    if (!this._data.length) return
    const horizontal = this.opts.direction === 'horizontal'
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
    if (vMin === vMax) { vMax = vMin + 1 }
    const scale = niceScale(vMin, vMax, this.opts.xTicks)
    const vOf = v => horizontal
      ? plot.x + ((v - scale.min) / (scale.max - scale.min)) * plot.w
      : plot.y + plot.h - ((v - scale.min) / (scale.max - scale.min)) * plot.h
    const slot = (horizontal ? plot.h : plot.w) / this._data.length
    const centerOf = i => (horizontal ? plot.y : plot.x) + slot * (i + 0.5)
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of scale.ticks) {
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
        t.textContent = fmt(tick, this.opts.valueDecimals)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }
    // 逐行绘制
    const g = el('g')
    this.svg.appendChild(g)
    const dotR = this.opts.dotRadius
    this._data.forEach((item, i) => {
      const center = centerOf(i)
      const pA = vOf(item.a)
      const pB = vOf(item.b)
      const same = Math.abs(item.a - item.b) < 1e-6
      const colorA = item.colorA || this.opts.colorA
      const colorB = item.colorB || this.opts.colorB
      const barColor = same ? this.opts.colorAgree : this.opts.colorA
      const rowG = el('g', { style: 'cursor:pointer' })
      rowG._meta = { item, index: i, center, pA, pB, colorA, colorB, same, barColor }
      // 连接条
      let bar
      if (horizontal) {
        bar = el('line', {
          x1: Math.min(pA, pB), x2: Math.max(pA, pB),
          y1: center, y2: center,
          stroke: barColor,
          'stroke-width': this.opts.barWidth,
          'stroke-linecap': 'round',
          opacity: this.opts.barOpacity,
          style: 'transition:opacity .15s',
        })
      } else {
        bar = el('line', {
          x1: center, x2: center,
          y1: Math.min(pA, pB), y2: Math.max(pA, pB),
          stroke: barColor,
          'stroke-width': this.opts.barWidth,
          'stroke-linecap': 'round',
          opacity: this.opts.barOpacity,
          style: 'transition:opacity .15s',
        })
      }
      rowG.appendChild(bar)
      // 起点圆（A）
      const baseR_A = this.opts.dotRadius
      const baseR_B = same ? this.opts.dotRadius * 0.7 : this.opts.dotRadius
      const dotA = el('circle', {
        cx: horizontal ? pA : center,
        cy: horizontal ? center : pA,
        r: baseR_A,
        fill: colorA,
        stroke: this.opts.dotStroke ? this.theme.dotStroke : 'none',
        'stroke-width': this.opts.dotStroke ? this.opts.dotStrokeWidth : 0,
        style: 'transition:r .15s,filter .15s',
        'data-role': 'a',
        'data-base-r': String(baseR_A),
      })
      rowG.appendChild(dotA)
      // 终点圆（B）
      const dotB = el('circle', {
        cx: horizontal ? pB : center,
        cy: horizontal ? center : pB,
        r: baseR_B,
        fill: same ? this.opts.colorAgree : colorB,
        stroke: this.opts.dotStroke ? this.theme.dotStroke : 'none',
        'stroke-width': this.opts.dotStroke ? this.opts.dotStrokeWidth : 0,
        style: 'transition:r .15s,filter .15s',
        'data-role': 'b',
        'data-base-r': String(baseR_B),
      })
      rowG.appendChild(dotB)
      // 值标签（按数值大小排序，避免互相压）
      const valA = item.a
      const valB = item.b
      const textA = this.opts.valueFormat(valA, this.opts.valueDecimals)
      const textB = this.opts.valueFormat(valB, this.opts.valueDecimals)
      const estWA = Math.max(20, String(textA).length * 7.5)
      const estWB = Math.max(20, String(textB).length * 7.5)

      // 水平模式下，找出两圆中位置更靠左/靠右的那个
      // 每个值跟着它自己的圆走
      const leftLimit = plot.x + 4                          // 左边界（避免压分类标签）
      const rightLimit = plot.x + plot.w - 60               // 右边界（留 delta 的位置）

      if (horizontal) {
        // A 值：A 圆在左侧时贴左侧，在右侧时贴右侧
        const aIsLeft = pA <= pB
        let ax, aAnchor
        if (aIsLeft) {
          // A 在左，标签贴左边；空间不够翻到右边
          if (pA - 12 - estWA >= leftLimit) { ax = pA - 12; aAnchor = 'end' }
          else { ax = pA + 12; aAnchor = 'start' }
        } else {
          // A 在右，标签贴右边
          if (pA + 12 + estWA <= rightLimit) { ax = pA + 12; aAnchor = 'start' }
          else { ax = pA - 12; aAnchor = 'end' }
        }
        if (this.opts.showValueA) {
          const t = el('text', {
            x: ax, y: center + 4,
            'text-anchor': aAnchor,
            'font-size': 11.5, 'font-weight': 600,
            fill: colorA,
            style: 'font-variant-numeric:tabular-nums',
            'pointer-events': 'none',
          })
          t.textContent = textA
          rowG.appendChild(t)
        }
        // B 值
        const bIsRight = pB >= pA
        let bx, bAnchor
        if (bIsRight) {
          if (pB + 12 + estWB <= rightLimit) { bx = pB + 12; bAnchor = 'start' }
          else { bx = pB - 12; bAnchor = 'end' }
        } else {
          if (pB - 12 - estWB >= leftLimit) { bx = pB - 12; bAnchor = 'end' }
          else { bx = pB + 12; bAnchor = 'start' }
        }
        if (this.opts.showValueB) {
          const t = el('text', {
            x: bx, y: center + 4,
            'text-anchor': bAnchor,
            'font-size': 11.5, 'font-weight': 600,
            fill: same ? this.opts.colorAgree : colorB,
            style: 'font-variant-numeric:tabular-nums',
            'pointer-events': 'none',
          })
          t.textContent = textB
          rowG.appendChild(t)
        }
      } else {
        // 垂直模式：A 在上或下，B 与之相反
        const aIsTop = pA <= pB
        if (this.opts.showValueA) {
          const ay = aIsTop ? pA - 12 : pA + 18
          const t = el('text', {
            x: center - 10, y: ay,
            'text-anchor': 'end',
            'font-size': 11.5, 'font-weight': 600,
            fill: colorA,
            style: 'font-variant-numeric:tabular-nums',
            'pointer-events': 'none',
          })
          t.textContent = textA
          rowG.appendChild(t)
        }
        if (this.opts.showValueB) {
          const by = aIsTop ? pB + 18 : pB - 12
          const t = el('text', {
            x: center + 10, y: by,
            'text-anchor': 'start',
            'font-size': 11.5, 'font-weight': 600,
            fill: same ? this.opts.colorAgree : colorB,
            style: 'font-variant-numeric:tabular-nums',
            'pointer-events': 'none',
          })
          t.textContent = textB
          rowG.appendChild(t)
        }
      }

      // 差值（固定在右端）
      if (this.opts.showDelta) {
        const deltaText = this.opts.deltaFormat(item.a, item.b)
        const t = el('text', {
          x: plot.x + plot.w + 10,
          y: center + 4,
          'text-anchor': 'start',
          'font-size': 11, 'font-weight': 500,
          fill: same ? this.theme.textMuted : (item.b >= item.a ? '#10b981' : '#ef4444'),
          style: 'font-variant-numeric:tabular-nums',
          'pointer-events': 'none',
        })
        t.textContent = deltaText
        rowG.appendChild(t)
      }

      // 左侧分类标签
      if (this.opts.showLabels) {
        const l = el('text', {
          x: horizontal ? plot.x - 12 : center,
          y: horizontal ? center + 4 : plot.y + plot.h + 22,
          'text-anchor': horizontal ? 'end' : 'middle',
          'font-size': 12, 'font-weight': 500, fill: this.theme.text,
        })
        l.textContent = item.label.length > 14 ? item.label.slice(0, 12) + '…' : item.label
        g.appendChild(l)
      }
      g.appendChild(rowG)
      this._rowEls.push(rowG)
      // 事件
      rowG.addEventListener('mouseenter', (e) => {
        this._hover = rowG
        this._applyHover()
        this._moveTip(e, item, colorA, colorB)
      })
      rowG.addEventListener('mousemove', (e) => {
        if (this._hover === rowG) this._moveTip(e, item, colorA, colorB)
      })
      rowG.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      rowG.addEventListener('click', (e) => { if (this.opts.onRowClick) this.opts.onRowClick(item, i, e) })
      dotA.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this.opts.onDotClick) this.opts.onDotClick({ type: 'a', ...item }, i, e)
      })
      dotB.addEventListener('click', (e) => {
        e.stopPropagation()
        if (this.opts.onDotClick) this.opts.onDotClick({ type: 'b', ...item }, i, e)
      })
    })
    if (animate) this._animate(horizontal)
    this._renderLegend()
    return this
  }
  _applyHover() {
    const hot = this._hover
    for (const r of this._rowEls) {
      const isHot = r === hot
      r.style.opacity = (hot && !isHot) ? '0.35' : '1'
      r.querySelectorAll('circle[data-role]').forEach(c => {
        const base = parseFloat(c.getAttribute('data-base-r') || this.opts.dotRadius)
        if (isHot) {
          // 按比例放大到 dotRadiusHover / dotRadius
          const k = this.opts.dotRadiusHover / this.opts.dotRadius
          c.setAttribute('r', String(base * k))
        } else {
          c.setAttribute('r', String(base))
        }
      })
    }
  }
  _moveTip(e, item, colorA, colorB) {
    if (!this.tip) return
    const delta = item.b - item.a
    const pct = item.a !== 0 ? ((delta / Math.abs(item.a)) * 100) : 0
    const sign = delta >= 0 ? '+' : ''
    this.tip.innerHTML = `
      <div style="font-weight:600;margin-bottom:5px">${item.label}</div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colorA}"></span>之前</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(item.a, this.opts.valueDecimals)}</span>
        <span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colorB}"></span>之后</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(item.b, this.opts.valueDecimals)}</span>
        <span style="opacity:.7">变化</span><span style="text-align:right;color:${delta >= 0 ? '#10b981' : '#ef4444'};font-weight:600">${sign}${this.opts.valueFormat(delta, this.opts.valueDecimals)} (${sign}${pct.toFixed(1)}%)</span>
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
  _animate(horizontal) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._rowEls.map((r, i) => {
      const m = r._meta
      const circleA = r.querySelector('circle[data-role="a"]')
      const circleB = r.querySelector('circle[data-role="b"]')
      const bar = r.querySelector('line')
      return { row: r, circleA, circleB, bar, meta: m, delay: i * stagger / duration }
    })
    // 起点：两圆都在 pA 位置
    targets.forEach(tg => {
      const m = tg.meta
      tg.circleA.setAttribute('r', '0')
      tg.circleB.setAttribute('r', '0')
      // circleB 起始位置必须在 pA（否则第一帧会从 pB 跳到 pA）
      if (horizontal) {
        tg.circleB.setAttribute('cx', String(m.pA))
      } else {
        tg.circleB.setAttribute('cy', String(m.pA))
      }
      if (tg.bar) {
        if (horizontal) {
          tg.bar.setAttribute('x1', String(m.pA))
          tg.bar.setAttribute('x2', String(m.pA))
        } else {
          tg.bar.setAttribute('y1', String(m.pA))
          tg.bar.setAttribute('y2', String(m.pA))
        }
      }
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const m = tg.meta
        const bPos = m.pA + (m.pB - m.pA) * e
        // 圆B 从 A 向 B 移动
        if (horizontal) {
          tg.circleB.setAttribute('cx', String(bPos))
        } else {
          tg.circleB.setAttribute('cy', String(bPos))
        }
        tg.circleA.setAttribute('r', String(this.opts.dotRadius * e))
        const baseB = m.same ? this.opts.dotRadius * 0.7 : this.opts.dotRadius
        tg.circleB.setAttribute('r', String(baseB * e))
        if (tg.bar) {
          if (horizontal) {
            tg.bar.setAttribute('x2', String(bPos))
          } else {
            tg.bar.setAttribute('y2', String(bPos))
          }
        }
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          const m = tg.meta
          if (horizontal) {
            tg.circleB.setAttribute('cx', String(m.pB))
          } else {
            tg.circleB.setAttribute('cy', String(m.pB))
          }
          tg.circleA.setAttribute('r', String(this.opts.dotRadius))
          const baseB = m.same ? this.opts.dotRadius * 0.7 : this.opts.dotRadius
          tg.circleB.setAttribute('r', String(baseB))
          if (tg.bar) {
            if (horizontal) {
              tg.bar.setAttribute('x1', String(Math.min(m.pA, m.pB)))
              tg.bar.setAttribute('x2', String(Math.max(m.pA, m.pB)))
            } else {
              tg.bar.setAttribute('y1', String(Math.min(m.pA, m.pB)))
              tg.bar.setAttribute('y2', String(Math.max(m.pA, m.pB)))
            }
          }
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
export default DumbbellChart
