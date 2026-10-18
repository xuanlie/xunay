// @xunay/kit/charts/lollipop —— 棒棒糖图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'lp-' + (++_uid).toString(36)

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

export class LollipopChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Lollipop] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: null,
      rowHeight: 34,
      padding: { top: 24, right: 90, bottom: 30, left: 120 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      direction: 'horizontal',    // 'horizontal' | 'vertical'
      axisBaseline: 0,            // 基线值（通常 0 或 min）
      // 棒棒糖
      stemWidth: 2,
      dotRadius: 7,
      dotRadiusHover: 10,
      dotStroke: true,
      // 颜色策略
      colorMode: 'byValue',       // 'byValue' | 'single' | 'byGroup'
      singleColor: '#3b82f6',
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      // 分组（可选，两组对比）
      showDelta: false,           // 显示与第二组对比的差值
      // 数值标签
      showValue: true,
      valueFormat: fmt,
      valueDecimals: null,
      valuePosition: 'end',       // 'end' | 'dot'
      // 网格
      grid: true,
      gridDash: '3 4',
      xTicks: 5,
      // 排序
      sort: 'none',               // 'none' | 'asc' | 'desc'
      // 标签
      showLabels: true,
      labelWidth: 110,
      // 交互
      tooltip: true,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 40 },
      onHover: null,
      onDotClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._itemEls = []
    this._build()
    if (options.data) this.setData(options.data)
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
      if (typeof d === 'number') return { label: String(i), value: d }
      return {
        label: d.label != null ? d.label : (d.name != null ? d.name : String(i)),
        value: +(d.value ?? d.y ?? 0),
        compare: d.compare != null ? +d.compare : null,
        color: d.color,
        group: d.group,
      }
    })
    if (this.opts.sort === 'asc') items.sort((a, b) => a.value - b.value)
    else if (this.opts.sort === 'desc') items.sort((a, b) => b.value - a.value)
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
  _colorOf(item, i) {
    if (item.color) return item.color
    const m = this.opts.colorMode
    if (m === 'single') return this.opts.singleColor
    if (m === 'byValue') {
      return item.value >= this.opts.axisBaseline ? this.opts.positiveColor : this.opts.negativeColor
    }
    return this.opts.colors[i % this.opts.colors.length]
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._itemEls = []
    if (!this._data.length) return
    const horizontal = this.opts.direction === 'horizontal'
    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    // 值范围
    let vMin = this.opts.axisBaseline, vMax = this.opts.axisBaseline
    for (const d of this._data) {
      if (d.value < vMin) vMin = d.value
      if (d.value > vMax) vMax = d.value
      if (d.compare != null) {
        if (d.compare < vMin) vMin = d.compare
        if (d.compare > vMax) vMax = d.compare
      }
    }
    const scale = niceScale(vMin, vMax, this.opts.xTicks)
    const vOf = v => horizontal
      ? plot.x + ((v - scale.min) / (scale.max - scale.min)) * plot.w
      : plot.y + plot.h - ((v - scale.min) / (scale.max - scale.min)) * plot.h
    const baselinePos = vOf(this.opts.axisBaseline)
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
          { stroke: this.theme.grid, 'stroke-width': 1,
            'stroke-dasharray': tick === this.opts.axisBaseline ? '0' : this.opts.gridDash }))
        const t = el('text', {
          x: horizontal ? p : plot.x - 10,
          y: horizontal ? plot.y + plot.h + 22 : p + 4,
          'text-anchor': horizontal ? 'middle' : 'end',
          'font-size': 11, fill: this.theme.textMuted,
        })
        t.textContent = fmt(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }
    // 基线
    this.svg.appendChild(el('line', horizontal
      ? { x1: baselinePos, x2: baselinePos, y1: plot.y, y2: plot.y + plot.h }
      : { x1: plot.x, x2: plot.x + plot.w, y1: baselinePos, y2: baselinePos },
      { stroke: this.theme.axis, 'stroke-width': 1 }))
    // 逐项绘制
    const g = el('g')
    this.svg.appendChild(g)
    this._data.forEach((item, i) => {
      const color = this._colorOf(item, i)
      const center = centerOf(i)
      const pVal = vOf(item.value)
      const grp = el('g', { style: 'cursor:pointer' })
      grp._meta = { item, index: i, color, center, pVal, baselinePos }
      // 棒
      let stem
      if (horizontal) {
        stem = el('line', {
          x1: baselinePos, x2: pVal, y1: center, y2: center,
          stroke: color, 'stroke-width': this.opts.stemWidth,
          'stroke-linecap': 'round', opacity: 0.85,
          style: 'transition:opacity .15s',
        })
      } else {
        stem = el('line', {
          x1: center, x2: center, y1: baselinePos, y2: pVal,
          stroke: color, 'stroke-width': this.opts.stemWidth,
          'stroke-linecap': 'round', opacity: 0.85,
          style: 'transition:opacity .15s',
        })
      }
      grp.appendChild(stem)
      // 对比点（可选）
      if (item.compare != null) {
        const pCmp = vOf(item.compare)
        const cmp = el('circle', {
          cx: horizontal ? pCmp : center,
          cy: horizontal ? center : pCmp,
          r: this.opts.dotRadius * 0.7,
          fill: 'none',
          stroke: color, 'stroke-width': 1.5,
          'stroke-dasharray': '3 3',
          opacity: 0.6,
        })
        grp.appendChild(cmp)
        // 差值区域
        const fillG = el('rect', {
          x: horizontal ? Math.min(baselinePos, Math.min(pVal, pCmp)) : center - 4,
          y: horizontal ? center - 4 : Math.min(baselinePos, Math.min(pVal, pCmp)),
          width: horizontal ? Math.abs(pVal - pCmp) : 8,
          height: horizontal ? 8 : Math.abs(pVal - pCmp),
          fill: color, opacity: 0.08,
        })
        grp.appendChild(fillG)
      }
      // 圆点
      const dot = el('circle', {
        cx: horizontal ? pVal : center,
        cy: horizontal ? center : pVal,
        r: this.opts.dotRadius,
        fill: color,
        stroke: this.opts.dotStroke ? (this.theme.bg === 'transparent' ? '#fff' : this.theme.bg) : 'none',
        'stroke-width': this.opts.dotStroke ? 2 : 0,
        style: 'transition:r .15s,filter .15s',
        'data-is-dot': '1',
        'data-base-r': String(this.opts.dotRadius),
      })
      grp.appendChild(dot)
      // 值标签
      if (this.opts.showValue) {
        const vText = this.opts.valueFormat(item.value, this.opts.valueDecimals)
        const isPositive = item.value >= this.opts.axisBaseline
        // 粗略估算文本宽度（够用即可）
        const estW = Math.max(24, String(vText).length * 7.5)
        let tx, ty, anchor
        if (horizontal) {
          if (isPositive) {
            // 正数：标签放圆点右侧
            tx = pVal + 12
            anchor = 'start'
          } else {
            // 负数：圆点左侧若有足够空间就放左侧；否则改放圆点右侧
            // 左侧可用边界 = plot.x（分类标签区右侧）
            const leftLimit = plot.x + 6
            if (pVal - 12 - estW >= leftLimit) {
              tx = pVal - 12
              anchor = 'end'
            } else {
              tx = pVal + 12
              anchor = 'start'
            }
          }
          ty = center + 4
        } else {
          // 垂直
          if (isPositive) {
            ty = pVal - 12
          } else {
            // 负数标签向下：若超出绘图底部则翻到上方
            const bottomLimit = plot.y + plot.h - 4
            ty = (pVal + 18 <= bottomLimit) ? pVal + 18 : pVal - 12
          }
          tx = center
          anchor = 'middle'
        }
        const t = el('text', {
          x: tx, y: ty,
          'text-anchor': anchor,
          'font-size': 11.5, 'font-weight': 600,
          fill: this.theme.text,
          style: 'font-variant-numeric:tabular-nums',
          'pointer-events': 'none',
        })
        t.textContent = vText
        grp.appendChild(t)
      }
      // 左侧分类标签
      if (this.opts.showLabels) {
        const l = el('text', {
          x: horizontal ? plot.x - 12 : center,
          y: horizontal ? center + 4 : plot.y + plot.h + 22,
          'text-anchor': horizontal ? 'end' : 'middle',
          'font-size': 12, fill: this.theme.text,
          'font-weight': 500,
        })
        l.textContent = item.label.length > 16 ? item.label.slice(0, 14) + '…' : item.label
        g.appendChild(l)
      }
      g.appendChild(grp)
      this._itemEls.push(grp)
      // 事件
      grp.addEventListener('mouseenter', (e) => {
        this._hover = grp
        this._applyHover()
        this._moveTip(e, item, color)
      })
      grp.addEventListener('mousemove', (e) => { if (this._hover === grp) this._moveTip(e, item, color) })
      grp.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      grp.addEventListener('click', (e) => { if (this.opts.onDotClick) this.opts.onDotClick(item, i, e) })
    })
    if (animate) this._animate()
    return this
  }
  _applyHover() {
    const hot = this._hover
    for (const g of this._itemEls) {
      const isHot = g === hot
      g.style.opacity = (hot && !isHot) ? '0.35' : '1'
      const dot = g.querySelector('circle[data-is-dot="1"]')
      if (dot) {
        const baseR = dot.getAttribute('data-base-r')
        const r = baseR ? parseFloat(baseR) : this.opts.dotRadius
        dot.setAttribute('r', String(isHot ? this.opts.dotRadiusHover : r))
      }
    }
  }
  _moveTip(e, item, color) {
    if (!this.tip) return
    let extra = ''
    if (item.compare != null) {
      const diff = item.value - item.compare
      const sign = diff >= 0 ? '+' : ''
      extra = `
        <div style="display:flex;justify-content:space-between;gap:20px">
          <span style="opacity:.7">对比</span>
          <strong>${this.opts.valueFormat(item.compare, this.opts.valueDecimals)}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;gap:20px">
          <span style="opacity:.7">差值</span>
          <strong style="color:${diff >= 0 ? '#10b981' : '#ef4444'}">${sign}${this.opts.valueFormat(diff, this.opts.valueDecimals)}</strong>
        </div>
      `
    }
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}"></span>
        <strong>${item.label}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">数值</span><span style="text-align:right;font-weight:600">${this.opts.valueFormat(item.value, this.opts.valueDecimals)}</span>
        ${extra}
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
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._itemEls.map((g, i) => {
      const m = g._meta
      const dot = g.querySelector('circle[data-is-dot="1"]') || g.querySelectorAll('circle')[g.querySelectorAll('circle').length - 1]
      const stems = g.querySelector('line')
      return { g, dot, stems, meta: m, delay: i * stagger / duration }
    })
    // 记录主圆点的最终半径
    this._itemEls.forEach(g => {
      const dot = g.querySelector('circle[data-is-dot="1"]')
      if (dot) dot.setAttribute('data-base-r', String(this.opts.dotRadius))
    })
    // 起始状态
    targets.forEach(tg => {
      const m = tg.meta
      const horizontal = this.opts.direction === 'horizontal'
      // 圆点回到基线
      tg.dot.setAttribute('cx', horizontal ? m.baselinePos : m.center)
      tg.dot.setAttribute('cy', horizontal ? m.center : m.baselinePos)
      tg.dot.setAttribute('r', '0')
      // 线回到基线
      if (tg.stems) {
        if (horizontal) {
          tg.stems.setAttribute('x2', String(m.baselinePos))
        } else {
          tg.stems.setAttribute('y2', String(m.baselinePos))
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
        const horizontal = this.opts.direction === 'horizontal'
        // 线延伸
        if (tg.stems) {
          if (horizontal) {
            const x = m.baselinePos + (m.pVal - m.baselinePos) * e
            tg.stems.setAttribute('x2', String(x))
          } else {
            const y = m.baselinePos + (m.pVal - m.baselinePos) * e
            tg.stems.setAttribute('y2', String(y))
          }
        }
        // 点移动到终点 + 半径增长
        if (horizontal) {
          tg.dot.setAttribute('cx', String(m.baselinePos + (m.pVal - m.baselinePos) * e))
        } else {
          tg.dot.setAttribute('cy', String(m.baselinePos + (m.pVal - m.baselinePos) * e))
        }
        tg.dot.setAttribute('r', String(this.opts.dotRadius * e))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          const m = tg.meta
          const horizontal = this.opts.direction === 'horizontal'
          if (tg.stems) {
            if (horizontal) tg.stems.setAttribute('x2', String(m.pVal))
            else tg.stems.setAttribute('y2', String(m.pVal))
          }
          if (horizontal) tg.dot.setAttribute('cx', String(m.pVal))
          else tg.dot.setAttribute('cy', String(m.pVal))
          tg.dot.setAttribute('r', String(this.opts.dotRadius))
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
export default LollipopChart
