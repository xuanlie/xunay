import { Chart } from './chart.js'
import { LinearScale, BandScale, resolveTheme, deepMerge, number, clamp } from './core.js'
import {
  normalizePoint, normalizeSeriesData,
  renderLineLikeSeries, renderBarLikeSeries,
  renderArcLikeSeries, renderRadarSeries,
  renderFunnelSeries, renderHeatmapSeries
} from './renderers.js'
import { AxesPlugin, GridPlugin, LegendPlugin, HoverPlugin } from './plugins.js'

// ============================================================
// 笛卡尔坐标系基类
// ============================================================
class CartesianChart extends Chart {
  _normalizeData(input) {
    if (input.series && Array.isArray(input.series)) {
      const series = input.series.map((s, i) => {
        const norm = normalizeSeriesData(s)
        return { name: s.name ?? `系列 ${i + 1}`, color: s.color, ...s, data: norm }
      })
      return { series, labels: input.labels || [] }
    }
    const data = (input.data || []).map(normalizePoint)
    return {
      series: [{ name: input.name || '数据', color: input.color, data }],
      labels: input.labels || []
    }
  }

  _computeScales() {
    const t = this.theme
    const p = this.layout.plot
    const series = this.data.series.filter((_, i) => !this.hiddenSeries.has(i))
    const allPoints = series.flatMap((s) => s.data)
    const useBand = this._useBandScale()

    if (useBand) {
      const labels = Array.from(new Set(
        series.flatMap((s) => s.data.map((pt) => pt.label ?? String(pt.x)))
      ))
      this.scales.x = new BandScale(labels, [p.x, p.x + p.width], this.options.bandPadding ?? 0.2)
    } else {
      const xs = allPoints.map((pt) => (typeof pt.x === 'number' ? pt.x : 0))
      const minX = xs.length ? Math.min(...xs) : 0
      const maxX = xs.length ? Math.max(...xs) : 1
      this.scales.x = new LinearScale([minX, maxX === minX ? minX + 1 : maxX], [p.x, p.x + p.width])
    }

    const yValues = this._collectYValues()
    let minY = yValues.length ? Math.min(0, ...yValues) : 0
    let maxY = yValues.length ? Math.max(0, ...yValues) : 1
    if (minY === maxY) maxY = minY + 1
    const pad = (maxY - minY) * 0.08
    this.scales.y = new LinearScale([minY - pad, maxY + pad], [p.y + p.height, p.y])
    this.scales.y.nice(this.options.tickCount || t.axis.tickCount)
  }

  _collectYValues() {
    const series = this.data.series.filter((_, i) => !this.hiddenSeries.has(i))
    const flat = series.flatMap((s) => s.data.map((pt) => pt.y))
    if (this.options.stacked && this._stackMode === 'vertical') {
      const totals = new Map()
      for (const s of series) {
        for (const pt of s.data) {
          const k = pt.label ?? String(pt.x)
          totals.set(k, (totals.get(k) || 0) + (pt.y > 0 ? pt.y : 0))
        }
      }
      return Array.from(totals.values())
    }
    return flat
  }

  _useBandScale() {
    const firstSeries = this.data.series.find((_, i) => !this.hiddenSeries.has(i))
    if (!firstSeries || !firstSeries.data.length) return true
    const sample = firstSeries.data
    const allIndex = sample.every((pt, i) => pt.x === i || pt.x == null)
    return allIndex
  }

  _xPos(pt) {
    if (this.scales.x instanceof BandScale) {
      return this.scales.x.center(pt.label ?? String(pt.x))
    }
    return this.scales.x.map(pt.x)
  }

  _renderSeries() {
    const t = this.theme
    const visible = this.data.series.filter((_, i) => !this.hiddenSeries.has(i))
    const els = []
    const isBarLike = this._isBarLike()
    const stacked = this.options.stacked === true

    if (stacked && isBarLike) {
      this._renderStackedBars(visible, els)
    } else if (isBarLike) {
      visible.forEach((s) => {
        const realIndex = this.data.series.indexOf(s)
        const color = s.color || t.colors[realIndex % t.colors.length]
        const groups = this._barGroups(s, visible)
        const mode = this._isHorizontal() ? 'horizontal' : 'vertical'
        els.push(...renderBarLikeSeries(this, { seriesIndex: realIndex, series: s, groups, color, mode }))
      })
    } else {
      this._computeBubbleScale()
      visible.forEach((s) => {
        const realIndex = this.data.series.indexOf(s)
        const color = s.color || t.colors[realIndex % t.colors.length]
        const points = s.data.map((pt) => ({
          x: this._xPos(pt),
          y: this.scales.y.map(pt.y),
          datum: pt,
          rRatio: undefined,
          r: pt.r
        }))
        const mode = this._lineMode()
        els.push(...renderLineLikeSeries(this, {
          seriesIndex: realIndex, series: s, points, color,
          mode, tension: s.tension ?? t.line.tension,
          baseline: this.layout.plot.y + this.layout.plot.height
        }))
      })
    }

    this._seriesEls = els
  }

  _computeBubbleScale() {
    if (this._lineMode() !== 'bubble') return
    const all = this.data.series.flatMap((s) => s.data.map((pt) => pt.r ?? 4))
    const maxR = all.length ? Math.max(...all) : 1
    const target = Math.min(this.layout.plot.width, this.layout.plot.height) / 12
    this._bubbleScale = maxR > 0 ? target / maxR : 1
  }

  _barGroups(series, visible) {
    const t = this.theme
    const plot = this.layout.plot
    const seriesCount = this.data.series.length
    const realIndex = this.data.series.indexOf(series)
    const padding = this.options.barPadding ?? t.bar.padding
    const groupPadding = t.bar.groupPadding
    const horizontal = this._isHorizontal()

    if (!(this.scales.x instanceof BandScale) || horizontal) {
      if (horizontal) {
        const items = series.data
        const slotY = plot.height / Math.max(1, items.length)
        const barH = Math.max(t.bar.minWidth, slotY * (1 - padding))
        return items.map((pt, i) => {
          const y = plot.y + i * slotY + slotY / 2
          return {
            x: this.scales.x.map(0),
            y: y - barH / 2,
            width: Math.abs(this.scales.x.map(pt.y) - this.scales.x.map(0)),
            height: barH,
            color: pt.color || series.color
          }
        })
      }
      const xs = series.data.map((pt) => this.scales.x.map(pt.x))
      const slot = plot.width / Math.max(1, xs.length)
      const barW = Math.max(t.bar.minWidth, slot * (1 - padding))
      return series.data.map((pt, i) => ({
        x: xs[i] - barW / 2, width: barW,
        y: this.scales.y.map(pt.y),
        height: Math.abs(this.scales.y.map(pt.y) - this.scales.y.map(0)),
        color: pt.color || series.color
      }))
    }

    const groupW = this.scales.x.bandwidth
    const innerW = groupW * (1 - groupPadding)
    const slot = innerW / Math.max(1, seriesCount)
    const barW = Math.max(t.bar.minWidth, slot * (1 - padding))
    const visibleIndex = visible.indexOf(series)

    return series.data.map((pt) => {
      const center = this.scales.x.center(pt.label ?? String(pt.x))
      const start = center - innerW / 2 + (visibleIndex >= 0 ? visibleIndex : realIndex) * slot + slot / 2
      return {
        x: start - barW / 2, width: barW,
        y: this.scales.y.map(pt.y),
        height: Math.abs(this.scales.y.map(pt.y) - this.scales.y.map(0)),
        color: pt.color || series.color
      }
    })
  }

  _renderStackedBars(visible, els) {
    const t = this.theme
    const horizontal = this._isHorizontal()
    const stacks = new Map()
    const order = []

    for (let si = 0; si < this.data.series.length; si++) {
      const s = this.data.series[si]
      if (this.hiddenSeries.has(si)) continue
      for (const pt of s.data) {
        const key = pt.label ?? String(pt.x)
        if (!stacks.has(key)) { stacks.set(key, []); order.push(key) }
        stacks.get(key).push({ pt, si })
      }
    }

    if (!order.length) return
    const padding = this.options.barPadding ?? t.bar.padding
    const plot = this.layout.plot

    if (horizontal) {
      const slot = plot.height / order.length
      const barH = Math.max(t.bar.minWidth, slot * (1 - padding))
      order.forEach((key, i) => {
        const y = plot.y + i * slot + slot / 2 - barH / 2
        let acc = 0
        stacks.get(key).forEach(({ pt, si }) => {
          const s = this.data.series[si]
          const color = pt.color || s.color || t.colors[si % t.colors.length]
          const start = acc
          const end = acc + Math.max(0, pt.y)
          acc = end
          const x1 = this.scales.x.map(start)
          const x2 = this.scales.x.map(end)
          els.push(...renderBarLikeSeries(this, {
            seriesIndex: si, series: s, color, mode: 'horizontal',
            groups: [{
              x: Math.min(x1, x2),
              y,
              width: Math.abs(x2 - x1),
              height: barH,
              color
            }]
          }))
          this._hitRegions[this._hitRegions.length - 1].dataIndex = i
        })
      })
    } else {
      const groupW = plot.width / order.length
      const barW = Math.max(t.bar.minWidth, groupW * (1 - padding))
      const zeroY = this.scales.y.map(0)
      order.forEach((key, i) => {
        const cx = plot.x + i * groupW + groupW / 2
        let acc = 0
        stacks.get(key).forEach(({ pt, si }) => {
          const s = this.data.series[si]
          const color = pt.color || s.color || t.colors[si % t.colors.length]
          const start = acc
          const end = acc + Math.max(0, pt.y)
          acc = end
          const y1 = this.scales.y.map(start)
          const y2 = this.scales.y.map(end)
          els.push(...renderBarLikeSeries(this, {
            seriesIndex: si, series: s, color, mode: 'vertical',
            groups: [{
              x: cx - barW / 2,
              y: Math.min(y1, y2),
              width: barW,
              height: Math.abs(y2 - y1),
              color
            }]
          }))
          this._hitRegions[this._hitRegions.length - 1].dataIndex = i
        })
      })
    }
  }

  _isBarLike() {
    return ['bar', 'hbar', 'stacked-bar', 'stacked-hbar', 'histogram'].includes(this.type)
  }
  _isHorizontal() {
    return this.type === 'hbar' || this.type === 'stacked-hbar'
  }
  _lineMode() {
    if (this.type === 'scatter') return 'scatter'
    if (this.type === 'bubble') return 'bubble'
    if (this.type === 'area' || this.type === 'stacked-area') return 'area'
    if (this.type === 'step') return 'step'
    return 'line'
  }

  _updateSeriesGeometry() {
    for (const item of this._seriesEls) if (item.apply) item.apply(this._progress)
  }
}

// ============================================================
// 圆形坐标基类
// ============================================================
class CircularChart extends Chart {
  _normalizeData(input) {
    const data = (input.data || []).map((d, i) => {
      if (typeof d === 'number') return { label: String(i), value: d }
      if (typeof d === 'object') {
        return { ...d, label: d.label ?? String(i), value: d.value ?? d.y ?? 0 }
      }
      return { label: String(i), value: 0 }
    })
    return { series: [{ name: input.name || '数据', data }], labels: [] }
  }

  _computeScales() {}

  _renderSeries() {
    const t = this.theme
    const data = this.data.series[0]?.data || []
    const mode = this._arcMode()
    const innerRatio = (this.type === 'donut' || this.type === 'polar')
      ? (this.options.innerRatio ?? t.arc.innerRadius)
      : 0
    const outerRatio = this.options.outerRatio ?? 1
    this._seriesEls = renderArcLikeSeries(this, {
      data,
      colorFn: (i) => t.colors[i % t.colors.length],
      mode,
      innerRatio,
      outerRatio
    })
  }

  _arcMode() {
    if (this.type === 'donut') return 'donut'
    if (this.type === 'rose') return 'rose'
    if (this.type === 'polar') return 'polar'
    return 'pie'
  }

  _updateSeriesGeometry() {
    for (const item of this._seriesEls) if (item.apply) item.apply(this._progress)
  }
}

// ============================================================
// 雷达图
// ============================================================
class RadarChartBase extends Chart {
  _normalizeData(input) {
    const labels = input.labels || []
    const rawSeries = input.series || [{ name: input.name || '数据', data: input.data || [] }]
    const series = rawSeries.map((s, i) => {
      const data = (s.data || []).map((d, j) => {
        if (typeof d === 'number') return { label: labels[j] ?? String(j), y: d }
        return { ...d, label: d.label ?? labels[j] ?? String(j), y: number(d.y ?? d.value, 0) }
      })
      return { name: s.name ?? `系列 ${i + 1}`, color: s.color, ...s, data }
    })
    return { series, labels }
  }

  _computeScales() {
    const all = this.data.series.flatMap((s) => s.data.map((pt) => pt.y))
    const max = all.length ? Math.max(...all) : 1
    this._radarMax = max <= 0 ? 1 : max * 1.15
    this._axesCount = this.data.labels.length || this.data.series[0]?.data.length || 0
  }

  _renderSeries() {
    const t = this.theme
    const els = []
    const axesCount = this._axesCount || 1
    const max = this._radarMax || 1

    const cx = this.layout.plot.x + this.layout.plot.width / 2
    const cy = this.layout.plot.y + this.layout.plot.height / 2
    const maxR = Math.max(1, Math.min(this.layout.plot.width, this.layout.plot.height) / 2 - 20)

    // 轴线 + 网格环
    const gridLayer = this.layers.grid
    for (let ring = 1; ring <= 4; ring++) {
      const r = (maxR * ring) / 4
      const pts = []
      for (let i = 0; i < axesCount; i++) {
        const angle = -Math.PI / 2 + (i / axesCount) * Math.PI * 2
        pts.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`)
      }
      gridLayer.appendChild(svgElRaw('polygon', {
        points: pts.join(' '), fill: 'none',
        stroke: t.grid, 'stroke-opacity': t.gridOpacity, 'stroke-dasharray': '3 3'
      }))
    }
    const axesLayer = this.layers.axes
    for (let i = 0; i < axesCount; i++) {
      const angle = -Math.PI / 2 + (i / axesCount) * Math.PI * 2
      axesLayer.appendChild(svgElRaw('line', {
        x1: cx, y1: cy,
        x2: cx + Math.cos(angle) * maxR,
        y2: cy + Math.sin(angle) * maxR,
        stroke: t.axis, 'stroke-width': 1
      }))
      const lx = cx + Math.cos(angle) * (maxR + 12)
      const ly = cy + Math.sin(angle) * (maxR + 12)
      const label = this.data.labels[i] ?? this.data.series[0]?.data[i]?.label ?? ''
      axesLayer.appendChild(svgElRaw('text', {
        x: lx, y: ly,
        'text-anchor': Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end',
        'dominant-baseline': 'middle',
        fill: t.textMuted, 'font-size': t.font.smallSize, 'font-family': t.font.family
      }, String(label)))
    }

    this.data.series.filter((_, i) => !this.hiddenSeries.has(i)).forEach((s) => {
      const realIndex = this.data.series.indexOf(s)
      const color = s.color || t.colors[realIndex % t.colors.length]
      const points = s.data.map((pt, i) => ({
        rRatio: clamp(pt.y / max, 0, 1),
        angle: -Math.PI / 2 + (i / axesCount) * Math.PI * 2,
        datum: pt
      }))
      els.push(...renderRadarSeries(this, {
        seriesIndex: realIndex, series: s, points, color, axesCount
      }))
    })

    this._seriesEls = els
  }

  _updateSeriesGeometry() {
    for (const item of this._seriesEls) if (item.apply) item.apply(this._progress)
  }
}

// ============================================================
// 漏斗
// ============================================================
class FunnelChartBase extends Chart {
  _normalizeData(input) {
    const data = (input.data || []).map((d, i) => {
      if (typeof d === 'number') return { label: String(i), value: d }
      return { ...d, label: d.label ?? String(i), value: d.value ?? d.y ?? 0 }
    })
    return { series: [{ name: input.name || '漏斗', data }], labels: [] }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    const data = this.data.series[0]?.data || []
    this._seriesEls = renderFunnelSeries(this, {
      data,
      colorFn: (i) => t.colors[i % t.colors.length],
      gap: this.options.gap ?? 2
    })
  }
  _updateSeriesGeometry() {
    for (const item of this._seriesEls) if (item.apply) item.apply(this._progress)
  }
}

// ============================================================
// 仪表盘
// ============================================================
class GaugeChartBase extends Chart {
  _normalizeData(input) {
    const value = number(input.value ?? input.data?.[0]?.value ?? 0, 0)
    const min = number(input.min ?? 0, 0)
    const max = number(input.max ?? 100, 100)
    const label = input.label ?? input.name ?? ''
    const data = [
      { label: label || '值', value: clamp(value, min, max) },
      { label: '剩余', value: Math.max(0, max - clamp(value, min, max)) }
    ]
    return { series: [{ name: 'gauge', data }], labels: [] }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    const value = this.data.series[0].data[0].value
    const max = number(this.options.max ?? 100, 100)
    const ratio = clamp(value / max, 0, 1)
    const startAngle = -Math.PI * 1.25
    const endAngle = -Math.PI * 0.25
    const midAngle = startAngle + (endAngle - startAngle) * ratio

    // 背景弧
    const [bg] = renderArcLikeSeries(this, {
      data: [{ value: 1 }],
      colorFn: () => t.grid,
      mode: 'gauge',
      innerRatio: this.options.innerRatio ?? 0.7,
      outerRatio: 1,
      startAngle, endAngle
    })
    // 前景弧（渐变）
    const [fg] = renderArcLikeSeries(this, {
      data: [{ value: 1 }],
      colorFn: () => t.colors[0],
      mode: 'gauge',
      innerRatio: this.options.innerRatio ?? 0.7,
      outerRatio: 1,
      startAngle, endAngle: midAngle
    })
    const els = []
    if (bg) els.push({ ...bg, apply: (p) => bg.apply(p) })
    if (fg) els.push({ ...fg, apply: (p) => fg.apply(p) })

    // 中心文字
    const cx = this.layout.plot.x + this.layout.plot.width / 2
    const cy = this.layout.plot.y + this.layout.plot.height / 2
    const text = svgElRaw('text', {
      x: cx, y: cy + 8, 'text-anchor': 'middle',
      'dominant-baseline': 'middle', fill: t.text,
      'font-size': this.options.fontSize ?? 28, 'font-weight': 600,
      'font-family': t.font.family
    }, String(value))
    this.layers.labels.appendChild(text)
    if (this.options.label) {
      this.layers.labels.appendChild(svgElRaw('text', {
        x: cx, y: cy - 24, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
        fill: t.textMuted, 'font-size': t.font.size, 'font-family': t.font.family
      }, String(this.options.label)))
    }
    this._seriesEls = els
  }
  _updateSeriesGeometry() {
    for (const item of this._seriesEls) if (item.apply) item.apply(this._progress)
  }
}

// ============================================================
// 热力图
// ============================================================
class HeatmapChartBase extends Chart {
  _normalizeData(input) {
    const matrix = Array.isArray(input.data?.[0]) || (Array.isArray(input.data) && Array.isArray(input.data[0]))
      ? input.data
      : (input.matrix || [])
    const flat = matrix.flat().map((v) => number(v, 0))
    const min = flat.length ? Math.min(...flat) : 0
    const max = flat.length ? Math.max(...flat) : 1
    return {
      series: [{ name: input.name || '热力图', data: [] }],
      labels: input.labels || [],
      matrix, min, max
    }
  }
  _computeScales() {
    const p = this.layout.plot
    this._x = p.x
    this._y = p.y
  }
  _renderSeries() {
    const matrix = this.data.matrix || []
    const min = this.data.min ?? 0
    const max = this.data.max ?? 1
    const span = max - min || 1
    const base = this.options.baseColor || [59, 130, 246]
    this._seriesEls = renderHeatmapSeries(this, {
      matrix,
      colorScale: (v) => {
        const t = clamp((v - min) / span, 0, 1)
        return `rgba(${base[0]},${base[1]},${base[2]},${0.12 + t * 0.85})`
      },
      xLabels: this.options.xLabels || [],
      yLabels: this.options.yLabels || []
    })
  }
  _updateSeriesGeometry() {
    for (const item of this._seriesEls) if (item.apply) item.apply(this._progress)
  }
}

// 内部：不需要 import 的极简 svgEl
function svgElRaw(name, attrs = {}, text) {
  const SVG_NS = 'http://www.w3.org/2000/svg'
  const el = document.createElementNS(SVG_NS, name)
  for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]))
  if (text != null) el.textContent = String(text)
  return el
}

// ============================================================
// 具体图表类
// ============================================================
export class LineChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'line'; this.render({ animate: o?.animate !== false && o?.animation !== false }) }
}
LineChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class AreaChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'area'; this.render({ animate: o?.animate !== false && o?.animation !== false }) }
}
AreaChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class StackedAreaChart extends CartesianChart {
  constructor(c, o) { super(c, { ...o, stacked: true }); this.type = 'stacked-area'; this.render({ animate: o?.animate !== false }) }
}
StackedAreaChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class StepChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'step'; this.render({ animate: o?.animate !== false }) }
}
StepChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class BarChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'bar'; this.render({ animate: o?.animate !== false }) }
}
BarChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class HBarChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'hbar'; this.render({ animate: o?.animate !== false }) }
}
HBarChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class StackedBarChart extends CartesianChart {
  constructor(c, o) { super(c, { ...o, stacked: true }); this.type = 'stacked-bar'; this.render({ animate: o?.animate !== false }) }
}
StackedBarChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class StackedHBarChart extends CartesianChart {
  constructor(c, o) { super(c, { ...o, stacked: true }); this.type = 'stacked-hbar'; this.render({ animate: o?.animate !== false }) }
}
StackedHBarChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class ScatterChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'scatter'; this.render({ animate: o?.animate !== false }) }
}
ScatterChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class BubbleChart extends CartesianChart {
  constructor(c, o) { super(c, o); this.type = 'bubble'; this.render({ animate: o?.animate !== false }) }
}
BubbleChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class HistogramChart extends CartesianChart {
  constructor(c, o) {
    super(c, o)
    this.type = 'histogram'
    this.render({ animate: o?.animate !== false })
  }
}
HistogramChart.builtinPlugins = [GridPlugin, AxesPlugin, LegendPlugin, HoverPlugin]

export class PieChart extends CircularChart {
  constructor(c, o) { super(c, o); this.type = 'pie'; this.render({ animate: o?.animate !== false }) }
}
PieChart.builtinPlugins = [LegendPlugin, HoverPlugin]

export class DonutChart extends CircularChart {
  constructor(c, o) { super(c, o); this.type = 'donut'; this.render({ animate: o?.animate !== false }) }
}
DonutChart.builtinPlugins = [LegendPlugin, HoverPlugin]

export class RoseChart extends CircularChart {
  constructor(c, o) { super(c, o); this.type = 'rose'; this.render({ animate: o?.animate !== false }) }
}
RoseChart.builtinPlugins = [LegendPlugin, HoverPlugin]

export class PolarChart extends CircularChart {
  constructor(c, o) { super(c, o); this.type = 'polar'; this.render({ animate: o?.animate !== false }) }
}
PolarChart.builtinPlugins = [LegendPlugin, HoverPlugin]

export class RadarChart extends RadarChartBase {
  constructor(c, o) { super(c, o); this.type = 'radar'; this.render({ animate: o?.animate !== false }) }
}
RadarChart.builtinPlugins = [LegendPlugin, HoverPlugin]

export class FunnelChart extends FunnelChartBase {
  constructor(c, o) { super(c, o); this.type = 'funnel'; this.render({ animate: o?.animate !== false }) }
}
FunnelChart.builtinPlugins = [LegendPlugin, HoverPlugin]

export class GaugeChart extends GaugeChartBase {
  constructor(c, o) { super(c, o); this.type = 'gauge'; this.render({ animate: o?.animate !== false }) }
}
GaugeChart.builtinPlugins = [HoverPlugin]

export class HeatmapChart extends HeatmapChartBase {
  constructor(c, o) { super(c, o); this.type = 'heatmap'; this.render({ animate: o?.animate !== false }) }
}
HeatmapChart.builtinPlugins = [HoverPlugin]

// ============================================================
// 新原语类型（treemap / sankey / network / tree / boxplot / candlestick / wordcloud）
// ============================================================
import {
  renderTreemap, renderSankey, renderNetwork, renderTree,
  renderBoxplot, renderCandlestick, renderWordcloud
} from './extra.js'

class TreemapChartBase extends Chart {
  _normalizeData(input) {
    const data = (input.data || []).map((d, i) => {
      if (typeof d === 'number') return { label: String(i), value: d }
      return { ...d, label: d.label ?? String(i), value: number(d.value ?? d.y ?? 0, 0) }
    })
    return { series: [{ name: 'treemap', data }], labels: [] }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    const data = this.data.series[0]?.data || []
    this._seriesEls = renderTreemap(this, { data, colorFn: (i) => t.colors[i % t.colors.length] })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

class SankeyChartBase extends Chart {
  _normalizeData(input) {
    return {
      series: [{ name: 'sankey', data: [] }],
      labels: [],
      nodes: input.nodes || [],
      links: input.links || []
    }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    this._seriesEls = renderSankey(this, {
      nodes: this.data.nodes || [],
      links: this.data.links || [],
      colorFn: (i) => t.colors[i % t.colors.length]
    })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

class NetworkChartBase extends Chart {
  _normalizeData(input) {
    return {
      series: [{ name: 'network', data: [] }],
      labels: [],
      nodes: input.nodes || [],
      links: input.links || []
    }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    this._seriesEls = renderNetwork(this, {
      nodes: this.data.nodes || [],
      links: this.data.links || [],
      colorFn: (i) => t.colors[i % t.colors.length]
    })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

class TreeChartBase extends Chart {
  _normalizeData(input) {
    return { series: [{ name: 'tree', data: [] }], labels: [], root: input.root || { label: 'root' } }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    this._seriesEls = renderTree(this, {
      root: this.data.root,
      colorFn: (i) => t.colors[i % t.colors.length]
    })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

class BoxplotChartBase extends Chart {
  _normalizeData(input) {
    const groups = (input.groups || input.data || []).map((g, i) => ({
      label: g.label ?? `组 ${i + 1}`,
      values: g.values || [],
      color: g.color
    }))
    return { series: [{ name: 'boxplot', data: [] }], labels: [], groups }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    this._seriesEls = renderBoxplot(this, {
      groups: this.data.groups || [],
      colorFn: (i) => t.colors[i % t.colors.length]
    })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

class CandlestickChartBase extends Chart {
  _normalizeData(input) {
    const data = (input.data || []).map((d, i) => ({
      label: d.label ?? String(i),
      open: number(d.open ?? d.o, 0),
      close: number(d.close ?? d.c, 0),
      high: number(d.high ?? d.h, 0),
      low: number(d.low ?? d.l, 0),
      color: d.color
    }))
    return { series: [{ name: 'candlestick', data }], labels: [] }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    this._seriesEls = renderCandlestick(this, {
      data: this.data.series[0]?.data || [],
      colorFn: (i) => t.colors[i % t.colors.length]
    })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

class WordcloudChartBase extends Chart {
  _normalizeData(input) {
    const words = (input.words || input.data || []).map((w, i) => {
      if (typeof w === 'string') return { text: w, value: 1 }
      return { text: w.text ?? w.label ?? String(i), value: number(w.value ?? w.weight ?? 1, 1), color: w.color }
    })
    return { series: [{ name: 'wordcloud', data: [] }], labels: [], words }
  }
  _computeScales() {}
  _renderSeries() {
    const t = this.theme
    this._seriesEls = renderWordcloud(this, {
      words: this.data.words || [],
      colorFn: (i) => t.colors[i % t.colors.length]
    })
  }
  _updateSeriesGeometry() { for (const it of this._seriesEls) if (it.apply) it.apply(this._progress) }
}

export class TreemapChart extends TreemapChartBase {
  constructor(c, o) { super(c, o); this.type = 'treemap'; this.render({ animate: o?.animate !== false }) }
}
TreemapChart.builtinPlugins = [HoverPlugin]

export class SankeyChart extends SankeyChartBase {
  constructor(c, o) { super(c, o); this.type = 'sankey'; this.render({ animate: o?.animate !== false }) }
}
SankeyChart.builtinPlugins = [HoverPlugin]

export class NetworkChart extends NetworkChartBase {
  constructor(c, o) { super(c, o); this.type = 'network'; this.render({ animate: o?.animate !== false }) }
}
NetworkChart.builtinPlugins = [HoverPlugin]

export class TreeChart extends TreeChartBase {
  constructor(c, o) { super(c, o); this.type = 'tree'; this.render({ animate: o?.animate !== false }) }
}
TreeChart.builtinPlugins = [HoverPlugin]

export class BoxplotChart extends BoxplotChartBase {
  constructor(c, o) { super(c, o); this.type = 'boxplot'; this.render({ animate: o?.animate !== false }) }
}
BoxplotChart.builtinPlugins = [HoverPlugin]

export class CandlestickChart extends CandlestickChartBase {
  constructor(c, o) { super(c, o); this.type = 'candlestick'; this.render({ animate: o?.animate !== false }) }
}
CandlestickChart.builtinPlugins = [HoverPlugin]

export class WordcloudChart extends WordcloudChartBase {
  constructor(c, o) { super(c, o); this.type = 'wordcloud'; this.render({ animate: o?.animate !== false }) }
}
WordcloudChart.builtinPlugins = [HoverPlugin]
