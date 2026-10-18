import { svgEl, number, formatNumber } from './core.js'

export const AxesPlugin = {
  name: 'axes',
  order: 20,
  init() {},
  afterRender() {
    const chart = this.chart
    if (!chart._hasAxes() || chart.options.axes === false) return
    const layer = chart.layers.axes
    const layout = chart.layout
    if (!layout.xAxis || !layout.yAxis) return

    const theme = chart.theme
    const p = layout.plot

    const yTicks = chart.scales.y.ticks(chart.options.tickCount || theme.axis.tickCount)
    const yTickSet = new Set(yTicks.map((v) => chart.scales.y.map(v)))

    for (const v of yTicks) {
      const y = chart.scales.y.map(v)
      layer.appendChild(svgEl('line', {
        x1: p.x - theme.axis.tickSize,
        y1: y,
        x2: p.x,
        y2: y,
        stroke: theme.axis,
        'stroke-width': theme.axis.lineWidth
      }))
      layer.appendChild(svgEl('text', {
        x: p.x - theme.axis.tickSize - theme.axis.labelGap,
        y,
        'text-anchor': 'end',
        'dominant-baseline': 'middle',
        fill: theme.textMuted,
        'font-size': theme.font.smallSize,
        'font-family': theme.font.family
      }, chart.options.yFormat ? chart.options.yFormat(v) : formatNumber(v)))
    }

    if (chart.scales.x instanceof Object && chart.scales.x.ticks) {
      const xTicks = chart.scales.x.ticks(chart.options.tickCount || theme.axis.tickCount)
      for (const v of xTicks) {
        const x = chart.scales.x.map(v)
        layer.appendChild(svgEl('line', {
          x1: x,
          y1: p.y + p.height,
          x2: x,
          y2: p.y + p.height + theme.axis.tickSize,
          stroke: theme.axis,
          'stroke-width': theme.axis.lineWidth
        }))
        layer.appendChild(svgEl('text', {
          x,
          y: p.y + p.height + theme.axis.tickSize + theme.axis.labelGap + theme.font.smallSize,
          'text-anchor': 'middle',
          fill: theme.textMuted,
          'font-size': theme.font.smallSize,
          'font-family': theme.font.family
        }, chart.options.xFormat ? chart.options.xFormat(v) : formatNumber(v)))
      }
    } else if (chart.scales.x.center) {
      const domain = chart.scales.x.domain
      const stride = Math.max(1, Math.ceil(domain.length / 12))
      domain.forEach((label, i) => {
        if (i % stride !== 0 && i !== domain.length - 1) return
        const x = chart.scales.x.center(label)
        layer.appendChild(svgEl('line', {
          x1: x,
          y1: p.y + p.height,
          x2: x,
          y2: p.y + p.height + theme.axis.tickSize,
          stroke: theme.axis,
          'stroke-width': theme.axis.lineWidth
        }))
        layer.appendChild(svgEl('text', {
          x,
          y: p.y + p.height + theme.axis.tickSize + theme.axis.labelGap + theme.font.smallSize,
          'text-anchor': 'middle',
          fill: theme.textMuted,
          'font-size': theme.font.smallSize,
          'font-family': theme.font.family
        }, chart.options.xFormat ? chart.options.xFormat(label) : String(label)))
      })
    }

    layer.appendChild(svgEl('line', {
      x1: p.x,
      y1: p.y,
      x2: p.x,
      y2: p.y + p.height,
      stroke: theme.axis,
      'stroke-width': theme.axis.lineWidth
    }))
    layer.appendChild(svgEl('line', {
      x1: p.x,
      y1: p.y + p.height,
      x2: p.x + p.width,
      y2: p.y + p.height,
      stroke: theme.axis,
      'stroke-width': theme.axis.lineWidth
    }))
  }
}

export const GridPlugin = {
  name: 'grid',
  order: 10,
  afterRender() {
    const chart = this.chart
    if (!chart._hasAxes() || chart.options.grid === false) return
    const theme = chart.theme
    const layer = chart.layers.grid
    const p = chart.layout.plot

    const yTicks = chart.scales.y.ticks(chart.options.tickCount || theme.axis.tickCount)
    for (const v of yTicks) {
      const y = chart.scales.y.map(v)
      layer.appendChild(svgEl('line', {
        x1: p.x,
        y1: y,
        x2: p.x + p.width,
        y2: y,
        stroke: theme.grid,
        'stroke-opacity': theme.gridOpacity,
        'stroke-dasharray': '3 3'
      }))
    }
  }
}

export const LegendPlugin = {
  name: 'legend',
  order: 5,
  afterRender() {
    const chart = this.chart
    if (chart.options.legend === false) return
    const layout = chart.layout
    if (!layout.legend) return
    const layer = chart.layers.legend
    const theme = chart.theme
    const legend = layout.legend
    const series = chart.data.series
    if (!series.length) return

    const isHorizontal = legend.position === 'top' || legend.position === 'bottom'
    const font = `${theme.font.size}px ${theme.font.family}`
    const itemH = theme.legend.itemSize
    const gap = theme.legend.itemGap
    const spacing = theme.legend.itemSpacing

    let x = legend.x + theme.padding.left
    let y = legend.y + theme.legend.rowHeight / 2
    const maxX = legend.x + legend.width - theme.padding.right

    series.forEach((s, i) => {
      const label = s.name || `系列 ${i + 1}`
      const textW = chart.measureText(label, font)
      const itemW = itemH + spacing + textW

      if (isHorizontal && x + itemW > maxX && x > legend.x + theme.padding.left) {
        x = legend.x + theme.padding.left
        y += theme.legend.rowHeight
      }

      const hidden = chart.hiddenSeries.has(i)
      const color = s.color || theme.colors[i % theme.colors.length]

      const g = svgEl('g', {
        style: 'cursor:pointer',
        tabindex: 0,
        role: 'button',
        'aria-label': `${label} 图例`
      })

      const swatch = svgEl('rect', {
        x,
        y: y - itemH / 2,
        width: itemH,
        height: itemH,
        rx: 3,
        fill: hidden ? 'transparent' : color,
        stroke: color,
        'stroke-width': 1.5
      })
      g.appendChild(swatch)

      const text = svgEl('text', {
        x: x + itemH + spacing,
        y,
        'dominant-baseline': 'middle',
        fill: hidden ? theme.textMuted : theme.text,
        'font-size': theme.font.size,
        'font-family': theme.font.family,
        style: 'user-select:none'
      }, label)
      g.appendChild(text)

      const toggle = () => {
        if (hidden) chart.hiddenSeries.delete(i)
        else chart.hiddenSeries.add(i)
        chart.render({ animate: false })
      }
      g.addEventListener('click', toggle)
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { toggle(); e.preventDefault() }
      })

      layer.appendChild(g)
      x += itemW + gap
    })
  }
}

export const HoverPlugin = {
  name: 'hover',
  order: 90,
  init() {
    const chart = this.chart
    this._onMove = (e) => {
      if (chart._destroyed) return
      const region = chart._findHit(e)
      const next = region ? { seriesIndex: region.seriesIndex, dataIndex: region.dataIndex } : null
      const changed = !sameHover(chart.hovered, next)
      chart.hovered = next
      if (changed) chart._scheduleHoverRender()
      this._mousePos = e
      this._hoverRegion = region
      this._applyTooltip()
      this._applyCrosshair()
    }
    this._onLeave = () => {
      chart.hovered = null
      this._mousePos = null
      this._hoverRegion = null
      chart._scheduleHoverRender()
      this._applyTooltip()
      this._applyCrosshair()
    }
  },
  bindEvents() {
    const chart = this.chart
    chart.svg.addEventListener('mousemove', this._onMove)
    chart.svg.addEventListener('mouseleave', this._onLeave)
  },
  afterRender() {
    this._applyCrosshair()
  },
  afterHover(hovered) {
    this._applyTooltip()
    this._applyCrosshair()
  },
  destroy() {
    const chart = this.chart
    chart.svg.removeEventListener('mousemove', this._onMove)
    chart.svg.removeEventListener('mouseleave', this._onLeave)
  },
  _applyCrosshair() {
    const chart = this.chart
    const layer = chart.layers.overlay
    const old = layer.querySelector('.xn-crosshair')
    if (old) old.remove()
    if (chart.options.crosshair === false) return
    if (!chart.hovered) return
    if (!chart._hasAxes()) return
    const region = this._hoverRegion
    if (!region) return
    const p = chart.layout.plot
    const theme = chart.theme
    const g = svgEl('g', { class: 'xn-crosshair' })
    if (region.type === 'point') {
      g.appendChild(svgEl('line', {
        x1: region.x, y1: p.y, x2: region.x, y2: p.y + p.height,
        stroke: theme.crosshair, 'stroke-dasharray': '3 3', 'stroke-opacity': 0.7
      }))
    }
    if (region.type === 'rect') {
      g.appendChild(svgEl('line', {
        x1: p.x, y1: region.y, x2: p.x + p.width, y2: region.y,
        stroke: theme.crosshair, 'stroke-dasharray': '3 3', 'stroke-opacity': 0.5
      }))
    }
    layer.appendChild(g)
  },
  _applyTooltip() {
    const chart = this.chart
    if (chart.options.tooltip === false) return
    const theme = chart.theme
    const container = chart.root

    let tip = container.querySelector('.xn-tooltip')
    if (!chart.hovered) {
      if (tip) tip.remove()
      return
    }

    if (!tip) {
      tip = document.createElement('div')
      tip.className = 'xn-tooltip'
      tip.style.cssText = `
        position:absolute;pointer-events:none;z-index:10;
        background:${theme.tooltip.background};color:${theme.tooltip.color};
        padding:${theme.tooltip.padding};border-radius:${theme.tooltip.radius}px;
        font-size:${theme.tooltip.fontSize}px;font-family:${theme.font.family};
        box-shadow:${theme.tooltip.shadow};border:1px solid ${theme.tooltip.border};
        white-space:nowrap;opacity:0;transition:opacity 120ms ease;
        backdrop-filter:blur(4px);max-width:280px;
      `
      container.appendChild(tip)
    }

    const series = chart.data.series[chart.hovered.seriesIndex]
    const datum = series?.data?.[chart.hovered.dataIndex]
    const color = datum?.color || series?.color || theme.colors[chart.hovered.seriesIndex % theme.colors.length]
    const formatter = chart.options.tooltipFormatter
    let html
    if (typeof formatter === 'function') {
      html = formatter({ series, datum, seriesIndex: chart.hovered.seriesIndex, dataIndex: chart.hovered.dataIndex })
    } else {
      const title = chart.options.xFormat
        ? chart.options.xFormat(datum?.label ?? chart.hovered.dataIndex)
        : String(datum?.label ?? chart.hovered.dataIndex)
      const value = datum?.y != null ? datum.y : datum?.value
      html = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;opacity:0.85;font-size:${theme.tooltip.fontSize - 1}px">
          <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
          <span>${escapeHTML(title)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;gap:16px">
          <span style="opacity:0.75">${escapeHTML(series?.name || '数值')}</span>
          <strong>${escapeHTML(chart.options.yFormat ? chart.options.yFormat(value) : formatNumber(value))}</strong>
        </div>
      `
    }
    tip.innerHTML = html

    if (this._mousePos) {
      const rect = container.getBoundingClientRect()
      const x = this._mousePos.clientX - rect.left
      const y = this._mousePos.clientY - rect.top
      const offset = theme.tooltip.offset
      const tw = tip.offsetWidth
      const th = tip.offsetHeight
      let left = x + offset
      let top = y + offset
      if (left + tw > rect.width) left = x - tw - offset
      if (top + th > rect.height) top = y - th - offset
      tip.style.left = Math.max(4, left) + 'px'
      tip.style.top = Math.max(4, top) + 'px'
    }
    tip.style.opacity = '1'
  }
}

function sameHover(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.seriesIndex === b.seriesIndex && a.dataIndex === b.dataIndex
}

function escapeHTML(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}
