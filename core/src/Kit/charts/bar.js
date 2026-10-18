// @xunay/kit/charts/bar —— 精修版柱状图
// 特性：分组 · 堆叠 · 水平 · 负值 · 圆角 · 渐变 · 
//      单柱/整列高亮 · 值标签 · 基线参考线 · 动画 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'bar-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
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
  for (let v = niceMin; v <= niceMax + step * 1e-6; v += step) {
    ticks.push(Number(v.toFixed(10)))
  }
  return { min: niceMin, max: niceMax, step, ticks }
}

function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  if (Math.abs(v) < 1) return v.toFixed(2)
  return String(Math.round(v))
}

export class BarChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[BarChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 320,
      padding: { top: 24, right: 20, bottom: 40, left: 52 },
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
      layout: 'grouped',       // 'grouped' | 'stacked' | 'normal'
      direction: 'vertical',   // 'vertical' | 'horizontal'
      radius: 6,
      barPadding: 0.2,         // 组内间距比例 0-0.9
      groupPadding: 0.3,       // 组间距比例
      minBarWidth: 4,
      showValue: false,        // 显示数值
      valueFormat: fmt,
      grid: true,
      gridDash: '3 4',
      tooltip: true,
      legend: true,
      yTicks: 5,
      xFormat: v => String(v),
      yFormat: fmt,
      animation: { duration: 800, easing: 'easeOutCubic', stagger: 20 },
      referenceLines: [],
      highlight: 'single',     // 'single' | 'column'
      onHover: null,
      onBarClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._series = []
    this._labels = []
    this._hidden = new Set()
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._barEls = []
    this._layerRects = []

    this._build()
    if (options.data || options.series || options.labels) {
      this.setData(options)
    }
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      grid: '#1e293b', axis: '#334155',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
      highlightBg: 'rgba(148,163,184,0.08)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      grid: '#e2e8f0', axis: '#cbd5e1',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
      highlightBg: 'rgba(15,23,42,0.04)',
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

    this.legendEl = document.createElement('div')
    this.legendEl.style.cssText = `display:flex;flex-wrap:wrap;gap:18px;font-size:12.5px;color:${this.theme.textMuted};margin-bottom:12px`
    c.appendChild(this.legendEl)

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
    const series = input.series || (input.data ? [{
      name: input.name || '数据',
      data: input.data,
    }] : [])
    this._labels = input.labels || (series[0]?.data || []).map((d, i) =>
      typeof d === 'object' ? (d.label ?? String(i)) : String(i))
    this._series = series.map((s, i) => ({
      name: s.name || `系列 ${i + 1}`,
      color: s.color || this.opts.colors[i % this.opts.colors.length],
      data: (s.data || []).map((d, j) => {
        if (typeof d === 'number') return { value: d, label: this._labels[j] ?? String(j) }
        return {
          value: d.value != null ? d.value : (d.y != null ? d.y : 0),
          label: d.label != null ? d.label : (this._labels[j] ?? String(j)),
          color: d.color,
        }
      }),
    }))
    this._hidden.clear()
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
    const p = {
      x: pad.left, y: pad.top,
      w: W - pad.left - pad.right,
      h: H - pad.top - pad.bottom,
    }

    this.svg.innerHTML = ''
    this._barEls = []
    this._layerRects = []

    const horizontal = this.opts.direction === 'horizontal'
    const visible = this._series.filter((_, i) => !this._hidden.has(i))
    const labels = this._labels
    const groupCount = Math.max(1, labels.length)

    // 值范围
    const vals = visible.flatMap(s => s.data.map(d => d.value)).filter(v => !isNaN(v))
    let yMin = Math.min(0, ...vals)
    let yMax = Math.max(0, ...vals)

    if (this.opts.layout === 'stacked') {
      // 堆叠：计算每组总量
      const totals = new Map()
      for (const s of visible) {
        s.data.forEach((d, i) => {
          const k = labels[i] ?? i
          const cur = totals.get(k) || { pos: 0, neg: 0 }
          if (d.value > 0) cur.pos += d.value
          else cur.neg += d.value
          totals.set(k, cur)
        })
      }
      yMax = Math.max(0, ...Array.from(totals.values()).map(v => v.pos))
      yMin = Math.min(0, ...Array.from(totals.values()).map(v => v.neg))
    }

    if (yMin === yMax) yMax = yMin + 1
    const scale = niceScale(yMin, yMax, this.opts.yTicks)

    // 坐标映射
    const valueToPos = (v) => {
      const t = (v - scale.min) / (scale.max - scale.min)
      return horizontal
        ? p.x + t * p.w
        : p.y + p.h - t * p.h
    }
    const zero = valueToPos(0)

    // 组 slot 宽度
    const slot = (horizontal ? p.h : p.w) / groupCount
    const gp = this.opts.groupPadding
    const groupW = slot * (1 - gp)

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    // 网格 + 值轴刻度
    if (this.opts.grid) {
      const g = el('g')
      for (const tick of scale.ticks) {
        const pos = valueToPos(tick)
        const line = horizontal
          ? { x1: pos, x2: pos, y1: p.y, y2: p.y + p.h }
          : { x1: p.x, x2: p.x + p.w, y1: pos, y2: pos }
        g.appendChild(el('line', {
          ...line, stroke: this.theme.grid, 'stroke-width': 1,
          'stroke-dasharray': tick === 0 ? '0' : this.opts.gridDash,
        }))
        const t = el('text', {
          x: horizontal ? pos : p.x - 10,
          y: horizontal ? p.y + p.h + 22 : pos + 4,
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

    // 基线
    this.svg.appendChild(el('line', horizontal
      ? { x1: zero, x2: zero, y1: p.y, y2: p.y + p.h }
      : { x1: p.x, x2: p.x + p.w, y1: zero, y2: zero },
      { stroke: this.theme.axis, 'stroke-width': 1 }))

    // 分类刻度
    const cg = el('g')
    labels.forEach((label, i) => {
      const center = (horizontal ? p.y : p.x) + slot * (i + 0.5)
      const t = el('text', {
        x: horizontal ? p.x - 10 : center,
        y: horizontal ? center + 4 : p.y + p.h + 22,
        'text-anchor': horizontal ? 'end' : 'middle',
        'font-size': 11,
        'font-family': 'inherit',
        fill: this.theme.textMuted,
      })
      t.textContent = this.opts.xFormat(label)
      cg.appendChild(t)
    })
    this.svg.appendChild(cg)

    // 参考线
    if (this.opts.referenceLines?.length) {
      const rg = el('g')
      for (const r of this.opts.referenceLines) {
        const pos = valueToPos(r.value ?? r.y)
        rg.appendChild(el('line', horizontal
          ? { x1: pos, x2: pos, y1: p.y, y2: p.y + p.h }
          : { x1: p.x, x2: p.x + p.w, y1: pos, y2: pos },
          { stroke: r.color || '#ef4444', 'stroke-width': 1.5, 'stroke-dasharray': r.dash || '6 4' }))
        if (r.label) {
          const t = el('text', {
            x: horizontal ? pos + 4 : p.x + p.w - 4,
            y: horizontal ? p.y + 14 : pos - 4,
            'text-anchor': horizontal ? 'start' : 'end',
            'font-size': 11, 'font-family': 'inherit',
            fill: r.color || '#ef4444',
          })
          t.textContent = r.label
          rg.appendChild(t)
        }
      }
      this.svg.appendChild(rg)
    }

    // 高亮层（列背景）
    if (this.opts.highlight === 'column') {
      labels.forEach((_, i) => {
        const r = el('rect', {
          x: horizontal ? p.x : p.x + slot * i,
          y: horizontal ? p.y + slot * i : p.y,
          width: horizontal ? p.w : slot,
          height: horizontal ? slot : p.h,
          fill: 'transparent',
          style: 'transition:fill .15s;pointer-events:all',
        })
        r.addEventListener('mouseenter', () => r.setAttribute('fill', this.theme.highlightBg))
        r.addEventListener('mouseleave', () => r.setAttribute('fill', 'transparent'))
        this.svg.appendChild(r)
      })
    }

    // 渐变定义
    const defs = el('defs')
    this.svg.insertBefore(defs, this.svg.firstChild)

    // 柱子
    const sg = el('g')
    this.svg.appendChild(sg)

    const seriesCount = visible.length
    const innerW = groupW / Math.max(1, seriesCount)
    const barW = Math.max(
      this.opts.minBarWidth,
      innerW * (1 - this.opts.barPadding)
    )

    // 堆叠基准
    const stackBase = new Map()

    visible.forEach((s, si) => {
      const realIdx = this._series.indexOf(s)
      const color = s.color

      // 渐变
      const gid = uid()
      const grad = el('linearGradient', horizontal
        ? { id: gid, x1: '0', y1: '0', x2: '1', y2: '0' }
        : { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' })
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 1 }))
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0.75 }))
      defs.appendChild(grad)

      s.data.forEach((d, i) => {
        const v = d.value
        const fillColor = d.color || color
        const usesGradient = !d.color

        let pos1, pos2
        if (this.opts.layout === 'stacked') {
          const k = labels[i] ?? i
          const cur = stackBase.get(k) || { pos: 0, neg: 0 }
          if (v >= 0) {
            pos1 = valueToPos(cur.pos)
            pos2 = valueToPos(cur.pos + v)
            cur.pos += v
          } else {
            pos1 = valueToPos(cur.neg)
            pos2 = valueToPos(cur.neg + v)
            cur.neg += v
          }
          stackBase.set(k, cur)
        } else {
          pos1 = zero
          pos2 = valueToPos(v)
        }

        const groupX = (horizontal ? p.y : p.x) + slot * i
        const centerOffset = (horizontal ? p.y : p.x) + slot * i + groupW / 2

        let x, y, w, h
        if (horizontal) {
          const x1 = Math.min(pos1, pos2)
          const x2 = Math.max(pos1, pos2)
          x = x1
          w = Math.max(1, x2 - x1)
          const baseY = this.opts.layout === 'stacked'
            ? centerOffset - barW / 2
            : centerOffset - (barW * seriesCount) / 2 + si * barW + barW * 0.5 - barW / 2
          y = this.opts.layout === 'stacked'
            ? centerOffset - barW / 2
            : centerOffset - (barW * seriesCount) / 2 + si * barW
          h = barW
        } else {
          const y1 = Math.min(pos1, pos2)
          const y2 = Math.max(pos1, pos2)
          y = y1
          h = Math.max(1, y2 - y1)
          const groupCenter = p.x + slot * i + groupW / 2
          x = this.opts.layout === 'stacked'
            ? groupCenter - barW / 2
            : groupCenter - (barW * seriesCount) / 2 + si * barW
          w = barW
        }

        const rect = el('rect', {
          x, y, width: w, height: h,
          rx: Math.min(this.opts.radius, w / 2, h / 2),
          fill: usesGradient ? `url(#${gid})` : fillColor,
          style: 'cursor:pointer;transition:opacity .15s,filter .15s',
        })
        rect._meta = { si: realIdx, di: i, datum: d, series: s }
        sg.appendChild(rect)
        this._barEls.push(rect)

        // 值标签
        if (this.opts.showValue) {
          const tx = horizontal ? Math.max(pos1, pos2) + 8 : x + w / 2
          const ty = horizontal ? y + h / 2 + 4 : Math.min(y, zero) - 6
          const t = el('text', {
            x: tx, y: ty,
            'text-anchor': horizontal ? 'start' : 'middle',
            'font-size': 11, 'font-weight': 600,
            'font-family': 'inherit',
            fill: this.theme.text,
          })
          t.textContent = this.opts.valueFormat(v)
          sg.appendChild(t)
          rect._valueEl = t
        }
      })
    })

    // 动画
    if (animate) {
      this._animate(zero, p, horizontal)
    }

    // 事件层
    this._attach(sg, p)

    // 图例
    this._legend()
  }

  _animate(zero, p, horizontal) {
    const { duration, easing, stagger } = this.opts.animation
    const bars = this._barEls.map((r, i) => {
      const rect = {
        x: parseFloat(r.getAttribute('x')),
        y: parseFloat(r.getAttribute('y')),
        w: parseFloat(r.getAttribute('width')),
        h: parseFloat(r.getAttribute('height')),
      }
      return { el: r, rect, i }
    })

    // 初始化为 0 高度
    bars.forEach(b => {
      if (horizontal) {
        b.el.setAttribute('width', '0')
        b.el.setAttribute('x', String(zero))
      } else {
        b.el.setAttribute('height', '0')
        b.el.setAttribute('y', String(zero))
      }
      b.el.style.opacity = '0'
    })

    const start = performance.now()
    const ease = t => {
      if (easing === 'easeOutCubic') return 1 - Math.pow(1 - t, 3)
      if (easing === 'easeOutQuart') return 1 - Math.pow(1 - t, 4)
      if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
      if (easing === 'easeOutBack') {
        const c1 = 1.70158, c3 = c1 + 1
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
      }
      return t
    }

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      for (const b of bars) {
        const d = (b.i * stagger) / duration
        const tt = Math.max(0, Math.min(1, (t - d) / (1 - d || 1)))
        const e = ease(tt)
        if (horizontal) {
          const targetW = b.rect.w
          const targetX = b.rect.x
          const curW = targetW * e
          const curX = b.rect.x + (zero - b.rect.x) * (1 - e)
          b.el.setAttribute('width', String(Math.max(0.5, curW)))
          b.el.setAttribute('x', String(zero + (targetX - zero) * e))
          b.el.setAttribute('rx', String(Math.min(this.opts.radius, curW / 2, b.rect.h / 2)))
        } else {
          const targetH = b.rect.h
          const targetY = b.rect.y
          const curH = targetH * e
          b.el.setAttribute('height', String(Math.max(0.5, curH)))
          b.el.setAttribute('y', String(zero + (targetY - zero) * e))
          b.el.setAttribute('rx', String(Math.min(this.opts.radius, b.rect.w / 2, curH / 2)))
        }
        b.el.style.opacity = String(0.15 + 0.85 * e)
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        bars.forEach(b => {
          if (horizontal) {
            b.el.setAttribute('width', String(b.rect.w))
            b.el.setAttribute('x', String(b.rect.x))
          } else {
            b.el.setAttribute('height', String(b.rect.h))
            b.el.setAttribute('y', String(b.rect.y))
          }
          b.el.style.opacity = '1'
        })
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }

  _attach(sg, p) {
    sg.addEventListener('mousemove', (e) => {
      const rect = this.svg.getBoundingClientRect()
      const scaleX = this.W / rect.width
      const mx = (e.clientX - rect.left) * scaleX
      const my = (e.clientY - rect.top) * scaleX

      // 命中检测
      let hit = null
      for (const r of this._barEls) {
        const x = parseFloat(r.getAttribute('x'))
        const y = parseFloat(r.getAttribute('y'))
        const w = parseFloat(r.getAttribute('width'))
        const h = parseFloat(r.getAttribute('height'))
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
          hit = r
          break
        }
      }

      if (hit !== this._hover) {
        this._hover = hit
        this._applyHover()
      }
      if (hit) this._moveTip(e, hit, rect, scaleX)
    })

    sg.addEventListener('mouseleave', () => {
      this._hover = null
      this._applyHover()
      if (this.tip) this.tip.style.opacity = '0'
      if (this.opts.onHover) this.opts.onHover(null)
    })

    sg.addEventListener('click', (e) => {
      if (!this._hover) return
      const meta = this._hover._meta
      if (this.opts.onBarClick) {
        this.opts.onBarClick(meta.datum, meta.di, e)
      }
    })
  }

  _applyHover() {
    const hot = this._hover
    for (const r of this._barEls) {
      const meta = r._meta
      if (this.opts.highlight === 'column') {
        const sameCol = hot && meta.di === hot._meta.di
        r.style.opacity = hot ? (sameCol ? '1' : '0.45') : '1'
      } else {
        r.style.opacity = hot ? (r === hot ? '1' : '0.35') : '1'
      }
      r.style.filter = r === hot ? 'brightness(1.12)' : ''
    }
  }

  _moveTip(e, bar, svgRect, scaleX) {
    if (!this.tip) return
    const meta = bar._meta
    const s = meta.series
    const d = meta.datum
    this.tip.innerHTML = `
      <div style="opacity:.75;margin-bottom:3px;font-size:11.5px">${this.opts.xFormat(d.label)}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${s.color}"></span>
        <span style="flex:1">${s.name}</span>
        <strong style="font-variant-numeric:tabular-nums">${this.opts.valueFormat(d.value)}</strong>
      </div>
    `
    this.tip.style.opacity = '1'
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = (e.clientX - svgRect.left)
    const cy = (e.clientY - svgRect.top)
    let left = cx + 14
    let top = cy - th - 10
    if (left + tw > svgRect.width - 4) left = cx - tw - 14
    if (top < 0) top = cy + 14
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) {
      this.opts.onHover({ series: s, datum: d, seriesIndex: meta.si, dataIndex: meta.di })
    }
  }

  _legend() {
    const L = this.legendEl
    L.innerHTML = ''
    if (!this.opts.legend || this._series.length <= 1) {
      L.style.display = 'none'
      return
    }
    L.style.display = 'flex'
    this._series.forEach((s, i) => {
      const item = document.createElement('div')
      const hidden = this._hidden.has(i)
      item.style.cssText = `display:flex;align-items:center;gap:6px;cursor:pointer;user-select:none;opacity:${hidden ? 0.35 : 1}`
      item.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.color}"></span><span>${s.name}</span>`
      item.onclick = () => {
        if (this._hidden.has(i)) this._hidden.delete(i)
        else this._hidden.add(i)
        this.render()
      }
      L.appendChild(item)
    })
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

export default BarChart
