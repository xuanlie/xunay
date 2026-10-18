// @xunay/kit/charts/boxplot —— 精修版箱线图
// 特性：5 数概括 · 异常值识别 · 水平/垂直 · 均值标记 · 悬停高亮 · 
//      抖动散点 · tooltip · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'bx-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

function fmt(v, digits) {
  if (v == null || isNaN(v)) return ''
  if (digits != null) return Number(v).toFixed(digits)
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Number(v).toFixed(Math.abs(v) < 10 ? 2 : 0))
}

function quantile(sorted, q) {
  if (!sorted.length) return 0
  const idx = (sorted.length - 1) * q
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function computeStats(values) {
  const sorted = values.slice().sort((a, b) => a - b)
  const n = sorted.length
  if (!n) return null
  const min = sorted[0]
  const max = sorted[n - 1]
  const q1 = quantile(sorted, 0.25)
  const med = quantile(sorted, 0.5)
  const q3 = quantile(sorted, 0.75)
  const iqr = q3 - q1
  const loFence = q1 - iqr * 1.5
  const hiFence = q3 + iqr * 1.5
  // 胡须：在围栏内的最远点
  let whiskLow = min
  let whiskHigh = max
  for (const v of sorted) if (v >= loFence) { whiskLow = v; break }
  for (let i = n - 1; i >= 0; i--) if (sorted[i] <= hiFence) { whiskHigh = sorted[i]; break }
  const outliers = sorted.filter(v => v < loFence || v > hiFence)
  const mean = values.reduce((a, b) => a + b, 0) / n
  return { min, max, q1, med, q3, iqr, loFence, hiFence, whiskLow, whiskHigh, outliers, mean, count: n, sorted }
}

function niceScale(min, max, count = 5) {
  if (max === min) max = min + 1
  const range = max - min
  const rough = range / count
  const exp = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / exp
  let step
  if (norm < 1.5) step = 1
  else if (norm < 3) step = 2
  else if (norm < 7) step = 5
  else step = 10
  step *= exp
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks = []
  for (let v = niceMin; v <= niceMax + step * 1e-6; v += step) ticks.push(Number(v.toFixed(10)))
  return { min: niceMin, max: niceMax, ticks }
}

export class BoxplotChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[BoxplotChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 400,
      padding: { top: 24, right: 24, bottom: 48, left: 52 },
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'],
      direction: 'vertical',    // 'vertical' | 'horizontal'
      boxWidth: 0.5,            // 0-0.9，相对 slot 的宽度
      boxRadius: 4,
      showMean: true,           // 显示均值
      meanStyle: 'diamond',     // 'diamond' | 'cross' | 'dash'
      showOutliers: true,
      outlierRadius: 3,
      showJitter: false,        // 显示原始点（抖动）
      jitterAmount: 0.35,
      jitterRadius: 2,
      grid: true,
      gridDash: '3 4',
      yTicks: 5,
      yFormat: v => fmt(v),
      xFormat: v => String(v),
      tooltip: true,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 60 },
      onHover: null,
      onBoxClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._groups = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._boxEls = []
    this._outlierEls = []
    this._jitterEls = []

    this._build()
    if (options.data || options.groups) this.setData(options)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155', boxStroke: '#0a0e17',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1', boxStroke: '#fff',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
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
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(input) {
    // 支持：
    //   { groups: [{ label, values: [...] }] }
    //   { data: [[1,2,3], [4,5,6]] }  (二维数组)
    let groups = []
    if (input.groups) {
      groups = input.groups.map((g, i) => ({
        label: g.label != null ? g.label : '组 ' + (i + 1),
        values: g.values || [],
        color: g.color,
      }))
    } else if (Array.isArray(input.data)) {
      if (Array.isArray(input.data[0])) {
        groups = input.data.map((vals, i) => ({
          label: (input.labels && input.labels[i]) || '组 ' + (i + 1),
          values: vals,
        }))
      } else {
        groups = [{ label: input.label || '数据', values: input.data }]
      }
    }
    this._groups = groups.map(g => ({ ...g, stats: computeStats(g.values) }))
    this.render()
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    this.render()
    return this
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }
    this._measure()

    const W = this.W, H = this.H
    const pad = this.opts.padding

    this.svg.innerHTML = ''
    this._boxEls = []
    this._outlierEls = []
    this._jitterEls = []

    const groups = this._groups.filter(g => g.stats)
    if (!groups.length) return

    const horizontal = this.opts.direction === 'horizontal'
    const plot = {
      x: pad.left,
      y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }

    // 值范围
    let vMin = Infinity, vMax = -Infinity
    for (const g of groups) {
      if (g.stats.min < vMin) vMin = g.stats.min
      if (g.stats.max > vMax) vMax = g.stats.max
      for (const o of g.stats.outliers) {
        if (o < vMin) vMin = o
        if (o > vMax) vMax = o
      }
    }
    if (!isFinite(vMin)) { vMin = 0; vMax = 1 }
    const scale = niceScale(vMin, vMax, this.opts.yTicks)

    const valueToPos = (v) => {
      const t = (v - scale.min) / (scale.max - scale.min)
      return horizontal ? plot.x + t * plot.w : plot.y + plot.h - t * plot.h
    }

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 网格 + 刻度
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of scale.ticks) {
        const p = valueToPos(tick)
        const line = horizontal
          ? { x1: p, x2: p, y1: plot.y, y2: plot.y + plot.h }
          : { x1: plot.x, x2: plot.x + plot.w, y1: p, y2: p }
        g.appendChild(el('line', {
          ...line,
          stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': this.opts.gridDash,
        }))
        const t = el('text', {
          x: horizontal ? p : plot.x - 10,
          y: horizontal ? plot.y + plot.h + 22 : p + 4,
          'text-anchor': horizontal ? 'middle' : 'end',
          'font-size': 11,
          'font-family': 'inherit',
          fill: this.theme.textMuted,
        })
        t.textContent = this.opts.yFormat(tick)
        g.appendChild(t)
      }
      this.svg.appendChild(g)
    }

    // 轴
    this.svg.appendChild(el('line', horizontal
      ? { x1: plot.x, x2: plot.x, y1: plot.y, y2: plot.y + plot.h }
      : { x1: plot.x, x2: plot.x + plot.w, y1: plot.y + plot.h, y2: plot.y + plot.h },
      { stroke: this.theme.axis, 'stroke-width': 1 }))

    // ===== 分组 =====
    const slot = (horizontal ? plot.h : plot.w) / groups.length
    const boxW = slot * this.opts.boxWidth
    const innerW = (horizontal ? plot.h : plot.w)
    const origin = horizontal ? plot.y : plot.x

    const g = el('g')
    this.svg.appendChild(g)

    groups.forEach((grp, i) => {
      const s = grp.stats
      const color = grp.color || this.opts.colors[i % this.opts.colors.length]
      const center = origin + slot * (i + 0.5)
      const halfW = boxW / 2

      const groupEl = el('g', { style: 'cursor:pointer' })
      groupEl._meta = { group: grp, index: i, color }

      // 计算几何
      const q1p = valueToPos(s.q1)
      const q3p = valueToPos(s.q3)
      const medp = valueToPos(s.med)
      const loP = valueToPos(s.whiskLow)
      const hiP = valueToPos(s.whiskHigh)
      const meanP = valueToPos(s.mean)

      // 箱体位置
      let boxX, boxY, boxWid, boxHei
      if (horizontal) {
        boxX = Math.min(q1p, q3p)
        boxY = center - halfW
        boxWid = Math.abs(q3p - q1p)
        boxHei = boxW
      } else {
        boxX = center - halfW
        boxY = Math.min(q1p, q3p)
        boxWid = boxW
        boxHei = Math.abs(q3p - q1p)
      }

      // 渐变
      const defs = this.svg.querySelector('defs') || this.svg.insertBefore(el('defs'), this.svg.firstChild)
      const gid = uid()
      const grad = el('linearGradient', horizontal
        ? { id: gid, x1: '0', y1: '0', x2: '1', y2: '0' }
        : { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' })
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.85 }))
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0.6 }))
      defs.appendChild(grad)

      // 胡须（上）
      if (horizontal) {
        groupEl.appendChild(el('line', {
          x1: Math.min(q3p, hiP), x2: Math.max(q3p, hiP),
          y1: center, y2: center,
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
        groupEl.appendChild(el('line', {
          x1: hiP, x2: hiP, y1: center - halfW * 0.5, y2: center + halfW * 0.5,
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
        // 胡须（下）
        groupEl.appendChild(el('line', {
          x1: Math.min(q1p, loP), x2: Math.max(q1p, loP),
          y1: center, y2: center,
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
        groupEl.appendChild(el('line', {
          x1: loP, x2: loP, y1: center - halfW * 0.5, y2: center + halfW * 0.5,
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
      } else {
        groupEl.appendChild(el('line', {
          x1: center, x2: center,
          y1: Math.min(q3p, hiP), y2: Math.max(q3p, hiP),
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
        groupEl.appendChild(el('line', {
          x1: center - halfW * 0.5, x2: center + halfW * 0.5,
          y1: hiP, y2: hiP,
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
        groupEl.appendChild(el('line', {
          x1: center, x2: center,
          y1: Math.min(q1p, loP), y2: Math.max(q1p, loP),
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
        groupEl.appendChild(el('line', {
          x1: center - halfW * 0.5, x2: center + halfW * 0.5,
          y1: loP, y2: loP,
          stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round',
        }))
      }

      // 抖动散点（背景层）
      if (this.opts.showJitter) {
        const ja = this.opts.jitterAmount
        s.sorted.forEach((v, k) => {
          const p = valueToPos(v)
          const jitter = (Math.random() - 0.5) * boxW * ja
          const jx = horizontal ? p : center + jitter
          const jy = horizontal ? center + jitter : p
          const dot = el('circle', {
            cx: jx, cy: jy, r: this.opts.jitterRadius,
            fill: color, opacity: 0.35,
          })
          groupEl.appendChild(dot)
          this._jitterEls.push(dot)
        })
      }

      // 箱体
      const box = el('rect', {
        x: boxX, y: boxY, width: boxWid, height: boxHei,
        rx: this.opts.boxRadius,
        fill: `url(#${gid})`,
        stroke: color, 'stroke-width': 2,
        style: 'transition:filter .15s',
      })
      groupEl.appendChild(box)
      this._boxEls.push({ el: box, meta: { index: i, color }, rect: { x: boxX, y: boxY, w: boxWid, h: boxHei } })

      // 中位线
      if (horizontal) {
        groupEl.appendChild(el('line', {
          x1: medp, x2: medp, y1: center - halfW, y2: center + halfW,
          stroke: this.theme.boxStroke, 'stroke-width': 2.5, 'stroke-linecap': 'round',
        }))
      } else {
        groupEl.appendChild(el('line', {
          x1: center - halfW, x2: center + halfW, y1: medp, y2: medp,
          stroke: this.theme.boxStroke, 'stroke-width': 2.5, 'stroke-linecap': 'round',
        }))
      }

      // 均值
      if (this.opts.showMean) {
        if (this.opts.meanStyle === 'diamond') {
          const d = 4
          const pts = horizontal
            ? `${meanP},${center - d} ${meanP + d},${center} ${meanP},${center + d} ${meanP - d},${center}`
            : `${center - d},${meanP} ${center},${meanP - d} ${center + d},${meanP} ${center},${meanP + d}`
          groupEl.appendChild(el('polygon', {
            points: pts,
            fill: 'none',
            stroke: this.theme.boxStroke,
            'stroke-width': 2,
          }))
        } else if (this.opts.meanStyle === 'cross') {
          const d = 5
          groupEl.appendChild(el('line', {
            x1: horizontal ? meanP - d : center - d,
            x2: horizontal ? meanP + d : center + d,
            y1: horizontal ? center - d : meanP - d,
            y2: horizontal ? center + d : meanP + d,
            stroke: this.theme.boxStroke, 'stroke-width': 2,
          }))
          groupEl.appendChild(el('line', {
            x1: horizontal ? meanP - d : center + d,
            x2: horizontal ? meanP + d : center - d,
            y1: horizontal ? center + d : meanP - d,
            y2: horizontal ? center - d : meanP + d,
            stroke: this.theme.boxStroke, 'stroke-width': 2,
          }))
        } else {
          if (horizontal) {
            groupEl.appendChild(el('line', {
              x1: meanP, x2: meanP, y1: center - halfW * 0.7, y2: center + halfW * 0.7,
              stroke: this.theme.boxStroke, 'stroke-width': 2, 'stroke-dasharray': '4 3',
            }))
          } else {
            groupEl.appendChild(el('line', {
              x1: center - halfW * 0.7, x2: center + halfW * 0.7, y1: meanP, y2: meanP,
              stroke: this.theme.boxStroke, 'stroke-width': 2, 'stroke-dasharray': '4 3',
            }))
          }
        }
      }

      // 异常值
      if (this.opts.showOutliers) {
        for (const v of s.outliers) {
          const p = valueToPos(v)
          const cx = horizontal ? p : center
          const cy = horizontal ? center : p
          const dot = el('circle', {
            cx, cy, r: this.opts.outlierRadius,
            fill: 'none',
            stroke: color,
            'stroke-width': 1.5,
          })
          groupEl.appendChild(dot)
          this._outlierEls.push(dot)
        }
      }

      g.appendChild(groupEl)

      // 标签
      const t = el('text', {
        x: horizontal ? plot.x - 10 : center,
        y: horizontal ? center + 4 : plot.y + plot.h + 22,
        'text-anchor': horizontal ? 'end' : 'middle',
        'font-size': 11.5,
        'font-family': 'inherit',
        fill: this.theme.textMuted,
      })
      t.textContent = this.opts.xFormat(grp.label)
      g.appendChild(t)

      // 事件
      groupEl.addEventListener('mouseenter', (e) => {
        this._hover = i
        this._applyHover()
        this._moveTip(e, grp, i)
      })
      groupEl.addEventListener('mousemove', (e) => {
        if (this._hover === i) this._moveTip(e, grp, i)
      })
      groupEl.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      groupEl.addEventListener('click', (e) => {
        if (this.opts.onBoxClick) this.opts.onBoxClick(grp, i, e)
      })
    })

    if (animate) this._animate()

    return this
  }

  _applyHover() {
    for (const b of this._boxEls) {
      const hot = b.meta.index === this._hover
      b.el.style.filter = hot ? 'brightness(1.15)' : (this._hover != null ? 'brightness(0.95)' : '')
      b.el.style.opacity = this._hover == null ? '1' : (hot ? '1' : '0.6')
    }
  }

  _moveTip(e, grp, i) {
    if (!this.tip) return
    const s = grp.stats
    const color = grp.color || this.opts.colors[i % this.opts.colors.length]
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${grp.label}</strong>
      </div>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:12px">
        <span style="opacity:.7">样本数</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${s.count}</strong>
        <span style="opacity:.7">最大值</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.max)}</strong>
        <span style="opacity:.7">上四分位</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.q3)}</strong>
        <span style="opacity:.7">中位数</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.med)}</strong>
        <span style="opacity:.7">下四分位</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.q1)}</strong>
        <span style="opacity:.7">最小值</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.min)}</strong>
        <span style="opacity:.7">均值</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.mean)}</strong>
        <span style="opacity:.7">IQR</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${fmt(s.iqr)}</strong>
        ${s.outliers.length ? `<span style="opacity:.7">异常值</span><strong style="text-align:right;font-variant-numeric:tabular-nums">${s.outliers.length} 个</strong>` : ''}
      </div>
    `
    this.tip.style.opacity = '1'
    const r = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    let left = cx + 14
    let top = cy - th / 2
    if (left + tw > r.width - 4) left = cx - tw - 14
    if (top < 0) top = 4
    if (top + th > r.height) top = r.height - th - 4
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) this.opts.onHover({ group: grp, index: i, stats: s })
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

    const targets = this._boxEls.map((b, i) => {
      const r = b.rect
      const cy = r.y + r.h / 2
      const cx = r.x + r.w / 2
      const delay = (i * stagger) / duration
      return { el: b.el, rect: r, cx, cy, delay }
    })

    targets.forEach(tg => {
      tg.el.setAttribute('transform', `translate(${tg.cx} ${tg.cy}) scaleY(0.02) translate(${-tg.cx} ${-tg.cy})`)
      tg.el.style.opacity = '0.2'
    })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        const sy = 0.02 + 0.98 * e
        const sx = 1
        tg.el.setAttribute('transform', sy >= 1 ? '' : `translate(${tg.cx} ${tg.cy}) scale(${sx},${sy}) translate(${-tg.cx} ${-tg.cy})`)
        tg.el.style.opacity = String(0.2 + 0.8 * e)
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
    this._cancelAnim = () => requestAnimationFrame(tick)
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

export default BoxplotChart
