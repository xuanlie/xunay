// @xunay/kit/charts/treemap —— 精修版矩形树图
// 特性：Squarified 布局 · 嵌套层级 · 悬停放大 · 自适应标签 · 
//      图例 · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'tm-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

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
// Squarified Treemap 算法
// 输入：nodes = [{ value, ... }]，rect = { x, y, w, h }
// 输出：附加 rect 的数组
// ============================================================
function squarify(nodes, rect) {
  const total = nodes.reduce((a, b) => a + b.value, 0)
  if (total <= 0) return nodes.map(n => ({ ...n, rect: { ...rect, w: 0, h: 0 } }))

  // 归一化：按面积比例，面积 = rect.w * rect.h * (value / total)
  const area = rect.w * rect.h
  const scaled = nodes.map(n => ({ ...n, area: (n.value / total) * area }))
  scaled.sort((a, b) => b.value - a.value)

  const result = []
  layoutRow(scaled, { ...rect }, result)
  return result
}

function layoutRow(items, rect, out) {
  if (items.length === 0) return
  if (items.length === 1) {
    out.push({ ...items[0], rect: { ...rect } })
    return
  }

  const shortSide = Math.min(rect.w, rect.h)
  let row = [items[0]]
  let rowArea = items[0].area
  let bestRatio = worst(row, rowArea, shortSide)

  let i = 1
  while (i < items.length) {
    const next = items[i]
    const nextArea = rowArea + next.area
    const ratio = worst([...row, next], nextArea, shortSide)
    if (ratio > bestRatio) break
    row.push(next)
    rowArea = nextArea
    bestRatio = ratio
    i++
  }

  // 布局这一行
  const rest = items.slice(row.length)
  if (rect.w >= rect.h) {
    const rowW = rowArea / rect.h
    let y = rect.y
    for (const item of row) {
      const h = item.area / rowW
      out.push({ ...item, rect: { x: rect.x, y, w: rowW, h } })
      y += h
    }
    if (rest.length) {
      layoutRow(rest, { x: rect.x + rowW, y: rect.y, w: rect.w - rowW, h: rect.h }, out)
    }
  } else {
    const rowH = rowArea / rect.w
    let x = rect.x
    for (const item of row) {
      const w = item.area / rowH
      out.push({ ...item, rect: { x, y: rect.y, w, h: rowH } })
      x += w
    }
    if (rest.length) {
      layoutRow(rest, { x: rect.x, y: rect.y + rowH, w: rect.w, h: rect.h - rowH }, out)
    }
  }
}

function worst(row, totalArea, shortSide) {
  let maxV = -Infinity
  let minV = Infinity
  for (const r of row) {
    if (r.area > maxV) maxV = r.area
    if (r.area < minV) minV = r.area
  }
  const s2 = shortSide * shortSide
  const t2 = totalArea * totalArea
  return Math.max((s2 * maxV) / t2, t2 / (s2 * minV))
}

// ============================================================
// 组件
// ============================================================
export class TreemapChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[TreemapChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 400,
      padding: 12,
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4'],
      // 层级：0 = 平铺，1 = 一级嵌套（推荐），2 = 二级
      depth: 1,
      gap: 2,                // 单元格间隙
      radius: 3,
      labelMinW: 40,         // 显示标签的最小宽度
      labelMinH: 24,
      labelFontSize: 12,
      valueFontSize: 11,
      showValues: true,
      minLabelArea: 400,     // 小于此面积不显示标签
      hoverLift: 2,          // 悬停放大（px）
      tooltip: true,
      legend: false,
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 25 },
      onHover: null,
      onNodeClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._cellEls = []
    this._labelEls = []

    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      cellBorder: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      cellBorder: '#fff',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 640))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(data) {
    // 支持 [{label, value}] 或 [{label, value, children: [...]}]（嵌套）
    this._data = (data || []).map((d, i) => ({
      label: d.label != null ? d.label : d.name ?? String(i),
      value: Math.max(0, d.value != null ? d.value : (d.y != null ? d.y : 0)),
      color: d.color,
      children: d.children ? d.children.map((c, j) => ({
        label: c.label != null ? c.label : c.name ?? `${d.label}/${j}`,
        value: Math.max(0, c.value ?? c.y ?? 0),
        color: c.color,
      })) : null,
      _i: i,
    }))
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
    this._cellEls = []
    this._labelEls = []

    if (!this._data.length) return

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const plot = {
      x: pad,
      y: pad,
      w: W - pad * 2,
      h: H - pad * 2,
    }

    const g = el('g')
    this.svg.appendChild(g)

    // 顶层切片
    const topNodes = this._data.map(d => ({ ...d, value: this._nodeValue(d) }))
    const layout = squarify(topNodes, plot)

    layout.forEach((node) => {
      const color = node.color || this.opts.colors[node._i % this.opts.colors.length]
      const r = node.rect

      // 单元格
      const rect = el('rect', {
        x: r.x + this.opts.gap / 2,
        y: r.y + this.opts.gap / 2,
        width: Math.max(0, r.w - this.opts.gap),
        height: Math.max(0, r.h - this.opts.gap),
        rx: this.opts.radius,
        fill: color,
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      rect._meta = {
        node,
        level: 0,
        color,
        label: node.label,
        value: node.value,
        x: r.x, y: r.y, w: r.w, h: r.h,
      }
      g.appendChild(rect)
      this._cellEls.push(rect)

      // 顶层标签
      this._maybeLabel(g, rect._meta, {
        x: r.x, y: r.y, w: r.w, h: r.h,
        fs: this.opts.labelFontSize,
        fw: 600,
        color: '#fff',
      })

      // 层级：子节点
      if (this.opts.depth >= 1 && node.children && node.children.length) {
        const childRect = {
          x: r.x + 4,
          y: r.y + 24,
          w: Math.max(0, r.w - 8),
          h: Math.max(0, r.h - 28),
        }
        if (childRect.w > 20 && childRect.h > 20) {
          const childLayout = squarify(
            node.children.map(c => ({ ...c, value: Math.max(0, c.value) })),
            childRect
          )
          childLayout.forEach((child, ci) => {
            const cr = child.rect
            // 子单元格用父色变暗/亮一点
            const childColor = child.color || this._shade(color, 0.15 + (ci % 3) * 0.08)
            const crect = el('rect', {
              x: cr.x + 1,
              y: cr.y + 1,
              width: Math.max(0, cr.w - 2),
              height: Math.max(0, cr.h - 2),
              rx: Math.max(0, this.opts.radius - 1),
              fill: childColor,
              style: 'cursor:pointer;transition:filter .15s,opacity .15s',
            })
            crect._meta = {
              node: child,
              parent: node,
              level: 1,
              color: childColor,
              label: child.label,
              value: child.value,
              x: cr.x, y: cr.y, w: cr.w, h: cr.h,
            }
            g.appendChild(crect)
            this._cellEls.push(crect)

            this._maybeLabel(g, crect._meta, {
              x: cr.x, y: cr.y, w: cr.w, h: cr.h,
              fs: this.opts.valueFontSize,
              fw: 500,
              color: 'rgba(255,255,255,0.95)',
            })
          })
        }
      }

      // 事件
      for (const cellEl of this._cellEls) {
        if (cellEl._bound) continue
        cellEl._bound = true
        cellEl.addEventListener('mouseenter', (e) => {
          this._hover = cellEl
          this._applyHover()
          this._moveTip(e, cellEl)
        })
        cellEl.addEventListener('mousemove', (e) => {
          if (this._hover === cellEl) this._moveTip(e, cellEl)
        })
        cellEl.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        cellEl.addEventListener('click', (e) => {
          const m = cellEl._meta
          if (this.opts.onNodeClick) {
            this.opts.onNodeClick({
              label: m.label,
              value: m.value,
              level: m.level,
              node: m.node,
              parent: m.parent,
            }, e)
          }
        })
      }
    })

    // 动画
    if (animate) this._animate()

    // 图例
    if (this.opts.legend) this._renderLegend()
  }

  _nodeValue(node) {
    if (node.children && node.children.length) {
      return node.children.reduce((a, c) => a + c.value, 0)
    }
    return node.value
  }

  _shade(hex, amount) {
    // amount > 0 变亮，< 0 变暗
    let h = hex.replace('#', '')
    if (h.length === 3) h = h.split('').map(c => c + c).join('')
    let r = parseInt(h.slice(0, 2), 16)
    let g = parseInt(h.slice(2, 4), 16)
    let b = parseInt(h.slice(4, 6), 16)
    if (amount >= 0) {
      r = Math.min(255, Math.round(r + (255 - r) * amount))
      g = Math.min(255, Math.round(g + (255 - g) * amount))
      b = Math.min(255, Math.round(b + (255 - b) * amount))
    } else {
      const k = 1 + amount
      r = Math.round(r * k)
      g = Math.round(g * k)
      b = Math.round(b * k)
    }
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
  }

  _maybeLabel(g, meta, { x, y, w, h, fs, fw, color }) {
    if (w < this.opts.labelMinW || h < this.opts.labelMinH) return
    const area = w * h
    if (area < this.opts.minLabelArea) return

    const tg = el('g', { style: 'pointer-events:none' })

    // 主标签
    const label = el('text', {
      x: x + w / 2,
      y: y + (this.opts.showValues && h > 32 ? h / 2 - 6 : h / 2 + 4),
      'text-anchor': 'middle',
      'font-size': fs,
      'font-weight': fw,
      'font-family': 'inherit',
      fill: color,
      style: 'text-shadow:0 1px 2px rgba(0,0,0,.35)',
    })
    label.textContent = meta.label.length > 18 && w < 100
      ? meta.label.slice(0, 16) + '…'
      : meta.label
    tg.appendChild(label)
    this._labelEls.push(label)

    // 数值
    if (this.opts.showValues && h > 32 && w > 50) {
      const v = el('text', {
        x: x + w / 2,
        y: y + h / 2 + 12,
        'text-anchor': 'middle',
        'font-size': Math.max(10, fs - 1),
        'font-family': 'inherit',
        fill: color,
        opacity: 0.85,
      })
      v.textContent = fmt(meta.value)
      tg.appendChild(v)
      this._labelEls.push(v)
    }

    g.appendChild(tg)
  }

  _applyHover() {
    for (const r of this._cellEls) {
      const hot = r === this._hover
      r.style.opacity = this._hover ? (hot ? '1' : '0.45') : '1'
      r.style.filter = hot ? 'brightness(1.1)' : ''
    }
  }

  _moveTip(e, cell) {
    if (!this.tip) return
    const m = cell._meta
    const parent = m.parent
    const total = this._data.reduce((a, d) => a + this._nodeValue(d), 0)
    const pct = total > 0 ? (m.value / total * 100).toFixed(1) : '0'

    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${m.color}"></span>
        <strong>${m.label}</strong>
      </div>
      ${parent ? `<div style="opacity:.65;font-size:11px;margin-bottom:4px">属于: ${parent.label}</div>` : ''}
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(m.value)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">占比</span>
        <strong style="font-variant-numeric:tabular-nums">${pct}%</strong>
      </div>
    `
    this.tip.style.opacity = '1'
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

    if (this.opts.onHover) {
      this.opts.onHover({
        label: m.label,
        value: m.value,
        percent: parseFloat(pct),
        level: m.level,
        parent: parent?.label,
      })
    }
  }

  _animate() {
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

    const targets = this._cellEls.map((r, i) => {
      const x = parseFloat(r.getAttribute('x'))
      const y = parseFloat(r.getAttribute('y'))
      const w = parseFloat(r.getAttribute('width'))
      const h = parseFloat(r.getAttribute('height'))
      const m = r._meta
      const delay = (m.level * 60 + i * stagger) / duration
      return { el: r, x, y, w, h, cx: x + w / 2, cy: y + h / 2, delay }
    })

    targets.forEach(tg => {
      tg.el.setAttribute('transform', `translate(${tg.cx} ${tg.cy}) scale(0.01) translate(${-tg.cx} ${-tg.cy})`)
      tg.el.style.opacity = '0'
    })
    this._labelEls.forEach(l => l.style.opacity = '0')

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const scale = 0.01 + 0.99 * e
        tg.el.setAttribute('transform', scale >= 1 ? '' : `translate(${tg.cx} ${tg.cy}) scale(${scale}) translate(${-tg.cx} ${-tg.cy})`)
        tg.el.style.opacity = String(e)
      })
      this._labelEls.forEach((l, i) => {
        const tg = targets[Math.min(i, targets.length - 1)]
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        l.style.opacity = String(tt * 0.95)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          tg.el.removeAttribute('transform')
          tg.el.style.opacity = '1'
        })
        this._labelEls.forEach(l => l.style.opacity = '1')
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }

  _renderLegend() {
    // 简化：不做完整图例，避免 UI 拥挤
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

export default TreemapChart
