// XuNay SVG Kit —— 交互式 SVG 图表库
// 特性：hover 高亮 · 跟随鼠标 tooltip · 数据动画 · 图例切换 · 响应式
import { createElement, div, span, canvas } from './element.js'
import { px } from './kit-util.js'
import { signal, effect, onCleanup } from './core.js'
import { show } from './misc.js'

const S = (tag, props, ...children) => createElement(tag, props, ...children)

// ============ 唯一 id ============
let _uid = 0
const uid = (p = 'x') => p + '-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 6)

// ============ 颜色 ============
export const PALETTE = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#06b6d4', '#eab308', '#ef4444',
]
const pickColor = (i, custom) => (custom && custom[i % custom.length]) || PALETTE[i % PALETTE.length]

// ============ 数值工具 ============
function niceMax(v) {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / exp
  if (n <= 1) return exp
  if (n <= 2) return 2 * exp
  if (n <= 5) return 5 * exp
  return 10 * exp
}
function formatNum(v, digits = 0) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return digits ? v.toFixed(digits) : String(Math.round(v))
}

// ============ 响应式尺寸 ============
function useResize(ref) {
  const w = signal(0)
  effect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect
      if (cr.width > 0) w(cr.width)
    })
    ro.observe(el)
    w(el.clientWidth)
    onCleanup(() => ro.disconnect())
  })
  return w
}

// ============ 图表容器 ============
// 提供：外框、SVG、tooltip、鼠标跟踪、图例
function ChartShell(props) {
  const {
    width, height, children, tooltip,
    legend, legendItems, legendActive,
    onLegendToggle, padding = 0,
  } = props
  const ref = { current: null }
  const wrapW = useResize(ref)
  const W = () => width || wrapW() || 600
  const H = () => height || 240

  return div({
    class: 'x-chart',
    style: 'position:relative;width:100%;' + (padding ? 'padding:' + padding + 'px;' : ''),
    ref: el => { ref.current = el },
  },
    S('svg', {
      viewBox: '0 0 ' + W() + ' ' + H(),
      width: '100%',
      height: H(),
      style: 'display:block;font-family:var(--x-font);overflow:visible',
      preserveAspectRatio: 'xMidYMid meet',
    }, ...children({ w: W(), h: H() })),
    tooltip,
    legend ? Legend({ items: legendItems, active: legendActive, onToggle: onLegendToggle }) : null
  )
}

// ============ Tooltip ============
function Tooltip(props) {
  const { x, y, visible, title, items, containerW } = px(props)
  return show(visible, () =>
    div({
      class: 'x-chart-tip',
      style: () => {
        const left = Math.max(8, Math.min(containerW - 8, x()))
        // GPU 加速：用 transform 定位，不走 left/top
        return `transform:translate3d(${left}px,${y()}px,0) translate(-50%,-100%)`
      },
    },
      title ? div({ class: 'x-chart-tip-title' }, title) : null,
      ...(items || []).map(it =>
        div({ class: 'x-chart-tip-row' },
          span({ class: 'x-chart-tip-dot', style: 'background:' + it.color }),
          span({ class: 'x-chart-tip-label' }, it.label),
          span({ class: 'x-chart-tip-value' }, it.value)
        )
      )
    )
  )
}

// ============ 图例 ============
function Legend(props) {
  const { items = [], active, onToggle } = px(props)
  return div({ class: 'x-chart-legend' },
    ...items.map((it, i) =>
      div({
        class: () => 'x-chart-legend-item' + (active && !active().has(it.key) ? ' off' : ''),
        on: { click: () => onToggle && onToggle(it.key) },
      },
        span({ class: 'x-chart-legend-dot', style: 'background:' + it.color }),
        span(null, it.label)
      )
    )
  )
}

// ============ 通用：卡片包装 ============
function wrap(props, inner) {
  return div({
    class: 'x-chart-card',
    style: 'background:var(--x-bg-elev);border:1px solid var(--x-border);border-radius:var(--x-radius-lg);padding:16px',
  },
    props.title ? div({ class: 'x-chart-title' }, props.title) : null,
    inner
  )
}

// ================================================================
// 柱状图
// ================================================================
export function BarChart(props) {
  const { data = [], labels = [], color, showValue = true, stack, group, horizontal = false, title } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })

  const inner = (ctx) => {
    const { w, h } = ctx
    const pad = { top: 20, right: 16, bottom: 32, left: 44 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom
    const maxV = niceMax(Math.max(...data, 0))
    const n = data.length || 1
    const slot = chartW / n
    const bw = Math.min(60, slot * 0.6)
    const y0 = pad.top + chartH
    const yOf = v => pad.top + chartH - (v / maxV) * chartH

    return [
      // 背景 hover 高亮
      ...data.map((v, i) => {
        const x = pad.left + slot * i
        return S('rect', {
          key: 'hb' + i,
          x, y: pad.top, width: slot, height: chartH,
          fill: () => hover() === i ? 'rgba(59,130,246,.06)' : 'transparent',
          style: 'transition:fill .15s;pointer-events:all;cursor:pointer',
          on: {
            mouseenter: () => hover(i),
            mouseleave: () => hover(-1),
          },
        })
      }),
      // 网格
      ...Array.from({ length: 5 }, (_, i) => {
        const y = yOf(maxV * (4 - i) / 4)
        return S('line', {
          key: 'g' + i,
          x1: pad.left, x2: w - pad.right, y1: y, y2: y,
          stroke: 'var(--x-border)', 'stroke-width': 1,
          'stroke-dasharray': i === 4 ? '0' : '3 3',
        })
      }),
      // Y 轴刻度
      ...Array.from({ length: 5 }, (_, i) => {
        const v = maxV * (4 - i) / 4
        const y = yOf(v)
        return S('text', {
          key: 'yl' + i,
          x: pad.left - 8, y: y + 4,
          'text-anchor': 'end', 'font-size': 11,
          fill: 'var(--x-text-mute)',
        }, formatNum(v))
      }),
      // 柱子
      ...data.map((v, i) => {
        const x = pad.left + slot * i + (slot - bw) / 2
        const y = yOf(v)
        const bh = y0 - y
        const fill = pickColor(i, color ? [color] : null)
        const isHover = () => hover() === i
        return S('g', { key: 'b' + i,
          on: {
            mouseenter: (e) => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 8 })
            },
          }
        },
          S('rect', {
            x, y, width: bw, height: () => Math.max(0, bh),
            rx: 4,
            fill,
            style: () => 'transition:opacity .2s, filter .2s;cursor:pointer;' +
              (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:.4'),
          }),
          showValue ? S('text', {
            x: x + bw / 2, y: y - 6,
            'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600,
            fill: 'var(--x-text)',
            style: () => 'transition:opacity .2s;' +
              (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:0'),
          }, formatNum(v)) : null
        )
      }),
      // X 轴标签
      ...labels.map((l, i) => S('text', {
        key: 'xl' + i,
        x: pad.left + slot * i + slot / 2,
        y: h - 10,
        'text-anchor': 'middle', 'font-size': 11,
        fill: 'var(--x-text-mute)',
      }, l)),
      // Tooltip
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x,
        y: () => mouse().y,
        containerW: w,
        title: () => hover() >= 0 ? (labels[hover()] || '') : '',
        items: () => hover() >= 0 ? [{ color: pickColor(hover(), color ? [color] : null), label: '值', value: formatNum(data[hover()]) }] : [],
      }),
    ]
  }

  return wrap({ title }, ChartShell({ width: props.width, height: props.height || 240, children: inner }))
}

// ================================================================
// 折线图 / 面积图
// ================================================================
export function LineChart(props) {
  return LineBase({ ...props, fill: false })
}
export function AreaChart(props) {
  return LineBase({ ...props, fill: true })
}

function LineBase(props) {
  const { data = [], labels = [], color, fill = false, smooth = true, dots = true, title, height = 240 } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })

  const inner = (ctx) => {
    const { w, h } = ctx
    const pad = { top: 20, right: 20, bottom: 32, left: 44 }
    const chartW = w - pad.left - pad.right
    const chartH = h - pad.top - pad.bottom
    const maxV = niceMax(Math.max(...data, 0))
    const n = data.length || 1
    const step = n > 1 ? chartW / (n - 1) : 0
    const y0 = pad.top + chartH
    const yOf = v => pad.top + chartH - (v / maxV) * chartH
    const xOf = i => pad.left + step * i

    const pts = data.map((v, i) => ({ x: xOf(i), y: yOf(v), v }))
    let linePath = ''
    if (pts.length) {
      if (smooth && pts.length > 2) {
        linePath = 'M' + pts[0].x + ',' + pts[0].y
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i], p1 = pts[i + 1]
          const cx = (p0.x + p1.x) / 2
          linePath += ' C' + cx + ',' + p0.y + ' ' + cx + ',' + p1.y + ' ' + p1.x + ',' + p1.y
        }
      } else {
        linePath = 'M' + pts.map(p => p.x + ',' + p.y).join(' L')
      }
    }
    const areaPath = pts.length
      ? linePath + ` L${pts[pts.length-1].x},${y0} L${pts[0].x},${y0} Z`
      : ''

    const gradId = uid('line-g')
    const lineColor = color || 'var(--x-primary)'

    // 十字线位置
    const crossX = () => hover() >= 0 ? xOf(hover()) : 0

    return [
      S('defs', null,
        S('linearGradient', { id: gradId, x1: 0, y1: 0, x2: 0, y2: 1 },
          S('stop', { offset: '0%', 'stop-color': lineColor, 'stop-opacity': .3 }),
          S('stop', { offset: '100%', 'stop-color': lineColor, 'stop-opacity': 0 })
        )
      ),
      // 网格
      ...Array.from({ length: 5 }, (_, i) => {
        const y = yOf(maxV * (4 - i) / 4)
        return S('line', {
          key: 'g' + i,
          x1: pad.left, x2: w - pad.right, y1: y, y2: y,
          stroke: 'var(--x-border)', 'stroke-width': 1,
          'stroke-dasharray': i === 4 ? '0' : '3 3',
        })
      }),
      // Y 轴刻度
      ...Array.from({ length: 5 }, (_, i) => {
        const v = maxV * (4 - i) / 4
        const y = yOf(v)
        return S('text', {
          key: 'yl' + i,
          x: pad.left - 8, y: y + 4,
          'text-anchor': 'end', 'font-size': 11,
          fill: 'var(--x-text-mute)',
        }, formatNum(v))
      }),
      // 面积
      fill ? S('path', {
        d: areaPath,
        fill: 'url(#' + gradId + ')',
        style: 'transition:opacity .3s',
      }) : null,
      // 主线（描边动画）
      S('path', {
        d: linePath,
        fill: 'none',
        stroke: lineColor,
        'stroke-width': 2.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        style: 'transition:stroke-dashoffset .6s ease-out',
      }),
      // 十字线
      show(() => hover() >= 0, () =>
        S('line', {
          x1: () => crossX(), x2: () => crossX(),
          y1: pad.top, y2: y0,
          stroke: lineColor, 'stroke-width': 1,
          'stroke-dasharray': '3 3', opacity: .5,
          style: 'transition:opacity .15s',
        })
      ),
      // 数据点
      ...(dots ? pts.map((p, i) =>
        S('circle', {
          key: 'd' + i,
          cx: p.x, cy: p.y,
          r: () => hover() === i ? 6 : 4,
          fill: 'var(--x-bg-elev)',
          stroke: lineColor,
          'stroke-width': 2.5,
          style: 'transition:r .15s;cursor:pointer',
          on: {
            mouseenter: e => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
            },
            mouseleave: () => hover(-1),
          },
        })
      ) : []),
      // 交互热区（整个图表响应鼠标移动）
      S('rect', {
        x: pad.left, y: pad.top, width: chartW, height: chartH,
        fill: 'transparent',
        on: {
          mousemove: e => {
            const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
            const rx = e.clientX - rect.left
            const i = Math.round((rx - pad.left) / step)
            const idx = Math.max(0, Math.min(n - 1, i))
            if (idx !== hover()) hover(idx)
            mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
          },
          mouseleave: () => hover(-1),
        },
      }),
      // X 轴标签
      ...labels.map((l, i) => S('text', {
        key: 'xl' + i,
        x: xOf(i),
        y: h - 10,
        'text-anchor': 'middle', 'font-size': 11,
        fill: 'var(--x-text-mute)',
      }, l)),
      // Tooltip
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x,
        y: () => mouse().y,
        containerW: w,
        title: () => hover() >= 0 ? (labels[hover()] || '') : '',
        items: () => hover() >= 0
          ? [{ color: lineColor, label: '数值', value: formatNum(data[hover()]) }]
          : [],
      }),
    ]
  }

  return wrap({ title }, ChartShell({ width: props.width, height, children: inner }))
}

// ================================================================
// 饼图 / 环形图
// ================================================================
export function PieChart(props) { return PieBase({ ...props, donut: false }) }
export function DonutChart(props) { return PieBase({ ...props, donut: true }) }

function PieBase(props) {
  const { data = [], donut = false, size = 240, title, legend = true } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })
  const disabled = signal(new Set())
  const activeData = () => data.filter(d => !disabled().has(d.label))

  const toggle = k => {
    const s = new Set(disabled())
    s.has(k) ? s.delete(k) : s.add(k)
    disabled(s)
  }

  const inner = (ctx) => {
    const { h } = ctx
    const sz = Math.min(size, h)
    const cx = sz / 2, cy = sz / 2
    const r = sz / 2 - 12
    const ir = donut ? r * 0.6 : 0
    const list = activeData()
    const total = list.reduce((s, d) => s + (d.value || 0), 0) || 1

    let a = -Math.PI / 2
    const slices = list.map((d, i) => {
      const idx = data.indexOf(d)
      const angle = (d.value / total) * Math.PI * 2
      const color = d.color || pickColor(idx)
      const isHover = () => hover() === idx
      const a0 = a, a1 = a + angle
      a = a1

      // 放大偏移
      const midAngle = (a0 + a1) / 2
      const offX = () => isHover() ? Math.cos(midAngle) * 6 : 0
      const offY = () => isHover() ? Math.sin(midAngle) * 6 : 0

      const path = arcPath(cx, cy, r, ir, a0, a1)

      return S('g', { key: idx,
        on: {
          mouseenter: e => {
            hover(idx)
            const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
            mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
          },
          mouseleave: () => hover(-1),
        }
      },
        S('path', {
          d: path,
          fill: color,
          stroke: 'var(--x-bg-elev)',
          'stroke-width': 2,
          style: () => 'cursor:pointer;transition:transform .2s, filter .2s, opacity .2s;' +
            `transform:translate(${offX()}px,${offY()}px);` +
            (hover() === -1 || isHover() ? '' : 'opacity:.35;'),
        })
      )
    })

    return [
      ...slices,
      // 中心百分比（环形）
      donut && hover() >= 0 ? S('text', {
        x: cx, y: cy + 6,
        'text-anchor': 'middle', 'font-size': sz / 6,
        'font-weight': 700, fill: 'var(--x-text)',
      }, Math.round(data[hover()].value / total * 100) + '%') : null,
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x,
        y: () => mouse().y,
        containerW: ctx.w,
        title: () => hover() >= 0 ? (data[hover()].label || '') : '',
        items: () => hover() >= 0
          ? [{ color: data[hover()].color || pickColor(hover()), label: '值', value: formatNum(data[hover()].value) + ' (' + Math.round(data[hover()].value / total * 100) + '%)' }]
          : [],
      }),
    ]
  }

  const legendItems = data.map((d, i) => ({ key: d.label, label: d.label, color: d.color || pickColor(i) }))
  const active = () => { const s = new Set(); for (const d of data) if (!disabled().has(d.label)) s.add(d.label); return s }

  return wrap({ title }, ChartShell({
    width: props.width, height: props.height || size,
    children: inner,
    legend,
    legendItems,
    legendActive: active,
    onLegendToggle: toggle,
  }))
}

function polar(cx, cy, r, a) { return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) } }
function arcPath(cx, cy, r, ir, a0, a1) {
  const p0 = polar(cx, cy, r, a0), p1 = polar(cx, cy, r, a1)
  const large = a1 - a0 > Math.PI ? 1 : 0
  if (ir > 0) {
    const i0 = polar(cx, cy, ir, a1), i1 = polar(cx, cy, ir, a0)
    return `M${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} L${i0.x},${i0.y} A${ir},${ir} 0 ${large} 0 ${i1.x},${i1.y} Z`
  }
  return `M${cx},${cy} L${p0.x},${p0.y} A${r},${r} 0 ${large} 1 ${p1.x},${p1.y} Z`
}

// ================================================================
// 环形进度（动画）
// ================================================================
export function RingProgress(props) {
  const { value = 0, size = 140, stroke = 12, color, label, title, animate = true } = px(props)
  const shown = signal(animate ? 0 : value)

  effect(() => {
    const target = value
    if (!animate) { shown(target); return }
    const start = shown()
    const duration = 600
    const t0 = performance.now()
    let raf
    const tick = now => {
      const p = Math.min(1, (now - t0) / duration)
      const ease = 1 - Math.pow(1 - p, 3)
      shown(start + (target - start) * ease)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    onCleanup(() => cancelAnimationFrame(raf))
  }, [value])

  const inner = (ctx) => {
    const sz = Math.min(size, ctx.h)
    const r = (sz - stroke) / 2
    const c = 2 * Math.PI * r
    const pct = () => Math.min(1, Math.max(0, shown() / 100))
    const cx = sz / 2, cy = sz / 2
    const col = color || 'var(--x-primary)'
    return [
      S('circle', { cx, cy, r, fill: 'none', stroke: 'var(--x-bg-soft)', 'stroke-width': stroke }),
      S('circle', {
        cx, cy, r, fill: 'none',
        stroke: col,
        'stroke-width': stroke,
        'stroke-linecap': 'round',
        'stroke-dasharray': c,
        'stroke-dashoffset': () => c * (1 - pct()),
        transform: `rotate(-90 ${cx} ${cy})`,
      }),
      S('text', {
        x: cx, y: cy + (label ? -2 : 8),
        'text-anchor': 'middle',
        'font-size': sz / 5,
        'font-weight': 700,
        fill: 'var(--x-text)',
      }, () => Math.round(shown()) + '%'),
      label ? S('text', {
        x: cx, y: cy + 22,
        'text-anchor': 'middle', 'font-size': 12,
        fill: 'var(--x-text-mute)',
      }, label) : null,
    ]
  }

  return wrap({ title }, ChartShell({ width: props.width, height: props.height || size, children: inner }))
}

// ================================================================
// 迷你折线
// ================================================================
export function Sparkline(props) {
  const { data = [], width = 120, height = 40, color, area = false, strokeWidth = 2 } = px(props)
  const max = Math.max(...data, 0), min = Math.min(...data, 0)
  const range = max - min || 1
  const step = data.length > 1 ? width / (data.length - 1) : 0
  const pts = data.map((v, i) => ({ x: i * step, y: height - ((v - min) / range) * (height - 6) - 3 }))
  const linePath = 'M' + pts.map(p => p.x.toFixed(2) + ',' + p.y.toFixed(2)).join(' L')
  const areaPath = linePath + ` L${width},${height} L0,${height} Z`
  const gid = uid('spark')
  const col = color || 'var(--x-primary)'
  return S('svg', { viewBox: `0 0 ${width} ${height}`, width, height, style: 'display:block;overflow:visible' },
    area ? S('defs', null,
      S('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 },
        S('stop', { offset: '0%', 'stop-color': col, 'stop-opacity': .3 }),
        S('stop', { offset: '100%', 'stop-color': col, 'stop-opacity': 0 })
      )
    ) : null,
    area ? S('path', { d: areaPath, fill: 'url(#' + gid + ')' }) : null,
    S('path', { d: linePath, fill: 'none', stroke: col, 'stroke-width': strokeWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
  )
}

// ================================================================
// 雷达图
// ================================================================
export function RadarChart(props) {
  const { data = [], size = 260, levels = 4, max, color, fillOpacity = 0.25, title } = px(props)
  const hover = signal(-1)
  const inner = (ctx) => {
    const sz = Math.min(size, ctx.h)
    const cx = sz / 2, cy = sz / 2, r = sz / 2 - 40
    const n = data.length || 1
    const mx = max || Math.max(...data.map(d => d.value), 1)
    const angle = i => (Math.PI * 2 * i / n) - Math.PI / 2
    const pt = (i, v) => ({ x: cx + Math.cos(angle(i)) * r * (v / mx), y: cy + Math.sin(angle(i)) * r * (v / mx) })
    const col = color || 'var(--x-primary)'

    const grids = []
    for (let l = 1; l <= levels; l++) {
      const pts = Array.from({ length: n }, (_, i) => { const p = pt(i, mx * l / levels); return p.x + ',' + p.y }).join(' ')
      grids.push(S('polygon', { key: 'g' + l, points: pts, fill: 'none', stroke: 'var(--x-border)', 'stroke-width': 1, 'stroke-dasharray': l === levels ? '0' : '2 3' }))
    }
    const spokes = Array.from({ length: n }, (_, i) => {
      const p = pt(i, mx)
      return S('line', { key: 's' + i, x1: cx, y1: cy, x2: p.x, y2: p.y, stroke: 'var(--x-border)', 'stroke-width': 1 })
    })
    const dataPts = data.map((d, i) => pt(i, d.value))
    const poly = dataPts.map(p => p.x + ',' + p.y).join(' ')
    const labels = data.map((d, i) => {
      const p = pt(i, mx * 1.18)
      return S('text', { key: 'l' + i, x: p.x, y: p.y + 4, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--x-text-dim)' }, d.label || '')
    })

    return [
      ...grids, ...spokes,
      S('polygon', {
        points: poly,
        fill: col, 'fill-opacity': fillOpacity,
        stroke: col, 'stroke-width': 2,
        style: 'transition:all .3s',
      }),
      ...dataPts.map((p, i) =>
        S('circle', {
          key: 'c' + i, cx: p.x, cy: p.y,
          r: () => hover() === i ? 6 : 4,
          fill: 'var(--x-bg-elev)',
          stroke: col, 'stroke-width': 2,
          style: 'transition:r .15s;cursor:pointer',
          on: {
            mouseenter: () => hover(i),
            mouseleave: () => hover(-1),
          },
        },
          S('title', null, (data[i].label || '') + ': ' + data[i].value)
        )
      ),
      ...labels,
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height: props.height || size, children: inner }))
}

// ================================================================
// 仪表盘
// ================================================================
export function GaugeChart(props) {
  const { value = 0, size = 200, stroke = 18, color, min = 0, max = 100, label, title, zones } = px(props)
  const shown = signal(value)
  effect(() => {
    const target = value, start = shown(), duration = 500
    const t0 = performance.now()
    let raf
    const tick = now => {
      const p = Math.min(1, (now - t0) / duration)
      const ease = 1 - Math.pow(1 - p, 3)
      shown(start + (target - start) * ease)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    onCleanup(() => cancelAnimationFrame(raf))
  }, [value])

  const inner = (ctx) => {
    const sz = Math.min(size, ctx.h)
    const cx = sz / 2, cy = sz / 2 + 10
    const r = sz / 2 - stroke - 4
    const pct = () => Math.min(1, Math.max(0, (shown() - min) / (max - min)))
    const a0 = Math.PI, a1 = Math.PI * 2
    const pEnd = () => a0 + (a1 - a0) * pct()
    const pTrack = polar(cx, cy, r, a0)
    const pTrackEnd = polar(cx, cy, r, a1)
    const col = color || 'var(--x-primary)'

    return [
      S('path', {
        d: `M${pTrack.x},${pTrack.y} A${r},${r} 0 0 1 ${pTrackEnd.x},${pTrackEnd.y}`,
        fill: 'none', stroke: 'var(--x-bg-soft)', 'stroke-width': stroke, 'stroke-linecap': 'round',
      }),
      S('path', {
        d: () => { const pe = polar(cx, cy, r, pEnd()); return `M${pTrack.x},${pTrack.y} A${r},${r} 0 ${pct() > 0.5 ? 1 : 0} 1 ${pe.x},${pe.y}` },
        fill: 'none', stroke: col, 'stroke-width': stroke, 'stroke-linecap': 'round',
      }),
      S('text', {
        x: cx, y: cy - 6,
        'text-anchor': 'middle', 'font-size': sz / 6,
        'font-weight': 700, fill: 'var(--x-text)',
      }, () => Math.round(shown())),
      label ? S('text', {
        x: cx, y: cy + 16,
        'text-anchor': 'middle', 'font-size': 12,
        fill: 'var(--x-text-mute)',
      }, label) : null,
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height: props.height || size, children: inner }))
}

// ================================================================
// 散点图
// ================================================================
export function ScatterChart(props) {
  const { data = [], height = 240, color, title } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })
  const inner = (ctx) => {
    const { w, h } = ctx
    const pad = { top: 20, right: 20, bottom: 32, left: 44 }
    const cw = w - pad.left - pad.right
    const ch = h - pad.top - pad.bottom
    const xs = data.map(d => d.x), ys = data.map(d => d.y)
    const xmin = Math.min(...xs, 0), xmax = niceMax(Math.max(...xs, 1))
    const ymax = niceMax(Math.max(...ys, 0))
    const sx = v => pad.left + ((v - xmin) / ((xmax - xmin) || 1)) * cw
    const sy = v => pad.top + ch - (v / ymax) * ch
    const col = color || 'var(--x-primary)'
    return [
      ...Array.from({ length: 5 }, (_, i) => S('line', {
        key: 'g' + i, x1: pad.left, x2: w - pad.right,
        y1: pad.top + ch * i / 4, y2: pad.top + ch * i / 4,
        stroke: 'var(--x-border)', 'stroke-width': 1, 'stroke-dasharray': '3 3',
      })),
      ...data.map((d, i) =>
        S('circle', {
          key: i, cx: sx(d.x), cy: sy(d.y),
          r: () => hover() === i ? (d.r || 6) + 3 : (d.r || 6),
          fill: d.color || col, 'fill-opacity': .8,
          stroke: 'var(--x-bg-elev)', 'stroke-width': 1.5,
          style: 'cursor:pointer;transition:r .15s',
          on: {
            mouseenter: e => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
            },
            mouseleave: () => hover(-1),
          },
        })
      ),
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x,
        y: () => mouse().y,
        containerW: w,
        items: () => hover() >= 0
          ? [{ color: data[hover()].color || col, label: 'x', value: data[hover()].x + ', y=' + data[hover()].y }]
          : [],
      }),
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height, children: inner }))
}

// ================================================================
// 热力图
// ================================================================
export function Heatmap(props) {
  const { data = [], rows = 7, cols = 12, cell = 24, gap = 3, colors, min, max, title } = px(props)
  const hover = signal(null)
  const mouse = signal({ x: 0, y: 0 })
  const inner = (ctx) => {
    const flat = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) flat.push((data[r] && data[r][c]) || 0)
    const mx = max ?? Math.max(...flat, 1)
    const mn = min ?? 0
    const range = mx - mn || 1
    const palette = colors || ['#e5e7eb', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5']
    const cells = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = (data[r] && data[r][c]) || 0
        const idx = Math.min(palette.length - 1, Math.floor((v - mn) / range * palette.length))
        const isHover = () => hover() && hover().r === r && hover().c === c
        cells.push(S('rect', {
          key: r + '-' + c,
          x: c * (cell + gap), y: r * (cell + gap),
          width: cell, height: cell, rx: 4,
          fill: palette[Math.max(0, idx)],
          style: () => 'cursor:pointer;transition:opacity .15s;' +
            (hover() && !isHover() ? 'opacity:.4' : ''),
          on: {
            mouseenter: e => {
              hover({ r, c, v })
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 })
            },
            mouseleave: () => hover(null),
          },
        }))
      }
    }
    const w = cols * (cell + gap)
    return [
      ...cells,
      Tooltip({
        visible: () => !!hover(),
        x: () => mouse().x,
        y: () => mouse().y,
        containerW: ctx.w,
        items: () => hover() ? [{ color: 'var(--x-primary)', label: `[${hover().r},${hover().c}]`, value: String(hover().v) }] : [],
      }),
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height: rows * (cell + gap) + 8, children: inner }))
}

// ================================================================
// 瀑布图
// ================================================================
export function WaterfallChart(props) {
  const { data = [], labels = [], height = 240, title } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })
  const inner = (ctx) => {
    const { w, h } = ctx
    const pad = { top: 20, right: 20, bottom: 32, left: 44 }
    const cw = w - pad.left - pad.right
    const ch = h - pad.top - pad.bottom
    let cum = 0
    const items = data.map(v => { const s = cum; cum += v; return { start: s, end: cum, v } })
    const allV = items.flatMap(it => [it.start, it.end])
    const maxV = niceMax(Math.max(...allV, 0))
    const minV = Math.min(...allV, 0)
    const range = maxV - minV || 1
    const yOf = v => pad.top + ch - ((v - minV) / range) * ch
    const n = data.length || 1
    const slot = cw / n
    const bw = Math.min(50, slot * 0.6)
    return [
      ...Array.from({ length: 5 }, (_, i) => {
        const y = pad.top + ch * i / 4
        return S('line', { key: 'g' + i, x1: pad.left, x2: w - pad.right, y1: y, y2: y,
          stroke: 'var(--x-border)', 'stroke-width': 1, 'stroke-dasharray': i === 4 ? '0' : '3 3' })
      }),
      ...items.map((it, i) => {
        const x = pad.left + slot * i + (slot - bw) / 2
        const top = Math.min(yOf(it.start), yOf(it.end))
        const bot = Math.max(yOf(it.start), yOf(it.end))
        const isHover = () => hover() === i
        const col = it.v >= 0 ? 'var(--x-success)' : 'var(--x-danger)'
        return S('g', { key: i,
          on: {
            mouseenter: e => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
            },
            mouseleave: () => hover(-1),
          }
        },
          S('rect', { x, y: top, width: bw, height: Math.max(2, bot - top), fill: col, rx: 3,
            style: () => 'cursor:pointer;transition:opacity .15s;' + (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:.35') }),
          S('text', { x: x + bw / 2, y: top - 6, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600,
            fill: 'var(--x-text)', style: () => 'transition:opacity .15s;' + (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:0') },
            (it.v > 0 ? '+' : '') + it.v),
          labels[i] ? S('text', { x: x + bw / 2, y: h - 10, 'text-anchor': 'middle', 'font-size': 11,
            fill: 'var(--x-text-mute)' }, labels[i]) : null
        )
      }),
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x, y: () => mouse().y, containerW: w,
        title: () => hover() >= 0 ? labels[hover()] : '',
        items: () => hover() >= 0 ? [{ color: data[hover()] >= 0 ? 'var(--x-success)' : 'var(--x-danger)', label: '变化', value: (data[hover()] > 0 ? '+' : '') + data[hover()] }] : [],
      }),
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height, children: inner }))
}

// ================================================================
// 漏斗图
// ================================================================
export function FunnelChart(props) {
  const { data = [], width = 340, height = 260, colors, title } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })
  const inner = (ctx) => {
    const w = Math.min(width, ctx.w)
    const h = ctx.h
    const n = data.length || 1
    const max = Math.max(...data.map(d => d.value), 1)
    const step = h / n
    return [
      ...data.map((d, i) => {
        const wTop = (d.value / max) * (w - 40)
        const wBot = i < n - 1 ? (data[i + 1].value / max) * (w - 40) : wTop * 0.6
        const y = i * step
        const p = `M${(w - wTop) / 2},${y} L${(w + wTop) / 2},${y} L${(w + wBot) / 2},${y + step} L${(w - wBot) / 2},${y + step} Z`
        const col = d.color || pickColor(i, colors)
        const isHover = () => hover() === i
        return S('g', { key: i,
          on: {
            mouseenter: e => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
            },
            mouseleave: () => hover(-1),
          }
        },
          S('path', { d: p, fill: col,
            style: () => 'cursor:pointer;transition:opacity .15s, transform .15s;' +
              (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:.35;') }),
          S('text', { x: w / 2, y: y + step / 2 + 4, 'text-anchor': 'middle', 'font-size': 13,
            fill: '#fff', 'font-weight': 600 }, (d.label || '') + ' ' + d.value)
        )
      }),
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x, y: () => mouse().y, containerW: w,
        items: () => hover() >= 0
          ? [{ color: data[hover()].color || pickColor(hover(), colors), label: data[hover()].label || '', value: String(data[hover()].value) }]
          : [],
      }),
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height, children: inner }))
}

// ================================================================
// 树图
// ================================================================
export function Treemap(props) {
  const { data = [], width = 400, height = 240, colors, title } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })
  const inner = (ctx) => {
    const w = Math.min(width, ctx.w)
    const h = ctx.h
    const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1
    let x = 0
    return [
      ...data.map((d, i) => {
        const bw = (d.value / total) * w
        const col = d.color || pickColor(i, colors)
        const isHover = () => hover() === i
        const g = S('g', { key: i,
          on: {
            mouseenter: e => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
            },
            mouseleave: () => hover(-1),
          }
        },
          S('rect', { x, y: 0, width: bw, height: h, fill: col,
            stroke: 'var(--x-bg-elev)', 'stroke-width': 2,
            style: () => 'cursor:pointer;transition:opacity .15s;' +
              (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:.35') }),
          bw > 60 ? S('text', { x: x + bw / 2, y: h / 2 - 6, 'text-anchor': 'middle',
            'font-size': 14, fill: '#fff', 'font-weight': 600 }, d.label || '') : null,
          bw > 60 ? S('text', { x: x + bw / 2, y: h / 2 + 14, 'text-anchor': 'middle',
            'font-size': 12, fill: 'rgba(255,255,255,.8)' }, formatNum(d.value)) : null
        )
        x += bw
        return g
      }),
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x, y: () => mouse().y, containerW: w,
        items: () => hover() >= 0
          ? [{ color: data[hover()].color || pickColor(hover(), colors), label: data[hover()].label || '', value: formatNum(data[hover()].value) }]
          : [],
      }),
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height, children: inner }))
}

// ================================================================
// 蜡烛图
// ================================================================
export function CandlestickChart(props) {
  const { data = [], labels = [], height = 260, title } = px(props)
  const hover = signal(-1)
  const mouse = signal({ x: 0, y: 0 })
  const inner = (ctx) => {
    const { w, h } = ctx
    const pad = { top: 20, right: 20, bottom: 32, left: 44 }
    const cw = w - pad.left - pad.right
    const ch = h - pad.top - pad.bottom
    const maxV = niceMax(Math.max(...data.map(d => d.high), 0))
    const minV = Math.min(...data.map(d => d.low), 0)
    const range = maxV - minV || 1
    const yOf = v => pad.top + ch - ((v - minV) / range) * ch
    const n = data.length || 1
    const slot = cw / n
    const bw = Math.min(20, slot * 0.6)
    return [
      ...Array.from({ length: 5 }, (_, i) => {
        const y = pad.top + ch * i / 4
        return S('line', { key: 'g' + i, x1: pad.left, x2: w - pad.right, y1: y, y2: y,
          stroke: 'var(--x-border)', 'stroke-width': 1, 'stroke-dasharray': '3 3' })
      }),
      ...data.map((d, i) => {
        const x = pad.left + slot * i + slot / 2
        const up = d.close >= d.open
        const col = up ? 'var(--x-success)' : 'var(--x-danger)'
        const yHigh = yOf(d.high), yLow = yOf(d.low)
        const yO = yOf(d.open), yC = yOf(d.close)
        const yTop = Math.min(yO, yC), yBot = Math.max(yO, yC)
        const isHover = () => hover() === i
        return S('g', { key: i,
          on: {
            mouseenter: e => {
              hover(i)
              const rect = e.currentTarget.ownerSVGElement.getBoundingClientRect()
              mouse({ x: e.clientX - rect.left, y: e.clientY - rect.top - 12 })
            },
            mouseleave: () => hover(-1),
          }
        },
          S('line', { x1: x, x2: x, y1: yHigh, y2: yLow, stroke: col, 'stroke-width': 1.5,
            style: () => 'transition:opacity .15s;' + (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:.35') }),
          S('rect', { x: x - bw / 2, y: yTop, width: bw, height: Math.max(2, yBot - yTop),
            fill: col, style: () => 'cursor:pointer;transition:opacity .15s;' + (hover() === -1 || isHover() ? 'opacity:1' : 'opacity:.35') }),
          labels[i] ? S('text', { x, y: h - 10, 'text-anchor': 'middle', 'font-size': 11,
            fill: 'var(--x-text-mute)' }, labels[i]) : null
        )
      }),
      Tooltip({
        visible: () => hover() >= 0,
        x: () => mouse().x, y: () => mouse().y, containerW: w,
        title: () => hover() >= 0 ? labels[hover()] : '',
        items: () => {
          if (hover() < 0) return []
          const d = data[hover()]
          return [
            { color: 'var(--x-text-dim)', label: '开', value: String(d.open) },
            { color: 'var(--x-success)', label: '高', value: String(d.high) },
            { color: 'var(--x-danger)', label: '低', value: String(d.low) },
            { color: d.close >= d.open ? 'var(--x-success)' : 'var(--x-danger)', label: '收', value: String(d.close) },
          ]
        },
      }),
    ]
  }
  return wrap({ title }, ChartShell({ width: props.width, height, children: inner }))
}

// ================================================================
// SVG 原语
// ================================================================
export const Svg = (props, ...c) => S('svg', px(props), ...c)
export const G = (props, ...c) => S('g', px(props), ...c)
export const Rect = props => S('rect', px(props))
export const Circle = props => S('circle', px(props))
export const Ellipse = props => S('ellipse', px(props))
export const SvgLine = props => S('line', px(props))
export const Path = props => S('path', px(props))
export const Polygon = props => S('polygon', px(props))
export const Polyline = props => S('polyline', px(props))
export const SvgText = (props, ...c) => S('text', px(props), ...c)
export const Defs = (props, ...c) => S('defs', px(props), ...c)
