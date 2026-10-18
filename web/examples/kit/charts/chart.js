import {
  SVG_NS, svgEl, svgGroup, number, clamp, isObject, deepMerge,
  EventEmitter, animate as runAnimation, LinearScale, BandScale,
  resolveTheme, formatNumber
} from './core.js'

let CHART_ID = 0

export class Chart {
  constructor(container, options = {}) {
    this.id = `xunay-chart-${++CHART_ID}`
    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container
    if (!this.container) {
      throw new Error(`[xunay/charts] 找不到容器: ${container}`)
    }
    if (this.container.__xunayChart) {
      this.container.__xunayChart.destroy()
    }
    this.container.__xunayChart = this

    this.type = 'chart'
    this.options = { ...options }
    this.theme = resolveTheme(options.theme)
    this.events = new EventEmitter()
    this.plugins = []
    this.data = { series: [], labels: [] }
    this.scales = { x: null, y: null }
    this.layout = null
    this.hovered = null
    this.selected = null
    this.hiddenSeries = new Set()
    this._destroyed = false
    this._progress = 1
    this._cancelAnim = null
    this._resizeObserver = null
    this._seriesEls = []
    this._hitRegions = []
    this._lastSeriesCount = 0
    this._lastWidth = 0
    this._measureCanvas = null

    this._buildRoot()
    this._initPlugins()
    this._bindEvents()
    this.setData(options, { animate: options.animation !== false && options.animate !== false })
    this._setupResize()
  }

  _buildRoot() {
    const root = document.createElement('div')
    root.className = 'xunay-chart'
    root.setAttribute('data-xunay-chart', this.id)
    root.style.cssText = 'position:relative;width:100%;min-width:0;font-family:inherit;outline:none;'
    root.tabIndex = 0
    this.container.innerHTML = ''
    this.container.appendChild(root)
    this.root = root

    const svg = svgEl('svg', {
      xmlns: SVG_NS,
      role: 'img',
      'aria-label': this.options.ariaLabel || this.options.title || '图表',
      style: 'display:block;overflow:visible'
    })
    this.root.appendChild(svg)
    this.svg = svg

    this.layers = {}
    const names = ['background', 'grid', 'axes', 'series', 'labels', 'overlay', 'legend']
    for (const name of names) {
      const g = svgGroup({ class: `xn-layer-${name}` })
      svg.appendChild(g)
      this.layers[name] = g
    }
  }

  _initPlugins() {
    const builtins = this.constructor.builtinPlugins || []
    const user = Array.isArray(this.options.plugins) ? this.options.plugins : []
    const all = [...builtins, ...user]
    const seen = new Set()
    this.plugins = all
      .filter((p) => {
        if (!p) return false
        const key = p.name || p.constructor?.name
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100))

    for (const p of this.plugins) {
      p.chart = this
      try { p.init?.() } catch (err) { console.error('[xunay/charts plugin]', err) }
    }
  }

  _bindEvents() {
    this._onKeyDown = (e) => {
      if (this._destroyed) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        this._navigate(e.key)
        e.preventDefault()
      } else if (e.key === 'Enter' || e.key === ' ') {
        this._activate()
        e.preventDefault()
      } else if (e.key === 'Escape') {
        this._clearHover()
        e.preventDefault()
      }
    }
    this.root.addEventListener('keydown', this._onKeyDown)
    for (const p of this.plugins) {
      p.bindEvents?.()
    }
  }

  _navigate() {}
  _activate() {}
  _clearHover() {
    this.hovered = null
    this._emitHover(null)
    this._scheduleHoverRender()
  }

  _scheduleHoverRender() {
    if (this._hoverRaf) return
    this._hoverRaf = requestAnimationFrame(() => {
      this._hoverRaf = 0
      this._applyHover()
    })
  }

  _applyHover() {
    for (const item of this._seriesEls) {
      if (item.applyHover) item.applyHover(this.hovered)
    }
    this.events.emit('hover', this.hovered ? this._hoverPayload() : null)
    if (typeof this.options.onHover === 'function') {
      this.options.onHover(this.hovered ? this._hoverPayload() : null)
    }
    for (const p of this.plugins) p.afterHover?.(this.hovered)
  }

  _hoverPayload() {
    const { seriesIndex, dataIndex } = this.hovered || {}
    const series = this.data.series[seriesIndex]
    const datum = series?.data[dataIndex]
    return { seriesIndex, dataIndex, series, datum }
  }

  _measureCanvasCtx() {
    if (!this._measureCanvas) {
      this._measureCanvas = document.createElement('canvas').getContext('2d')
    }
    return this._measureCanvas
  }

  measureText(text, font) {
    const ctx = this._measureCanvasCtx()
    ctx.font = font
    return ctx.measureText(String(text ?? '')).width
  }

  setData(input = {}, { animate = false } = {}) {
    if (this._destroyed) return this
    const normalized = this._normalizeData(input)
    this.data = normalized

    for (const key of ['title', 'ariaLabel', 'colors', 'name']) {
      if (input[key] !== undefined) this.options[key] = input[key]
    }

    if (normalized.series.length !== this._lastSeriesCount) {
      this.hiddenSeries.clear()
      this._lastSeriesCount = normalized.series.length
    }
    this.hovered = null

    this.render({ animate })
    return this
  }

  update(next = {}) {
    if (this._destroyed) return this
    if (next.theme) this.theme = resolveTheme(next.theme)
    this.options = { ...this.options, ...next }

    const hasData = next.data !== undefined || next.series !== undefined
    if (hasData) return this.setData({ ...this.options, ...next })

    for (const p of this.plugins) p.beforeUpdate?.(next)
    this.render({ animate: next.animate === true })
    for (const p of this.plugins) p.afterUpdate?.(next)
    return this
  }

  _normalizeData(input) {
    return { series: [], labels: [] }
  }

  render({ animate = false } = {}) {
    if (this._destroyed) return this
    if (this._cancelAnim) {
      this._cancelAnim()
      this._cancelAnim = null
    }

    this._measure()
    this._computeLayout()
    this._computeScales()

    for (const g of Object.values(this.layers)) g.replaceChildren()

    this._seriesEls = []
    this._hitRegions = []

    this._renderBackground()
    this._renderGrid()
    this._renderAxes()
    this._renderSeries()
    this._renderLabels()
    this._renderLegend()

    for (const p of this.plugins) p.afterRender?.()

    const duration = this.theme.animation.duration
    if (animate && duration > 0) {
      this._progress = 0
      this._cancelAnim = runAnimation({
        duration,
        easing: this.theme.animation.easing,
        onUpdate: (t) => {
          this._progress = t
          this._updateSeriesGeometry()
          this._applyHover()
        },
        onComplete: () => {
          this._progress = 1
          this._cancelAnim = null
          this._updateSeriesGeometry()
          this._applyHover()
        }
      })
    } else {
      this._progress = 1
      this._updateSeriesGeometry()
      this._applyHover()
    }
    return this
  }

  _measure() {
    const rect = this.root.getBoundingClientRect()
    const measured = Math.max(1, Math.round(rect.width || 0))
    const fallback = this.options.width || 640
    this.width = Math.max(1, measured || fallback)
    const optH = this.options.height
    if (optH != null) {
      this.height = Math.max(1, number(optH, 320))
    } else if (this._lastAutoHeight) {
      this.height = this._lastAutoHeight
    } else {
      this.height = Math.max(1, Math.round(this.width * 0.5))
    }
    this._lastAutoHeight = this.height

    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.height))
  }

  _computeLayout() {
    const t = this.theme
    const p = { ...t.padding }
    const width = this.width
    const height = this.height

    const layout = {
      width,
      height,
      padding: p,
      title: null,
      legend: null,
      plot: { x: 0, y: 0, width: 0, height: 0 },
      xAxis: null,
      yAxis: null
    }

    let top = p.top
    let right = p.right
    let bottom = p.bottom
    let left = p.left

    if (this.options.title) {
      layout.title = {
        x: width / 2,
        y: top + t.font.titleSize * 0.9,
        size: t.font.titleSize
      }
      top += t.font.titleSize + t.titleGap
    }

    const legend = this._computeLegendSize()
    if (legend) {
      const position = legend.position
      if (position === 'top') {
        layout.legend = { x: 0, y: top, width, height: legend.height, position }
        top += legend.height
      } else if (position === 'bottom') {
        layout.legend = { x: 0, y: 0, width, height: legend.height, position }
        bottom += legend.height
      } else if (position === 'left') {
        layout.legend = { x: 0, y: 0, width: legend.width, height, position }
        left += legend.width
      } else if (position === 'right') {
        layout.legend = { x: 0, y: 0, width: legend.width, height, position }
        right += legend.width
      }
    }

    if (this._hasAxes()) {
      left += t.axis.size
      bottom += t.axis.size
    }

    layout.plot = {
      x: left,
      y: top,
      width: Math.max(1, width - left - right),
      height: Math.max(1, height - top - bottom)
    }

    if (this._hasAxes()) {
      layout.yAxis = { x: layout.plot.x, y: layout.plot.y, width: t.axis.size, height: layout.plot.height }
      layout.xAxis = { x: layout.plot.x, y: layout.plot.y + layout.plot.height, width: layout.plot.width, height: t.axis.size }
    }

    if (layout.legend) {
      if (layout.legend.position === 'top') {
        layout.legend.y = p.top + (layout.title ? t.font.titleSize + t.titleGap : 0)
      } else if (layout.legend.position === 'bottom') {
        layout.legend.y = height - p.bottom - layout.legend.height
      } else if (layout.legend.position === 'left') {
        layout.legend.y = p.top
      } else if (layout.legend.position === 'right') {
        layout.legend.x = width - p.right - layout.legend.width
      }
    }

    this.layout = layout
  }

  _computeLegendSize() {
    if (this.options.legend === false) return null
    const legendOpt = isObject(this.options.legend) ? this.options.legend : {}
    const items = this.data.series.filter((_, i) => !this.hiddenSeries.has(i))
    if (!items.length) return null
    const t = this.theme
    const position = legendOpt.position || t.legend.position
    const font = `${t.font.size}px ${t.font.family}`

    const totalWidth = items.reduce((sum, s) => {
      const w = this.measureText(s.name || '', font)
      return sum + t.legend.itemSize + t.legend.itemSpacing + w + t.legend.itemGap
    }, 0)

    if (position === 'top' || position === 'bottom') {
      const rows = Math.max(1, Math.ceil(totalWidth / Math.max(1, this.width - t.padding.left - t.padding.right)))
      return { position, height: rows * t.legend.rowHeight, width: this.width }
    }
    const maxTextWidth = items.reduce((m, s) => Math.max(m, this.measureText(s.name || '', font)), 0)
    return { position, width: maxTextWidth + t.legend.itemSize + t.legend.itemSpacing + t.legend.itemGap * 2, height: this.height }
  }

  _hasAxes() {
    return this.type === 'line' || this.type === 'bar'
  }

  _computeScales() {}
  _renderBackground() {
    const bg = this.theme.background
    if (!bg || bg === 'transparent') return
    this.layers.background.appendChild(
      svgEl('rect', { x: 0, y: 0, width: this.width, height: this.height, fill: bg })
    )
  }
  _renderGrid() {}
  _renderAxes() {}
  _renderSeries() {}
  _renderLabels() {}
  _renderLegend() {}
  _updateSeriesGeometry() {}

  _findHit(event) {
    const rect = this.svg.getBoundingClientRect()
    const sx = this.width / Math.max(1, rect.width)
    const sy = this.height / Math.max(1, rect.height)
    const x = (event.clientX - rect.left) * sx
    const y = (event.clientY - rect.top) * sy
    let best = null
    let bestDist = Infinity
    for (const r of this._hitRegions) {
      if (r.type === 'point') {
        const d = Math.hypot(r.x - x, r.y - y)
        if (d <= r.r && d < bestDist) { best = r; bestDist = d }
      } else if (r.type === 'rect') {
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) { best = r; break }
      } else if (r.type === 'arc') {
        const dx = x - r.cx
        const dy = y - r.cy
        const dist = Math.hypot(dx, dy)
        if (dist >= r.innerR && dist <= r.r) {
          let ang = Math.atan2(dy, dx)
          const twoPi = Math.PI * 2
          let s = r.startA
          let e = r.endA
          while (ang < s) ang += twoPi
          while (e < s) e += twoPi
          if (ang >= s && ang <= e) { best = r; break }
        }
      }
    }
    return best
  }

  _setupResize() {
    if (typeof ResizeObserver === 'undefined') return
    this._resizeObserver = new ResizeObserver(() => {
      if (this._destroyed) return
      const w = this.root.clientWidth
      if (w > 0 && w !== this._lastWidth) {
        this._lastWidth = w
        this.render()
      }
    })
    this._resizeObserver.observe(this.root)
    this._lastWidth = this.root.clientWidth
  }

  destroy() {
    if (this._destroyed) return
    this._destroyed = true
    if (this._cancelAnim) this._cancelAnim()
    if (this._hoverRaf) cancelAnimationFrame(this._hoverRaf)
    if (this._resizeObserver) this._resizeObserver.disconnect()
    for (const p of this.plugins) {
      try { p.destroy?.() } catch (err) { console.error('[xunay/charts plugin destroy]', err) }
    }
    this.events.clear()
    this.root.removeEventListener('keydown', this._onKeyDown)
    if (this.container && this.container.__xunayChart === this) {
      delete this.container.__xunayChart
    }
    this.root.remove()
  }

  toSVGString() {
    const clone = this.svg.cloneNode(true)
    clone.setAttribute('xmlns', SVG_NS)
    return new XMLSerializer().serializeToString(clone)
  }

  toDataURL(type = 'png', quality = 1) {
    const xml = this.toSVGString()
    if (type === 'svg') {
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    }
    return new Promise((resolve, reject) => {
      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const ratio = window.devicePixelRatio || 1
        const canvas = document.createElement('canvas')
        canvas.width = this.width * ratio
        canvas.height = this.height * ratio
        const ctx = canvas.getContext('2d')
        ctx.scale(ratio, ratio)
        ctx.drawImage(img, 0, 0, this.width, this.height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/png', quality))
      }
      img.onerror = (err) => {
        URL.revokeObjectURL(url)
        reject(err)
      }
      img.src = url
    })
  }

  async exportPNG(filename = 'chart.png') {
    const url = await this.toDataURL('png')
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  exportSVG(filename = 'chart.svg') {
    const a = document.createElement('a')
    a.href = this.toDataURL('svg')
    a.download = filename
    a.click()
  }

  on(event, fn) {
    return this.events.on(event, fn)
  }

  off(event, fn) {
    this.events.off(event, fn)
  }
}
