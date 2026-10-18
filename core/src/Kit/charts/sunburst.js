// @xunay/kit/charts/sunburst —— 旭日图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'sb-' + (++_uid).toString(36)

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
function arcPath(cx, cy, rO, rI, a0, a1) {
  const large = (a1 - a0) > Math.PI ? 1 : 0
  const x0o = cx + rO * Math.cos(a0), y0o = cy + rO * Math.sin(a0)
  const x1o = cx + rO * Math.cos(a1), y1o = cy + rO * Math.sin(a1)
  if (rI <= 0) return `M ${cx} ${cy} L ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${rO} ${rO} 0 ${large} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} Z`
  const x0i = cx + rI * Math.cos(a1), y0i = cy + rI * Math.sin(a1)
  const x1i = cx + rI * Math.cos(a0), y1i = cy + rI * Math.sin(a0)
  return `M ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${rO} ${rO} 0 ${large} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} L ${x0i.toFixed(2)} ${y0i.toFixed(2)} A ${rI} ${rI} 0 ${large} 0 ${x1i.toFixed(2)} ${y1i.toFixed(2)} Z`
}
function shade(hex, amount) {
  const h = hex.replace('#', '')
  const arr = h.length === 3 ? h.split('').map(c => c + c) : [h.slice(0,2), h.slice(2,4), h.slice(4,6)]
  const [r, g, b] = arr.map(x => parseInt(x, 16))
  if (amount >= 0) {
    return '#' + [r, g, b].map(v => Math.min(255, Math.round(v + (255 - v) * amount)).toString(16).padStart(2, '0')).join('')
  }
  const k = 1 + amount
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v * k)).toString(16).padStart(2, '0')).join('')
}

export class SunburstChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Sunburst] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 400, padding: 20,
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      innerRadius: 0.22,
      gap: 1.5,
      startAngle: -Math.PI / 2,
      fullCircle: true,
      showCenterLabel: true,
      centerLabelText: null,
      labelMinAngle: 0.15,
      labelMinRadius: 40,
      hoverExpand: 0.04,
      tooltip: true,
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 15 },
      onHover: null, onSliceClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._root = null
    this._layers = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._sliceEls = []
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
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      sliceStroke: '#fff',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 480))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    // 归一化：{ label, value, children }
    const norm = (n, i, parentColor) => {
      const children = n.children && n.children.length ? n.children.map((c, j) => norm(c, j, n.color || parentColor)) : null
      const value = children ? children.reduce((a, b) => a + b.value, 0) : (Number(n.value) || 0)
      return {
        label: n.label || n.name || String(i),
        value,
        children,
        color: n.color || null,
        _parentColor: parentColor,
        _raw: n,
      }
    }
    this._root = {
      label: 'root',
      value: 0,
      children: (data.children || data).map((n, i) => norm(n, i, null)),
      color: null,
    }
    this._root.value = this._root.children.reduce((a, b) => a + b.value, 0)
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _computeColor(node, level, index) {
    if (node.color) return node.color
    if (node._parentColor) {
      // 子节点用父色微调
      return shade(node._parentColor, 0.12 + (index % 3) * 0.1 - 0.1)
    }
    return this.opts.colors[index % this.opts.colors.length]
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H
    this.svg.innerHTML = ''
    this._sliceEls = []
    this._layers = []
    if (!this._root || !this._root.children.length) return
    const cx = W / 2, cy = H / 2
    const rMax = Math.max(20, Math.min(W, H) / 2 - this.opts.padding)
    const r0 = rMax * this.opts.innerRadius
    // 求最大深度
    let maxDepth = 0
    const findDepth = (n, d) => { n._depth = d; maxDepth = Math.max(maxDepth, d); if (n.children) n.children.forEach(c => findDepth(c, d + 1)) }
    findDepth(this._root, 0)
    // 每层的半径
    const ringGap = 2
    const layerCount = maxDepth
    const layerWidth = (rMax - r0) / layerCount
    const startA = this.opts.startAngle
    const fullSweep = this.opts.fullCircle ? Math.PI * 2 : Math.PI * 1.5
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 布局：递归赋值角度
    const layout = (node, a0, a1, depth) => {
      node._a0 = a0
      node._a1 = a1
      node._depth = depth
      node._rI = r0 + (depth - 1) * layerWidth
      node._rO = r0 + depth * layerWidth - this.opts.gap
      if (node.children && node.children.length) {
        const total = node.children.reduce((a, b) => a + b.value, 0)
        let acc = a0
        for (const c of node.children) {
          const s = (c.value / total) * (a1 - a0)
          layout(c, acc, acc + s, depth + 1)
          acc += s
        }
      }
    }
    this._root.children.forEach((c, i) => {
      const total = this._root.value
      const a0 = startA + (i === 0 ? 0 : this._root.children.slice(0, i).reduce((a, b) => a + b.value, 0) / total * fullSweep)
      const a1 = a0 + (c.value / total) * fullSweep
      c._parentColor = this.opts.colors[i % this.opts.colors.length]
      c._levelIndex = i
      layout(c, a0, a1, 1)
    })
    // 绘制所有分片
    const g = el('g')
    this.svg.appendChild(g)
    const walk = (node, level) => {
      if (node !== this._root) {
        const color = this._computeColor(node, level, node._levelIndex || 0)
        const path = el('path', {
          d: arcPath(cx, cy, node._rO, node._rI, node._a0, node._a1),
          fill: color,
          stroke: this.theme.sliceStroke,
          'stroke-width': 1,
          style: 'cursor:pointer;transition:filter .15s,opacity .15s',
        })
        path._meta = { node, color, cx, cy, a0: node._a0, a1: node._a1, rI: node._rI, rO: node._rO, depth: level }
        g.appendChild(path)
        this._sliceEls.push(path)
        path.addEventListener('mouseenter', (e) => {
          this._hover = path
          this._applyHover()
          this._moveTip(e, node, color)
        })
        path.addEventListener('mousemove', (e) => { if (this._hover === path) this._moveTip(e, node, color) })
        path.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        path.addEventListener('click', (e) => { if (this.opts.onSliceClick) this.opts.onSliceClick(node, level, e) })
        // 标签
        const mid = (node._a0 + node._a1) / 2
        const rMid = (node._rI + node._rO) / 2
        const angle = node._a1 - node._a0
        if (angle >= this.opts.labelMinAngle && rMid >= this.opts.labelMinRadius) {
          const lx = cx + Math.cos(mid) * rMid
          const ly = cy + Math.sin(mid) * rMid
          const t = el('text', {
            x: lx, y: ly + 4,
            'text-anchor': 'middle',
            'font-size': Math.max(9, Math.min(12, layerWidth * 0.3)),
            'font-weight': 500,
            fill: '#fff',
            style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.3)',
          })
          t.textContent = node.label.length > 8 && angle < 0.4 ? node.label.slice(0, 7) + '…' : node.label
          g.appendChild(t)
        }
      }
      if (node.children && node.children.length) node.children.forEach(c => walk(c, level + 1))
    }
    this._root.children.forEach(c => walk(c, 1))
    // 中心标签
    if (this.opts.showCenterLabel) {
      const cg = el('g')
      if (this.opts.centerLabelText) {
        const t = el('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 16, 'font-weight': 600, fill: this.theme.text })
        t.textContent = this.opts.centerLabelText
        cg.appendChild(t)
      } else {
        const t1 = el('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 22, 'font-weight': 700, fill: this.theme.text, style: 'font-variant-numeric:tabular-nums' })
        t1.textContent = fmt(this._root.value)
        cg.appendChild(t1)
        const t2 = el('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': 11, fill: this.theme.textMuted })
        t2.textContent = '总计'
        cg.appendChild(t2)
      }
      this.svg.appendChild(cg)
    }
    if (animate) this._animate()
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._sliceEls.forEach(s => {
        s.setAttribute('transform', '')
        s.style.filter = ''
        s.style.opacity = '1'
      })
      return
    }
    const hm = hot._meta
    this._sliceEls.forEach(s => {
      const m = s._meta
      const isHot = s === hot
      const isAncestor = m.a0 <= hm.a0 && m.a1 >= hm.a1 && m.depth < hm.depth
      const isDescendant = m.a0 >= hm.a0 && m.a1 <= hm.a1 && m.depth > hm.depth
      if (isHot) {
        // 弹出
        const mid = (m.a0 + m.a1) / 2
        const dx = Math.cos(mid) * 4
        const dy = Math.sin(mid) * 4
        s.setAttribute('transform', `translate(${dx} ${dy})`)
        s.style.filter = 'brightness(1.15)'
        s.style.opacity = '1'
      } else if (isAncestor || isDescendant) {
        s.setAttribute('transform', '')
        s.style.filter = ''
        s.style.opacity = '1'
      } else {
        s.setAttribute('transform', '')
        s.style.filter = ''
        s.style.opacity = '0.3'
      }
    })
  }
  _moveTip(e, node, color) {
    if (!this.tip) return
    const total = this._root.value
    const pct = total > 0 ? (node.value / total * 100).toFixed(1) : '0'
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${node.label}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong>${fmt(node.value)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">占比</span>
        <strong>${pct}%</strong>
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const cx = e.clientX - r.left, cy = e.clientY - r.top
    let left = cx + 14, top = cy - th - 10
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = cy + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover(node)
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._sliceEls.map((s, i) => ({ el: s, meta: s._meta, delay: (i * stagger) / duration }))
    const W = this.W, H = this.H
    const cx = W / 2, cy = H / 2
    targets.forEach(tg => {
      const m = tg.meta
      // 起始：只画一条缝
      tg.el.setAttribute('d', arcPath(cx, cy, m.rI + 0.1, m.rI, m.a0, m.a0 + 0.001))
      tg.el.style.opacity = '0'
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const m = tg.meta
        const rO = m.rI + (m.rO - m.rI) * e
        const a1 = m.a0 + (m.a1 - m.a0) * e
        tg.el.setAttribute('d', arcPath(cx, cy, rO, m.rI, m.a0, a1))
        tg.el.style.opacity = String(e)
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => { const m = tg.meta; tg.el.setAttribute('d', arcPath(cx, cy, m.rO, m.rI, m.a0, m.a1)); tg.el.style.opacity = '1' })
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
export default SunburstChart
