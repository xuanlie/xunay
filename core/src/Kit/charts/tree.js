// @xunay/kit/charts/tree —— 精修版树形图
// 特性：折叠/展开 · 曲线连接 · 路径高亮到根 · 大小映射 ·
//      水平/垂直 · 动画展开 · tooltip · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'tr-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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
// Tidy Tree 布局（Reingold-Tilford 简化版）
// ============================================================
function layoutTree(root, opts) {
  const { nodeGap, levelGap, orientation } = opts
  const horizontal = orientation === 'horizontal'

  // 后序遍历：计算每个节点的子树高度（占用空间）
  function assign(node) {
    if (!node.children || !node.children.length || node._collapsed) {
      node._subtreeSize = 1
      return
    }
    for (const c of node.children) assign(c)
    let sum = 0
    for (const c of node.children) sum += c._subtreeSize
    node._subtreeSize = Math.max(1, sum)
  }
  assign(root)

  // 前序遍历：分配位置
  // 主轴 = 沿着树生长方向（depth），副轴 = 子树并排方向
  function place(node, offset, depth) {
    const span = (node._subtreeSize - 1) * nodeGap
    node._depth = depth
    node._side = offset + span / 2
    if (node.children && node.children.length && !node._collapsed) {
      let cur = offset
      for (const c of node.children) {
        const cSpan = (c._subtreeSize - 1) * nodeGap
        place(c, cur, depth + 1)
        cur += cSpan + nodeGap
      }
    }
  }
  place(root, 0, 0)

  // 收集所有节点
  const nodes = []
  function collect(node, parent) {
    node._parent = parent
    nodes.push(node)
    if (node.children && node.children.length && !node._collapsed) {
      for (const c of node.children) collect(c, node)
    }
  }
  collect(root, null)

  return { nodes, root }
}

// ============================================================
// 组件
// ============================================================
export class TreeChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[TreeChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 500,
      padding: 32,
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      orientation: 'horizontal',   // 'horizontal' | 'vertical'
      nodeRadius: 7,
      nodeRadiusByValue: false,
      nodeMinR: 5,
      nodeMaxR: 20,
      nodeGap: 30,                 // 兄弟节点间距
      levelGap: 90,                // 层级间距
      edgeWidth: 1.6,
      edgeCurve: 0.5,              // 曲线程度
      edgeColorMode: 'child',      // 'child' | 'parent' | 'mixed'
      labelFontSize: 12,
      showLabels: true,
      showValues: false,
      expandAll: true,             // 初始化时展开所有
      defaultExpanded: null,       // 函数 (node) => bool，控制初始展开
      collapsible: true,
      highlightPath: true,         // 悬停高亮到根的路径
      dimOpacity: 0.15,
      tooltip: true,
      animation: { duration: 600, easing: 'easeOutCubic' },
      onHover: null,
      onNodeClick: null,
      onToggle: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._root = null
    this._collapsed = new Set()    // 折叠的节点集合（用 node id 或引用）
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._nodeEls = new Map()      // node -> {g, circle, label}
    this._edgeEls = []
    this._edges = []

    this._build()
    if (options.data || options.root) this.setData(options.data || options.root)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      nodeStroke: '#0a0e17', edgeColor: '#334155',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      nodeStroke: '#fff', edgeColor: '#cbd5e1',
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
    this.wrap.style.cssText = 'position:relative;width:100%;overflow:hidden'
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 800))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(data) {
    // 归一化：给每个节点补 id、展开状态
    let idCounter = 0
    const assignId = (n, parent) => {
      n._id = n.id != null ? n.id : ('n' + (idCounter++))
      n._parent = parent
      n._depth = 0
      if (n.children && n.children.length) {
        for (const c of n.children) assignId(c, n)
      }
    }
    assignId(data, null)

    // 初始折叠：根据 expandAll / defaultExpanded
    this._collapsed.clear()
    const walk = (n) => {
      if (n.children && n.children.length) {
        const shouldExpand = this.opts.defaultExpanded
          ? !!this.opts.defaultExpanded(n)
          : this.opts.expandAll
        if (!shouldExpand) this._collapsed.add(n._id)
        for (const c of n.children) walk(c)
      }
    }
    walk(data)

    this._root = data
    this.render()
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }

  toggle(node) {
    if (!this.opts.collapsible) return
    if (!node.children || !node.children.length) return
    if (this._collapsed.has(node._id)) this._collapsed.delete(node._id)
    else this._collapsed.add(node._id)
    if (this.opts.onToggle) this.opts.onToggle(node, !this._collapsed.has(node._id))
    this.render({ animate: true })
  }

  expandAll() {
    this._collapsed.clear()
    this.render({ animate: true })
  }

  collapseAll() {
    const walk = (n) => {
      if (n.children && n.children.length) {
        this._collapsed.add(n._id)
        for (const c of n.children) walk(c)
      }
    }
    walk(this._root)
    this.render({ animate: true })
  }

  _radiusOf(n) {
    if (!this.opts.nodeRadiusByValue) return this.opts.nodeRadius
    const all = this._collectAll(this._root)
    const vals = all.map(x => x.value || 0)
    const maxV = Math.max(...vals, 1)
    const minV = Math.min(...vals, 0)
    const span = maxV - minV || 1
    const t = ((n.value || 0) - minV) / span
    return this.opts.nodeMinR + t * (this.opts.nodeMaxR - this.opts.nodeMinR)
  }

  _collectAll(n, out = []) {
    out.push(n)
    if (n.children) for (const c of n.children) this._collectAll(c, out)
    return out
  }

  _colorOf(n) {
    if (n.color) return n.color
    const depth = n._depth || 0
    return this.opts.colors[depth % this.opts.colors.length]
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding

    this.svg.innerHTML = ''
    this._nodeEls.clear()
    this._edgeEls = []
    this._edges = []

    if (!this._root) return

    // 应用折叠状态
    const applyCollapse = (n) => {
      n._collapsed = this._collapsed.has(n._id)
      if (n.children) for (const c of n.children) applyCollapse(c)
    }
    applyCollapse(this._root)

    // 布局
    const { nodes } = layoutTree(this._root, {
      nodeGap: this.opts.nodeGap,
      levelGap: this.opts.levelGap,
      orientation: this.opts.orientation,
    })

    // 转换到画布坐标
    const horizontal = this.opts.orientation === 'horizontal'
    const maxDepth = Math.max(...nodes.map(n => n._depth), 1)
    const maxSide = Math.max(...nodes.map(n => n._side), 0)

    const plotW = W - pad * 2
    const plotH = H - pad * 2

    // 主轴（depth 方向）铺满，副轴（side）居中
    let levelGap
    let nodeGap
    if (horizontal) {
      levelGap = maxDepth > 0 ? plotW / maxDepth : 0
      nodeGap = this.opts.nodeGap
    } else {
      levelGap = maxDepth > 0 ? plotH / maxDepth : 0
      nodeGap = this.opts.nodeGap
    }

    // side 居中：算总副轴跨度
    const sideSpan = maxSide + this.opts.nodeGap
    const sideOrigin = (horizontal ? plotH : plotW) / 2 - sideSpan / 2

    for (const n of nodes) {
      if (horizontal) {
        n._x = pad + n._depth * levelGap
        n._y = pad + sideOrigin + n._side
      } else {
        n._x = pad + sideOrigin + n._side
        n._y = pad + n._depth * levelGap
      }
    }

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const root = el('g')
    this.svg.appendChild(root)

    // ===== 边 =====
    const edgeLayer = el('g')
    root.appendChild(edgeLayer)

    for (const n of nodes) {
      if (!n._parent) continue
      const p = n._parent
      const color = this.opts.edgeColorMode === 'parent'
        ? this._colorOf(p)
        : this.opts.edgeColorMode === 'mixed'
          ? this._colorOf(n)
          : this.theme.edgeColor

      const r1 = this._radiusOf(p)
      const r2 = this._radiusOf(n)
      let d
      if (horizontal) {
        const x1 = p._x + r1
        const x2 = n._x - r2
        const cx1 = x1 + (x2 - x1) * this.opts.edgeCurve
        const cx2 = x2 - (x2 - x1) * this.opts.edgeCurve
        d = `M ${x1} ${p._y} C ${cx1} ${p._y} ${cx2} ${n._y} ${x2} ${n._y}`
      } else {
        const y1 = p._y + r1
        const y2 = n._y - r2
        const cy1 = y1 + (y2 - y1) * this.opts.edgeCurve
        const cy2 = y2 - (y2 - y1) * this.opts.edgeCurve
        d = `M ${p._x} ${y1} C ${p._x} ${cy1} ${n._x} ${cy2} ${n._x} ${y2}`
      }

      const path = el('path', {
        d,
        fill: 'none',
        stroke: color,
        'stroke-width': this.opts.edgeWidth,
        'stroke-linecap': 'round',
        style: 'transition:stroke .15s,stroke-width .15s,opacity .15s',
      })
      path._meta = { child: n, parent: p, color }
      edgeLayer.appendChild(path)
      this._edgeEls.push(path)
      this._edges.push({ child: n, parent: p, el: path })
    }

    // ===== 节点 =====
    const nodeLayer = el('g')
    root.appendChild(nodeLayer)

    for (const n of nodes) {
      const r = this._radiusOf(n)
      const color = this._colorOf(n)
      const g = el('g', { style: 'cursor:pointer' })
      g._meta = { node: n, color, r }

      // 折叠状态：有子节点且折叠时，外圈虚线提示
      const hasChildren = n.children && n.children.length > 0
      const isCollapsed = hasChildren && this._collapsed.has(n._id)

      if (isCollapsed) {
        g.appendChild(el('circle', {
          cx: n._x, cy: n._y, r: r + 4,
          fill: 'none',
          stroke: color,
          'stroke-width': 1.5,
          'stroke-dasharray': '3 3',
          opacity: 0.7,
        }))
      }

      const circle = el('circle', {
        cx: n._x, cy: n._y, r,
        fill: color,
        stroke: this.theme.nodeStroke,
        'stroke-width': 2,
        style: 'transition:r .15s ease,filter .15s ease',
      })
      g.appendChild(circle)

      // 折叠/展开符号（如果可折叠且有子节点）
      if (hasChildren && this.opts.collapsible && r >= 5) {
        const sign = el('text', {
          x: n._x, y: n._y + 1,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'font-size': Math.max(9, r * 1.2),
          'font-weight': 700,
          'font-family': 'inherit',
          fill: '#fff',
          style: 'pointer-events:none;user-select:none',
        })
        sign.textContent = isCollapsed ? '+' : '−'
        g.appendChild(sign)
      }

      // 标签
      if (this.opts.showLabels) {
        let lx, ly, anchor
        if (horizontal) {
          // 叶子节点标签在右侧，否则在节点下方
          if (!n.children || !n.children.length || this._collapsed.has(n._id)) {
            lx = n._x + r + 6
            ly = n._y + 4
            anchor = 'start'
          } else {
            lx = n._x
            ly = n._y - r - 6
            anchor = 'middle'
          }
        } else {
          if (!n.children || !n.children.length || this._collapsed.has(n._id)) {
            lx = n._x
            ly = n._y + r + this.opts.labelFontSize + 2
            anchor = 'middle'
          } else {
            lx = n._x + r + 6
            ly = n._y + 4
            anchor = 'start'
          }
        }
        const t = el('text', {
          x: lx, y: ly,
          'text-anchor': anchor,
          'font-size': this.opts.labelFontSize,
          'font-weight': 500,
          'font-family': 'inherit',
          fill: this.theme.text,
          style: 'pointer-events:none;user-select:none',
        })
        t.textContent = String(n.name || n.label || n._id).slice(0, 24)
        g.appendChild(t)
        g._label = t

        if (this.opts.showValues && n.value != null) {
          const vt = el('text', {
            x: lx, y: ly + (anchor === 'middle' ? 14 : 0),
            'text-anchor': anchor,
            'font-size': 10.5,
            'font-family': 'inherit',
            fill: this.theme.textMuted,
            style: 'pointer-events:none;user-select:none',
          })
          vt.textContent = fmt(n.value)
          g.appendChild(vt)
        }
      }

      nodeLayer.appendChild(g)
      this._nodeEls.set(n._id, { g, circle, meta: g._meta, node: n })

      g.addEventListener('mouseenter', (e) => {
        this._hover = n._id
        this._applyHover()
        this._moveTip(e, n)
      })
      g.addEventListener('mousemove', (e) => {
        if (this._hover === n._id) this._moveTip(e, n)
      })
      g.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      g.addEventListener('click', (e) => {
        // 点击时若可折叠且不按 Ctrl，优先切换折叠
        const hasKids = n.children && n.children.length
        if (hasKids && this.opts.collapsible && !e.ctrlKey && !e.metaKey) {
          this.toggle(n)
        }
        if (this.opts.onNodeClick) this.opts.onNodeClick(n, e)
      })
    }

    if (animate) this._animate(nodes)

    return this
  }

  _ancestors(n) {
    const out = new Set()
    let cur = n
    while (cur) {
      out.add(cur._id)
      cur = cur._parent
    }
    return out
  }

  _descendants(n) {
    const out = new Set([n._id])
    const walk = (x) => {
      if (x.children && !this._collapsed.has(x._id)) {
        for (const c of x.children) { out.add(c._id); walk(c) }
      }
    }
    walk(n)
    return out
  }

  _applyHover() {
    if (!this._hover) {
      for (const [, o] of this._nodeEls) o.g.style.opacity = '1'
      for (const e of this._edgeEls) {
        e.style.opacity = '1'
        e.setAttribute('stroke-width', this.opts.edgeWidth)
        e.setAttribute('stroke', e._meta.color)
      }
      return
    }

    const centerNode = this._nodeEls.get(this._hover).node
    const pathSet = this.opts.highlightPath ? this._ancestors(centerNode) : new Set([this._hover])
    const descSet = this._descendants(centerNode)
    const related = new Set([...pathSet, ...descSet])

    for (const [id, o] of this._nodeEls) {
      o.g.style.opacity = related.has(id) ? '1' : String(this.opts.dimOpacity)
    }

    for (const e of this._edgeEls) {
      const cid = e._meta.child._id
      const pid = e._meta.parent._id
      const active = related.has(cid) && related.has(pid)
      e.style.opacity = active ? '1' : String(this.opts.dimOpacity)
      e.setAttribute('stroke-width', active ? this.opts.edgeWidth * 2 : this.opts.edgeWidth)
      e.setAttribute('stroke', active ? this._colorOf(centerNode) : e._meta.color)
    }
  }

  _moveTip(e, n) {
    if (!this.tip) return
    const parentLabel = n._parent ? (n._parent.name || n._parent.label || n._parent._id) : null
    const childCount = n.children ? n.children.length : 0
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${this._colorOf(n)}"></span>
        <strong>${n.name || n.label || n._id}</strong>
      </div>
      ${n.value != null ? `<div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(n.value)}</strong>
      </div>` : ''}
      ${childCount ? `<div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">子节点</span>
        <strong>${childCount}</strong>
      </div>` : ''}
      ${parentLabel ? `<div style="opacity:.65;font-size:11px;margin-top:3px">父: ${parentLabel}</div>` : ''}
    `
    this._positionTip(e)
    if (this.opts.onHover) this.opts.onHover(n)
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

  _animate(nodes) {
    const { duration, easing } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }

    const nodeTargets = new Map()
    for (const n of nodes) {
      const o = this._nodeEls.get(n._id)
      if (!o) continue
      nodeTargets.set(n._id, { x: n._x, y: n._y })
    }

    // 起始：全部在根位置
    const rootNode = nodes.find(n => !n._parent)
    const rootX = rootNode ? rootNode._x : this.W / 2
    const rootY = rootNode ? rootNode._y : this.H / 2

    for (const [id, o] of this._nodeEls) {
      o.circle.setAttribute('cx', rootX)
      o.circle.setAttribute('cy', rootY)
      if (o._label) { o._label.setAttribute('x', rootX); o._label.setAttribute('y', rootY) }
      o.g.querySelectorAll('circle, text').forEach(child => {
        if (child.tagName === 'circle') { child.setAttribute('cx', rootX); child.setAttribute('cy', rootY) }
      })
    }
    this._edgeEls.forEach(e => e.style.opacity = '0')

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const e = ease(t)
      for (const n of nodes) {
        const o = this._nodeEls.get(n._id)
        if (!o) continue
        const cx = rootX + (n._x - rootX) * e
        const cy = rootY + (n._y - rootY) * e
        o.g.querySelectorAll('circle').forEach(c => {
          c.setAttribute('cx', cx)
          c.setAttribute('cy', cy)
        })
        const textEls = o.g.querySelectorAll('text')
        if (textEls.length > 0) {
          textEls[0].setAttribute('x', cx + (n._x - (rootX + (n._x - rootX) * (1 - e))) - (n._x - cx) + (o.g._meta ? (o.g._meta.x != null ? 0 : 0) : 0))
        }
      }
      this._edgeEls.forEach(e2 => e2.style.opacity = String(e))
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        this.render()
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

export default TreeChart
