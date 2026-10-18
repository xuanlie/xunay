// @xunay/kit/charts/waffle —— 华夫图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'wf-' + (++_uid).toString(36)

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

export class WaffleChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Waffle] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null,
      height: null,            // 自动
      cols: 10,                // 列数（10×10 = 100 格）
      rows: 10,                // 行数
      gap: 3,
      radius: 3,
      padding: 20,
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#a855f7'],
      emptyColor: null,        // 剩余格子颜色（null = 主题默认）
      mode: 'percent',         // 'percent'（按百分比分配） | 'count'（按数值取整）
      order: 'rows',           // 填充顺序：'rows'（行优先） | 'cols' | 'snake'
      showLegend: true,
      showTotal: true,
      totalLabel: '总计',
      legendFormat: null,      // (item, pct) => string
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 8 },
      onHover: null,
      onCellClick: null,
      onLegendClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = []
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
      emptyColor: '#1e293b',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      emptyColor: '#f1f5f9',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
    }
  }
  _build() {
    const c = this.container
    c.innerHTML = ''
    c.style.cssText = 'position:relative;width:100%;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"PingFang SC",sans-serif;display:flex;flex-direction:column;align-items:center'
    if (this.opts.title) {
      const t = document.createElement('div')
      t.style.cssText = `font-size:16px;font-weight:600;color:${this.theme.text};margin-bottom:6px;align-self:flex-start`
      t.textContent = this.opts.title
      c.appendChild(t)
    }
    if (this.opts.subtitle) {
      const s = document.createElement('div')
      s.style.cssText = `font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px;align-self:flex-start`
      s.textContent = this.opts.subtitle
      c.appendChild(s)
    }
    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'position:relative;width:100%;display:flex;flex-direction:column;align-items:center;gap:16px'
    c.appendChild(this.wrap)
    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible;max-width:100%' })
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
  setData(data) {
    this._data = (data || []).map((d, i) => ({
      label: d.label != null ? d.label : 'Item ' + (i + 1),
      value: Math.max(0, +d.value || 0),
      color: d.color,
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
  _computeCells() {
    const totalCells = this.opts.cols * this.opts.rows
    const total = this._data.reduce((a, b) => a + b.value, 0) || 1
    // 每个分类分配多少格
    const assigned = []
    let used = 0
    if (this.opts.mode === 'count') {
      // 按数值取整，最后按总比例归一化到 totalCells
      const scale = totalCells / total
      let remaining = totalCells
      for (let i = 0; i < this._data.length; i++) {
        const d = this._data[i]
        const isLast = i === this._data.length - 1
        const cnt = isLast ? remaining : Math.round(d.value * scale)
        const c = Math.max(0, Math.min(remaining, cnt))
        assigned.push({ ...d, count: c, index: i })
        remaining -= c
      }
    } else {
      // percent：先用 floor，再按余数分配
      const raw = this._data.map(d => (d.value / total) * totalCells)
      const floors = raw.map(Math.floor)
      const rem = totalCells - floors.reduce((a, b) => a + b, 0)
      // 按小数部分排序分配剩余
      const remIdx = raw.map((v, i) => ({ i, frac: v - floors[i] }))
        .sort((a, b) => b.frac - a.frac)
      for (let k = 0; k < rem; k++) floors[remIdx[k].i]++
      for (let i = 0; i < this._data.length; i++) {
        assigned.push({ ...this._data[i], count: floors[i], index: i })
      }
    }
    // 构建格子序列
    const cells = []
    const order = this.opts.order
    const C = this.opts.cols, R = this.opts.rows
    if (order === 'cols') {
      for (let c = 0; c < C; c++) {
        for (let r = 0; r < R; r++) cells.push([c, r])
      }
    } else if (order === 'snake') {
      for (let r = 0; r < R; r++) {
        const cols = r % 2 === 0 ? [...Array(C).keys()] : [...Array(C).keys()].reverse()
        for (const c of cols) cells.push([c, r])
      }
    } else {
      for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) cells.push([c, r])
      }
    }
    // 分配颜色
    const result = []
    let idx = 0
    for (const item of assigned) {
      for (let k = 0; k < item.count; k++) {
        if (idx >= cells.length) break
        const [c, r] = cells[idx]
        result.push({
          c, r,
          item,
          color: item.color || this.opts.colors[item.index % this.opts.colors.length],
          itemIndex: item.index,
        })
        idx++
      }
    }
    // 剩余空格
    for (; idx < cells.length; idx++) {
      const [c, r] = cells[idx]
      result.push({
        c, r,
        item: null,
        color: this.opts.emptyColor || this.theme.emptyColor,
      })
    }
    return { assigned, cells: result, total }
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this.svg.innerHTML = ''
    this._cellEls = []
    if (!this._data.length) return
    const { assigned, cells, total } = this._computeCells()
    // 计算尺寸：优先让格子接近正方形
    const rect = this.wrap.getBoundingClientRect()
    const wrapW = this.opts.width || Math.max(200, Math.round(rect.width || 480))
    const C = this.opts.cols, R = this.opts.rows
    const gap = this.opts.gap
    // 目标格子大小
    const maxW = wrapW - this.opts.padding * 2
    const cellSize = Math.min((maxW - gap * (C - 1)) / C, 52)
    const W = cellSize * C + gap * (C - 1) + this.opts.padding * 2
    const H = cellSize * R + gap * (R - 1) + this.opts.padding * 2
    this.W = W; this.H = H
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    this.svg.setAttribute('width', String(W))
    this.svg.setAttribute('height', String(H))
    this.svg.setAttribute('fill', 'none')
    const ox = this.opts.padding
    const oy = this.opts.padding
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }
    // 画格子
    const g = el('g')
    this.svg.appendChild(g)
    const r2 = Math.min(this.opts.radius, cellSize / 2)
    for (const cell of cells) {
      const x = ox + cell.c * (cellSize + gap)
      const y = oy + cell.r * (cellSize + gap)
      const rect = el('rect', {
        x, y, width: cellSize, height: cellSize,
        rx: r2,
        fill: cell.color,
        style: 'cursor:pointer;transition:opacity .15s,filter .15s',
      })
      rect._meta = cell
      g.appendChild(rect)
      this._cellEls.push(rect)
      if (cell.item) {
        rect.addEventListener('mouseenter', (e) => {
          this._hover = cell
          this._applyHover()
          this._moveTip(e, cell, total)
        })
        rect.addEventListener('mousemove', (e) => { if (this._hover === cell) this._moveTip(e, cell, total) })
        rect.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover()
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        rect.addEventListener('click', (e) => { if (this.opts.onCellClick) this.opts.onCellClick(cell.item, cell.itemIndex, e) })
      }
    }
    // 中心总量（可选）
    if (this.opts.showTotal) {
      // 不做覆盖，只在外层显示
    }
    if (animate) this._animate(cellSize, gap, ox, oy)
    // 图例
    this._renderLegend(assigned, total, W)
    return this
  }
  _renderLegend(assigned, total, W) {
    if (this.legendEl) this.legendEl.remove()
    if (!this.opts.showLegend) return
    const L = document.createElement('div')
    L.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;font-size:12.5px;max-width:100%'
    for (const item of assigned) {
      if (item.count === 0) continue
      const pct = total > 0 ? (item.value / total * 100) : 0
      const el2 = document.createElement('div')
      el2.style.cssText = 'display:flex;align-items:center;gap:6px;color:' + this.theme.textMuted + ';cursor:pointer;user-select:none'
      const dot = document.createElement('span')
      dot.style.cssText = `display:inline-block;width:10px;height:10px;border-radius:2px;background:${item.color || this.opts.colors[item.index % this.opts.colors.length]}`
      const txt = document.createElement('span')
      txt.textContent = this.opts.legendFormat
        ? this.opts.legendFormat(item, pct)
        : `${item.label} ${pct.toFixed(1)}%`
      el2.appendChild(dot)
      el2.appendChild(txt)
      el2.onclick = (e) => { if (this.opts.onLegendClick) this.opts.onLegendClick(item, e) }
      L.appendChild(el2)
    }
    // 总计
    if (this.opts.showTotal) {
      const t = document.createElement('div')
      t.style.cssText = `display:flex;align-items:center;gap:6px;color:${this.theme.text};font-weight:600`
      t.textContent = `${this.opts.totalLabel}: ${fmt(total)}`
      L.appendChild(t)
    }
    this.legendEl = L
    this.wrap.appendChild(L)
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._cellEls.forEach(c => { c.style.opacity = '1'; c.style.filter = '' })
      return
    }
    const hi = hot.itemIndex
    for (const c of this._cellEls) {
      const m = c._meta
      if (!m.item) {
        c.style.opacity = '0.35'
        continue
      }
      const same = m.itemIndex === hi
      c.style.opacity = same ? '1' : '0.25'
      c.style.filter = same ? 'brightness(1.1)' : ''
    }
  }
  _moveTip(e, cell, total) {
    if (!this.tip) return
    const item = cell.item
    const pct = total > 0 ? (item.value / total * 100) : 0
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${cell.color}"></span>
        <strong>${item.label}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong>${fmt(item.value)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">占比</span>
        <strong>${pct.toFixed(2)}%</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">格数</span>
        <strong>${item.count}</strong>
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
  _animate(cellSize, gap, ox, oy) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._cellEls.map((el2, i) => {
      const m = el2._meta
      const cx = ox + m.c * (cellSize + gap) + cellSize / 2
      const cy = oy + m.r * (cellSize + gap) + cellSize / 2
      return { el: el2, cx, cy, delay: (i * stagger) / duration }
    })
    targets.forEach(tg => {
      tg.el.setAttribute('transform', `translate(${tg.cx} ${tg.cy}) scale(0.01) translate(${-tg.cx} ${-tg.cy})`)
      tg.el.style.opacity = '0'
    })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const scale = 0.01 + 0.99 * e
        tg.el.setAttribute('transform', scale >= 0.999 ? '' : `translate(${tg.cx} ${tg.cy}) scale(${scale}) translate(${-tg.cx} ${-tg.cy})`)
        tg.el.style.opacity = String(e)
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else {
        targets.forEach(tg => { tg.el.removeAttribute('transform'); tg.el.style.opacity = '1' })
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
      if (w > 0 && Math.abs(w - last) > 4) { last = w; this.render() }
    })
    this._resizeObs.observe(this.wrap)
    last = this.wrap.clientWidth
  }
  replay() { this.render({ animate: true }); return this }
  destroy() { if (this._cancelAnim) this._cancelAnim(); if (this._resizeObs) this._resizeObs.disconnect(); this.container.innerHTML = '' }
}
export default WaffleChart
