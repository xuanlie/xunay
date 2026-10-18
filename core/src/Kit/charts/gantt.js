// @xunay/kit/charts/gantt —— 甘特图
const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'gt-' + (++_uid).toString(36)

function el(t, a) {
  const e = document.createElementNS(NS, t)
  if (a) for (const k in a) { const v = a[k]; if (v != null && v !== false) e.setAttribute(k, v) }
  return e
}
function fmtDate(d) {
  const dt = d instanceof Date ? d : new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
function dayDiff(a, b) {
  return Math.round((new Date(b).setHours(0,0,0,0) - new Date(a).setHours(0,0,0,0)) / 86400000)
}
function addDays(d, n) {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  return dt
}

export class GanttChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Gantt] 找不到容器: ' + container)
    this.opts = Object.assign({
      width: null, height: null,
      rowHeight: 36,
      padding: { top: 44, right: 24, bottom: 20, left: 0 },
      title: null, subtitle: null, theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      labelWidth: 160,
      labelAlign: 'left',
      barHeight: 0.62,
      barRadius: 4,
      showProgress: true,
      progressColor: null,
      showToday: true,
      todayColor: '#ef4444',
      showWeekend: true,
      weekendColor: null,
      showDependencies: true,
      dependencyColor: null,
      groupBy: null,          // null | 字段名
      groupColors: null,
      timeUnit: 'day',        // 'day' | 'week' | 'month'
      tooltip: true,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 40 },
      dateFormat: fmtDate,
      onHover: null,
      onBarClick: null,
    }, options)
    this.theme = this._theme(this.opts.theme)
    this._tasks = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._barEls = []
    this._build()
    if (options.tasks || options.data) this.setData(options.tasks || options.data)
    this._setupResize()
  }
  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', rowAlt: 'rgba(148,163,184,0.04)',
      weekend: 'rgba(148,163,184,0.05)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', rowAlt: 'rgba(15,23,42,0.02)',
      weekend: 'rgba(15,23,42,0.04)',
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
  setData(tasks) {
    this._tasks = (tasks || []).map((t, i) => ({
      id: t.id != null ? t.id : 't' + i,
      name: t.name || t.label || 'Task ' + (i + 1),
      start: new Date(t.start || Date.now()),
      end: new Date(t.end || t.start || Date.now()),
      progress: Math.max(0, Math.min(1, t.progress || 0)),
      color: t.color,
      group: t.group,
      deps: t.deps || t.dependencies || [],
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
  _dateRange() {
    if (!this._tasks.length) return { start: new Date(), end: new Date(), days: 1 }
    let min = this._tasks[0].start, max = this._tasks[0].end
    for (const t of this._tasks) {
      if (t.start < min) min = t.start
      if (t.end > max) max = t.end
    }
    // 前后各留一点
    const start = addDays(min, -1)
    const end = addDays(max, 2)
    const days = Math.max(1, dayDiff(start, end))
    return { start, end, days }
  }
  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._barEls = []
    const rect = this.wrap.getBoundingClientRect()
    const W = this.opts.width || Math.max(600, Math.round(rect.width || 800))
    const rows = this._tasks.length
    if (!rows) return
    const rowH = this.opts.rowHeight
    const pad = this.opts.padding
    const H = this.opts.height || Math.max(200, pad.top + pad.bottom + rows * rowH)
    this.W = W; this.H = H
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    this.svg.setAttribute('width', String(W))
    this.svg.setAttribute('height', String(H))
    this.svg.setAttribute('fill', 'none')
    this.svg.innerHTML = ''
    // 日期范围
    const { start: dateStart, days } = this._dateRange()
    const labelW = this.opts.labelWidth
    const plotX = labelW + pad.left
    const plotW = W - plotX - pad.right
    const dayW = plotW / days
    const xOfDay = d => plotX + dayDiff(dateStart, d) * dayW
    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }
    // 周末竖条
    if (this.opts.showWeekend) {
      const wg = el('g')
      for (let i = 0; i < days; i++) {
        const d = addDays(dateStart, i)
        const dow = d.getDay()
        if (dow === 0 || dow === 6) {
          wg.appendChild(el('rect', {
            x: plotX + i * dayW, y: pad.top,
            width: dayW, height: rows * rowH,
            fill: this.opts.weekendColor || this.theme.weekend,
          }))
        }
      }
      this.svg.appendChild(wg)
    }
    // 行交替背景
    const rg = el('g')
    for (let i = 0; i < rows; i++) {
      if (i % 2 === 1) {
        rg.appendChild(el('rect', {
          x: 0, y: pad.top + i * rowH,
          width: W, height: rowH,
          fill: this.theme.rowAlt,
        }))
      }
    }
    this.svg.appendChild(rg)
    // 时间网格 + 表头
    const tg = el('g')
    const unit = this.opts.timeUnit
    // 每天/周/月的网格线
    for (let i = 0; i <= days; i++) {
      const d = addDays(dateStart, i)
      const dow = d.getDay()
      const isWeekStart = dow === 1
      const isMonthStart = d.getDate() === 1
      let show = false
      if (unit === 'day') show = true
      else if (unit === 'week') show = isWeekStart
      else if (unit === 'month') show = isMonthStart
      if (show && i > 0) {
        tg.appendChild(el('line', {
          x1: plotX + i * dayW, x2: plotX + i * dayW,
          y1: pad.top, y2: pad.top + rows * rowH,
          stroke: this.theme.grid, 'stroke-width': 1, opacity: 0.5,
        }))
      }
    }
    this.svg.appendChild(tg)
    // 表头：日期刻度
    const hg = el('g')
    const headerY = pad.top - 10
    const monthStride = unit === 'month' ? 1 : Math.max(1, Math.floor(30 / (unit === 'week' ? 7 : 1)))
    // 时间轴主标题行（月/年）
    let lastMonth = -1, monthStartIdx = 0
    for (let i = 0; i <= days; i++) {
      const d = addDays(dateStart, i)
      const m = d.getMonth()
      if (m !== lastMonth || i === days) {
        if (lastMonth !== -1) {
          const x1 = plotX + monthStartIdx * dayW
          const x2 = plotX + i * dayW
          const t = el('text', {
            x: (x1 + x2) / 2, y: pad.top - 26,
            'text-anchor': 'middle', 'font-size': 11.5,
            'font-weight': 600, fill: this.theme.text,
          })
          t.textContent = `${d.getFullYear()}-${String(lastMonth + 1).padStart(2, '0')}`
          hg.appendChild(t)
        }
        monthStartIdx = i
        lastMonth = m
      }
    }
    // 每日刻度
    const tickStride = unit === 'day' ? Math.max(1, Math.ceil(days / 20)) : unit === 'week' ? 7 : 30
    for (let i = 0; i < days; i += tickStride) {
      const d = addDays(dateStart, i)
      const x = plotX + i * dayW + dayW / 2
      const t = el('text', {
        x, y: headerY,
        'text-anchor': 'middle', 'font-size': 10.5,
        fill: this.theme.textMuted,
      })
      if (unit === 'month') t.textContent = `${d.getMonth() + 1}月`
      else t.textContent = `${d.getMonth() + 1}/${d.getDate()}`
      hg.appendChild(t)
    }
    this.svg.appendChild(hg)
    // 今天线
    if (this.opts.showToday) {
      const today = new Date()
      const todayDay = dayDiff(dateStart, today)
      if (todayDay >= 0 && todayDay <= days) {
        const x = plotX + todayDay * dayW + dayW / 2
        this.svg.appendChild(el('line', {
          x1: x, x2: x, y1: pad.top - 4, y2: pad.top + rows * rowH,
          stroke: this.opts.todayColor, 'stroke-width': 1.5,
          'stroke-dasharray': '4 4', opacity: 0.7,
        }))
        const t = el('text', {
          x, y: pad.top - 10,
          'text-anchor': 'middle', 'font-size': 10,
          fill: this.opts.todayColor, 'font-weight': 600,
        })
        t.textContent = '今天'
        this.svg.appendChild(t)
      }
    }
    // 任务条
    const bg = el('g')
    this.svg.appendChild(bg)
    const barH = rowH * this.opts.barHeight
    const barY = (i) => pad.top + i * rowH + (rowH - barH) / 2
    this._tasks.forEach((task, i) => {
      const color = task.color || this.opts.colors[i % this.opts.colors.length]
      const x1 = xOfDay(task.start)
      const x2 = xOfDay(addDays(task.end, 1))
      const w = Math.max(2, x2 - x1)
      const y = barY(i)
      // 任务条
      const rect = el('rect', {
        x: x1, y, width: w, height: barH,
        rx: Math.min(this.opts.barRadius, barH / 2),
        fill: color, opacity: 0.9,
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      rect._meta = { task, index: i, x: x1, y, w, h: barH, color }
      bg.appendChild(rect)
      this._barEls.push(rect)
      // 进度填充
      if (this.opts.showProgress && task.progress > 0) {
        bg.appendChild(el('rect', {
          x: x1, y, width: w * task.progress, height: barH,
          rx: Math.min(this.opts.barRadius, barH / 2),
          fill: this.opts.progressColor || '#000',
          opacity: 0.35,
          style: 'pointer-events:none',
        }))
      }
      // 进度百分比
      if (this.opts.showProgress && w > 60) {
        const t = el('text', {
          x: x1 + 8, y: y + barH / 2 + 4,
          'text-anchor': 'start', 'font-size': 11,
          fill: '#fff', 'font-weight': 600,
          style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.4)',
        })
        t.textContent = Math.round(task.progress * 100) + '%'
        bg.appendChild(t)
      }
      // 任务名（条上）
      if (w > 100) {
        const t = el('text', {
          x: x1 + w - 8, y: y + barH / 2 + 4,
          'text-anchor': 'end', 'font-size': 11,
          fill: '#fff', 'font-weight': 500,
          style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.4)',
        })
        t.textContent = task.name.length > 16 ? task.name.slice(0, 15) + '…' : task.name
        bg.appendChild(t)
      }
      // 左侧标签
      const label = el('text', {
        x: labelW - 10, y: y + barH / 2 + 4,
        'text-anchor': 'end', 'font-size': 12,
        fill: this.theme.text, 'font-weight': 500,
      })
      label.textContent = task.name.length > 20 ? task.name.slice(0, 18) + '…' : task.name
      bg.appendChild(label)
      rect.addEventListener('mouseenter', (e) => {
        this._hover = rect
        this._applyHover()
        this._moveTip(e, task)
      })
      rect.addEventListener('mousemove', (e) => { if (this._hover === rect) this._moveTip(e, task) })
      rect.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      rect.addEventListener('click', (e) => { if (this.opts.onBarClick) this.opts.onBarClick(task, i, e) })
    })
    // 依赖箭头
    if (this.opts.showDependencies) {
      const dg = el('g')
      const map = new Map(this._tasks.map((t, i) => [t.id, i]))
      this._tasks.forEach((task, i) => {
        for (const depId of task.deps) {
          const depIdx = map.get(depId)
          if (depIdx == null) continue
          const dep = this._tasks[depIdx]
          const dx2 = xOfDay(addDays(dep.end, 1))
          const dy = barY(depIdx) + barH / 2
          const cx1 = xOfDay(task.start)
          const cy = barY(i) + barH / 2
          const midX = dx2 + Math.min(20, (cx1 - dx2) / 2)
          dg.appendChild(el('path', {
            d: `M ${dx2} ${dy} H ${midX} V ${cy} H ${cx1}`,
            fill: 'none',
            stroke: this.opts.dependencyColor || this.theme.axis,
            'stroke-width': 1.5, 'stroke-linejoin': 'round',
            'marker-end': `url(#gantt-arrow-${this._uid || (this._uid = Math.random().toString(36).slice(2))})`,
          }))
        }
      })
      const defs = el('defs')
      const markerId = `gantt-arrow-${this._uid}`
      const marker = el('marker', {
        id: markerId, viewBox: '0 0 10 10',
        refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto',
      })
      marker.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: this.opts.dependencyColor || this.theme.axis }))
      defs.appendChild(marker)
      this.svg.insertBefore(defs, this.svg.firstChild)
      this.svg.appendChild(dg)
    }
    if (animate) this._animate()
    return this
  }
  _applyHover() {
    for (const r of this._barEls) {
      const hot = r === this._hover
      r.style.filter = hot ? 'brightness(1.15)' : ''
      r.style.opacity = this._hover ? (hot ? '1' : '0.4') : '0.9'
    }
  }
  _moveTip(e, task) {
    if (!this.tip) return
    const dur = Math.max(1, dayDiff(task.start, task.end) + 1)
    const color = task.color || this.opts.colors[this._tasks.indexOf(task) % this.opts.colors.length]
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${task.name}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">开始</span><span style="text-align:right">${this.opts.dateFormat(task.start)}</span>
        <span style="opacity:.7">结束</span><span style="text-align:right">${this.opts.dateFormat(task.end)}</span>
        <span style="opacity:.7">工期</span><span style="text-align:right">${dur} 天</span>
        ${task.progress > 0 ? `<span style="opacity:.7">进度</span><span style="text-align:right">${Math.round(task.progress * 100)}%</span>` : ''}
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth, th = this.tip.offsetHeight
    const cx = e.clientX - r.left + this.wrap.scrollLeft
    const cy = e.clientY - r.top
    let left = cx + 14, top = cy - th - 10
    if (left + tw > this.wrap.scrollLeft + r.width - 4) left = cx - tw - 14
    if (top < 0) top = cy + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'
    if (this.opts.onHover) this.opts.onHover(task)
  }
  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => easing === 'easeOutBack' ? (() => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) })() : 1 - Math.pow(1 - t, 3)
    const targets = this._barEls.map((r, i) => ({
      el: r, x: r._meta.x, w: r._meta.w, delay: i * stagger / duration,
    }))
    targets.forEach(t => { t.el.setAttribute('x', String(t.x + t.w)); t.el.setAttribute('width', '0') })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const w = tg.w * e
        tg.el.setAttribute('x', String(tg.x))
        tg.el.setAttribute('width', String(w))
      })
      if (t < 1) { raf = requestAnimationFrame(tick); this._cancelAnim = () => cancelAnimationFrame(raf) }
      else { targets.forEach(tg => { tg.el.setAttribute('x', String(tg.x)); tg.el.setAttribute('width', String(tg.w)) }); this._cancelAnim = null }
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
export default GanttChart
