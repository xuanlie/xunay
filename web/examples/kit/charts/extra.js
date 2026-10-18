import { svgEl, number, clamp } from './core.js'

const SVG_NS = 'http://www.w3.org/2000/svg'
function raw(name, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, name)
  for (const k in attrs) if (attrs[k] != null) el.setAttribute(k, String(attrs[k]))
  if (text != null) el.textContent = String(text)
  return el
}

// ============================================================
// 树图 Treemap
// ============================================================
export function renderTreemap(chart, { data, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []
  const items = data.map((d, i) => ({ ...d, value: Math.max(0, number(d.value ?? d.y, 0)), _i: i }))
  const total = items.reduce((a, b) => a + b.value, 0)
  if (total <= 0) return els

  // squarified treemap（简化版：切分法）
  function layout(rect, list) {
    if (!list.length) return []
    if (list.length === 1) {
      return [{ ...list[0], x: rect.x, y: rect.y, w: rect.w, h: rect.h }]
    }
    // 一半一半
    const sum = list.reduce((a, b) => a + b.value, 0)
    let acc = 0
    let split = 0
    for (let i = 0; i < list.length; i++) {
      acc += list[i].value
      if (acc >= sum / 2) { split = i + 1; break }
    }
    if (split === 0) split = 1
    if (split === list.length) split = list.length - 1
    const left = list.slice(0, split)
    const right = list.slice(split)
    const leftSum = left.reduce((a, b) => a + b.value, 0)
    const leftRatio = leftSum / sum
    if (rect.w >= rect.h) {
      const lw = rect.w * leftRatio
      return [
        ...layout({ x: rect.x, y: rect.y, w: lw, h: rect.h }, left),
        ...layout({ x: rect.x + lw, y: rect.y, w: rect.w - lw, h: rect.h }, right)
      ]
    }
    const lh = rect.h * leftRatio
    return [
      ...layout({ x: rect.x, y: rect.y, w: rect.w, h: lh }, left),
      ...layout({ x: rect.x, y: rect.y + lh, w: rect.w, h: rect.h - lh }, right)
    ]
  }

  const rects = layout({ x: p.x, y: p.y, w: p.width, h: p.height }, items)

  rects.forEach((r) => {
    const color = r.color || colorFn(r._i)
    const g = raw('g', { tabindex: 0, role: 'button' })
    const rect = raw('rect', {
      x: r.x + 1, y: r.y + 1, width: Math.max(1, r.w - 2), height: Math.max(1, r.h - 2),
      rx: 3, fill: color
    })
    rect.style.cursor = 'pointer'
    g.appendChild(rect)
    if (r.w > 44 && r.h > 24) {
      g.appendChild(raw('text', {
        x: r.x + 8, y: r.y + 18, fill: '#fff',
        'font-size': 12, 'font-weight': 600, 'pointer-events': 'none'
      }, String(r.label ?? r._i)))
      if (r.h > 40) {
        g.appendChild(raw('text', {
          x: r.x + 8, y: r.y + 34, fill: 'rgba(255,255,255,0.85)',
          'font-size': 11, 'pointer-events': 'none'
        }, number(r.value).toLocaleString()))
      }
    }
    g.addEventListener('click', (e) => {
      chart.hovered = { seriesIndex: 0, dataIndex: r._i }
      chart.events.emit('click', { seriesIndex: 0, dataIndex: r._i, datum: r, event: e })
      if (typeof chart.options.onSliceClick === 'function') {
        chart.options.onSliceClick(r, r._i, e)
      }
    })
    layer.appendChild(g)

    els.push({
      type: 'treemap', di: r._i, el: rect,
      apply: (pr) => { rect.setAttribute('opacity', String(0.15 + 0.85 * pr)) },
      applyHover: (hv) => {
        const hot = hv && hv.dataIndex === r._i
        rect.setAttribute('stroke', hot ? '#fff' : 'transparent')
        rect.setAttribute('stroke-width', hot ? 2 : 0)
      }
    })
    chart._hitRegions.push({
      type: 'rect', x: r.x, y: r.y, w: r.w, h: r.h,
      seriesIndex: 0, dataIndex: r._i
    })
  })
  return els
}

// ============================================================
// 桑基图 Sankey
// ============================================================
export function renderSankey(chart, { nodes, links, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []

  // 按列分层
  const depth = new Map()
  const all = nodes.map((n, i) => ({ ...n, _i: i }))
  const linksN = links.map((l) => ({ ...l }))
  let changed = true
  all.forEach((n) => depth.set(n._i, 0))
  let guard = 0
  while (changed && guard++ < 20) {
    changed = false
    for (const l of linksN) {
      const d = (depth.get(l.source) ?? 0) + 1
      if (d > (depth.get(l.target) ?? 0)) { depth.set(l.target, d); changed = true }
    }
  }
  const maxDepth = Math.max(...depth.values(), 0) + 1
  const columns = Array.from({ length: maxDepth }, () => [])
  all.forEach((n) => columns[depth.get(n._i)].push(n))

  const colW = p.width / Math.max(1, maxDepth - 1 || 1)
  const nodeW = 16
  const nodeMap = new Map()

  columns.forEach((col, ci) => {
    const total = col.reduce((a, b) => a + Math.max(0, number(b.value ?? 10, 10)), 0)
    const gap = 12
    const availH = p.height - gap * (col.length - 1)
    const scale = availH / Math.max(1, total)
    let y = p.y
    col.forEach((n) => {
      const h = Math.max(4, number(n.value ?? 10, 10) * scale)
      const x = p.x + ci * colW - (ci === 0 ? 0 : nodeW / 2) + (ci === maxDepth - 1 ? -nodeW : 0)
      const rect = raw('rect', { x, y, width: nodeW, height: h, rx: 2, fill: colorFn(n._i) })
      rect.style.cursor = 'pointer'
      layer.appendChild(rect)
      nodeMap.set(n._i, { x, y, w: nodeW, h, value: n.value ?? 10, _i: n._i, label: n.label })
      els.push({
        type: 'sankey-node', di: n._i, el: rect,
        apply: (pr) => { rect.setAttribute('opacity', String(0.2 + 0.8 * pr)) }
      })
      chart._hitRegions.push({ type: 'rect', x, y, w: nodeW, h, seriesIndex: 0, dataIndex: n._i })
      if (p.width > 260) {
        layer.appendChild(raw('text', {
          x: ci === maxDepth - 1 ? x - 4 : x + nodeW + 4,
          y: y + h / 2,
          'text-anchor': ci === maxDepth - 1 ? 'end' : 'start',
          'dominant-baseline': 'middle',
          fill: chart.theme.textMuted, 'font-size': 10,
          'font-family': chart.theme.font.family,
          'pointer-events': 'none'
        }, n.label ?? ''))
      }
      y += h + gap
    })
  })

  // 连线
  const outOffset = new Map()
  const inOffset = new Map()
  linksN.forEach((l, i) => {
    const s = nodeMap.get(l.source)
    const t = nodeMap.get(l.target)
    if (!s || !t) return
    const thickness = Math.max(2, number(l.value ?? 10, 10))
    const sOff = outOffset.get(l.source) || 0
    const tOff = inOffset.get(l.target) || 0
    const sy = s.y + sOff + thickness / 2
    const ty = t.y + tOff + thickness / 2
    const sx = s.x + nodeW
    const tx = t.x
    const cx1 = sx + (tx - sx) * 0.5
    const cx2 = tx - (tx - sx) * 0.5
    const d = `M ${sx} ${sy} C ${cx1} ${sy}, ${cx2} ${ty}, ${tx} ${ty}`
    const path = raw('path', {
      d, fill: 'none', stroke: colorFn(l.source % 8),
      'stroke-width': thickness, 'stroke-opacity': 0.35,
      'stroke-linecap': 'round'
    })
    layer.appendChild(path)
    els.push({
      type: 'sankey-link', el: path,
      apply: (pr) => { path.setAttribute('stroke-opacity', String(0.35 * pr)) }
    })
    outOffset.set(l.source, sOff + thickness)
    inOffset.set(l.target, tOff + thickness)
  })

  return els
}

// ============================================================
// 关系图 Network
// ============================================================
export function renderNetwork(chart, { nodes, links, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []
  const cx = p.x + p.width / 2
  const cy = p.y + p.height / 2
  const R = Math.min(p.width, p.height) / 2 - 20

  // 圆环布局
  const n = nodes.length
  const positions = nodes.map((_, i) => {
    const angle = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2
    return { x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R }
  })

  links.forEach((l) => {
    const s = positions[l.source]
    const t = positions[l.target]
    if (!s || !t) return
    const path = raw('line', {
      x1: s.x, y1: s.y, x2: t.x, y2: t.y,
      stroke: chart.theme.grid, 'stroke-width': Math.max(1, number(l.value ?? 1)),
      'stroke-opacity': 0.6
    })
    layer.appendChild(path)
    els.push({ type: 'link', el: path, apply: (pr) => path.setAttribute('stroke-opacity', String(0.6 * pr)) })
  })

  nodes.forEach((node, i) => {
    const pos = positions[i]
    const color = node.color || colorFn(i)
    const circle = raw('circle', {
      cx: pos.x, cy: pos.y, r: 14, fill: color,
      stroke: '#fff', 'stroke-width': 2, tabindex: 0, role: 'button'
    })
    circle.style.cursor = 'pointer'
    layer.appendChild(circle)
    els.push({
      type: 'node', di: i, el: circle,
      apply: (pr) => {
        circle.setAttribute('cx', cx + (pos.x - cx) * pr)
        circle.setAttribute('cy', cy + (pos.y - cy) * pr)
      },
      applyHover: (hv) => {
        const hot = hv && hv.dataIndex === i
        circle.setAttribute('r', hot ? 18 : 14)
      }
    })
    chart._hitRegions.push({ type: 'point', x: pos.x, y: pos.y, r: 18, seriesIndex: 0, dataIndex: i })
    layer.appendChild(raw('text', {
      x: pos.x, y: pos.y, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      fill: '#fff', 'font-size': 11, 'font-weight': 600, 'pointer-events': 'none'
    }, String(node.label ?? i).slice(0, 3)))
  })
  return els
}

// ============================================================
// 树 Tree（垂直层级）
// ============================================================
export function renderTree(chart, { root, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []

  const levels = []
  function walk(node, depth, parent) {
    if (!levels[depth]) levels[depth] = []
    const item = { node, depth, parent, x: 0, y: 0 }
    levels[depth].push(item)
    node._item = item
    ;(node.children || []).forEach((c) => walk(c, depth + 1, item))
  }
  walk(root, 0, null)

  const maxDepth = levels.length - 1
  levels.forEach((level, d) => {
    const y = p.y + (maxDepth === 0 ? p.height / 2 : (d / maxDepth) * p.height)
    level.forEach((item, i) => {
      const x = p.x + ((i + 0.5) / level.length) * p.width
      item.x = x
      item.y = y
      const color = item.node.color || colorFn(d)
      const r = Math.max(6, 16 - d * 2)
      const circle = raw('circle', {
        cx: x, cy: y, r, fill: color, stroke: '#fff', 'stroke-width': 2,
        tabindex: 0, role: 'button'
      })
      circle.style.cursor = 'pointer'
      layer.appendChild(circle)
      els.push({
        type: 'tree-node', el: circle,
        apply: (pr) => { circle.setAttribute('opacity', String(0.2 + 0.8 * pr)) }
      })
      layer.appendChild(raw('text', {
        x, y: y - r - 4, 'text-anchor': 'middle',
        fill: chart.theme.text, 'font-size': 11,
        'font-family': chart.theme.font.family, 'pointer-events': 'none'
      }, String(item.node.label ?? '')))
      chart._hitRegions.push({ type: 'point', x, y, r: r + 6, seriesIndex: 0, dataIndex: d })
    })
  })

  // 连接线
  function connect(item) {
    if (!item.parent) return
    const s = item.parent
    const t = item
    const d = `M ${s.x} ${s.y} C ${s.x} ${(s.y + t.y) / 2}, ${t.x} ${(s.y + t.y) / 2}, ${t.x} ${t.y}`
    const path = raw('path', {
      d, fill: 'none', stroke: chart.theme.grid,
      'stroke-width': 1.5, 'stroke-opacity': 0.7
    })
    layer.appendChild(path)
    els.push({ type: 'tree-link', el: path, apply: (pr) => path.setAttribute('stroke-opacity', String(0.7 * pr)) })
  }
  levels.forEach((level) => level.forEach(connect))
  return els
}

// ============================================================
// 箱线图 Boxplot
// ============================================================
export function renderBoxplot(chart, { groups, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []
  const allVals = groups.flatMap((g) => g.values)
  const min = Math.min(...allVals, 0)
  const max = Math.max(...allVals, 1)
  const span = max - min || 1
  const y = (v) => p.y + p.height - ((v - min) / span) * p.height
  const bw = (p.width / groups.length) * 0.5

  groups.forEach((g, i) => {
    const sorted = [...g.values].sort((a, b) => a - b)
    const q = (pct) => {
      const idx = (sorted.length - 1) * pct
      const lo = Math.floor(idx), hi = Math.ceil(idx)
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
    }
    const q1 = q(0.25), q2 = q(0.5), q3 = q(0.75)
    const iqr = q3 - q1
    const lo = Math.max(sorted[0], q1 - iqr * 1.5)
    const hi = Math.min(sorted[sorted.length - 1], q3 + iqr * 1.5)
    const cx = p.x + ((i + 0.5) / groups.length) * p.width
    const color = g.color || colorFn(i)

    const box = raw('rect', {
      x: cx - bw / 2, y: y(q3), width: bw, height: Math.max(1, y(q1) - y(q3)),
      fill: color, 'fill-opacity': 0.7, stroke: color, 'stroke-width': 2, rx: 3
    })
    box.style.cursor = 'pointer'
    layer.appendChild(box)
    els.push({
      type: 'box', di: i, el: box,
      apply: (pr) => {
        const cy0 = p.y + p.height
        box.setAttribute('y', cy0 + (y(q3) - cy0) * pr)
        box.setAttribute('height', Math.max(1, (y(q1) - y(q3)) * pr))
      },
      applyHover: (hv) => {
        const hot = hv && hv.dataIndex === i
        box.setAttribute('fill-opacity', hot ? '0.9' : '0.7')
      }
    })

    // 中位线
    layer.appendChild(raw('line', {
      x1: cx - bw / 2, y1: y(q2), x2: cx + bw / 2, y2: y(q2),
      stroke: '#fff', 'stroke-width': 2
    }))
    // 胡须
    layer.appendChild(raw('line', { x1: cx, y1: y(lo), x2: cx, y2: y(q1), stroke: color, 'stroke-width': 1.5 }))
    layer.appendChild(raw('line', { x1: cx, y1: y(q3), x2: cx, y2: y(hi), stroke: color, 'stroke-width': 1.5 }))
    layer.appendChild(raw('line', { x1: cx - bw / 4, y1: y(lo), x2: cx + bw / 4, y2: y(lo), stroke: color, 'stroke-width': 2 }))
    layer.appendChild(raw('line', { x1: cx - bw / 4, y1: y(hi), x2: cx + bw / 4, y2: y(hi), stroke: color, 'stroke-width': 2 }))

    chart._hitRegions.push({
      type: 'rect', x: cx - bw / 2, y: y(hi), w: bw, h: y(lo) - y(hi),
      seriesIndex: 0, dataIndex: i
    })

    layer.appendChild(raw('text', {
      x: cx, y: p.y + p.height + 16, 'text-anchor': 'middle',
      fill: chart.theme.textMuted, 'font-size': 11, 'font-family': chart.theme.font.family
    }, g.label ?? `组 ${i + 1}`))
  })
  return els
}

// ============================================================
// K 线图 Candlestick
// ============================================================
export function renderCandlestick(chart, { data, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []
  const lows = data.map((d) => d.low)
  const highs = data.map((d) => d.high)
  const min = Math.min(...lows)
  const max = Math.max(...highs)
  const span = max - min || 1
  const y = (v) => p.y + p.height - ((v - min) / span) * p.height
  const slot = p.width / data.length
  const w = Math.max(2, slot * 0.6)

  data.forEach((d, i) => {
    const cx = p.x + (i + 0.5) * slot
    const up = d.close >= d.open
    const color = d.color || (up ? colorFn(0) : colorFn(3))
    const bodyTop = Math.min(y(d.open), y(d.close))
    const bodyH = Math.max(1, Math.abs(y(d.close) - y(d.open)))
    const g = raw('g', { tabindex: 0, role: 'button' })
    g.style.cursor = 'pointer'
    g.appendChild(raw('line', {
      x1: cx, y1: y(d.high), x2: cx, y2: y(d.low),
      stroke: color, 'stroke-width': 1.5
    }))
    const rect = raw('rect', {
      x: cx - w / 2, y: bodyTop, width: w, height: bodyH,
      fill: up ? color : '#fff', stroke: color, 'stroke-width': 1.5, rx: 2
    })
    g.appendChild(rect)
    layer.appendChild(g)
    els.push({
      type: 'candle', di: i, el: rect,
      apply: (pr) => {
        const cy0 = p.y + p.height
        rect.setAttribute('y', cy0 + (bodyTop - cy0) * pr)
        rect.setAttribute('height', Math.max(1, bodyH * pr))
      }
    })
    chart._hitRegions.push({
      type: 'rect', x: cx - w / 2, y: y(d.high), w, h: y(d.low) - y(d.high),
      seriesIndex: 0, dataIndex: i
    })
  })
  return els
}

// ============================================================
// 词云 Wordcloud
// ============================================================
export function renderWordcloud(chart, { words, colorFn }) {
  const layer = chart.layers.series
  const p = chart.layout.plot
  const els = []
  const sorted = [...words].sort((a, b) => (b.value ?? b.weight ?? 1) - (a.value ?? a.weight ?? 1))
  const maxW = sorted[0]?.value ?? 1
  const minW = sorted[sorted.length - 1]?.value ?? 1
  const placed = []

  function fits(x, y, w, h) {
    const pad = 2
    return !placed.some((r) =>
      x - w / 2 - pad < r.x + r.w / 2 &&
      x + w / 2 + pad > r.x - r.w / 2 &&
      y - h / 2 - pad < r.y + r.h / 2 &&
      y + h / 2 + pad > r.y - r.h / 2
    )
  }

  const cx = p.x + p.width / 2
  const cy = p.y + p.height / 2
  const maxR = Math.min(p.width, p.height) / 2

  sorted.forEach((w, i) => {
    const t = maxW === minW ? 0.5 : ((w.value ?? w.weight ?? 1) - minW) / (maxW - minW)
    const size = 12 + t * 30
    const text = String(w.text ?? w.label ?? '')
    const tw = text.length * size * 0.6
    const th = size * 1.15

    let px = cx, py = cy
    let ok = false
    for (let r = 0; r < maxR && !ok; r += 6) {
      const steps = Math.max(8, Math.floor(r / 6) * 4)
      for (let s = 0; s < steps; s++) {
        const ang = (s / steps) * Math.PI * 2 + i * 0.7
        const x = cx + Math.cos(ang) * r
        const y = cy + Math.sin(ang) * r
        if (x - tw / 2 > p.x && x + tw / 2 < p.x + p.width && y - th / 2 > p.y && y + th / 2 < p.y + p.height && fits(x, y, tw, th)) {
          px = x; py = y; ok = true; break
        }
      }
    }
    placed.push({ x: px, y: py, w: tw, h: th })

    const color = w.color || colorFn(i)
    const t2 = svgEl('text', {
      x: px, y: py, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
      fill: color, 'font-size': size, 'font-weight': 600,
      'font-family': chart.theme.font.family, tabindex: 0, role: 'button'
    }, text)
    t2.style.cursor = 'pointer'
    layer.appendChild(t2)

    els.push({
      type: 'word', di: i, el: t2,
      apply: (pr) => { t2.setAttribute('opacity', String(0.15 + 0.85 * pr)) },
      applyHover: (hv) => {
        const hot = hv && hv.dataIndex === i
        t2.setAttribute('font-weight', hot ? 800 : 600)
        t2.setAttribute('fill', hot ? chart.theme.colors[0] : color)
      }
    })
    chart._hitRegions.push({
      type: 'rect', x: px - tw / 2, y: py - th / 2, w: tw, h: th,
      seriesIndex: 0, dataIndex: i
    })
  })
  return els
}
