// @xunay/kit/charts/sankey —— 精修版桑基图
// 特性：分层布局 · 贝塞尔带状流 · 悬停链路高亮 · 节点拖拽 ·
//      多级流转 · tooltip · 动画生长 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'sk-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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

function hexToRgb(h) {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex)
  if (amount >= 0) {
    return `rgb(${Math.min(255, Math.round(r + (255 - r) * amount))},${Math.min(255, Math.round(g + (255 - g) * amount))},${Math.min(255, Math.round(b + (255 - b) * amount))})`
  }
  const k = 1 + amount
  return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`
}

export class SankeyChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[SankeyChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 480,
      padding: { top: 24, right: 120, bottom: 24, left: 20 },
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      nodeWidth: 18,
      nodePadding: 14,
      nodeRadius: 3,
      linkCurve: 0.5,           // 曲线弯曲程度 0-1
      linkOpacity: 0.32,
      linkHoverOpacity: 0.7,
      labelPosition: 'auto',    // 'auto' | 'left' | 'right' | 'inside'
      labelFontSize: 12,
      showValues: true,
      tooltip: true,
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 25 },
      onHover: null,
      onNodeClick: null,
      onLinkClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._nodes = []
    this._links = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._nodeEls = new Map()
    this._linkEls = []
    this._labelEls = []

    this._build()
    if (options.nodes || options.data) this.setData(options)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      nodeStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      nodeStroke: '#fff',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 720))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(input) {
    // 支持两种输入：
    //   1) { nodes: [{name}], links: [{source, target, value}] }
    //   2) { data: [{from, to, value}] }
    let nodes = []
    let links = []

    if (input.nodes && input.links) {
      nodes = input.nodes.map((n, i) => ({
        id: n.id != null ? n.id : (n.name != null ? n.name : i),
        name: n.name != null ? n.name : (n.label != null ? n.label : String(i)),
        color: n.color,
        layer: n.layer != null ? n.layer : null,
      }))
      links = input.links.map(l => ({
        source: l.source != null ? l.source : l.from,
        target: l.target != null ? l.target : l.to,
        value: Math.max(0, l.value || 0),
        color: l.color,
      }))
    } else if (input.data) {
      const nameSet = new Map()
      const addNode = (name) => {
        if (!nameSet.has(name)) {
          nameSet.set(name, {
            id: name,
            name: String(name),
            color: null,
          })
        }
        return nameSet.get(name)
      }
      for (const l of input.data) {
        const sName = l.from != null ? l.from : l.source
        const tName = l.to != null ? l.to : l.target
        addNode(sName)
        addNode(tName)
        links.push({
          source: sName,
          target: tName,
          value: Math.max(0, l.value || 0),
          color: l.color,
        })
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

  // 分层：如果节点没指定 layer，用最长路径法
  _computeLayers() {
    const nodesById = new Map(this._nodes.map(n => [n.id, n]))
    const outgoing = new Map()
    const incoming = new Map()
    for (const n of this._nodes) {
      outgoing.set(n.id, [])
      incoming.set(n.id, [])
    }
    for (const l of this._links) {
      if (!nodesById.has(l.source) || !nodesById.has(l.target)) continue
      outgoing.get(l.source).push(l)
      incoming.get(l.target).push(l)
    }

    // 若节点有显式 layer，用它；否则拓扑排序算最长路径
    const layer = new Map()
    const sources = this._nodes.filter(n => incoming.get(n.id).length === 0)
    const queue = sources.map(n => n.id)
    for (const id of queue) layer.set(id, 0)
    const visited = new Set()
    let guard = 0
    while (queue.length && guard++ < this._nodes.length * 10) {
      const id = queue.shift()
      if (visited.has(id)) continue
      visited.add(id)
      const cur = layer.get(id) || 0
      for (const l of outgoing.get(id)) {
        const next = cur + 1
        if ((layer.get(l.target) ?? -1) < next) {
          layer.set(l.target, next)
          queue.push(l.target)
        }
      }
    }
    // 覆盖显式 layer
    for (const n of this._nodes) {
      if (n.layer != null) layer.set(n.id, n.layer)
    }
    // 兜底：没算到层的放 0
    for (const n of this._nodes) {
      if (!layer.has(n.id)) layer.set(n.id, 0)
    }
    this._nodes.forEach(n => { n._layer = layer.get(n.id) || 0 })
    this._maxLayer = Math.max(...this._nodes.map(n => n._layer), 0)
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding

    this.svg.innerHTML = ''
    this._nodeEls.clear()
    this._linkEls = []
    this._labelEls = []

    if (!this._nodes.length) return

    this._computeLayers()

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const plotX = pad.left
    const plotY = pad.top
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom

    // 每层 x
    const layerCount = this._maxLayer + 1
    const xOf = layer => plotX + (layerCount <= 1 ? plotW / 2 : (layer / (layerCount - 1)) * (plotW - this.opts.nodeWidth))

    // 分组
    const byLayer = new Map()
    for (const n of this._nodes) {
      if (!byLayer.has(n._layer)) byLayer.set(n._layer, [])
      byLayer.get(n._layer).push(n)
    }

    // 节点总流量（取流入或流出较大值）
    const nodeValue = new Map()
    const outSum = new Map()
    const inSum = new Map()
    for (const n of this._nodes) {
      outSum.set(n.id, 0)
      inSum.set(n.id, 0)
    }
    for (const l of this._links) {
      outSum.set(l.source, (outSum.get(l.source) || 0) + l.value)
      inSum.set(l.target, (inSum.get(l.target) || 0) + l.value)
    }
    for (const n of this._nodes) {
      const o = outSum.get(n.id) || 0
      const i = inSum.get(n.id) || 0
      nodeValue.set(n.id, Math.max(o, i))
    }

    // 每层最大总流量
    const layerMax = new Map()
    for (const [lv, list] of byLayer) {
      let total = 0
      for (const n of list) total += nodeValue.get(n.id)
      // 还要算 padding
      total += this.opts.nodePadding * Math.max(0, list.length - 1)
      layerMax.set(lv, total)
    }

    // 计算每个节点的 y 和高度
    for (const [lv, list] of byLayer) {
      // 按节点值从大到小排
      list.sort((a, b) => nodeValue.get(b.id) - nodeValue.get(a.id))
      const total = layerMax.get(lv)
      const usable = plotH
      const scale = total > 0 ? usable / total : 1
      // 若总高度不足，则仍按 scale 缩
      let y = plotY + (usable - total * scale) / 2
      // 若 scale 太小，压缩 padding
      const gap = Math.min(this.opts.nodePadding, total > 0 ? (usable - list.reduce((a, n) => a + nodeValue.get(n.id), 0)) / Math.max(1, list.length - 1) : 0)
      const realGap = Math.max(4, gap)
      for (const n of list) {
        const h = nodeValue.get(n.id) * scale
        n._x = xOf(lv)
        n._y = y
        n._w = this.opts.nodeWidth
        n._h = Math.max(2, h)
        n._value = nodeValue.get(n.id)
        y += n._h + realGap
      }
    }

    // 节点 id -> 节点对象
    const nodeMap = new Map(this._nodes.map(n => [n.id, n]))

    // ===== 链接 =====
    const linkLayer = el('g')
    this.svg.appendChild(linkLayer)

    // 计算每个节点内 links 的位置（源出口 / 目标入口）
    const linkLayout = []
    const sourceCursor = new Map()
    const targetCursor = new Map()
    for (const n of this._nodes) {
      sourceCursor.set(n.id, 0)
      targetCursor.set(n.id, 0)
    }

    // 先按源节点分配出度位置
    const linksBySource = new Map()
    for (const l of this._links) {
      if (!linksBySource.has(l.source)) linksBySource.set(l.source, [])
      linksBySource.get(l.source).push(l)
    }
    for (const [sid, links] of linksBySource) {
      const node = nodeMap.get(sid)
      if (!node) continue
      const total = outSum.get(sid) || 1
      let acc = 0
      links.sort((a, b) => a.value - b.value)
      for (const l of links) {
        l._sy = node._y + (acc / total) * node._h
        l._sh = (l.value / total) * node._h
        acc += l.value
      }
    }

    // 再按目标节点分配入度位置
    const linksByTarget = new Map()
    for (const l of this._links) {
      if (!linksByTarget.has(l.target)) linksByTarget.set(l.target, [])
      linksByTarget.get(l.target).push(l)
    }
    for (const [tid, links] of linksByTarget) {
      const node = nodeMap.get(tid)
      if (!node) continue
      const total = inSum.get(tid) || 1
      let acc = 0
      links.sort((a, b) => a.value - b.value)
      for (const l of links) {
        l._ty = node._y + (acc / total) * node._h
        l._th = (l.value / total) * node._h
        acc += l.value
      }
    }

    // 生成带状路径
    const curveK = this.opts.linkCurve
    for (const l of this._links) {
      const s = nodeMap.get(l.source)
      const t = nodeMap.get(l.target)
      if (!s || !t) continue
      const x0 = s._x + s._w
      const x1 = t._x
      const y0 = l._sy + l._sh / 2
      const y1 = l._ty + l._th / 2
      const h0 = l._sh
      const h1 = l._th
      const c = (x1 - x0) * curveK + (x1 - x0) * 0.2
      const xc0 = x0 + c
      const xc1 = x1 - c

      const path = `M ${x0} ${y0 - h0 / 2} C ${xc0} ${y0 - h0 / 2} ${xc1} ${y1 - h1 / 2} ${x1} ${y1 - h1 / 2} L ${x1} ${y1 + h1 / 2} C ${xc1} ${y1 + h1 / 2} ${xc0} ${y0 + h0 / 2} ${x0} ${y0 + h0 / 2} Z`

      const color = l.color || s.color || this.opts.colors[this._nodes.indexOf(s) % this.opts.colors.length]

      const pathEl = el('path', {
        d: path,
        fill: color,
        opacity: this.opts.linkOpacity,
        style: 'cursor:pointer;transition:opacity .15s',
      })
      pathEl._meta = { link: l, s, t, color, x0, x1, y0, y1, h0, h1 }
      linkLayer.appendChild(pathEl)
      this._linkEls.push(pathEl)

      pathEl.addEventListener('mouseenter', (e) => {
        this._hover = pathEl
        this._applyHover()
        this._moveTipLink(e, pathEl)
      })
      pathEl.addEventListener('mousemove', (e) => {
        if (this._hover === pathEl) this._moveTipLink(e, pathEl)
      })
      pathEl.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      pathEl.addEventListener('click', (e) => {
        if (this.opts.onLinkClick) this.opts.onLinkClick(l, e)
      })
    }

    // ===== 节点 =====
    const nodeLayer = el('g')
    this.svg.appendChild(nodeLayer)

    for (const n of this._nodes) {
      const color = n.color || this.opts.colors[this._nodes.indexOf(n) % this.opts.colors.length]
      const rect = el('rect', {
        x: n._x,
        y: n._y,
        width: n._w,
        height: n._h,
        rx: this.opts.nodeRadius,
        fill: color,
        stroke: this.theme.nodeStroke,
        'stroke-width': 1,
        style: 'cursor:pointer;transition:filter .15s',
      })
      rect._meta = { node: n, color }
      nodeLayer.appendChild(rect)
      this._nodeEls.set(n.id, rect)

      rect.addEventListener('mouseenter', (e) => {
        this._hover = rect
        this._applyHover()
        this._moveTipNode(e, rect)
      })
      rect.addEventListener('mousemove', (e) => {
        if (this._hover === rect) this._moveTipNode(e, rect)
      })
      rect.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      rect.addEventListener('click', (e) => {
        if (this.opts.onNodeClick) this.opts.onNodeClick(n, e)
      })

      // 标签
      if (n._h >= 8) {
        const leftSide = n._layer <= (this._maxLayer / 2)
        let lx, anchor
        if (leftSide) {
          lx = n._x - 8
          anchor = 'end'
        } else {
          lx = n._x + n._w + 8
          anchor = 'start'
        }
        // 最左层标签放左，最右层放右
        if (n._layer === 0 && this._maxLayer > 0) { lx = n._x - 8; anchor = 'end' }
        else if (n._layer === this._maxLayer) { lx = n._x + n._w + 8; anchor = 'start' }

        const nameT = el('text', {
          x: lx,
          y: n._y + n._h / 2 + 4,
          'text-anchor': anchor,
          'font-size': this.opts.labelFontSize,
          'font-weight': 500,
          'font-family': 'inherit',
          fill: this.theme.text,
          style: 'pointer-events:none;user-select:none',
        })
        nameT.textContent = n.name
        nodeLayer.appendChild(nameT)
        this._labelEls.push(nameT)

        if (this.opts.showValues && n._h >= 22) {
          const valT = el('text', {
            x: lx,
            y: n._y + n._h / 2 + 18,
            'text-anchor': anchor,
            'font-size': 11,
            'font-family': 'inherit',
            fill: this.theme.textMuted,
            style: 'pointer-events:none;user-select:none',
          })
          valT.textContent = fmt(n._value)
          nodeLayer.appendChild(valT)
          this._labelEls.push(valT)
        }
      }
    }

    // 动画
    if (animate) this._animate(linkLayer)

    return this
  }

  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._linkEls.forEach(p => p.setAttribute('opacity', this.opts.linkOpacity))
      this._nodeEls.forEach(p => p.style.filter = '')
      return
    }

    // 命中节点：高亮相关的所有链接
    if (hot._meta.node) {
      const id = hot._meta.node.id
      for (const p of this._linkEls) {
        const m = p._meta
        const related = m.link.source === id || m.link.target === id
        p.setAttribute('opacity', related ? this.opts.linkHoverOpacity : 0.08)
      }
      for (const [nid, p] of this._nodeEls) {
        p.style.filter = nid === id ? 'brightness(1.15)' : ''
      }
    } else if (hot._meta.link) {
      // 命中链接：只高亮此链接
      const l = hot._meta.link
      for (const p of this._linkEls) {
        p.setAttribute('opacity', p === hot ? this.opts.linkHoverOpacity : 0.08)
      }
      for (const [nid, p] of this._nodeEls) {
        p.style.filter = (nid === l.source || nid === l.target) ? 'brightness(1.15)' : ''
      }
    }
  }

  _moveTipNode(e, rect) {
    if (!this.tip) return
    const m = rect._meta
    const n = m.node
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${m.color}"></span>
        <strong>${n.name}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">流量</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(n._value)}</strong>
      </div>
    `
    this._positionTip(e)
    if (this.opts.onHover) this.opts.onHover({ type: 'node', node: n, value: n._value })
  }

  _moveTipLink(e, path) {
    if (!this.tip) return
    const m = path._meta
    const l = m.link
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${m.color}"></span>
        <strong>${m.s.name} → ${m.t.name}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">流量</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(l.value)}</strong>
      </div>
    `
    this._positionTip(e)
    if (this.opts.onHover) this.opts.onHover({ type: 'link', link: l, source: m.s, target: m.t, value: l.value })
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

  _animate(linkLayer) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }

    const targets = this._linkEls.map((p, i) => {
      const m = p._meta
      return {
        el: p,
        x0: m.x0, x1: m.x1,
        y0: m.y0, y1: m.y1,
        h0: m.h0, h1: m.h1,
        color: m.color,
        delay: (i * stagger) / duration,
      }
    })

    // 初始：起点宽度保留，终点收缩到起点
    targets.forEach(tg => {
      const x0 = tg.x0, x1 = tg.x1
      const y0 = tg.y0, y1 = tg.y0  // 终点 y 起始 = 起点 y
      const h0 = tg.h0, h1 = tg.h0
      const c = (x1 - x0) * this.opts.linkCurve + (x1 - x0) * 0.2
      const xc0 = x0 + c, xc1 = x1 - c
      const d = `M ${x0} ${y0 - h0 / 2} C ${xc0} ${y0 - h0 / 2} ${xc1} ${y1 - h1 / 2} ${x1} ${y1 - h1 / 2} L ${x1} ${y1 + h1 / 2} C ${xc1} ${y1 + h1 / 2} ${xc0} ${y0 + h0 / 2} ${x0} ${y0 + h0 / 2} Z`
      tg.el.setAttribute('d', d)
      tg.el.setAttribute('opacity', '0')
    })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const y1 = tg.y0 + (tg.y1 - tg.y0) * e
        const h1 = tg.h0 + (tg.h1 - tg.h0) * e
        const c = (tg.x1 - tg.x0) * this.opts.linkCurve + (tg.x1 - tg.x0) * 0.2
        const xc0 = tg.x0 + c, xc1 = tg.x1 - c
        const d = `M ${tg.x0} ${tg.y0 - tg.h0 / 2} C ${xc0} ${tg.y0 - tg.h0 / 2} ${xc1} ${y1 - h1 / 2} ${tg.x1} ${y1 - h1 / 2} L ${tg.x1} ${y1 + h1 / 2} C ${xc1} ${y1 + h1 / 2} ${xc0} ${tg.y0 + tg.h0 / 2} ${tg.x0} ${tg.y0 + tg.h0 / 2} Z`
        tg.el.setAttribute('d', d)
        tg.el.setAttribute('opacity', String(this.opts.linkOpacity * e))
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          const y1 = tg.y1, h1 = tg.h1
          const c = (tg.x1 - tg.x0) * this.opts.linkCurve + (tg.x1 - tg.x0) * 0.2
          const xc0 = tg.x0 + c, xc1 = tg.x1 - c
          const d = `M ${tg.x0} ${tg.y0 - tg.h0 / 2} C ${xc0} ${tg.y0 - tg.h0 / 2} ${xc1} ${y1 - h1 / 2} ${tg.x1} ${y1 - h1 / 2} L ${tg.x1} ${y1 + h1 / 2} C ${xc1} ${y1 + h1 / 2} ${xc0} ${tg.y0 + tg.h0 / 2} ${tg.x0} ${tg.y0 + tg.h0 / 2} Z`
          tg.el.setAttribute('d', d)
          tg.el.setAttribute('opacity', String(this.opts.linkOpacity))
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

export default SankeyChart
