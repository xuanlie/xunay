// @xunay/kit/charts/marimekko —— 马赛克图（宽柱堆叠）
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'mk-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  if (Math.abs(v) < 1 && v !== 0) return (v * 100).toFixed(1) + '%'
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

export class MarimekkoChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Marimekko] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: 420,
      padding: { top: 40, right: 24, bottom: 60, left: 56 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      colorMode: 'byCategory',   // 'byCategory'（同类别同色）| 'byColumn'（同列同色）
      // 是否归一化各列为 100%
      normalize: true,
      // 列间距
      columnGap: 3,
      // 单元格标签
      showLabels: true,
      labelMinW: 40,
      labelMinH: 20,
      labelFontSize: 11,
      labelColor: '#fff',
      labelMode: 'both',      // 'value' | 'percent' | 'both' | 'none'
      valueFormat: fmt,
      // 顶部分类标签（列名）
      showColumnLabels: true,
      columnLabelFontSize: 11.5,
      // 底部数值
      showColumnValues: true,
      columnValueFormat: fmt,
      // 图例
      legend: true,
      legendPosition: 'bottom',
      // 网格
      showGrid: false,
      // 交互
      tooltip: true,
      dimOpacity: 0.3,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 12 },
      onHover: null,
      onCellClick: null,
      onColumnClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._categories = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._cellEls = []
    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', cellStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc', tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', cellStroke: '#ffffff',
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
    if (this.opts.legend && this.opts.legendPosition === 'top') {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;font-size:12.5px;margin-bottom:12px'
      c.appendChild(this.legendEl)
    }
    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'position:relative;width:100%'
    c.appendChild(this.wrap)
    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible;width:100%' })
    this.wrap.appendChild(this.svg)
    if (this.opts.legend && this.opts.legendPosition === 'bottom') {
      this.legendEl = document.createElement('div')
      this.legendEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-size:12.5px;margin-top:12px'
      c.appendChild(this.legendEl)
    }
    if (this.opts.tooltip) {
      this.tip = document.createElement('div')
      this.tip.style.cssText = `
        position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;
        background:${this.theme.tipBg};color:${this.theme.tipColor};
        border:1px solid ${this.theme.tipBorder};padding:8px 12px;border-radius:8px;
        font-size:12px;line-height:1.55;box-shadow:0 8px 24px rgba(0,0,0,.18);
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
  setData(input) {
    // 支持：
    //   1. { columns: [{ label, values: { 分类A: v, 分类B: v, ... } }] }
    //   2. { columns: ['A','B'], categories: ['X','Y'], matrix: [[1,2],[3,4]] }
    //   3. [{ label, values: {...} }]
    let columns = []
    let categories = []
    if (input.columns && input.categories && input.matrix) {
      columns = input.columns.map((label, i) => ({
        label,
        values: input.categories.reduce((acc, cat, j) => { acc[cat] = input.matrix[i][j]; return acc }, {}),
      }))
      categories = input.categories.slice()
    } else if (input.columns) {
      columns = input.columns.slice()
      // 收集全部分类
      const set = new Set()
      for (const c of columns) if (c.values) for (const k of Object.keys(c.values)) set.add(k)
      categories = input.categories || Array.from(set)
    } else if (Array.isArray(input)) {
      columns = input.slice()
      const set = new Set()
      for (const c of columns) if (c.values) for (const k of Object.keys(c.values)) set.add(k)
      categories = Array.from(set)
    }
    this._data = columns
    this._categories = categories
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _colorOf(category, colIndex) {
    const catIdx = this._categories.indexOf(category)
    const base = this.opts.colors[catIdx % this.opts.colors.length]
    if (this.opts.colorMode === 'byColumn') {
      const colBase = this.opts.colors[colIndex % this.opts.colors.length]
      return shade(colBase, catIdx * 0.12)
    }
    return base
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()
    const W = this.W, H = this.H, pad = this.opts.padding
    this.svg.innerHTML = ''
    this._cellEls = []
    if (!this._data.length) return
    const plot = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }
    // 每列总量
    const colTotals = this._data.map(c => {
      let t = 0
      for (const k of this._categories) t += Math.max(0, +(c.values?.[k] || 0))
      return t
    })
    const grandTotal = colTotals.reduce((a, b) => a + b, 0) || 1
    const gap = this.opts.columnGap
    const availW = plot.w - gap * (this._data.length - 1)
    // 各列宽度按总量比例
    const colWidths = colTotals.map(t => (t / grandTotal) * availW)
    if (this.theme.bg !== 'transparent') this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    // 网格
    if (this.opts.showGrid) {
      for (let k = 0; k <= 5; k++) {
        const y = plot.y + plot.h * (k / 5)
        this.svg.appendChild(el('line', { x1: plot.x, x2: plot.x + plot.w, y1: y, y2: y, stroke: this.theme.grid, 'stroke-width': 1 }))
      }
    }
    // Y 轴刻度（百分比）
    if (this.opts.normalize) {
      for (let k = 0; k <= 5; k++) {
        const t = 1 - k / 5
        const y = plot.y + plot.h * (k / 5)
        const tx = el('text', {
          x: plot.x - 10, y: y + 4,
          'text-anchor': 'end', 'font-size': 11, fill: this.theme.textMuted,
        })
        tx.textContent = (t * 100).toFixed(0) + '%'
        this.svg.appendChild(tx)
      }
    }
    // 逐列绘制
    const g = el('g')
    this.svg.appendChild(g)
    let cursorX = plot.x
    this._data.forEach((col, ci) => {
      const cw = colWidths[ci]
      const total = colTotals[ci] || 1
      const colValues = this._categories
        .map(cat => ({ cat, v: Math.max(0, +(col.values?.[cat] || 0)) }))
        .filter(x => x.v > 0)
      if (this.opts.normalize) {
        // 各段按比例铺满列高
        let accT = 0
        colValues.forEach(({ cat, v }) => {
          const ratio = v / total
          const y0 = plot.y + plot.h - (accT + ratio) * plot.h
          const h = ratio * plot.h
          accT += ratio
          const color = this._colorOf(cat, ci)
          const rect = el('rect', {
            x: cursorX, y: y0,
            width: Math.max(0, cw), height: Math.max(0, h - 0.5),
            fill: color,
            stroke: this.theme.cellStroke, 'stroke-width': 0.5,
            style: 'cursor:pointer;transition:filter .15s,opacity .15s',
          })
          rect._meta = { col, colIndex: ci, cat, value: v, total, color, x: cursorX, y: y0, w: cw, h }
          g.appendChild(rect)
          this._cellEls.push(rect)
          // 值标签
          if (this.opts.showLabels && this.opts.labelMode !== 'none' && cw > this.opts.labelMinW && h > this.opts.labelMinH) {
            const mode = this.opts.labelMode
            const pctTxt = (ratio * 100).toFixed(0) + '%'
            const valTxt = this.opts.valueFormat(v)
            let label = ''
            if (mode === 'percent') label = pctTxt
            else if (mode === 'value') label = valTxt
            else if (mode === 'both') label = valTxt + ' · ' + pctTxt
            // 空间够才用长文本，不够就退回单值
            const estW = label.length * this.opts.labelFontSize * 0.6
            if (estW > cw - 6) {
              label = mode === 'both' ? (h > 26 ? valTxt + '\n' + pctTxt : pctTxt) : label
            }
            const isTwoLine = label.includes('\n')
            const t = el('text', {
              x: cursorX + cw / 2,
              y: y0 + h / 2 + (isTwoLine ? -3 : 4),
              'text-anchor': 'middle',
              'font-size': this.opts.labelFontSize,
              'font-weight': 600,
              fill: this.opts.labelColor,
              style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.35)',
            })
            if (isTwoLine) {
              const [l1, l2] = label.split('\n')
              const tsp1 = el('tspan', { x: cursorX + cw / 2, dy: 0 })
              tsp1.textContent = l1
              t.appendChild(tsp1)
              const tsp2 = el('tspan', { x: cursorX + cw / 2, dy: 12, style: 'opacity:.85' })
              tsp2.textContent = l2
              t.appendChild(tsp2)
            } else {
              t.textContent = label
            }
            g.appendChild(t)
          }
          // 事件
          rect.addEventListener('mouseenter', (e) => {
            this._hover = rect
            this._applyHover()
            this._moveTip(e, rect._meta, ratio)
          })
          rect.addEventListener('mousemove', (e) => { if (this._hover === rect) this._moveTip(e, rect._meta, ratio) })
          rect.addEventListener('mouseleave', () => {
            this._hover = null
            this._applyHover()
            if (this.tip) this.tip.style.opacity = '0'
            if (this.opts.onHover) this.opts.onHover(null)
          })
          rect.addEventListener('click', (e) => { if (this.opts.onCellClick) this.opts.onCellClick({ column: col, category: cat, value: v, total, ratio }, ci, cat, e) })
        })
      } else {
        // 绝对高度：最大总量决定
        const maxTotal = Math.max(...colTotals, 1)
        const colH = (total / maxTotal) * plot.h
        let acc = 0
        colValues.forEach(({ cat, v }) => {
          const h = (v / total) * colH
          const y0 = plot.y + plot.h - acc - h
          acc += h
          const color = this._colorOf(cat, ci)
          const rect = el('rect', {
            x: cursorX, y: y0, width: Math.max(0, cw), height: Math.max(0, h - 0.5),
            fill: color, stroke: this.theme.cellStroke, 'stroke-width': 0.5,
            style: 'cursor:pointer;transition:filter .15s,opacity .15s',
          })
          rect._meta = { col, colIndex: ci, cat, value: v, total, color, x: cursorX, y: y0, w: cw, h }
          g.appendChild(rect)
          this._cellEls.push(rect)
          if (this.opts.showLabels && this.opts.labelMode !== 'none' && cw > this.opts.labelMinW && h > this.opts.labelMinH) {
            const mode = this.opts.labelMode
            const ratio2 = v / total
            const pctTxt = (ratio2 * 100).toFixed(0) + '%'
            const valTxt = this.opts.valueFormat(v)
            let label = ''
            if (mode === 'percent') label = pctTxt
            else if (mode === 'value') label = valTxt
            else if (mode === 'both') label = valTxt + ' · ' + pctTxt
            const estW = label.length * this.opts.labelFontSize * 0.6
            if (estW > cw - 6) label = (mode === 'both') ? pctTxt : label
            const t = el('text', {
              x: cursorX + cw / 2, y: y0 + h / 2 + 4,
              'text-anchor': 'middle',
              'font-size': this.opts.labelFontSize,
              'font-weight': 600,
              fill: this.opts.labelColor,
              style: 'pointer-events:none',
            })
            t.textContent = label
            g.appendChild(t)
          }
          rect.addEventListener('mouseenter', (e) => {
            this._hover = rect
            this._applyHover()
            this._moveTip(e, rect._meta, v / total)
          })
          rect.addEventListener('mousemove', (e) => { if (this._hover === rect) this._moveTip(e, rect._meta, v / total) })
          rect.addEventListener('mouseleave', () => {
            this._hover = null
            this._applyHover()
            if (this.tip) this.tip.style.opacity = '0'
            if (this.opts.onHover) this.opts.onHover(null)
          })
          rect.addEventListener('click', (e) => { if (this.opts.onCellClick) this.opts.onCellClick({ column: col, category: cat, value: v, total, ratio: v / total }, ci, cat, e) })
        })
      }
      // 顶部分类标签
      if (this.opts.showColumnLabels) {
        const t = el('text', {
          x: cursorX + cw / 2, y: plot.y - 20,
          'text-anchor': 'middle', 'font-size': this.opts.columnLabelFontSize,
          'font-weight': 600, fill: this.theme.text,
          style: 'pointer-events:none',
        })
        t.textContent = col.label.length > 10 ? col.label.slice(0, 9) + '…' : col.label
        g.appendChild(t)
      }
      // 底部分类数值
      if (this.opts.showColumnValues) {
        const t = el('text', {
          x: cursorX + cw / 2, y: plot.y + plot.h + 20,
          'text-anchor': 'middle', 'font-size': 11,
          fill: this.theme.textMuted,
          style: 'pointer-events:none;font-variant-numeric:tabular-nums',
        })
        t.textContent = this.opts.columnValueFormat(total)
        g.appendChild(t)
      }
      // 整列悬停区域（可选）
      cursorX += cw + gap
    })
    if (animate) this._animate()
    // 图例
    this._renderLegend()
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._cellEls.forEach(c => { c.style.filter = ''; c.style.opacity = '1' })
      return
    }
    for (const c of this._cellEls) {
      const isHot = c === hot
      c.style.filter = isHot ? 'brightness(1.15)' : ''
      c.style.opacity = (hot && !isHot) ? String(this.opts.dimOpacity) : '1'
    }
  }
  _moveTip(e, meta, ratio) {
    if (!this.tip) return
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${meta.color}"></span>
        <strong>${meta.col.label} · ${meta.cat}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">数值</span><span style="text-align:right;font-weight:600">${fmt(meta.value)}</span>
        <span style="opacity:.7">列内占比</span><span style="text-align:right">${(ratio * 100).toFixed(1)}%</span>
        <span style="opacity:.7">列总计</span><span style="text-align:right">${fmt(meta.total)}</span>
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
    if (this.opts.onHover) this.opts.onHover({ column: meta.col, category: meta.cat, value: meta.value, ratio })
  }
  _renderLegend() {
    if (!this.legendEl) return
    this.legendEl.innerHTML = ''
    const catOrder = []
    const seen = new Set()
    for (const c of this._data) {
      for (const k of this._categories) {
        if (!seen.has(k) && (c.values?.[k] || 0) > 0) { seen.add(k); catOrder.push(k) }
      }
    }
    catOrder.forEach((cat, idx) => {
      const color = this.opts.colorMode === 'byColumn' ? this.opts.colors[0] : this.opts.colors[this._categories.indexOf(cat) % this.opts.colors.length]
      const item = document.createElement('div')
      item.style.cssText = 'display:flex;align-items:center;gap:6px;color:' + this.theme.textMuted
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span><span>${cat}</span>`
      this.legendEl.appendChild(item)
    })
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const plot = {
      x: this.opts.padding.left,
      y: this.opts.padding.top,
      h: this.H - this.opts.padding.top - this.opts.padding.bottom,
    }
    const baseY = plot.y + plot.h
    const targets = this._cellEls.map((r, i) => {
      const m = r._meta
      return { el: r, x: m.x, y: m.y, w: m.w, h: m.h, delay: i * stagger / duration }
    })
    targets.forEach(tg => {
      tg.el.setAttribute('y', String(baseY))
      tg.el.setAttribute('height', '0')
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const cy = tg.y + tg.h / 2
        const curY = baseY + (cy - baseY) * e
        const curH = tg.h * e
        tg.el.setAttribute('y', String(curY - curH / 2))
        tg.el.setAttribute('height', String(Math.max(0, curH)))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => {
          tg.el.setAttribute('y', String(tg.y))
          tg.el.setAttribute('height', String(tg.h))
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
export default MarimekkoChart
