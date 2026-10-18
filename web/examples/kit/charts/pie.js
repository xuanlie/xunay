// @xunay/kit/charts/pie —— 精修版饼图/环形图/玫瑰图
// 特性：饼图/环形/玫瑰 · 内外半径可调 · 扇区弹出 · 引导线 ·
//      中心文字 · 图例 · 动画 · 多行标签 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'pie-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

function arcPath(cx, cy, rOuter, rInner, a0, a1) {
  const large = (a1 - a0) > Math.PI ? 1 : 0
  const x0o = cx + rOuter * Math.cos(a0)
  const y0o = cy + rOuter * Math.sin(a0)
  const x1o = cx + rOuter * Math.cos(a1)
  const y1o = cy + rOuter * Math.sin(a1)
  if (rInner <= 0) {
    return `M ${cx} ${cy} L ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} Z`
  }
  const x0i = cx + rInner * Math.cos(a1)
  const y0i = cy + rInner * Math.sin(a1)
  const x1i = cx + rInner * Math.cos(a0)
  const y1i = cy + rInner * Math.sin(a0)
  return `M ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} L ${x0i.toFixed(2)} ${y0i.toFixed(2)} A ${rInner} ${rInner} 0 ${large} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)} Z`
}

function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Math.round(v))
}

export class PieChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[PieChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 320,
      padding: 20,
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      shape: 'donut',           // 'pie' | 'donut' | 'rose'
      innerRatio: 0.6,          // 环形内半径占比
      outerRatio: 1,            // 外半径占比
      startAngle: -Math.PI / 2,
      padAngle: 0.015,          // 扇区间隙（rad）
      labelStyle: 'inside',     // 'none' | 'inside' | 'outside' | 'legend'
      labelMinAngle: 0.22,      // 小于此角度的扇区不显示标签
      showPercent: false,       // 显示百分比
      showValue: false,         // 显示数值
      centerText: null,         // 中心大字
      centerSubText: null,      // 中心小字
      legend: true,
      legendPosition: 'bottom', // 'top' | 'bottom'
      tooltip: true,
      explodeOnHover: 8,        // 悬停弹出距离（px）
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 35 },
      onHover: null,
      onSliceClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hidden = new Set()
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._sliceEls = []
    this._labelEls = []

    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      sliceStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
      labelLine: '#475569',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      sliceStroke: '#fff',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
      labelLine: '#cbd5e1',
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

    if (this.opts.legend && this.opts.legendPosition === 'top') {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = `display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px`
      c.appendChild(this.legendEl)
    }

    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'position:relative;width:100%'
    c.appendChild(this.wrap)

    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible;width:100%' })
    this.wrap.appendChild(this.svg)

    if (this.opts.legend && this.opts.legendPosition === 'bottom') {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = `display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-size:12.5px;color:${this.theme.textMuted};margin-top:14px`
      c.appendChild(this.legendEl)
    }

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

  setData(data) {
    this._data = (data || []).map((d, i) => {
      if (typeof d === 'number') return { label: String(i), value: d }
      return {
        label: d.label != null ? d.label : String(i),
        value: Math.max(0, d.value != null ? d.value : (d.y != null ? d.y : 0)),
        color: d.color,
      }
    })
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
    this._sliceEls = []
    this._labelEls = []

    // 可见数据
    const visible = this._data
      .map((d, i) => ({ ...d, _i: i }))
      .filter(d => !this._hidden.has(d._i))

    const total = visible.reduce((a, b) => a + b.value, 0)
    if (total <= 0) {
      this._legend()
      return
    }

    const cx = W / 2
    const cy = H / 2
    const rMax = Math.max(10, Math.min(W - pad * 2, H - pad * 2) / 2)
    const rOuter = rMax * this.opts.outerRatio

    // 玫瑰图：每个扇区半径按比例
    const maxVal = Math.max(...visible.map(d => d.value))

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 布局
    let a = this.opts.startAngle
    const padA = visible.length > 1 ? this.opts.padAngle : 0

    // 主体
    const g = el('g')
    this.svg.appendChild(g)

    visible.forEach((d, idx) => {
      const sweep = (d.value / total) * Math.PI * 2
      const a0 = a + padA / 2
      const a1 = a + sweep - padA / 2
      a += sweep

      const mid = (a0 + a1) / 2
      const color = d.color || this.opts.colors[d._i % this.opts.colors.length]

      // 玫瑰：扇区半径变化
      const ratio = this.opts.shape === 'rose' ? d.value / maxVal : 1
      const r = rOuter * ratio

      // 内半径
      let rInner = 0
      if (this.opts.shape === 'donut') rInner = r * this.opts.innerRatio

      const path = el('path', {
        d: arcPath(cx, cy, r, rInner, a0, a1),
        fill: color,
        stroke: this.theme.sliceStroke,
        'stroke-width': 1.5,
        style: 'cursor:pointer;transition:transform .2s ease,opacity .15s;transform-origin:' + cx + 'px ' + cy + 'px',
      })
      path._meta = { data: d, index: idx, realIndex: d._i, mid, color, r, rInner }
      g.appendChild(path)
      this._sliceEls.push(path)

      // 悬停
      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTip(e, path)
      })
      path.addEventListener('mousemove', (e) => {
        if (this._hover === path) this._moveTip(e, path)
      })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => {
        if (this.opts.onSliceClick) this.opts.onSliceClick(d, d._i, e)
      })

      // 标签
      if (this.opts.labelStyle !== 'none' && this.opts.labelStyle !== 'legend' && sweep >= this.opts.labelMinAngle) {
        this._renderLabel(g, cx, cy, r, rInner, mid, d, total, color)
      }
    })

    // 中心文字
    if (this.opts.shape === 'donut' && (this.opts.centerText || this.opts.centerSubText)) {
      const cg = el('g')
      const rInner = rOuter * this.opts.innerRatio
      if (this.opts.centerText) {
        const t1 = el('text', {
          x: cx, y: cy + 4,
          'text-anchor': 'middle', 'dominant-baseline': 'middle',
          'font-size': 26, 'font-weight': 700,
          'font-family': 'inherit', fill: this.theme.text,
        })
        t1.textContent = this.opts.centerText
        cg.appendChild(t1)
      }
      if (this.opts.centerSubText) {
        const t2 = el('text', {
          x: cx, y: cy + 26,
          'text-anchor': 'middle', 'dominant-baseline': 'middle',
          'font-size': 12,
          'font-family': 'inherit', fill: this.theme.textMuted,
        })
        t2.textContent = this.opts.centerSubText
        cg.appendChild(t2)
      }
      this.svg.appendChild(cg)
    }

    // 动画
    if (animate) this._animate(visible, total, cx, cy, rOuter)

    // 图例
    this._legend()
  }

  _renderLabel(g, cx, cy, r, rInner, mid, d, total, color) {
    const pct = (d.value / total) * 100
    const text = this.opts.showPercent
      ? pct.toFixed(1) + '%'
      : this.opts.showValue
        ? fmt(d.value)
        : d.label

    if (this.opts.labelStyle === 'inside') {
      const rr = rInner > 0 ? (r + rInner) / 2 : r * 0.65
      const x = cx + Math.cos(mid) * rr
      const y = cy + Math.sin(mid) * rr
      const t = el('text', {
        x, y: y + 4,
        'text-anchor': 'middle',
        'font-size': 11.5,
        'font-weight': 600,
        'font-family': 'inherit',
        fill: '#fff',
        style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.3)',
      })
      t.textContent = text
      g.appendChild(t)
      this._labelEls.push(t)
    } else if (this.opts.labelStyle === 'outside') {
      const rEdge = r + 12
      const x1 = cx + Math.cos(mid) * r
      const y1 = cy + Math.sin(mid) * r
      const x2 = cx + Math.cos(mid) * rEdge
      const y2 = cy + Math.sin(mid) * rEdge
      const side = Math.cos(mid) >= 0 ? 1 : -1
      const x3 = x2 + side * 20
      const y3 = y2

      const line = el('polyline', {
        points: `${x1.toFixed(2)},${y1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${x3.toFixed(2)},${y3.toFixed(2)}`,
        fill: 'none',
        stroke: this.theme.labelLine,
        'stroke-width': 1.2,
      })
      g.appendChild(line)

      const t = el('text', {
        x: x3 + side * 4,
        y: y3 + 4,
        'text-anchor': side > 0 ? 'start' : 'end',
        'font-size': 11.5,
        'font-family': 'inherit',
        fill: this.theme.text,
      })
      t.textContent = text
      g.appendChild(t)
      this._labelEls.push(t)
    }
  }

  _animate(visible, total, cx, cy, rOuter) {
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

    let a = this.opts.startAngle
    const padA = visible.length > 1 ? this.opts.padAngle : 0
    const maxVal = Math.max(...visible.map(d => d.value))
    const targets = visible.map((d, idx) => {
      const sweep = (d.value / total) * Math.PI * 2
      const a0 = a + padA / 2
      const a1 = a + sweep - padA / 2
      a += sweep
      const ratio = this.opts.shape === 'rose' ? d.value / maxVal : 1
      const r = rOuter * ratio
      const rInner = this.opts.shape === 'donut' ? r * this.opts.innerRatio : 0
      return { a0, a1, r, rInner, delay: idx * stagger / duration }
    })

    // 初始化为 0 大小
    this._sliceEls.forEach((p, i) => {
      const t = targets[i]
      p.setAttribute('d', arcPath(cx, cy, 0.01, 0.01, t.a0, t.a0 + 0.001))
      p.style.opacity = '0'
    })
    this._labelEls.forEach(l => l.style.opacity = '0')

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      this._sliceEls.forEach((p, i) => {
        const tg = targets[i]
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const r = tg.r * e
        const ri = tg.rInner * e
        const a0 = tg.a0
        const a1 = tg.a0 + (tg.a1 - tg.a0) * e
        p.setAttribute('d', arcPath(cx, cy, Math.max(0.5, r), Math.max(0, ri), a0, a1))
        p.style.opacity = String(e)
      })
      this._labelEls.forEach((l, i) => {
        const tg = targets[Math.min(i, targets.length - 1)]
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        l.style.opacity = String(tt)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        this._sliceEls.forEach((p, i) => {
          const tg = targets[i]
          p.setAttribute('d', arcPath(cx, cy, tg.r, tg.rInner, tg.a0, tg.a1))
          p.style.opacity = '1'
        })
        this._labelEls.forEach(l => l.style.opacity = '1')
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }

  _applyHover() {
    const dist = this.opts.explodeOnHover
    this._sliceEls.forEach(p => {
      const hot = p === this._hover
      const meta = p._meta
      if (hot && dist > 0) {
        const dx = Math.cos(meta.mid) * dist
        const dy = Math.sin(meta.mid) * dist
        p.style.transform = `translate(${dx}px, ${dy}px)`
        p.style.filter = 'brightness(1.12)'
      } else {
        p.style.transform = ''
        p.style.filter = ''
      }
      p.style.opacity = this._hover ? (hot ? '1' : '0.55') : '1'
    })
  }

  _moveTip(e, path) {
    if (!this.tip) return
    const meta = path._meta
    const total = this._data
      .filter((_, i) => !this._hidden.has(i))
      .reduce((a, b) => a + b.value, 0)
    const pct = ((meta.data.value / total) * 100).toFixed(1)
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${meta.color}"></span>
        <strong>${meta.data.label}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(meta.data.value)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">占比</span>
        <strong style="font-variant-numeric:tabular-nums">${pct}%</strong>
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
      this.opts.onHover({ data: meta.data, index: meta.realIndex, percent: parseFloat(pct) })
    }
  }

  _legend() {
    if (!this.legendEl) return
    const L = this.legendEl
    L.innerHTML = ''
    if (!this.opts.legend || this._data.length <= 1) {
      L.style.display = 'none'
      return
    }
    L.style.display = 'flex'
    this._data.forEach((d, i) => {
      const color = d.color || this.opts.colors[i % this.opts.colors.length]
      const hidden = this._hidden.has(i)
      const item = document.createElement('div')
      item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;opacity:${hidden ? 0.35 : 1};transition:opacity .15s`
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span><span>${d.label}</span>`
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

export default PieChart
