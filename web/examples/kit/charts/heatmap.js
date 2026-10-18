// @xunay/kit/charts/heatmap —— 精修版热力图
// 特性：色阶渐变 · 行列标签 · 单元格数值 · 图例条 · 悬停高亮 · 
//      十字准线 · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'hm-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

function hexToRgb(h) {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function lerpColor(a, b, t) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const r = Math.round(ca[0] + (cb[0] - ca[0]) * t)
  const g = Math.round(ca[1] + (cb[1] - ca[1]) * t)
  const bl = Math.round(ca[2] + (cb[2] - ca[2]) * t)
  return `rgb(${r},${g},${bl})`
}

function rampColor(stops, t) {
  if (t <= 0) return stops[0]
  if (t >= 1) return stops[stops.length - 1]
  const n = stops.length - 1
  const i = Math.floor(t * n)
  const local = t * n - i
  return lerpColor(stops[i], stops[i + 1], local)
}

function fmt(v, digits = 1) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return Number(v).toFixed(digits)
}

export class HeatmapChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[HeatmapChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: null,          // null = 自动按行数
      padding: { top: 20, right: 20, bottom: 60, left: 60 },
      title: null,
      subtitle: null,
      theme: 'light',
      // 色阶：从低到高
      colorRamp: ['#e0f2fe', '#7dd3fc', '#0ea5e9', '#0369a1', '#082f49'],
      // 深色主题色阶
      colorRampDark: ['#0c4a6e', '#075985', '#0284c7', '#38bdf8', '#bae6fd'],
      cellGap: 2,
      cellRadius: 3,
      showValues: false,      // 单元格内显示数值
      valueDigits: 1,
      valueThreshold: null,   // 小于此宽度不显示值
      showRowLabels: true,
      showColLabels: true,
      rowLabelWidth: 56,
      colLabelHeight: 40,
      colLabelRotate: 0,      // 度
      legend: true,           // 底部色阶条
      legendSteps: 5,
      crosshair: true,        // 悬停高亮行列
      tooltip: true,
      animation: { duration: 700, easing: 'easeOutCubic', stagger: 8 },
      valueFormat: v => fmt(v, 1),
      onHover: null,
      onCellClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._matrix = []
    this._rowLabels = []
    this._colLabels = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._cellEls = []

    this._build()
    if (options.data) this.setData(options.data, options)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      cellBorder: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
      crosshair: 'rgba(148,163,184,0.5)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      cellBorder: '#fff',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
      crosshair: 'rgba(15,23,42,0.3)',
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

    const pad = this.opts.padding
    const rows = this._matrix.length
    const cols = rows > 0 ? this._matrix[0].length : 0

    // 自动高度：让每个格子接近方形
    let H = this.opts.height
    if (H == null) {
      const availW = this.W - pad.left - pad.right
      const availH = cols > 0
        ? Math.min(availW / cols, 60) * rows
        : 240
      H = Math.max(180, Math.round(availH + pad.top + pad.bottom))
    }
    this.H = H
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(data, opts = {}) {
    // data 支持：matrix 二维数组 或 { rows, cols, values } 或 series 数组
    if (Array.isArray(data) && Array.isArray(data[0])) {
      this._matrix = data
    } else if (data.matrix) {
      this._matrix = data.matrix
    } else if (Array.isArray(data)) {
      this._matrix = [data]
    } else {
      this._matrix = []
    }

    this._rowLabels = opts.rowLabels || opts.yLabels || this._matrix.map((_, i) => String(i))
    const cols = this._matrix[0]?.length || 0
    this._colLabels = opts.colLabels || opts.xLabels || Array.from({ length: cols }, (_, i) => String(i))

    this.render()
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }

  _ramp() {
    return this.opts.theme === 'dark' ? this.opts.colorRampDark : this.opts.colorRamp
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding

    this.svg.innerHTML = ''
    this._cellEls = []

    const rows = this._matrix.length
    const cols = rows > 0 ? this._matrix[0].length : 0
    if (!rows || !cols) return

    // 图例占位
    const legendH = this.opts.legend ? 44 : 0
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom - legendH

    // 数据范围
    let vMin = Infinity, vMax = -Infinity
    for (const row of this._matrix) for (const v of row) {
      if (v == null || isNaN(v)) continue
      if (v < vMin) vMin = v
      if (v > vMax) vMax = v
    }
    if (!isFinite(vMin)) { vMin = 0; vMax = 1 }
    if (vMin === vMax) vMax = vMin + 1
    const span = vMax - vMin

    // 单元格尺寸
    const cw = plotW / cols
    const ch = plotH / rows
    const gap = this.opts.cellGap
    const radius = Math.min(this.opts.cellRadius, cw / 2 - gap, ch / 2 - gap)

    const ramp = this._ramp()
    const colorOf = v => {
      if (v == null || isNaN(v)) return 'transparent'
      const t = (v - vMin) / span
      return rampColor(ramp, t)
    }

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const originX = pad.left
    const originY = pad.top

    // 列标签
    if (this.opts.showColLabels) {
      const lg = el('g')
      const rot = this.opts.colLabelRotate
      this._colLabels.forEach((label, i) => {
        const cx = originX + cw * (i + 0.5)
        const cy = originY - 8
        const t = el('text', {
          x: cx, y: cy,
          'text-anchor': rot ? 'start' : 'middle',
          'dominant-baseline': 'middle',
          'font-size': 11.5,
          'font-family': 'inherit',
          fill: this.theme.textMuted,
          transform: rot ? `rotate(${rot} ${cx} ${cy})` : '',
        })
        t.textContent = label
        lg.appendChild(t)
      })
      this.svg.appendChild(lg)
    }

    // 行标签
    if (this.opts.showRowLabels) {
      const lg = el('g')
      this._rowLabels.forEach((label, i) => {
        const x = originX - 10
        const y = originY + ch * (i + 0.5)
        const t = el('text', {
          x, y,
          'text-anchor': 'end',
          'dominant-baseline': 'middle',
          'font-size': 11.5,
          'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = label
        lg.appendChild(t)
      })
      this.svg.appendChild(lg)
    }

    // 单元格
    const cg = el('g')
    this.svg.appendChild(cg)

    // 十字准线层（先放，让单元格覆盖在上面）
    const crossLayer = el('g', { style: 'pointer-events:none' })
    this.svg.appendChild(crossLayer)

    this._matrix.forEach((row, ri) => {
      row.forEach((v, ci) => {
        const x = originX + cw * ci + gap / 2
        const y = originY + ch * ri + gap / 2
        const w = cw - gap
        const h = ch - gap
        const fill = colorOf(v)

        const rect = el('rect', {
          x, y, width: w, height: h,
          rx: radius,
          fill,
          stroke: this.theme.cellBorder,
          'stroke-width': 0.5,
          style: 'cursor:pointer;transition:opacity .15s,filter .15s',
        })
        rect._meta = { ri, ci, value: v }
        cg.appendChild(rect)
        this._cellEls.push(rect)

        // 数值
        if (this.opts.showValues && cw > 32 && ch > 18) {
          const t = el('text', {
            x: x + w / 2,
            y: y + h / 2 + 4,
            'text-anchor': 'middle',
            'font-size': Math.min(12, Math.max(9, cw * 0.22)),
            'font-weight': 500,
            'font-family': 'inherit',
            fill: '#fff',
            style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.3)',
          })
          t.textContent = this.opts.valueFormat(v)
          cg.appendChild(t)
        }

        // 事件
        rect.addEventListener('mouseenter', (e) => {
          this._hover = rect
          this._applyHover(crossLayer, originX, originY, cw, ch, ri, ci)
          this._moveTip(e, rect)
        })
        rect.addEventListener('mousemove', (e) => {
          if (this._hover === rect) this._moveTip(e, rect)
        })
        rect.addEventListener('mouseleave', () => {
          this._hover = null
          this._applyHover(crossLayer, originX, originY, cw, ch, -1, -1)
          if (this.tip) this.tip.style.opacity = '0'
          if (this.opts.onHover) this.opts.onHover(null)
        })
        rect.addEventListener('click', (e) => {
          if (this.opts.onCellClick) {
            this.opts.onCellClick({
              row: this._rowLabels[ri],
              col: this._colLabels[ci],
              value: v,
              rowIndex: ri,
              colIndex: ci,
            }, e)
          }
        })
      })
    })

    // 图例条
    if (this.opts.legend) {
      this._renderLegend(W, H, legendH, ramp, vMin, vMax)
    }

    // 动画
    if (animate) this._animate()
  }

  _applyHover(layer, originX, originY, cw, ch, ri, ci) {
    // 高亮当前行列的所有单元格
    for (const r of this._cellEls) {
      const m = r._meta
      const sameRow = m.ri === ri
      const sameCol = m.ci === ci
      const hot = sameRow && sameCol
      const active = ri >= 0 && (sameRow || sameCol)
      r.style.opacity = ri < 0 ? '1' : (active ? '1' : '0.35')
      r.style.filter = hot ? 'brightness(1.15)' : ''
    }
    // 十字准线背景
    layer.innerHTML = ''
    if (this.opts.crosshair && ri >= 0) {
      layer.appendChild(el('rect', {
        x: originX, y: originY + ch * ri,
        width: cw * this._matrix[0].length, height: ch,
        fill: this.theme.crosshair,
        opacity: 0.15,
      }))
      layer.appendChild(el('rect', {
        x: originX + cw * ci, y: originY,
        width: cw, height: ch * this._matrix.length,
        fill: this.theme.crosshair,
        opacity: 0.15,
      }))
      layer.appendChild(el('rect', {
        x: originX + cw * ci, y: originY + ch * ri,
        width: cw, height: ch,
        fill: 'none',
        stroke: this.theme.text,
        'stroke-width': 2,
      }))
    }
  }

  _renderLegend(W, H, legendH, ramp, vMin, vMax) {
    const pad = this.opts.padding
    const barW = Math.min(280, W - pad.left - pad.right - 40)
    const barH = 10
    const bx = (W - barW) / 2
    const by = H - legendH + 6
    const steps = this.opts.legendSteps

    // 渐变定义
    const defs = el('defs')
    const gid = uid()
    const grad = el('linearGradient', { id: gid, x1: '0', y1: '0', x2: '1', y2: '0' })
    ramp.forEach((c, i) => {
      grad.appendChild(el('stop', {
        offset: `${(i / (ramp.length - 1)) * 100}%`,
        'stop-color': c,
      }))
    })
    defs.appendChild(grad)
    this.svg.insertBefore(defs, this.svg.firstChild)

    this.svg.appendChild(el('rect', {
      x: bx, y: by, width: barW, height: barH,
      rx: barH / 2, fill: `url(#${gid})`,
    }))

    // 图例刻度
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = bx + barW * t
      const val = vMin + (vMax - vMin) * t
      const txt = el('text', {
        x, y: by + barH + 14,
        'text-anchor': 'middle',
        'font-size': 10.5,
        'font-family': 'inherit',
        fill: this.theme.textMuted,
      })
      txt.textContent = fmt(val, 0)
      this.svg.appendChild(txt)
    }
  }

  _moveTip(e, rect) {
    if (!this.tip) return
    const m = rect._meta
    const v = m.value
    const row = this._rowLabels[m.ri] ?? m.ri
    const col = this._colLabels[m.ci] ?? m.ci
    this.tip.innerHTML = `
      <div style="opacity:.75;margin-bottom:3px;font-size:11.5px">${row} · ${col}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${rect.getAttribute('fill')}"></span>
        <span style="flex:1">数值</span>
        <strong style="font-variant-numeric:tabular-nums">${this.opts.valueFormat(v)}</strong>
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    let left = cx + 14
    let top = cy - th - 10
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = cy + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) {
      this.opts.onHover({ row, col, value: v, rowIndex: m.ri, colIndex: m.ci })
    }
  }

  _animate() {
    const { duration, easing, stagger } = this.opts.animation
    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      return t
    }

    const targets = this._cellEls.map((r, i) => {
      const x = parseFloat(r.getAttribute('x'))
      const y = parseFloat(r.getAttribute('y'))
      const w = parseFloat(r.getAttribute('width'))
      const h = parseFloat(r.getAttribute('height'))
      const m = r._meta
      const delay = ((m.ri + m.ci) * stagger) / duration
      return { el: r, x, y, w, h, delay, fill: r.getAttribute('fill') }
    })

    // 初始状态：缩小 + 透明
    targets.forEach(tg => {
      tg.el.setAttribute('transform', `translate(${tg.x + tg.w / 2} ${tg.y + tg.h / 2}) scale(0.01) translate(${-(tg.x + tg.w / 2)} ${-(tg.y + tg.h / 2)})`)
      tg.el.style.opacity = '0'
    })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const scale = 0.01 + 0.99 * e
        tg.el.setAttribute('transform', scale >= 1 ? '' : `translate(${tg.x + tg.w / 2} ${tg.y + tg.h / 2}) scale(${scale}) translate(${-(tg.x + tg.w / 2)} ${-(tg.y + tg.h / 2)})`)
        tg.el.style.opacity = String(e)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          tg.el.removeAttribute('transform')
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

export default HeatmapChart
