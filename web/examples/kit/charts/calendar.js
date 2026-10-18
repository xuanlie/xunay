// @xunay/kit/charts/calendar —— 日历热力图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'ch-' + (++_uid).toString(36)

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
function lerp(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b)
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`
}
function rampColor(stops, t) {
  if (t <= 0) return stops[0]
  if (t >= 1) return stops[stops.length - 1]
  const n = stops.length - 1
  const i = Math.floor(t * n)
  return lerp(stops[i], stops[i + 1], t * n - i)
}
function dayKey(d) {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
function addDays(d, n) {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  dt.setHours(0, 0, 0, 0)
  return dt
}

export class CalendarHeatmap {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[CalendarHeatmap] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null,
      height: null,
      padding: { top: 30, right: 20, bottom: 24, left: 40 },
      title: null, subtitle: null, theme: 'light',
      // 时间范围：null = 自动（从数据推）+ 向前补一年
      startDate: null,
      endDate: null,
      cellSize: 12,
      cellGap: 3,
      cellRadius: 2,
      // 颜色：5 个等级
      colorRamp: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
      colorRampDark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
      // 分级方式
      levels: 5,
      // 阈值（null = 按分位数自动）
      thresholds: null,
      // 显示
      showWeekdayLabels: true,     // 一二三四五六日
      showMonthLabels: true,       // 月份分隔
      showLegend: true,
      legendLabel: 'Less → More',
      // 周日 vs 周一为起始
      weekStart: 1,                // 0 = 周日，1 = 周一
      // 交互
      tooltip: true,
      tooltipFormat: null,         // (date, value) => string
      dateFormat: (d) => dayKey(d),
      onHover: null,
      onCellClick: null,
      animation: { duration: 600, easing: 'easeOutCubic', stagger: 3 },
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._data = new Map()  // key: 'YYYY-MM-DD', value: number
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
      cellStroke: 'rgba(0,0,0,0.3)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      cellStroke: 'rgba(0,0,0,0.06)',
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
    this.wrap.style.cssText = 'position:relative;width:100%;overflow-x:auto'
    c.appendChild(this.wrap)
    this.svg = el('svg', { xmlns: NS, style: 'display:block;overflow:visible' })
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
    this._data = new Map()
    if (Array.isArray(data)) {
      for (const d of data) {
        if (!d) continue
        const key = typeof d.date === 'string' ? d.date : dayKey(d.date || d.day)
        const v = Number(d.value != null ? d.value : d.count != null ? d.count : 0)
        this._data.set(key, v)
      }
    } else if (data && typeof data === 'object') {
      for (const [k, v] of Object.entries(data)) {
        this._data.set(k, Number(v) || 0)
      }
    }
    this.render()
    return this
  }
  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }
  _range() {
    let start = this.opts.startDate ? new Date(this.opts.startDate) : null
    let end = this.opts.endDate ? new Date(this.opts.endDate) : null
    if (!start || !end) {
      if (this._data.size) {
        const keys = Array.from(this._data.keys()).sort()
        if (!start) start = new Date(keys[0])
        if (!end) end = new Date(keys[keys.length - 1])
      } else {
        if (!end) end = new Date()
        if (!start) start = addDays(end, -364)
      }
    }
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    // 对齐到周初
    const ws = this.opts.weekStart
    while (start.getDay() !== ws) start = addDays(start, -1)
    while (end.getDay() !== (ws + 6) % 7) end = addDays(end, 1)
    return { start, end }
  }
  _computeThresholds() {
    if (this.opts.thresholds) return this.opts.thresholds
    const vals = Array.from(this._data.values()).filter(v => v > 0).sort((a, b) => a - b)
    if (!vals.length) return [1, 2, 3, 4]
    const q = (p) => vals[Math.min(vals.length - 1, Math.floor(vals.length * p))]
    // 用分位数定义 4 个阈值（对应 5 个等级）
    return [q(0.2), q(0.4), q(0.6), q(0.85)]
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this.svg.innerHTML = ''
    this._cellEls = []
    const { start, end } = this._range()
    const cs = this.opts.cellSize
    const gap = this.opts.cellGap
    const step = cs + gap
    const pad = this.opts.padding
    // 计算周数和天数
    const totalDays = Math.round((end - start) / 86400000) + 1
    const weeks = Math.ceil(totalDays / 7)
    // 尺寸
    const contentW = weeks * step - gap
    const contentH = 7 * step - gap
    const monthLabelH = this.opts.showMonthLabels ? 18 : 0
    const weekdayLabelW = this.opts.showWeekdayLabels ? 24 : 0
    const legendH = this.opts.showLegend ? 28 : 0
    const W = pad.left + weekdayLabelW + contentW + pad.right
    const H = pad.top + monthLabelH + contentH + legendH + pad.bottom
    this.W = W
    this.H = H
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    this.svg.setAttribute('width', String(W))
    this.svg.setAttribute('height', String(H))
    this.svg.setAttribute('fill', 'none')
    const originX = pad.left + weekdayLabelW
    const originY = pad.top + monthLabelH
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }
    const ramp = this.opts.theme === 'dark' ? this.opts.colorRampDark : this.opts.colorRamp
    const thresholds = this._computeThresholds()
    const colorOf = (v) => {
      if (!v || v <= 0) return ramp[0]
      for (let i = 0; i < thresholds.length; i++) {
        if (v <= thresholds[i]) return ramp[i + 1] || ramp[ramp.length - 1]
      }
      return ramp[ramp.length - 1]
    }
    // 每个星期几的行位置
    const ws = this.opts.weekStart
    // 用于查找 x、y
    const xOfDate = (d) => {
      const diff = Math.round((d - start) / 86400000)
      return originX + Math.floor(diff / 7) * step
    }
    const yOfDate = (d) => {
      const dow = (d.getDay() - ws + 7) % 7
      return originY + dow * step
    }
    // 绘制格子
    const cellG = el('g')
    this.svg.appendChild(cellG)
    let cur = new Date(start)
    let i = 0
    const weekendOverlay = []
    while (cur <= end) {
      const key = dayKey(cur)
      const v = this._data.get(key) || 0
      const x = xOfDate(cur)
      const y = yOfDate(cur)
      const color = colorOf(v)
      const rect = el('rect', {
        x, y,
        width: cs, height: cs,
        rx: this.opts.cellRadius,
        fill: color,
        stroke: this.theme.cellStroke,
        'stroke-width': 0.5,
        style: 'cursor:pointer;transition:filter .12s,stroke .12s',
      })
      rect._meta = { date: new Date(cur), key, value: v, x, y, color }
      cellG.appendChild(rect)
      this._cellEls.push(rect)
      rect.addEventListener('mouseenter', (e) => {
        this._hover = rect
        this._applyHover()
        this._moveTip(e, rect._meta)
      })
      rect.addEventListener('mousemove', (e) => { if (this._hover === rect) this._moveTip(e, rect._meta) })
      rect.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      rect.addEventListener('click', (e) => {
        if (this.opts.onCellClick) this.opts.onCellClick(rect._meta.date, v, e)
      })
      cur = addDays(cur, 1)
      i++
    }
    // 月份标签
    if (this.opts.showMonthLabels) {
      const mg = el('g')
      let lastMonth = -1
      let mCur = new Date(start)
      while (mCur <= end) {
        if (mCur.getMonth() !== lastMonth) {
          const x = xOfDate(mCur)
          const t = el('text', {
            x, y: pad.top + 12,
            'text-anchor': 'start', 'font-size': 10.5,
            fill: this.theme.textMuted,
          })
          t.textContent = (mCur.getMonth() + 1) + '月'
          mg.appendChild(t)
          lastMonth = mCur.getMonth()
        }
        mCur = addDays(mCur, 1)
      }
      this.svg.appendChild(mg)
    }
    // 星期标签
    if (this.opts.showWeekdayLabels) {
      const wg = el('g')
      const names = this.opts.weekStart === 1
        ? ['一', '二', '三', '四', '五', '六', '日']
        : ['日', '一', '二', '三', '四', '五', '六']
      names.forEach((n, r) => {
        // 只显示单双（一、三、五）
        if (this.opts.weekStart === 1 ? (r % 2 === 0) : (r % 2 === 1)) {
          const t = el('text', {
            x: pad.left + weekdayLabelW - 6,
            y: originY + r * step + cs / 2 + 3,
            'text-anchor': 'end',
            'font-size': 10,
            fill: this.theme.textMuted,
          })
          t.textContent = n
          wg.appendChild(t)
        }
      })
      this.svg.appendChild(wg)
    }
    // 图例
    if (this.opts.showLegend) {
      const lg = el('g')
      const ly = originY + contentH + 14
      let lx = originX
      const t = el('text', {
        x: lx, y: ly + cs / 2 + 3,
        'text-anchor': 'start', 'font-size': 10.5,
        fill: this.theme.textMuted,
      })
      t.textContent = '少'
      lg.appendChild(t)
      lx += 20
      const levels = this.opts.levels
      for (let k = 0; k < levels; k++) {
        const color = ramp[k] || ramp[ramp.length - 1]
        lg.appendChild(el('rect', {
          x: lx + k * (cs + 2), y: ly,
          width: cs, height: cs,
          rx: this.opts.cellRadius,
          fill: color,
          stroke: this.theme.cellStroke, 'stroke-width': 0.5,
        }))
      }
      const t2 = el('text', {
        x: lx + levels * (cs + 2) + 4,
        y: ly + cs / 2 + 3,
        'text-anchor': 'start', 'font-size': 10.5,
        fill: this.theme.textMuted,
      })
      t2.textContent = '多'
      lg.appendChild(t2)
      // 统计总数
      const total = Array.from(this._data.values()).reduce((a, b) => a + b, 0)
      const t3 = el('text', {
        x: W - pad.right,
        y: ly + cs / 2 + 3,
        'text-anchor': 'end', 'font-size': 10.5,
        fill: this.theme.textMuted,
      })
      t3.textContent = `总计 ${fmt(total)}`
      lg.appendChild(t3)
      this.svg.appendChild(lg)
    }
    if (animate) this._animate(originX, originY, step)
    return this
  }
  _applyHover() {
    const hot = this._hover
    if (!hot) {
      this._cellEls.forEach(c => { c.style.filter = ''; c.style.stroke = this.theme.cellStroke; c.style.strokeWidth = '0.5' })
      return
    }
    this._cellEls.forEach(c => {
      c.style.stroke = c === hot ? this.theme.text : this.theme.cellStroke
      c.style.strokeWidth = c === hot ? '1.5' : '0.5'
      c.style.filter = c === hot ? 'brightness(1.15)' : ''
    })
  }
  _moveTip(e, meta) {
    if (!this.tip) return
    const { date, value } = meta
    const dateStr = this.opts.tooltipFormat ? this.opts.tooltipFormat(date, value) : this.opts.dateFormat(date)
    this.tip.innerHTML = `
      <div style="font-weight:600;margin-bottom:3px">${dateStr}</div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong>${fmt(value)}</strong>
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const mx = e.clientX - r.left + this.wrap.scrollLeft
    const my = e.clientY - r.top
    let left = mx + 14, top = my - th - 10
    if (left + tw > r.width + this.wrap.scrollLeft - 4) left = mx - tw - 14
    if (top < 0) top = my + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover(date, value)
  }
  _animate(originX, originY, step) {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const cs = this.opts.cellSize
    const targets = this._cellEls.map((r, i) => {
      const m = r._meta
      const cx = m.x + cs / 2, cy = m.y + cs / 2
      return { el: r, cx, cy, delay: (i * stagger) / duration }
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
    // 日历图不太需要响应式（滚动条）
  }
  replay() { this.render({ animate: true }); return this }
  destroy() { if (this._cancelAnim) this._cancelAnim(); this.container.innerHTML = '' }
}
export default CalendarHeatmap
