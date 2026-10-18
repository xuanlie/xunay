import { svgEl, number, clamp, formatNumber } from './core.js'

export function normalizePoint(d, i) {
  if (d == null) return { x: i, y: 0, label: String(i) }
  if (typeof d === 'number') return { x: i, y: d, label: String(i) }
  if (typeof d === 'object') {
    const y = d.y != null ? d.y : d.value
    return {
      ...d,
      x: d.x != null ? d.x : i,
      y: number(y, 0),
      r: d.r != null ? number(d.r, 4) : d.radius != null ? number(d.radius, 4) : undefined,
      label: d.label != null ? d.label : String(i)
    }
  }
  return { x: i, y: 0, label: String(i) }
}

export function normalizeSeriesData(series) {
  return (series.data || []).map(normalizePoint)
}

export function linePath(points, tension = 0) {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (tension <= 0) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  }
  const t = clamp(tension, 0, 1) * 0.4
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return d
}

export function areaPath(points, baseline, tension = 0) {
  if (!points.length) return ''
  const top = linePath(points, tension)
  const last = points[points.length - 1]
  const first = points[0]
  return `${top} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`
}

export function arcPath(cx, cy, radius, innerRadius, startAngle, endAngle) {
  const sweep = endAngle - startAngle
  const large = sweep > Math.PI ? 1 : 0
  const cos1 = Math.cos(startAngle), sin1 = Math.sin(startAngle)
  const cos2 = Math.cos(endAngle), sin2 = Math.sin(endAngle)
  const x1 = cx + radius * cos1, y1 = cy + radius * sin1
  const x2 = cx + radius * cos2, y2 = cy + radius * sin2
  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`
  }
  const x3 = cx + innerRadius * cos2, y3 = cy + innerRadius * sin2
  const x4 = cx + innerRadius * cos1, y4 = cy + innerRadius * sin1
  return [
    `M ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 ${large} 0 ${x4} ${y4}`,
    'Z'
  ].join(' ')
}

// ============================================================
// 折线 / 面积 / 散点 / 阶梯
// ============================================================
export function renderLineLikeSeries(chart, {
  seriesIndex, series, points, color, mode = 'line', tension = 0, baseline = 0
}) {
  const t = chart.theme
  const layer = chart.layers.series
  const els = []
  const stroke = series.width ?? t.line.width
  const baseY = chart.layout.plot.y + chart.layout.plot.height
  const gradId = `xn-grad-${chart.id}-${seriesIndex}`
  const defs = chart.svg.querySelector('defs') || chart.svg.insertBefore(svgEl('defs'), chart.svg.firstChild)

  const target = points.map((p) => ({ x: p.x, y: p.y }))
  const startY = mode === 'area'
    ? target.map((p) => ({ x: p.x, y: baseY }))
    : target.map((p) => ({ x: p.x, y: baseY }))

  if (mode === 'area') {
    const gradient = svgEl('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' })
    gradient.appendChild(svgEl('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': series.fillOpacity ?? 0.5 }))
    gradient.appendChild(svgEl('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': series.fillOpacityEnd ?? 0.02 }))
    defs.appendChild(gradient)

    const area = svgEl('path', { fill: `url(#${gradId})`, stroke: 'none' })
    layer.appendChild(area)
    els.push({
      type: 'area', el: area,
      apply: (p) => {
        const pts = target.map((pt, i) => ({ x: pt.x, y: startY[i].y + (target[i].y - startY[i].y) * p }))
        area.setAttribute('d', areaPath(pts, baseY, tension))
      }
    })
  }

  const drawLine = mode === 'line' || mode === 'area' || mode === 'step'
  if (drawLine) {
    const path = svgEl('path', {
      fill: 'none', stroke: color,
      'stroke-width': stroke, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    })
    if (mode === 'step') {
      path.setAttribute('d', target.map((pt, i) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`
        return `H ${pt.x} V ${pt.y}`
      }).join(' '))
    }
    layer.appendChild(path)
    if (mode !== 'step') {
      els.push({
        type: 'line', el: path,
        apply: (p) => {
          const pts = target.map((pt, i) => ({ x: pt.x, y: startY[i].y + (target[i].y - startY[i].y) * p }))
          path.setAttribute('d', linePath(pts, tension))
        }
      })
    }
  }

  const showPoints = series.points !== false && (mode === 'scatter' || mode === 'bubble' || mode === 'line' || series.points === true)
  if (showPoints) {
    target.forEach((pt, di) => {
      const baseR = series.pointRadius ?? t.line.pointRadius
      const r = mode === 'bubble'
        ? Math.max(2, (points[di].r ?? 4) * (chart._bubbleScale || 1))
        : baseR
      const dot = svgEl('circle', {
        cx: pt.x, cy: pt.y, r,
        fill: color,
        stroke: chart.theme.background === 'transparent' ? '#fff' : chart.theme.background,
        'stroke-width': 1.5, tabindex: -1, 'aria-hidden': 'true'
      })
      dot.style.cursor = 'pointer'
      dot.style.transition = 'r 120ms ease, stroke-width 120ms ease'
      layer.appendChild(dot)

      els.push({
        type: 'point', si: seriesIndex, di, el: dot,
        apply: (p) => {
          const y = startY[di].y + (target[di].y - startY[di].y) * p
          dot.setAttribute('cy', y)
          dot.style.opacity = String(0.1 + 0.9 * p)
        },
        applyHover: (hovered) => {
          const hot = hovered && hovered.seriesIndex === seriesIndex && hovered.dataIndex === di
          const hoverR = mode === 'bubble'
            ? Math.max(4, (points[di].r ?? 4) * (chart._bubbleScale || 1) * 1.2)
            : (series.pointRadiusHover ?? t.line.pointRadiusHover)
          dot.setAttribute('r', hot ? hoverR : (mode === 'bubble' ? r : baseR))
          dot.setAttribute('stroke-width', hot ? 2.5 : 1.5)
        }
      })
      chart._hitRegions.push({
        type: 'point', x: pt.x, y: pt.y,
        r: Math.max(10, r + 6), seriesIndex, dataIndex: di
      })
    })
  } else {
    target.forEach((pt, di) => {
      chart._hitRegions.push({ type: 'point', x: pt.x, y: pt.y, r: 12, seriesIndex, dataIndex: di })
    })
  }

  return els
}

// ============================================================
// 柱状 / 水平柱 / 堆叠
// ============================================================
export function renderBarLikeSeries(chart, {
  seriesIndex, series, groups, color, mode = 'vertical'
}) {
  const t = chart.theme
  const layer = chart.layers.series
  const els = []
  const horizontal = mode === 'horizontal'
  const zeroBase = horizontal ? chart.scales.x.map(0) : chart.scales.y.map(0)

  groups.forEach((group, di) => {
    const rect = svgEl('rect', {
      fill: group.color || color,
      rx: 0, tabindex: -1, 'aria-hidden': 'true'
    })
    rect.style.cursor = 'pointer'
    layer.appendChild(rect)

    const finalRadius = Math.min(
      series.radius ?? t.bar.radius,
      horizontal ? group.height / 2 : group.width / 2,
      8
    )

    els.push({
      type: 'bar', si: seriesIndex, di, el: rect,
      apply: (p) => {
        if (horizontal) {
          const finalX = group.x
          const curX = zeroBase + (finalX - zeroBase) * p
          const curW = Math.max(0.5, group.width * p)
          rect.setAttribute('x', Math.min(curX, zeroBase))
          rect.setAttribute('y', group.y)
          rect.setAttribute('width', curW)
          rect.setAttribute('height', Math.max(1, group.height))
          rect.setAttribute('rx', Math.min(finalRadius, curW / 2, group.height / 2))
        } else {
          const finalY = group.y
          const curY = zeroBase + (finalY - zeroBase) * p
          const curH = Math.max(0.5, group.height * p)
          rect.setAttribute('x', group.x)
          rect.setAttribute('y', Math.min(curY, zeroBase))
          rect.setAttribute('width', Math.max(1, group.width))
          rect.setAttribute('height', curH)
          rect.setAttribute('rx', Math.min(finalRadius, group.width / 2, curH / 2))
        }
      },
      applyHover: (hovered) => {
        const hot = hovered && hovered.seriesIndex === seriesIndex && hovered.dataIndex === di
        rect.style.filter = hot ? 'brightness(1.15)' : ''
      }
    })

    chart._hitRegions.push({
      type: 'rect',
      x: group.x - 1,
      y: group.y - 1,
      w: (horizontal ? group.width : group.width) + 2,
      h: (horizontal ? group.height : group.height) + 2,
      seriesIndex, dataIndex: di
    })
  })

  return els
}

// ============================================================
// 饼 / 环 / 玫瑰 / 极坐标 / 仪表盘
// ============================================================
export function renderArcLikeSeries(chart, {
  data, colorFn, mode = 'pie', innerRatio = 0, outerRatio = 1, startAngle = -Math.PI / 2, endAngle
}) {
  const t = chart.theme
  const layer = chart.layers.series
  const els = []
  const values = data.map((d) => Math.max(0, number(d.value, 0)))
  const total = values.reduce((a, b) => a + b, 0)
  const cx = chart.layout.plot.x + chart.layout.plot.width / 2
  const cy = chart.layout.plot.y + chart.layout.plot.height / 2
  const maxR = Math.max(1, Math.min(chart.layout.plot.width, chart.layout.plot.height) / 2)
  const innerR = innerRatio > 0 ? maxR * innerRatio : 0
  const padAngle = data.length > 1 && mode !== 'gauge' ? (t.arc.padAngle || 0) : 0

  const fullCircle = mode === 'pie' || mode === 'donut' || mode === 'rose' || mode === 'polar'
  const fullEnd = endAngle != null ? endAngle : (fullCircle ? startAngle + Math.PI * 2 : startAngle + Math.PI)

  if (total <= 0) {
    if (mode === 'gauge') {
      layer.appendChild(svgEl('path', {
        d: arcPath(cx, cy, maxR * outerRatio, innerR, startAngle, fullEnd),
        fill: 'none', stroke: t.grid, 'stroke-width': Math.max(1, (maxR * outerRatio - innerR)),
      }))
    }
    return els
  }

  if (mode === 'rose' || mode === 'polar') {
    const maxVal = Math.max(...values)
    const angleStep = (fullEnd - startAngle) / values.length
    data.forEach((item, i) => {
      const a0 = startAngle + i * angleStep + padAngle / 2
      const a1 = startAngle + (i + 1) * angleStep - padAngle / 2
      const ratio = mode === 'polar' ? 1 : values[i] / maxVal
      const r = maxR * outerRatio * ratio
      const color = item.color || colorFn(i)
      const path = svgEl('path', {
        d: '', fill: color,
        stroke: t.background === 'transparent' ? '#fff' : t.background,
        'stroke-width': 1, tabindex: -1, 'aria-hidden': 'true'
      })
      path.style.cursor = 'pointer'
      path.style.transition = 'transform 120ms ease'
      path.style.transformOrigin = `${cx}px ${cy}px`
      layer.appendChild(path)
      const mid = (a0 + a1) / 2

      els.push({
        type: 'arc', si: 0, di: i, el: path,
        apply: (p) => {
          const curR = innerR + (r - innerR) * p
          path.setAttribute('d', arcPath(cx, cy, curR, innerR, a0, a1))
        },
        applyHover: (hovered) => {
          const hot = hovered && hovered.dataIndex === i
          const dx = hot ? Math.cos(mid) * 6 : 0
          const dy = hot ? Math.sin(mid) * 6 : 0
          path.style.transform = `translate(${dx}px, ${dy}px)`
        }
      })

      chart._hitRegions.push({
        type: 'arc', cx, cy, r: Math.max(r, 4), innerR, startA: a0, endA: a1,
        seriesIndex: 0, dataIndex: i
      })
    })
    return els
  }

  let angle = startAngle
  data.forEach((item, i) => {
    const value = values[i]
    const sweep = (value / total) * (fullEnd - startAngle)
    const a0 = angle + padAngle / 2
    const a1 = angle + sweep - padAngle / 2
    angle += sweep
    const color = item.color || colorFn(i)
    const path = svgEl('path', {
      d: '', fill: color,
      stroke: t.background === 'transparent' ? '#fff' : t.background,
      'stroke-width': 1, tabindex: -1, 'aria-hidden': 'true'
    })
    path.style.cursor = 'pointer'
    path.style.transition = 'transform 120ms ease'
    path.style.transformOrigin = `${cx}px ${cy}px`
    layer.appendChild(path)
    const mid = (a0 + a1) / 2

    els.push({
      type: 'arc', si: 0, di: i, el: path,
      apply: (p) => {
        const from = startAngle
        const s = from + (a0 - from) * p
        const e = from + (a1 - from) * p
        path.setAttribute('d', arcPath(cx, cy, maxR * outerRatio, innerR, s, e))
      },
      applyHover: (hovered) => {
        const hot = hovered && hovered.dataIndex === i
        const dx = hot ? Math.cos(mid) * 7 : 0
        const dy = hot ? Math.sin(mid) * 7 : 0
        path.style.transform = `translate(${dx}px, ${dy}px)`
      }
    })

    chart._hitRegions.push({
      type: 'arc', cx, cy, r: maxR * outerRatio, innerR,
      startA: a0, endA: a1, seriesIndex: 0, dataIndex: i
    })
  })

  return els
}

// ============================================================
// 雷达
// ============================================================
export function renderRadarSeries(chart, {
  seriesIndex, series, points, color, axesCount
}) {
  const t = chart.theme
  const layer = chart.layers.series
  const els = []
  const cx = chart.layout.plot.x + chart.layout.plot.width / 2
  const cy = chart.layout.plot.y + chart.layout.plot.height / 2
  const maxR = Math.max(1, Math.min(chart.layout.plot.width, chart.layout.plot.height) / 2 - 20)

  const coords = points.map((pt, i) => {
    const angle = -Math.PI / 2 + (i / axesCount) * Math.PI * 2
    const ratio = clamp(pt.rRatio ?? 0, 0, 1)
    return { x: cx + Math.cos(angle) * maxR * ratio, y: cy + Math.sin(angle) * maxR * ratio, angle }
  })

  const target = coords.map((c) => ({ x: c.x, y: c.y }))
  const start = coords.map((c) => ({ x: cx, y: cy }))

  const gradId = `xn-radar-${chart.id}-${seriesIndex}`
  const defs = chart.svg.querySelector('defs') || chart.svg.insertBefore(svgEl('defs'), chart.svg.firstChild)
  const g = svgEl('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' })
  g.appendChild(svgEl('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': series.fillOpacity ?? 0.45 }))
  g.appendChild(svgEl('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0.05 }))
  defs.appendChild(g)

  const path = svgEl('path', {
    d: '', fill: `url(#${gradId})`, stroke: color,
    'stroke-width': series.width ?? 2, 'stroke-linejoin': 'round'
  })
  layer.appendChild(path)

  els.push({
    type: 'radar', si: seriesIndex, el: path,
    apply: (p) => {
      const pts = target.map((pt, i) => ({
        x: start[i].x + (target[i].x - start[i].x) * p,
        y: start[i].y + (target[i].y - start[i].y) * p
      }))
      path.setAttribute('d', pts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ') + ' Z')
    }
  })

  coords.forEach((c, di) => {
    const dot = svgEl('circle', {
      cx: c.x, cy: c.y, r: series.pointRadius ?? 4, fill: color,
      stroke: t.background === 'transparent' ? '#fff' : t.background, 'stroke-width': 1.5
    })
    layer.appendChild(dot)
    els.push({
      type: 'point', si: seriesIndex, di, el: dot,
      apply: (p) => {
        dot.setAttribute('cx', start[di].x + (c.x - start[di].x) * p)
        dot.setAttribute('cy', start[di].y + (c.y - start[di].y) * p)
      },
      applyHover: (hovered) => {
        const hot = hovered && hovered.seriesIndex === seriesIndex && hovered.dataIndex === di
        dot.setAttribute('r', hot ? 7 : (series.pointRadius ?? 4))
      }
    })
    chart._hitRegions.push({
      type: 'point', x: c.x, y: c.y, r: 12,
      seriesIndex, dataIndex: di
    })
  })

  return els
}

// ============================================================
// 漏斗
// ============================================================
export function renderFunnelSeries(chart, {
  data, colorFn, gap = 2
}) {
  const layer = chart.layers.series
  const els = []
  const p = chart.layout.plot
  const values = data.map((d) => Math.max(0, number(d.value, 0)))
  const maxV = Math.max(...values, 1)
  const itemH = (p.height - gap * (data.length - 1)) / Math.max(1, data.length)
  const cx = p.x + p.width / 2

  data.forEach((item, i) => {
    const ratio = values[i] / maxV
    const nextRatio = i < data.length - 1 ? values[i + 1] / maxV : ratio * 0.6
    const topW = p.width * ratio
    const botW = p.width * nextRatio
    const y = p.y + i * (itemH + gap)
    const color = item.color || colorFn(i)

    const d = [
      `M ${cx - topW / 2} ${y}`,
      `L ${cx + topW / 2} ${y}`,
      `L ${cx + botW / 2} ${y + itemH}`,
      `L ${cx - botW / 2} ${y + itemH}`,
      'Z'
    ].join(' ')

    const path = svgEl('path', {
      d, fill: color,
      stroke: chart.theme.background === 'transparent' ? '#fff' : chart.theme.background,
      'stroke-width': 1, tabindex: -1, 'aria-hidden': 'true'
    })
    path.style.cursor = 'pointer'
    layer.appendChild(path)

    els.push({
      type: 'funnel', si: 0, di: i, el: path,
      apply: (progress) => {
        const scale = progress
        path.setAttribute('opacity', String(0.15 + 0.85 * progress))
        path.setAttribute('transform', `translate(${cx},${y + itemH / 2}) scale(${scale},1) translate(${-cx},${-(y + itemH / 2)})`)
      },
      applyHover: (hovered) => {
        const hot = hovered && hovered.dataIndex === i
        path.style.filter = hot ? 'brightness(1.15)' : ''
      }
    })

    chart._hitRegions.push({
      type: 'rect', x: cx - topW / 2, y, w: topW, h: itemH,
      seriesIndex: 0, dataIndex: i
    })

    if (chart.options.labels !== false && item.label != null) {
      layer.appendChild(svgEl('text', {
        x: cx, y: y + itemH / 2,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        fill: '#fff', 'font-size': 12, 'pointer-events': 'none'
      }, `${item.label} ${values[i]}`))
    }
  })

  return els
}

// ============================================================
// 热力图
// ============================================================
export function renderHeatmapSeries(chart, {
  matrix, colorScale, xLabels, yLabels
}) {
  const layer = chart.layers.series
  const els = []
  const p = chart.layout.plot
  const rows = matrix.length
  const cols = rows > 0 ? matrix[0].length : 0
  if (!rows || !cols) return els
  const cw = p.width / cols
  const ch = p.height / rows

  matrix.forEach((row, ri) => {
    row.forEach((val, ci) => {
      const color = colorScale(val, ri, ci)
      const rect = svgEl('rect', {
        x: p.x + ci * cw, y: p.y + ri * ch,
        width: cw - 1, height: ch - 1, rx: 2,
        fill: color, tabindex: -1, 'aria-hidden': 'true'
      })
      rect.style.cursor = 'pointer'
      rect.style.transition = 'opacity 150ms ease'
      layer.appendChild(rect)

      els.push({
        type: 'cell', si: 0, di: ri * cols + ci, el: rect,
        apply: (prog) => { rect.setAttribute('opacity', String(0.15 + 0.85 * prog)) },
        applyHover: (hovered) => {
          const hot = hovered && hovered.dataIndex === ri * cols + ci
          rect.setAttribute('stroke', hot ? '#fff' : 'transparent')
          rect.setAttribute('stroke-width', hot ? 2 : 0)
        }
      })

      chart._hitRegions.push({
        type: 'rect', x: p.x + ci * cw, y: p.y + ri * ch, w: cw, h: ch,
        seriesIndex: 0, dataIndex: ri * cols + ci
      })

      if (chart.options.labels !== false && cw > 28 && ch > 18) {
        layer.appendChild(svgEl('text', {
          x: p.x + ci * cw + cw / 2, y: p.y + ri * ch + ch / 2,
          'text-anchor': 'middle', 'dominant-baseline': 'middle',
          fill: '#fff', 'font-size': 11, 'pointer-events': 'none'
        }, formatNumber(val)))
      }
    })
  })

  return els
}
