// @xunay/kit/charts/network —— 精修版关系图
// 特性：力导向布局 · 节点拖拽 · 邻居高亮 · 边曲线 · 权重映射 · 
//      多类型节点 · tooltip · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'nw-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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
  return String(Math.round(v))
}

// ============================================================
// 力导向布局（简化版 Fruchterman-Reingold）
// ============================================================
class ForceSim {
  constructor(nodes, links, opts) {
    this.nodes = nodes
    this.links = links
    this.width = opts.width
    this.height = opts.height
    this.cx = opts.width / 2
    this.cy = opts.height / 2
    this.k = Math.sqrt((opts.width * opts.height) / Math.max(1, nodes.length)) * 0.55
    this.iterations = opts.iterations || 260
    this.charge = opts.charge != null ? opts.charge : -1
    this.gravity = opts.gravity != null ? opts.gravity : 0.08
    this.linkDistance = opts.linkDistance || null
    // 邻接
    this.adj = new Map()
    for (const n of nodes) this.adj.set(n.id, [])
    for (const l of links) {
      if (this.adj.has(l.source)) this.adj.get(l.source).push(l.target)
      if (this.adj.has(l.target)) this.adj.get(l.target).push(l.source)
    }
  }

  run() {
    // 初始化：圆环放置
    const n = this.nodes.length
    const r0 = Math.min(this.width, this.height) * 0.35
    this.nodes.forEach((node, i) => {
      if (node.x == null) {
        const a = (i / n) * Math.PI * 2
        node.x = this.cx + Math.cos(a) * r0 + (Math.random() - 0.5) * 20
        node.y = this.cy + Math.sin(a) * r0 + (Math.random() - 0.5) * 20
      }
      node.vx = 0
      node.vy = 0
    })

    const area = this.width * this.height
    for (let iter = 0; iter < this.iterations; iter++) {
      const temp = (1 - iter / this.iterations) * (this.k * 0.5) + 0.5

      // 斥力
      for (let i = 0; i < this.nodes.length; i++) {
        const a = this.nodes[i]
        for (let j = i + 1; j < this.nodes.length; j++) {
          const b = this.nodes[j]
          let dx = a.x - b.x
          let dy = a.y - b.y
          let d2 = dx * dx + dy * dy
          if (d2 < 0.01) { dx = (Math.random() - 0.5) * 0.1; dy = (Math.random() - 0.5) * 0.1; d2 = 0.01 }
          const d = Math.sqrt(d2)
          const force = (this.k * this.k) / d * this.charge * -1
          const fx = (dx / d) * force * 0.001
          const fy = (dy / d) * force * 0.001
          a.vx += fx; a.vy += fy
          b.vx -= fx; b.vy -= fy
        }
      }

      // 引力（边）
      for (const l of this.links) {
        const a = this.nodes.find(n => n.id === l.source)
        const b = this.nodes.find(n => n.id === l.target)
        if (!a || !b) continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01
        const target = this.linkDistance != null
          ? this.linkDistance
          : this.k * (1 + 0.5 * Math.min(3, l.value / 200 || 1))
        const f = (d - target) / d * 0.5
        a.vx += dx * f * 0.06
        a.vy += dy * f * 0.06
        b.vx -= dx * f * 0.06
        b.vy -= dy * f * 0.06
      }

      // 重力（拉向中心）
      for (const n of this.nodes) {
        n.vx += (this.cx - n.x) * this.gravity * 0.05
        n.vy += (this.cy - n.y) * this.gravity * 0.05
      }

      // 更新
      for (const n of this.nodes) {
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
        if (speed > temp) { n.vx = (n.vx / speed) * temp; n.vy = (n.vy / speed) * temp }
        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.85
        n.vy *= 0.85
      }
    }
    return this.nodes
  }
}

// ============================================================
// 组件
// ============================================================
export class NetworkChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[NetworkChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 500,
      padding: 40,
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      layout: 'force',           // 'force' | 'circle' | 'grid'
      nodeRadius: 8,             // 基准半径
      nodeRadiusByValue: false,  // 按 value 缩放
      nodeMinR: 6,
      nodeMaxR: 24,
      edgeWidth: 1.2,
      edgeWidthByValue: false,
      edgeMinW: 0.5,
      edgeMaxW: 5,
      edgeColor: null,           // null = 用源节点颜色
      edgeOpacity: 0.3,
      edgeCurve: 0,              // 0 = 直线，>0 = 曲线
      edgeArrows: false,         // 箭头
      labelFontSize: 11,
      labelMinR: 10,
      showLabels: true,
      dimOpacity: 0.12,          // 未高亮元素透明度
      iterations: 260,
      charge: -1,
      gravity: 0.08,
      draggable: true,
      zoomable: true,
      tooltip: true,
      animation: { duration: 900, easing: 'easeOutCubic' },
      onHover: null,
      onNodeClick: null,
      onLinkClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._nodes = []
    this._links = []
    this._hover = null
    this._hoverNode = null
    this._cancelAnim = null
    this._resizeObs = null
    this._nodeEls = new Map()
    this._linkEls = []
    this._labelEls = new Map()
    this._drag = null
    this._zoom = 1
    this._pan = { x: 0, y: 0 }

    this._build()
    if (options.nodes || options.data) this.setData(options)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      nodeStroke: '#0a0e17', labelBg: 'rgba(15,23,42,0.85)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      nodeStroke: '#fff', labelBg: 'rgba(255,255,255,0.85)',
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

    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'position:relative;width:100%;overflow:hidden;border-radius:8px'
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 720))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(input) {
    let nodes = []
    let links = []

    if (input.nodes && input.links) {
      nodes = input.nodes.map((n, i) => ({
        id: n.id != null ? n.id : (n.name != null ? n.name : i),
        name: n.name != null ? n.name : (n.label != null ? n.label : String(i)),
        value: n.value != null ? n.value : 1,
        color: n.color,
        group: n.group,
      }))
      links = input.links.map(l => ({
        source: l.source != null ? l.source : l.from,
        target: l.target != null ? l.target : l.to,
        value: l.value != null ? l.value : 1,
        color: l.color,
      }))
    } else if (input.data) {
      const nameSet = new Map()
      const addNode = (name, v) => {
        if (!nameSet.has(name)) nameSet.set(name, { id: name, name: String(name), value: 0 })
        const n = nameSet.get(name)
        n.value += v
        return n
      }
      for (const l of input.data) {
        const s = l.source != null ? l.source : l.from
        const t = l.target != null ? l.target : l.to
        const v = l.value != null ? l.value : 1
        addNode(s, v)
        addNode(t, v)
        links.push({ source: s, target: t, value: v, color: l.color })
      }
      nodes = Array.from(nameSet.values())
    }

    this._nodes = nodes
    this._links = links
    this.render()
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }

  _layoutNodes() {
    const { layout } = this.opts
    const W = this.W, H = this.H
    const pad = this.opts.padding
    const cx = W / 2
    const cy = H / 2

    if (layout === 'force') {
      const sim = new ForceSim(this._nodes, this._links, {
        width: W - pad * 2,
        height: H - pad * 2,
        iterations: this.opts.iterations,
        charge: this.opts.charge,
        gravity: this.opts.gravity,
      })
      sim.run()
      // 平移到 padding 内
      const xs = this._nodes.map(n => n.x)
      const ys = this._nodes.map(n => n.y)
      const minX = Math.min(...xs), maxX = Math.max(...xs)
      const minY = Math.min(...ys), maxY = Math.max(...ys)
      const dx = pad - minX
      const dy = pad - minY
      const scaleX = (W - pad * 2) / Math.max(1, maxX - minX)
      const scaleY = (H - pad * 2) / Math.max(1, maxY - minY)
      const scale = Math.min(scaleX, scaleY, 1.5)
      for (const n of this._nodes) {
        n.x = pad + (n.x - minX) * scale
        n.y = pad + (n.y - minY) * scale
      }
    } else if (layout === 'circle') {
      const r = Math.min(W, H) / 2 - pad
      this._nodes.forEach((n, i) => {
        const a = (i / this._nodes.length) * Math.PI * 2 - Math.PI / 2
        n.x = cx + Math.cos(a) * r
        n.y = cy + Math.sin(a) * r
      })
    } else if (layout === 'grid') {
      const cols = Math.ceil(Math.sqrt(this._nodes.length))
      const rows = Math.ceil(this._nodes.length / cols)
      const stepX = (W - pad * 2) / Math.max(1, cols - 1)
      const stepY = (H - pad * 2) / Math.max(1, rows - 1)
      this._nodes.forEach((n, i) => {
        const c = i % cols
        const r = Math.floor(i / cols)
        n.x = pad + c * stepX
        n.y = pad + r * stepY
      })
    }
  }

  _radiusOf(n) {
    if (!this.opts.nodeRadiusByValue) return this.opts.nodeRadius
    const vals = this._nodes.map(x => x.value)
    const maxV = Math.max(...vals, 1)
    const minV = Math.min(...vals, 0)
    const span = maxV - minV || 1
    const t = (n.value - minV) / span
    return this.opts.nodeMinR + t * (this.opts.nodeMaxR - this.opts.nodeMinR)
  }

  _widthOf(l) {
    if (!this.opts.edgeWidthByValue) return this.opts.edgeWidth
    const vals = this._links.map(x => x.value)
    const maxV = Math.max(...vals, 1)
    const minV = Math.min(...vals, 0)
    const span = maxV - minV || 1
    const t = (l.value - minV) / span
    return this.opts.edgeMinW + t * (this.opts.edgeMaxW - this.opts.edgeMinW)
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H

    this.svg.innerHTML = ''
    this._nodeEls.clear()
    this._linkEls = []
    this._labelEls.clear()

    if (!this._nodes.length) return

    this._layoutNodes()

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 缩放/平移 group
    this._root = el('g')
    this.svg.appendChild(this._root)

    const nodeMap = new Map(this._nodes.map(n => [n.id, n]))

    // ===== 边 =====
    const edgeLayer = el('g')
    this._root.appendChild(edgeLayer)

    // 箭头定义
    const defs = el('defs')
    this.svg.insertBefore(defs, this.svg.firstChild)
    const markerId = uid()
    const marker = el('marker', {
      id: markerId,
      viewBox: '0 0 10 10',
      refX: 10, refY: 5,
      markerWidth: 6, markerHeight: 6,
      orient: 'auto-start-reverse',
    })
    marker.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: 'currentColor' }))
    defs.appendChild(marker)

    this._links.forEach((l, i) => {
      const s = nodeMap.get(l.source)
      const t = nodeMap.get(l.target)
      if (!s || !t) return
      const rs = this._radiusOf(s)
      const rt = this._radiusOf(t)
      const dx = t.x - s.x
      const dy = t.y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / dist
      const uy = dy / dist
      const x1 = s.x + ux * rs
      const y1 = s.y + uy * rs
      const x2 = t.x - ux * rt
      const y2 = t.y - uy * rt

      const color = l.color || this.opts.edgeColor || s.color || this.opts.colors[this._nodes.indexOf(s) % this.opts.colors.length]
      const w = this._widthOf(l)

      let d
      if (this.opts.edgeCurve > 0) {
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        // 垂直偏移
        const nx = -uy
        const ny = ux
        const offset = dist * this.opts.edgeCurve * 0.25
        const ctrlX = midX + nx * offset
        const ctrlY = midY + ny * offset
        d = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`
      } else {
        d = `M ${x1} ${y1} L ${x2} ${y2}`
      }

      const path = el('path', {
        d,
        fill: 'none',
        stroke: color,
        'stroke-width': w,
        'stroke-opacity': this.opts.edgeOpacity,
        'stroke-linecap': 'round',
        'marker-end': this.opts.edgeArrows ? `url(#${markerId})` : null,
        style: 'cursor:pointer;transition:stroke-opacity .15s,stroke-width .15s',
      })
      path._meta = { link: l, s, t, color, w, x1, y1, x2, y2 }
      edgeLayer.appendChild(path)
      this._linkEls.push(path)

      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTipLink(e, path)
      })
      path.addEventListener('mousemove', (e) => {
        if (this._hover === path) this._moveTipLink(e, path)
      })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => {
        if (this.opts.onLinkClick) this.opts.onLinkClick(l, e)
      })
    })

    // ===== 节点 =====
    const nodeLayer = el('g')
    this._root.appendChild(nodeLayer)

    for (const n of this._nodes) {
      const r = this._radiusOf(n)
      const color = n.color || this.opts.colors[this._nodes.indexOf(n) % this.opts.colors.length]
      const g = el('g', { style: 'cursor:grab;touch-action:none', 'data-node-id': String(n.id) })
      g._meta = { node: n, color, r }

      const circle = el('circle', {
        cx: n.x,
        cy: n.y,
        r,
        fill: color,
        stroke: this.theme.nodeStroke,
        'stroke-width': 2,
        style: 'transition:filter .15s',
      })
      g.appendChild(circle)

      nodeLayer.appendChild(g)
      this._nodeEls.set(n.id, { g, circle, meta: g._meta })

      // 标签
      if (this.opts.showLabels && r >= this.opts.labelMinR) {
        const t = el('text', {
          x: n.x,
          y: n.y + r + this.opts.labelFontSize + 2,
          'text-anchor': 'middle',
          'font-size': this.opts.labelFontSize,
          'font-weight': 500,
          'font-family': 'inherit',
          fill: this.theme.text,
          style: 'pointer-events:none;user-select:none',
        })
        t.textContent = n.name.length > 10 ? n.name.slice(0, 9) + '…' : n.name
        nodeLayer.appendChild(t)
        this._labelEls.set(n.id, t)
      }

      // 事件
      g.addEventListener('mouseenter', (e) => {
        this._hoverNode = n.id
        this._applyHover()
        this._moveTipNode(e, g)
      })
      g.addEventListener('mousemove', (e) => {
        if (this._hoverNode === n.id && !this._drag) this._moveTipNode(e, g)
      })
      g.addEventListener('mouseleave', () => {
        if (this._drag) return
        this._hoverNode = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      g.addEventListener('click', (e) => {
        if (this._drag && this._drag.moved) return
        if (this.opts.onNodeClick) this.opts.onNodeClick(n, e)
      })

      // 拖拽
      if (this.opts.draggable) {
        }
    }

    // 平移 + 缩放
    this._setupZoomPan()

    // 动画
    if (animate) this._animate()

    return this
  }

  _applyHover() {
    const hoverNode = this._hoverNode
    const hoverLink = this._hover && this._hover._meta.link

    if (!hoverNode && !hoverLink) {
      for (const p of this._linkEls) p.setAttribute('stroke-opacity', this.opts.edgeOpacity)
      for (const [, o] of this._nodeEls) o.circle.style.filter = ''
      return
    }

    // 邻居集合
    let center = null
    let neighbors = new Set()
    let linkActive = new Set()

    if (hoverNode) {
      center = hoverNode
      neighbors.add(hoverNode)
      for (const l of this._links) {
        if (l.source === hoverNode) { neighbors.add(l.target); linkActive.add(l) }
        if (l.target === hoverNode) { neighbors.add(l.source); linkActive.add(l) }
      }
    } else if (hoverLink) {
      neighbors.add(hoverLink.source)
      neighbors.add(hoverLink.target)
      linkActive.add(hoverLink)
    }

    for (const p of this._linkEls) {
      const m = p._meta
      const active = linkActive.has(m.link)
      p.setAttribute('stroke-opacity', active ? 0.85 : this.opts.dimOpacity)
      p.setAttribute('stroke-width', active ? m.w * 1.6 : m.w)
    }

    for (const [id, o] of this._nodeEls) {
      const active = neighbors.has(id)
      o.circle.style.filter = active ? 'brightness(1.15)' : ''
      o.g.style.opacity = active ? '1' : String(this.opts.dimOpacity)
    }

    for (const [id, t] of this._labelEls) {
      t.style.opacity = neighbors.has(id) ? '1' : String(this.opts.dimOpacity)
    }
  }

  _updateNodePosition(node) {
    const o = this._nodeEls.get(node.id)
    if (o) {
      o.circle.setAttribute('cx', node.x)
      o.circle.setAttribute('cy', node.y)
      const t = this._labelEls.get(node.id)
      if (t) {
        t.setAttribute('x', node.x)
        t.setAttribute('y', node.y + o.meta.r + this.opts.labelFontSize + 2)
      }
    }
    // 重画边
    const nodeMap = new Map(this._nodes.map(n => [n.id, n]))
    for (const p of this._linkEls) {
      const m = p._meta
      if (m.s.id !== node.id && m.t.id !== node.id) continue
      const s = m.s, t = m.t
      const rs = this._radiusOf(s)
      const rt = this._radiusOf(t)
      const dx = t.x - s.x
      const dy = t.y - s.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const ux = dx / dist, uy = dy / dist
      const x1 = s.x + ux * rs, y1 = s.y + uy * rs
      const x2 = t.x - ux * rt, y2 = t.y - uy * rt
      let d
      if (this.opts.edgeCurve > 0) {
        const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2
        const nx = -uy, ny = ux
        const offset = dist * this.opts.edgeCurve * 0.25
        d = `M ${x1} ${y1} Q ${midX + nx * offset} ${midY + ny * offset} ${x2} ${y2}`
      } else {
        d = `M ${x1} ${y1} L ${x2} ${y2}`
      }
      p.setAttribute('d', d)
    }
  }

  _setupZoomPan() {
    if (!this.opts.zoomable) return
    const svg = this.svg
    svg.style.touchAction = 'none'
    svg.style.cursor = 'grab'

    let mode = null
    let dragNode = null
    let dragOffsetX = 0
    let dragOffsetY = 0
    let panStartX = 0
    let panStartY = 0
    let pointerId = null

    const screenToRoot = (sx, sy) => {
      const pt = svg.createSVGPoint()
      pt.x = sx
      pt.y = sy
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      return {
        x: (svgP.x - this._pan.x) / this._zoom,
        y: (svgP.y - this._pan.y) / this._zoom,
      }
    }

    const onDown = (e) => {
      // 向上找 data-node-id
      let el = e.target
      let nodeId = null
      while (el && el !== svg) {
        const id = el.getAttribute && el.getAttribute('data-node-id')
        if (id != null) { nodeId = id; break }
        el = el.parentNode
      }
      const node = nodeId != null ? this._nodes.find(n => String(n.id) === nodeId) : null

      pointerId = e.pointerId
      try { svg.setPointerCapture(e.pointerId) } catch {}

      if (node) {
        mode = 'drag'
        dragNode = node
        const rp = screenToRoot(e.clientX, e.clientY)
        dragOffsetX = rp.x - node.x
        dragOffsetY = rp.y - node.y
        svg.style.cursor = 'grabbing'
        // 拖动开始时隐藏 tooltip
        if (this.tip) this.tip.style.opacity = '0'
      } else {
        mode = 'pan'
        panStartX = e.clientX - this._pan.x
        panStartY = e.clientY - this._pan.y
        svg.style.cursor = 'grabbing'
      }
      e.preventDefault()
    }

    const onMove = (e) => {
      if (e.pointerId !== pointerId) return
      if (mode === 'drag' && dragNode) {
        const rp = screenToRoot(e.clientX, e.clientY)
        dragNode.x = rp.x - dragOffsetX
        dragNode.y = rp.y - dragOffsetY
        this._updateNodePosition(dragNode)
      } else if (mode === 'pan') {
        this._pan.x = e.clientX - panStartX
        this._pan.y = e.clientY - panStartY
        this._applyTransform()
      }
    }

    const onUp = (e) => {
      if (e.pointerId !== pointerId) return
      mode = null
      dragNode = null
      pointerId = null
      try { svg.releasePointerCapture(e.pointerId) } catch {}
      svg.style.cursor = 'grab'
    }

    svg.addEventListener('pointerdown', onDown)
    svg.addEventListener('pointermove', onMove)
    svg.addEventListener('pointerup', onUp)
    svg.addEventListener('pointercancel', onUp)

    // 滚轮缩放（以鼠标为中心）
    svg.addEventListener('wheel', (e) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const oldZoom = this._zoom
      this._zoom = Math.max(0.3, Math.min(3, this._zoom * delta))
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      const k = this._zoom / oldZoom
      this._pan.x = svgP.x - (svgP.x - this._pan.x) * k
      this._pan.y = svgP.y - (svgP.y - this._pan.y) * k
      this._applyTransform()
    }, { passive: false })

    svg.addEventListener('dblclick', () => {
      this._zoom = 1
      this._pan = { x: 0, y: 0 }
      this._applyTransform()
    })
  }

  _applyTransform() {
    if (this._root) {
      this._root.setAttribute('transform', `translate(${this._pan.x} ${this._pan.y}) scale(${this._zoom})`)
    }
  }

  _moveTipNode(e, g) {
    if (!this.tip || this._dragging) return
    const m = g._meta
    const n = m.node
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${m.color}"></span>
        <strong>${n.name}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(n.value)}</strong>
      </div>
      ${n.group != null ? `<div style="opacity:.65;font-size:11px;margin-top:3px">分组: ${n.group}</div>` : ''}
    `
    this._positionTip(e)
    if (this.opts.onHover) this.opts.onHover({ type: 'node', node: n, value: n.value })
  }

  _moveTipLink(e, path) {
    if (!this.tip) return
    const m = path._meta
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${m.color}"></span>
        <strong>${m.s.name} → ${m.t.name}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">权重</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(m.link.value)}</strong>
      </div>
    `
    this._positionTip(e)
    if (this.opts.onHover) this.opts.onHover({ type: 'link', link: m.link, source: m.s, target: m.t, value: m.link.value })
  }

  _positionTip(e) {
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
    this.tip.style.opacity = '1'
  }

  _animate() {
    const { duration, easing } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }

    const cx = this.W / 2, cy = this.H / 2

    // 保存最终位置
    const nodeTargets = new Map()
    for (const [id, o] of this._nodeEls) {
      nodeTargets.set(id, { x: o.meta.node.x, y: o.meta.node.y })
      const nx = cx + (o.meta.node.x - cx) * 0.01
      const ny = cy + (o.meta.node.y - cy) * 0.01
      o.circle.setAttribute('cx', nx)
      o.circle.setAttribute('cy', ny)
    }
    const linkTargets = this._linkEls.map(p => ({ el: p, d: p.getAttribute('d'), opacity: p.getAttribute('stroke-opacity') }))
    this._linkEls.forEach(p => p.setAttribute('stroke-opacity', '0'))
    for (const [, t] of this._labelEls) t.style.opacity = '0'

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const e = ease(t)
      for (const [id, o] of this._nodeEls) {
        const tg = nodeTargets.get(id)
        const nx = cx + (tg.x - cx) * e
        const ny = cy + (tg.y - cy) * e
        o.circle.setAttribute('cx', nx)
        o.circle.setAttribute('cy', ny)
        const tt = this._labelEls.get(id)
        if (tt) {
          tt.setAttribute('x', nx)
          tt.setAttribute('y', ny + o.meta.r + this.opts.labelFontSize + 2)
        }
      }
      for (const lt of linkTargets) {
        lt.el.setAttribute('stroke-opacity', String(parseFloat(lt.opacity) * e))
      }
      for (const [, t] of this._labelEls) t.style.opacity = String(e)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        for (const [id, o] of this._nodeEls) {
          o.circle.setAttribute('cx', o.meta.node.x)
          o.circle.setAttribute('cy', o.meta.node.y)
        }
        // 重画边到最终位置
        const nodeMap = new Map(this._nodes.map(n => [n.id, n]))
        for (const p of this._linkEls) {
          const m = p._meta
          const rs = this._radiusOf(m.s)
          const rt = this._radiusOf(m.t)
          const dx = m.t.x - m.s.x
          const dy = m.t.y - m.s.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const ux = dx / dist, uy = dy / dist
          const x1 = m.s.x + ux * rs, y1 = m.s.y + uy * rs
          const x2 = m.t.x - ux * rt, y2 = m.t.y - uy * rt
          let d
          if (this.opts.edgeCurve > 0) {
            const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2
            const nx = -uy, ny = ux
            const offset = dist * this.opts.edgeCurve * 0.25
            d = `M ${x1} ${y1} Q ${midX + nx * offset} ${midY + ny * offset} ${x2} ${y2}`
          } else {
            d = `M ${x1} ${y1} L ${x2} ${y2}`
          }
          p.setAttribute('d', d)
          p.setAttribute('stroke-opacity', this.opts.edgeOpacity)
        }
        for (const [, t] of this._labelEls) t.style.opacity = '1'
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

export default NetworkChart
