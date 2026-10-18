// @xunay/kit/charts/funnel —— 精修版漏斗图
// 特性：梯形漏斗 · 转化率标注 · 悬停高亮 · 分段标签 · 
//      水平/垂直 · 渐变色 · 动画 · 深色浅色 · 响应式

const NS = 'http://www.w3.org/2000/svg'
let _uid = 0
const uid = () => 'fn-' + (++_uid).toString(36) + Math.random().toString(36).slice(2, 5)

function el(tag, attrs) {
  const e = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) e.setAttribute(k, v)
  }
  return e
}

function fmt(v) {
  if (v == null || isNaN(v)) return ''
  if (Math.abs(v) >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (Math.abs(v) >= 1e3) return (v / 1e3).toFixed(1) + 'K'
  return String(Math.round(v))
}

export class FunnelChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[FunnelChart] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 360,
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'],
      direction: 'vertical',    // 'vertical' | 'horizontal'
      gap: 4,                   // 段间距 px
      minRatio: 0.25,           // 最小宽度比例（让末端不会变成 0）
      showLabel: true,          // 显示标签
      showValue: true,          // 显示数值
      showPercent: true,        // 显示转化率
      labelPosition: 'inside',  // 'inside' | 'outside'
      tooltip: true,
      animation: { duration: 900, easing: 'easeOutCubic', stagger: 60 },
      onHover: null,
      onSliceClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._data = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._segEls = []

    this._build()
    if (options.data) this.setData(options.data)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      labelBg: 'rgba(15,23,42,0.9)', labelBorder: 'rgba(148,163,184,0.15)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
      segmentStroke: '#0a0e17',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      labelBg: 'rgba(255,255,255,0.9)', labelBorder: 'rgba(15,23,42,0.08)',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
      segmentStroke: '#fff',
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
    this.W = this.opts.width || Math.max(1, Math.round(r.width || 520))
    this.H = this.opts.height
    this.svg.setAttribute('viewBox', `0 0 ${this.W} ${this.H}`)
    this.svg.setAttribute('width', '100%')
    this.svg.setAttribute('height', String(this.H))
    this.svg.setAttribute('fill', 'none')
  }

  setData(data) {
    this._data = (data || []).map((d, i) => {
      if (typeof d === 'number') return { label: '阶段 ' + (i + 1), value: d }
      return {
        label: d.label != null ? d.label : '阶段 ' + (i + 1),
        value: Math.max(0, d.value != null ? d.value : (d.y != null ? d.y : 0)),
        color: d.color,
      }
    })
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
    this._segEls = []

    const n = this._data.length
    if (!n) return

    const horizontal = this.opts.direction === 'horizontal'
    const plotW = W - pad.left - pad.right
    const plotH = H - pad.top - pad.bottom
    const gap = this.opts.gap
    const segH = (horizontal ? plotW : plotH) / n - gap * (n - 1) / n

    const maxVal = Math.max(...this._data.map(d => d.value)) || 1
    const minR = this.opts.minRatio

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const g = el('g')
    this.svg.appendChild(g)

    // 计算每一段的上下宽度比例
    const ratios = this._data.map(d => {
      const r = d.value / maxVal
      return Math.max(minR, r)
    })

    // 计算每段的几何位置
    const segments = []
    for (let i = 0; i < n; i++) {
      const r0 = ratios[i]
      const r1 = i < n - 1 ? ratios[i + 1] : ratios[i] * 0.7
      if (horizontal) {
        const x0 = pad.left + i * (segH + gap)
        const w = segH
        const cy = pad.top + plotH / 2
        const h0 = plotH * r0
        const h1 = plotH * r1
        const y0 = cy - h0 / 2
        const y1 = cy - h1 / 2
        segments.push({
          path: `M ${x0} ${y0} L ${x0 + w} ${y1} L ${x0 + w} ${y1 + h1} L ${x0} ${y0 + h0} Z`,
          x0, x1: x0 + w, y0, y1, w, h0, h1,
          cx: x0 + w / 2,
          cyMid: cy,
          box: { x: x0, y: Math.min(y0, y1), w, h: Math.max(h0, h1) },
        })
      } else {
        const y0 = pad.top + i * (segH + gap)
        const h = segH
        const cx = pad.left + plotW / 2
        const w0 = plotW * r0
        const w1 = plotW * r1
        const x0 = cx - w0 / 2
        const x1 = cx - w1 / 2
        segments.push({
          path: `M ${x0} ${y0} L ${x1} ${y0 + h} L ${x1 + w1} ${y0 + h} L ${x0 + w0} ${y0} Z`,
          x0, x1, y0, y1: y0 + h, w: w0, h,
          cx: cx,
          cyMid: y0 + h / 2,
          box: { x: Math.min(x0, x1), y: y0, w: Math.max(w0, w1), h },
        })
      }
    }

    // 渲染每一段
    this._data.forEach((d, i) => {
      const seg = segments[i]
      const color = d.color || this.opts.colors[i % this.opts.colors.length]
      const gid = uid()
      const defs = this.svg.querySelector('defs') || this.svg.insertBefore(el('defs'), this.svg.firstChild)
      const grad = el('linearGradient', horizontal
        ? { id: gid, x1: '0', y1: '0', x2: '1', y2: '0' }
        : { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' })
      grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 1 }))
      grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0.75 }))
      defs.appendChild(grad)

      const path = el('path', {
        d: seg.path,
        fill: `url(#${gid})`,
        stroke: this.theme.segmentStroke,
        'stroke-width': 1.5,
        style: 'cursor:pointer;transition:filter .15s,opacity .15s',
      })
      path._meta = { data: d, index: i, color, seg }
      g.appendChild(path)
      this._segEls.push(path)

      path.addEventListener('mouseenter', (e) => {
        this._hover = path
        this._applyHover()
        this._moveTip(e, path)
      })
      path.addEventListener('mousemove', (e) => {
        if (this._hover === path) this._moveTip(e, path)
      })
      path.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      path.addEventListener('click', (e) => {
        if (this.opts.onSliceClick) this.opts.onSliceClick(d, i, e)
      })

      // 标签
      if (this.opts.showLabel || this.opts.showValue || this.opts.showPercent) {
        this._renderLabel(g, seg, i, d, color, horizontal)
      }
    })

    if (animate) this._animate(segments, horizontal)

    // 连接虚线（段间）
    if (n > 1) {
      const cg = el('g')
      for (let i = 0; i < n - 1; i++) {
        const a = segments[i]
        const b = segments[i + 1]
        if (horizontal) {
          const x = a.x1 + gap / 2
          const yTopA = a.y1
          const yBotA = a.y1 + a.h1
          const yTopB = b.y0
          const yBotB = b.y0 + b.h0
          const conv = this._data[i + 1].value / (this._data[i].value || 1)
        } else {
          const y = a.y1 + gap / 2
        }
      }
      this.svg.appendChild(cg)
    }
  }

  _renderLabel(g, seg, i, d, color, horizontal) {
    const lines = []
    if (this.opts.showLabel) lines.push({ text: d.label, weight: 600, size: 12.5 })
    if (this.opts.showValue) lines.push({ text: fmt(d.value), weight: 400, size: 11.5, opacity: 0.85 })
    if (this.opts.showPercent && i > 0) {
      const prev = this._data[i - 1].value || 1
      const pct = ((d.value / prev) * 100).toFixed(1)
      lines.push({ text: '↓ ' + pct + '%', weight: 400, size: 11, opacity: 0.75 })
    }

    if (this.opts.labelPosition === 'inside') {
      const totalH = lines.reduce((a, l) => a + l.size * 1.35, 0)
      let y = seg.cyMid - totalH / 2 + lines[0].size
      lines.forEach((l) => {
        const t = el('text', {
          x: horizontal ? seg.x0 + seg.w / 2 : seg.cx,
          y: y,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
          'font-size': l.size,
          'font-weight': l.weight,
          'font-family': 'inherit',
          fill: '#fff',
          style: 'pointer-events:none;text-shadow:0 1px 2px rgba(0,0,0,.25)' + (l.opacity ? `;opacity:${l.opacity}` : ''),
        })
        t.textContent = l.text
        g.appendChild(t)
        y += l.size * 1.35
      })
    } else {
      // outside：靠右侧
      if (horizontal) {
        const t = el('text', {
          x: seg.x1 + 12,
          y: seg.cyMid + 4,
          'text-anchor': 'start',
          'font-size': 12.5,
          'font-family': 'inherit',
          fill: this.theme.text,
        })
        t.textContent = this.opts.showLabel ? d.label : fmt(d.value)
        g.appendChild(t)
      } else {
        // 垂直：标签放中心偏右外侧
        const t = el('text', {
          x: seg.cx,
          y: seg.cyMid + 4,
          'text-anchor': 'middle',
          'font-size': 12.5,
          'font-family': 'inherit',
          fill: this.theme.text,
        })
        t.textContent = this.opts.showLabel ? d.label : fmt(d.value)
        g.appendChild(t)
      }
    }
  }

  _animate(segments, horizontal) {
    const { duration, easing, stagger } = this.opts.animation
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

    this._segEls.forEach((p, i) => { p.style.opacity = '0' })

    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      this._segEls.forEach((p, i) => {
        const d = (i * stagger) / duration
        const tt = Math.max(0, Math.min(1, (t - d) / (1 - d || 1)))
        const e = ease(tt)
        const seg = segments[i]
        p.style.opacity = String(e)
        // 从段左边（或顶边）展开
        if (horizontal) {
          const w0 = seg.w * e
          const yTop = seg.y0
          const yBot = seg.y0 + seg.h0
          const yTopRight = seg.y1
          const yBotRight = seg.y1 + seg.h1
          const d2 = `M ${seg.x0} ${yTop} L ${seg.x0 + w0} ${seg.y1 + (yTopRight - seg.y1) * e} L ${seg.x0 + w0} ${seg.y1 + (yBotRight - seg.y1) * e} L ${seg.x0} ${yBot} Z`
          p.setAttribute('d', d2)
        } else {
          const h = seg.h * e
          const xTop = seg.cx - (seg.w / 2)
          const wBot = seg.w * e * (segments[i].h1 / seg.h0 || 1)
          const xBot = seg.cx - wBot / 2
          const d2 = `M ${seg.cx - (seg.w / 2)} ${seg.y0} L ${seg.x1} ${seg.y0 + h} L ${seg.x1 + wBot} ${seg.y0 + h} L ${seg.cx + (seg.w / 2)} ${seg.y0} Z`
          p.setAttribute('d', d2)
        }
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        this._segEls.forEach((p, i) => {
          p.setAttribute('d', segments[i].path)
          p.style.opacity = '1'
        })
        this._cancelAnim = null
      }
    }
    raf = requestAnimationFrame(tick)
    this._cancelAnim = () => cancelAnimationFrame(raf)
  }

  _applyHover() {
    this._segEls.forEach(p => {
      const hot = p === this._hover
      p.style.filter = hot ? 'brightness(1.12)' : ''
      p.style.opacity = this._hover ? (hot ? '1' : '0.55') : '1'
    })
  }

  _moveTip(e, path) {
    if (!this.tip) return
    const meta = path._meta
    const i = meta.index
    const d = meta.data
    const prev = i > 0 ? this._data[i - 1].value : null
    const pct = prev ? ((d.value / prev) * 100).toFixed(1) : null
    const overall = this._data[0].value ? ((d.value / this._data[0].value) * 100).toFixed(1) : null

    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${meta.color}"></span>
        <strong>${d.label}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">数值</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(d.value)}</strong>
      </div>
      ${pct != null ? `<div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">上一步转化</span>
        <strong style="font-variant-numeric:tabular-nums">${pct}%</strong>
      </div>` : ''}
      ${overall != null && i > 0 ? `<div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">整体转化</span>
        <strong style="font-variant-numeric:tabular-nums">${overall}%</strong>
      </div>` : ''}
    `
    this.tip.style.opacity = '1'
    const rect = this.wrap.getBoundingClientRect()
    const tw = this.tip.offsetWidth
    const th = this.tip.offsetHeight
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    let left = cx + 14
    let top = cy - th / 2
    if (left + tw > rect.width - 4) left = cx - tw - 14
    if (top < 0) top = 4
    if (top + th > rect.height) top = rect.height - th - 4
    this.tip.style.left = left + 'px'
    this.tip.style.top = top + 'px'

    if (this.opts.onHover) {
      this.opts.onHover({ data: d, index: i, percent: pct ? parseFloat(pct) : null, overall: overall ? parseFloat(overall) : null })
    }
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

export default FunnelChart
