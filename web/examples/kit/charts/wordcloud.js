// @xunay/kit/charts/wordcloud —— 精修版词云（重写版）
const NS = 'http://www.w3.org/2000/svg'

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

function hexToRgb(h) {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b)
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)},${Math.round(ca[1] + (cb[1] - ca[1]) * t)},${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`
}
function rampColor(stops, t) {
  if (t <= 0) return stops[0]
  if (t >= 1) return stops[stops.length - 1]
  const n = stops.length - 1
  const i = Math.floor(t * n)
  return lerpColor(stops[i], stops[i + 1], t * n - i)
}

// 检测两个矩形是否碰撞
function overlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y)
}

// 从中心向外逐圈扫描，返回放置成功的 {x, y}
function findSpot(placed, W, H, w, h) {
  const cx = W / 2, cy = H / 2
  const maxR = Math.sqrt(W * W + H * H) / 2 + 10
  // 半径步长 2px，每个圆周按 8px 弧长采样
  for (let r = 0; r <= maxR; r += 2) {
    const circumference = 2 * Math.PI * Math.max(0.1, r)
    const samples = Math.max(8, Math.ceil(circumference / 6))
    // 从随机角度开始，避免所有词都堆在同一方向
    const startAngle = (w * 0.37 + h * 0.11) % (Math.PI * 2)
    for (let i = 0; i < samples; i++) {
      const angle = startAngle + (i / samples) * Math.PI * 2
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      const rx = x - w / 2
      const ry = y - h / 2
      if (rx < 0 || ry < 0 || rx + w > W || ry + h > H) continue
      const rect = { x: rx, y: ry, w, h }
      let coll = false
      for (const p of placed) {
        if (overlap(rect, p)) { coll = true; break }
      }
      if (!coll) return { x, y }
    }
  }
  return null
}

export class WordcloudChart {
  constructor(container, options = {}) {
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container
    if (!this.container) throw new Error('[Wordcloud] 找不到容器: ' + container)

    this.opts = Object.assign({
      width: null,
      height: 400,
      padding: 12,
      title: null,
      subtitle: null,
      theme: 'light',
      colors: ['#3b82f6','#8b5cf6','#ec4899','#f97316','#22c55e','#06b6d4','#eab308','#ef4444','#14b8a6','#a855f7'],
      minFontSize: 14,
      maxFontSize: 56,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
      fontWeight: 700,
      rotateRatio: 0,
      colorMode: 'palette',
      ramp: ['#bfdbfe', '#3b82f6', '#1e3a8a'],
      singleColor: '#8b5cf6',
      hoverScale: 1.12,
      tooltip: true,
      animation: { duration: 600, easing: 'easeOutCubic', stagger: 12 },
      onHover: null,
      onWordClick: null,
    }, options)

    this.theme = this._theme(this.opts.theme)
    this._words = []
    this._hover = null
    this._cancelAnim = null
    this._resizeObs = null
    this._wordEls = []
    this._canvas = null

    this._build()
    if (options.data || options.words) this.setData(options.data || options.words)
    this._setupResize()
  }

  _theme(t) {
    if (t === 'dark') return {
      bg: 'transparent', text: '#e2e8f0', textMuted: '#94a3b8',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(148,163,184,0.15)',
    }
    return {
      bg: 'transparent', text: '#0f172a', textMuted: '#64748b',
      tipBg: 'rgba(15,23,42,0.96)', tipColor: '#f8fafc',
      tipBorder: 'rgba(255,255,255,0.08)',
    }
  }

  _build() {
    const c = this.container
    c.innerHTML = ''
    c.style.position = 'relative'
    c.style.width = '100%'

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

    this.svg = el('svg', { xmlns: NS, style: 'display:block;width:100%' })
    this.wrap.appendChild(this.svg)

    // 隐藏的测量 canvas
    this._canvas = document.createElement('canvas')

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

  _measureText(text, fontSize, weight) {
    const ctx = this._canvas.getContext('2d')
    ctx.font = `${weight} ${fontSize}px ${this.opts.fontFamily}`
    const w = ctx.measureText(String(text)).width
    if (!w || w < 1 || !isFinite(w)) {
      // 兜底：CJK 字符宽 ≈ 1×字号，拉丁字符 ≈ 0.55×字号
      let est = 0
      for (const ch of String(text)) {
        est += /[\u4e00-\u9fa5\u3040-\u30ff]/.test(ch) ? 1 : 0.55
      }
      return est * fontSize
    }
    return w
  }

  setData(data) {
    let arr = []
    if (Array.isArray(data)) {
      arr = data.map((d, i) => {
        if (typeof d === 'string') return { text: d, value: 1 }
        return {
          text: d.text != null ? d.text : (d.label != null ? d.label : String(i)),
          value: Number(d.value != null ? d.value : (d.weight != null ? d.weight : 1)),
          color: d.color,
        }
      })
    } else if (data && typeof data === 'object') {
      arr = Object.entries(data).map(([text, value]) => ({ text, value: Number(value) || 1 }))
    }
    this._words = arr.filter(w => w.text && w.text.length).sort((a, b) => b.value - a.value)
    this.render()
    return this
  }

  setOptions(o = {}) {
    Object.assign(this.opts, o)
    if (o.theme) this.theme = this._theme(o.theme)
    if (o.data || o.words) return this.setData(o.data || o.words)
    this.render()
    return this
  }

  _colorOf(w) {
    if (w.color) return w.color
    const mode = this.opts.colorMode
    if (mode === 'single') return this.opts.singleColor
    if (mode === 'ramp') return rampColor(this.opts.ramp, w._t)
    return this.opts.colors[w._i % this.opts.colors.length]
  }

  render({ animate = false } = {}) {
    if (this._cancelAnim) { this._cancelAnim(); this._cancelAnim = null }

    // 测量尺寸（容器宽度必须拿到）
    const rect = this.wrap.getBoundingClientRect()
    const W = this.opts.width || Math.max(200, Math.round(rect.width || 640))
    const H = this.opts.height
    const pad = this.opts.padding
    const innerW = W - pad * 2
    const innerH = H - pad * 2

    this.W = W
    this.H = H

    this.svg.innerHTML = ''
    this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    this.svg.setAttribute('height', String(H))
    this.svg.setAttribute('fill', 'none')
    this._wordEls = []

    if (!this._words.length || innerW < 50 || innerH < 50) return

    // 计算字号
    const values = this._words.map(w => w.value)
    const maxV = Math.max(...values)
    const minV = Math.min(...values)
    const span = maxV - minV || 1

    const sized = this._words.map((w, i) => {
      const t = (w.value - minV) / span
      const fontSize = this.opts.minFontSize + Math.pow(t, 0.6) * (this.opts.maxFontSize - this.opts.minFontSize)
      const text = String(w.text)
      const tw = this._measureText(text, fontSize, this.opts.fontWeight)
      const th = fontSize * 1.25
      return { ...w, _i: i, _t: t, _fontSize: fontSize, _w: tw, _h: th }
    })

    // 布局：从大到小依次放置
    const placed = []
    for (const w of sized) {
      const spot = findSpot(placed, innerW, innerH, w._w, w._h)
      if (spot) {
        w._x = spot.x + pad
        w._y = spot.y + pad
        w._ok = true
        placed.push({ x: spot.x, y: spot.y - w._h / 2, w: w._w, h: w._h })
      } else {
        w._ok = false
      }
    }

    // 背景
    if (this.theme.bg !== 'transparent') {
      this.svg.appendChild(el('rect', { x: 0, y: 0, width: W, height: H, fill: this.theme.bg }))
    }

    const g = el('g')
    this.svg.appendChild(g)

    // 输出
    const okWords = sized.filter(w => w._ok)
    for (const w of okWords) {
      const color = this._colorOf(w)
      const t = el('text', {
        x: w._x,
        y: w._y,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': w._fontSize,
        'font-weight': this.opts.fontWeight,
        'font-family': this.opts.fontFamily,
        fill: color,
        style: 'cursor:pointer;user-select:none;transition:font-size .15s ease,fill .15s ease',
      })
      t.textContent = w.text
      t._meta = { word: w, color }
      g.appendChild(t)
      this._wordEls.push(t)

      t.addEventListener('mouseenter', (e) => {
        this._hover = t
        this._applyHover()
        this._moveTip(e, w)
      })
      t.addEventListener('mousemove', (e) => {
        if (this._hover === t) this._moveTip(e, w)
      })
      t.addEventListener('mouseleave', () => {
        this._hover = null
        this._applyHover()
        if (this.tip) this.tip.style.opacity = '0'
        if (this.opts.onHover) this.opts.onHover(null)
      })
      t.addEventListener('click', (e) => {
        if (this.opts.onWordClick) this.opts.onWordClick(w, e)
      })
    }

    if (window.__WC_DEBUG) {
      console.log(`[Wordcloud] 放置 ${okWords.length}/${sized.length}，画布 ${W}×${H}`)
    }

    if (animate) this._animate()
  }

  _applyHover() {
    const hot = this._hover
    for (const t of this._wordEls) {
      const isHot = t === hot
      const base = t._meta.word._fontSize
      t.setAttribute('font-size', String(isHot ? base * this.opts.hoverScale : base))
      t.style.opacity = hot && !isHot ? '0.3' : '1'
    }
  }

  _moveTip(e, w) {
    if (!this.tip) return
    const color = this._colorOf(w)
    this.tip.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${color}"></span>
        <strong>${w.text}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">权重</span>
        <strong style="font-variant-numeric:tabular-nums">${fmt(w.value)}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;gap:20px">
        <span style="opacity:.7">排名</span>
        <strong>#${w._i + 1}</strong>
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
    if (this.opts.onHover) this.opts.onHover(w)
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
    const targets = this._wordEls.map((t, i) => ({
      el: t, fs: t._meta.word._fontSize, delay: (i * stagger) / duration,
    }))
    targets.forEach(tg => { tg.el.style.opacity = '0' })
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      targets.forEach(tg => {
        const tt = Math.max(0, Math.min(1, (t - tg.delay) / (1 - tg.delay || 1)))
        const e = ease(tt)
        tg.el.setAttribute('font-size', String(tg.fs * e))
        tg.el.style.opacity = String(e)
      })
      if (t < 1) {
        raf = requestAnimationFrame(tick)
        this._cancelAnim = () => cancelAnimationFrame(raf)
      } else {
        targets.forEach(tg => {
          tg.el.setAttribute('font-size', String(tg.fs))
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
    let tid
    this._resizeObs = new ResizeObserver(() => {
      const w = this.wrap.clientWidth
      if (w > 0 && Math.abs(w - last) > 8) {
        last = w
        clearTimeout(tid)
        tid = setTimeout(() => this.render(), 150)
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

export default WordcloudChart
