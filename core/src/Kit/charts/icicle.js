// @xunay/kit/charts/icicle —— 冰柱图（层级矩形条）
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'ic-' + (++_uid).toString(36)

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
  if (amount >= 0) return '#' + [r, g, b].map(v => Math.min(255, Math.round(v + (255 - v) * amount)).toString(16).padStart(2, '0')).join('')
  const k = 1 + amount
  return '#' + [r, g, b].map(v => Math.max(0, Math.round(v * k)).toString(16).padStart(2, '0')).join('')
}

export class IcicleChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Icicle] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 420,
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      direction: 'vertical',   // 'vertical' = 层级向下 | 'horizontal' = 层级向右
      maxDepth: null,          // null = 全部
      // 色度
      shadeMode: 'byDepth',    // 'byDepth' | 'byParent' | 'single'
      depthShade: -0.08,       // 每深层色度
      singleColor: '#3b82f6',
      // 每层间隙
      layerGap: 2,
      itemGap: 1,
      // 标签
      showLabels: true,
      labelMinW: 40,
      labelMinH: 18,
      labelFontSize: 11,
      // 交互
      tooltip: true,
      dimOpacity: 0.25,
      // 动画
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 12 },
      onHover: null,
      onItemClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._root = null
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 720))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }
  setData(data) {
    // 归一化 { label, value, children }
    const norm = (n, i, parentColor) => {
      const children = n.children && n.children.length ? n.children.map((c, j) => norm(c, j, n.color || parentColor)) : null
      const value = children ? children.reduce((a, b) => a + b.value, 0) : (Number(n.value ?? n.size ?? 1) || 0)
      return {
        label: n.label || n.name || String(i),
        value, children,
        color: n.color || null,
        _parentColor: parentColor,
        _raw: n,
      }
    }
    const root = {
      label: 'root', value: 0,
      children: (data.children || (Array.isArray(data) ? data : [data])).map((n, i) => norm(n, i, null)),
      color: null,
    }
    root.value = root.children.reduce((a, b) => a + b.value, 0)
    this._root = root
    // 计算最大深度
    let maxD = 0
    const walk = (n, d) => { maxD = Math.max(maxD, d); if (n.children) n.children.forEach(c => walk(c, d + 1)) }
    walk(root, 0)
    this._maxDepth = this.opts.maxDepth != null ? Math.min(this.opts.maxDepth, maxD) : maxD
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _colorOf(node, depth, parentIndex) {
    if (node.color) return node.color
    const m = this.opts.shadeMode
    if (m === 'single') return this.opts.singleColor
    if (m === 'byParent' && node._parentColor) {
      return shade(node._parentColor, this.opts.depthShade)
    }
    if (depth === 1) return this.opts.colors[(node._levelIndex ?? parentIndex ?? 0) % this.opts.colors.length]
    if (node._parentColor) return shade(node._parentColor, this.opts.depthShade)
    return this.opts.colors[depth % this.opts.colors.length]
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._itemEls = []
    if (!this._root) return
    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    const horizontal = this.opts.direction === 'horizontal'
    // 计算每层厚度
    const depthCount = this._maxDepth + 1
    const thickness = (horizontal ? plot.w : plot.h) / depthCount
    // 第一层：给每个子节点设置 _levelIndex
    this._root.children.forEach((c, i) => {
      c._parentColor = this.opts.colors[i % this.opts.colors.length]
      c._levelIndex = i
    })
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    const g = el('g')
    this.svg.appendChild(g)
    // 递归布局
    const gap = this.opts.layerGap
    const ig = this.opts.itemGap
    const layout = (node, level, startPos, spanSize) => {
      // 该节点的矩形区（跨 layer 的）—— icicle 里每个节点只占自己那一层
      // node 的可视矩形在 layer = level 的条带上
      if (level > this._maxDepth) return
      if (level >= 1) {
        const color = this._colorOf(node, level)
        // 位置
        let x, y, w, h
        if (horizontal) {
          x = plot.x + (level - 1) * thickness + gap / 2
          w = thickness - gap
          y = startPos + ig / 2
          h = Math.max(1, spanSize - ig)
        } else {
          y = plot.y + (level - 1) * thickness + gap / 2
          h = thickness - gap
          x = startPos + ig / 2
          w = Math.max(1, spanSize - ig)
        }
        const rect = el('rect', {
          x, y, width: w, height: h,
          rx: 2,
          fill: color,
          stroke: this.theme.stroke, 'stroke-width': 0.5,
          style: 'cursor:pointer;transition:filter .15s,opacity .15s',
        })
        rect._meta = { node, color, level, x, y, w, h }
        g.appendChild(rect)
        this._itemEls.push(rect)
        // 标签
        const dim = horizontal ? h : w
        const otherDim = horizontal ? w : h
        if (this.opts.showLabels && dim > this.opts.labelMinW && otherDim > this.opts.labelMinH) {
          const t = el('text', {
            x: horizontal ? x + w / 2 : x + w / 2,
            y: horizontal ? y + h / 2 + 4 : y + h / 2 + 4,
            'text-anchor': 'middle',
            'font-size': this.opts.labelFontSize,
            'font-weight': 500,
            fill: '#fff',
            style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.35)',
          })
          const maxChars = Math.max(3, Math.floor(dim / 6))
          const label = node.label
          t.textContent = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label
          g.appendChild(t)
        }
        // 事件
        rect.addEventListener('mouseenter', (e) => {
          this._hover = rect
          this._applyHover()
          this._moveTip(e, node, color)
        })
        rect.addEventListener('mousemove', (e) => { if (this._hover === rect) this._moveTip(e, node, color) })
        rect.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        rect.addEventListener('click', (e) => { if (this.opts.onItemClick) this.opts.onItemClick(node, level, e) })
      }
      if (node.children && node.children.length) {
        const total = node.children.reduce((a, b) => a + b.value, 0) || 1
        let acc = startPos
        for (const c of node.children) {
          const childSpan = (c.value / total) * spanSize
          c._parentColor = node._parentColor || this._colorOf(node, level)
          c._levelIndex = node._levelIndex
          layout(c, level + 1, acc, childSpan)
          acc += childSpan
        }
      }
    }
    // 顶层：每个 root 子节点占主轴的一段
    const rootTotal = this._root.value || 1
    let acc = horizontal ? plot.y : plot.x
    for (const c of this._root.children) {
      const span = (c.value / rootTotal) * (horizontal ? plot.h : plot.w)
      c._parentColor = this.opts.colors[this._root.children.indexOf(c) % this.opts.colors.length]
      c._levelIndex = this._root.children.indexOf(c)
      layout(c, 1, acc, span)
      acc += span
    }
    if (animate) this._animate(horizontal, plot, thickness)
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._itemEls.forEach(c => { c.style.filter = ''; c.style.opacity = '1' })
      return
    }
    for (const c of this._itemEls) {
      const isHot = c === hot
      c.style.filter = isHot ? 'brightness(1.15)' : ''
      c.style.opacity = (hot && !isHot) ? String(this.opts.dimOpacity) : '1'
    }
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
  _animate(horizontal, plot, thickness) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._itemEls.map((r, i) => {
      const m = r._meta
      return { el: r, meta: m, delay: i * stagger / duration }
    })
    targets.forEach(tg => {
      const m = tg.meta
      if (horizontal) {
        tg.el.setAttribute('width', '0')
        tg.el.setAttribute('x', String(m.x))
      } else {
        tg.el.setAttribute('height', '0')
        tg.el.setAttribute('y', String(m.y))
      }
      tg.el.style.opacity = '0'
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const m = tg.meta
        if (horizontal) {
          tg.el.setAttribute('width', String(m.w * e))
        } else {
          tg.el.setAttribute('height', String(m.h * e))
        }
        tg.el.style.opacity = String(e)
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          const m = tg.meta
          if (horizontal) {
            tg.el.setAttribute('width', String(m.w))
            tg.el.setAttribute('x', String(m.x))
          } else {
            tg.el.setAttribute('height', String(m.h))
            tg.el.setAttribute('y', String(m.y))
          }
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
      if (w > 0 && w !== last) { last = w; this.render() }
    })
    this._resizeObs.observe(this.wrap)
    last = this.wrap.clientWidth
  }
  replay() { this.render({ animate: true }); return this }
  destroy() { if (this._cancelAnim) this._cancelAnim(); if (this._resizeObs) this._resizeObs.disconnect(); this.container.innerHTML = '' }
}
export default IcicleChart
