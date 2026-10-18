// @xunay/kit/charts/circlepack —— 圆堆积图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'cp-' + (++_uid).toString(36)

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
function hexToRgb(h) {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  if (amount >= 0) {
    return '#' + [r, g, b].map(v => Math.min(255, Math.round(v + (255 - v) * amount)).toString(16).padStart(2, '0')).join('')
  }
  const k = 1 + amount
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v * k)).toString(16).padStart(2, '0')).join('')
}

// 圆堆积布局：从内到外递归放置
function packCircles(node, cx, cy, r) {
  node._cx = cx
  node._cy = cy
  node._r = r
  if (!node.children || !node.children.length) return
  // 按面积 = value 比例分配半径
  const total = node.children.reduce((a, c) => a + (c.value || 1), 0) || 1
  // 找出总面积可容纳的最大内圆半径
  // 简化方法：用"贪心圆堆积"
  const placed = []
  const baseR = r * 0.92
  // 按从大到小排序
  const sorted = node.children.slice().sort((a, b) => (b.value || 1) - (a.value || 1))
  const scale = baseR / Math.sqrt(total)
  for (const c of sorted) {
    const cr = Math.sqrt(c.value || 1) * scale
    // 找位置：从中心向外螺旋放置，不与其他已放置的圆重叠，且不超出父圆
    let px = 0, py = 0
    let ok = false
    if (placed.length === 0) {
      px = cx; py = cy; ok = true
    } else {
      // 尝试沿已放置圆的边缘放置
      outer: for (let k = 0; k < placed.length; k++) {
        const p = placed[k]
        for (let ang = 0; ang < Math.PI * 2; ang += 0.15) {
          const tx = p.cx + (p.r + cr) * Math.cos(ang)
          const ty = p.cy + (p.r + cr) * Math.sin(ang)
          // 检查父圆边界
          const dToParent = Math.hypot(tx - cx, ty - cy)
          if (dToParent + cr > r * 0.98) continue
          // 检查与其他圆不重叠
          let coll = false
          for (const q of placed) {
            const dd = Math.hypot(tx - q.cx, ty - q.cy)
            if (dd < q.r + cr - 0.5) { coll = true; break }
          }
          if (!coll) { px = tx; py = ty; ok = true; break outer }
        }
      }
    }
    if (!ok) continue
    placed.push({ cx: px, cy: py, r: cr, node: c })
    packCircles(c, px, py, cr)
  }
}

export class CirclePackingChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[CirclePacking] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 480, padding: 12,
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      // 只显示到第几层
      maxDepth: 2,
      // 用父色微调子色
      childShade: 0.18,
      // 描边
      strokeWidth: 1.5,
      strokeColor: null,
      // 标签
      showLabels: true,
      minLabelR: 16,
      labelFontSize: 11.5,
      // 内圈是否有边距
      labelPadding: 0.7,
      // 悬停
      hoverStrokeWidth: 3,
      dimOpacity: 0.25,
      // 交互
      tooltip: true,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 8 },
      onHover: null,
      onCircleClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._root = null
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._circleEls = []
    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      stroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      stroke: '#ffffff',
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
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    // 归一化：{ label, value, children: [...] }
    const norm = (n, i, parentColor) => {
      const children = n.children && n.children.length ? n.children.map((c, j) => norm(c, j, n.color || parentColor)) : null
      const value = children ? children.reduce((a, b) => a + b.value, 0) : (Number(n.value ?? n.size ?? 1) || 0)
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
      children: (data.children || (Array.isArray(data) ? data : [data])).map((n, i) => norm(n, i, null)),
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
  _colorOf(node, level, index) {
    if (node.color) return node.color
    if (node._parentColor) return shade(node._parentColor, (level % 2 === 0 ? 1 : -1) * this.opts.childShade)
    return this.opts.colors[index % this.opts.colors.length]
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._circleEls = []
    if (!this._root || !this._root.children.length) return
    // 布局
    const cx = W / 2, cy = H / 2
    const rMax = Math.max(20, Math.min(W, H) / 2 - pad)
    this._root.children.forEach((c, i) => {
      c._parentColor = this.opts.colors[i % this.opts.colors.length]
      c._levelIndex = i
    })
    // 根节点内部按比例分配第一层半径，多个顶层节点放在大圆里
    // 简单方式：把 root 当成一个整体
    packCircles(this._root, cx, cy, rMax)
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    const g = el('g')
    this.svg.appendChild(g)
    // 递归绘制所有节点
    const walk = (node, level, parentColor, parentIndex) => {
      if (node !== this._root && node._r > 0.5) {
        const color = this._colorOf(node, level, node._levelIndex ?? parentIndex ?? 0)
        const circle = el('circle', {
          cx: node._cx,
          cy: node._cy,
          r: node._r,
          fill: color,
          stroke: this.opts.strokeColor || this.theme.stroke,
          'stroke-width': this.opts.strokeWidth,
          style: 'cursor:pointer;transition:filter .15s,opacity .15s',
        })
        circle._meta = { node, color, cx: node._cx, cy: node._cy, r: node._r, level }
        g.appendChild(circle)
        this._circleEls.push(circle)
        // 悬停
        circle.addEventListener('mouseenter', (e) => {
          this._hover = circle
          this._applyHover()
          this._moveTip(e, node, color)
        })
        circle.addEventListener('mousemove', (e) => { if (this._hover === circle) this._moveTip(e, node, color) })
        circle.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        circle.addEventListener('click', (e) => { if (this.opts.onCircleClick) this.opts.onCircleClick(node, level, e) })
        // 标签
        if (this.opts.showLabels && node._r >= this.opts.minLabelR && level <= this.opts.maxDepth) {
          const t = el('text', {
            x: node._cx,
            y: node._cy + 4,
            'text-anchor': 'middle',
            'font-size': Math.min(14, Math.max(10, node._r * 0.28)),
            'font-weight': 500,
            fill: '#fff',
            style: 'pointer-events:none;user-select:none;text-shadow:0 1px 2px rgba(0,0,0,.35)',
          })
          const label = node.label
          const maxChars = Math.max(3, Math.floor(node._r / 5))
          t.textContent = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label
          g.appendChild(t)
        }
      }
      if (node.children && node.children.length && level < this.opts.maxDepth) {
        for (const c of node.children) walk(c, level + 1, node.color || parentColor, node._levelIndex)
      }
    }
    this._root.children.forEach((c, i) => walk(c, 1, c._parentColor, i))
    if (animate) this._animate()
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._circleEls.forEach(c => {
        c.style.filter = ''
        c.style.opacity = '1'
        c.setAttribute('stroke-width', String(this.opts.strokeWidth))
      })
      return
    }
    const hm = hot._meta
    this._circleEls.forEach(c => {
      const m = c._meta
      const isHot = c === hot
      // 祖先或后代
      const isAncestor = hm.node._cx === m.cx && hm.node._cy === m.cy && m.r > hm.r
      const isDescendant = m.cx === hm.cx && m.cy === hm.cy && false // 需要树关系
      const related = isHot
      c.style.filter = isHot ? 'brightness(1.12)' : ''
      c.style.opacity = isHot ? '1' : String(this.opts.dimOpacity)
      c.setAttribute('stroke-width', String(isHot ? this.opts.hoverStrokeWidth : this.opts.strokeWidth))
    })
  }
  _moveTip(e, node, color) {
    if (!this.tip) return
    const total = this._root.value
    const pct = total > 0 ? (node.value / total * 100).toFixed(1) : '0'
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color}"></span>
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
      ${node.children ? `<div style="opacity:.65;font-size:11px;margin-top:3px">子节点: ${node.children.length}</div>` : ''}
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
    if (this.opts.onHover) this.opts.onHover(node)
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._circleEls.map((c, i) => ({ el: c, meta: c._meta, delay: i * stagger / duration }))
    targets.forEach(tg => {
      tg.el.setAttribute('r', '0')
      tg.el.style.opacity = '0'
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('r', String(tg.meta.r * e))
        tg.el.style.opacity = String(e)
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => { tg.el.setAttribute('r', String(tg.meta.r)); tg.el.style.opacity = '1' })
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
export default CirclePackingChart
