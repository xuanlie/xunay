export const SVG_NS = 'http://www.w3.org/2000/svg'

export function svgEl(name, attrs = {}, text) {
  const el = document.createElementNS(SVG_NS, name)
  for (const k in attrs) {
    const v = attrs[k]
    if (v != null && v !== false) el.setAttribute(k, String(v))
  }
  if (text != null) el.textContent = String(text)
  return el
}

export function svgGroup(attrs) {
  return svgEl('g', attrs || {})
}

export function number(v, fallback = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

export function isObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

export function deepMerge(base, extra) {
  if (!isObject(base)) return extra
  if (!isObject(extra)) return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  for (const key in extra) {
    const bv = base[key]
    const ev = extra[key]
    if (isObject(bv) && isObject(ev)) out[key] = deepMerge(bv, ev)
    else out[key] = ev
  }
  return out
}

export class EventEmitter {
  constructor() {
    this._map = new Map()
  }
  on(event, fn) {
    if (!this._map.has(event)) this._map.set(event, new Set())
    this._map.get(event).add(fn)
    return () => this.off(event, fn)
  }
  off(event, fn) {
    const set = this._map.get(event)
    if (set) set.delete(fn)
  }
  emit(event, ...args) {
    const set = this._map.get(event)
    if (!set) return
    for (const fn of set) {
      try { fn(...args) } catch (err) { console.error('[xunay/charts]', err) }
    }
  }
  clear() {
    this._map.clear()
  }
}

export const Easings = {
  linear: (t) => t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
}

export function animate({ duration = 500, easing = 'easeOutCubic', onUpdate, onComplete }) {
  if (duration <= 0) {
    onUpdate(1, 1)
    onComplete && onComplete()
    return () => {}
  }
  const ease = Easings[easing] || Easings.easeOutCubic
  const start = performance.now()
  let rafId = 0
  const tick = (now) => {
    const t = clamp((now - start) / duration, 0, 1)
    onUpdate(ease(t), t)
    if (t < 1) rafId = requestAnimationFrame(tick)
    else onComplete && onComplete()
  }
  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}

function niceStep(rough) {
  if (rough <= 0) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(rough)))
  const norm = rough / pow
  let nice
  if (norm < 1.5) nice = 1
  else if (norm < 3) nice = 2
  else if (norm < 7) nice = 5
  else nice = 10
  return nice * pow
}

function roundStep(v, step) {
  if (step <= 0) return v
  const digits = Math.max(0, -Math.floor(Math.log10(step)) + 1)
  return Number(v.toFixed(Math.min(12, digits)))
}

export class LinearScale {
  constructor(domain = [0, 1], range = [0, 1]) {
    this.domain = [...domain]
    this.range = [...range]
  }
  map(v) {
    const [d0, d1] = this.domain
    const [r0, r1] = this.range
    const span = d1 - d0 || 1
    return r0 + ((v - d0) / span) * (r1 - r0)
  }
  invert(p) {
    const [d0, d1] = this.domain
    const [r0, r1] = this.range
    const span = r1 - r0 || 1
    return d0 + ((p - r0) / span) * (d1 - d0)
  }
  nice(count = 5) {
    const [d0, d1] = this.domain
    const range = d1 - d0
    if (range <= 0) return this
    const step = niceStep(range / count)
    this.domain = [Math.floor(d0 / step) * step, Math.ceil(d1 / step) * step]
    return this
  }
  ticks(count = 5) {
    const [d0, d1] = this.domain
    const range = d1 - d0
    if (range <= 0) return [d0]
    const step = niceStep(range / count)
    const start = Math.ceil(d0 / step) * step
    const out = []
    for (let v = start; v <= d1 + step * 1e-6; v += step) {
      out.push(roundStep(v, step))
    }
    return out
  }
}

export class BandScale {
  constructor(domain = [], range = [0, 1], padding = 0.2) {
    this.domain = [...domain]
    this.range = [...range]
    this.padding = padding
  }
  get step() {
    return (this.range[1] - this.range[0]) / Math.max(1, this.domain.length)
  }
  get bandwidth() {
    return this.step * (1 - this.padding)
  }
  map(value) {
    const i = this.domain.indexOf(value)
    if (i < 0) return this.range[0]
    const offset = (this.step - this.bandwidth) / 2
    return this.range[0] + i * this.step + offset
  }
  center(value) {
    return this.map(value) + this.bandwidth / 2
  }
  invert(p) {
    const i = Math.floor((p - this.range[0]) / this.step)
    const idx = clamp(i, 0, this.domain.length - 1)
    return this.domain[idx]
  }
}

export const defaultTheme = {
  colors: [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ],
  background: 'transparent',
  text: '#334155',
  textMuted: '#94a3b8',
  grid: '#e2e8f0',
  gridOpacity: 0.6,
  axis: '#cbd5e1',
  crosshair: '#94a3b8',
  font: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: 12,
    titleSize: 16,
    smallSize: 11,
    weight: 400,
    titleWeight: 600
  },
  padding: { top: 20, right: 20, bottom: 20, left: 20 },
  titleGap: 12,
  legend: {
    rowHeight: 28,
    columnWidth: 120,
    itemSize: 12,
    itemGap: 16,
    itemSpacing: 6,
    text: null,
    position: 'top'
  },
  axis: {
    size: 44,
    tickSize: 5,
    tickCount: 5,
    lineWidth: 1,
    labelGap: 8
  },
  line: {
    width: 2,
    pointRadius: 4,
    pointRadiusHover: 6,
    tension: 0
  },
  bar: {
    padding: 0.2,
    radius: 4,
    minWidth: 2,
    groupPadding: 0.1
  },
  arc: {
    innerRadius: 0.55,
    padAngle: 0.008,
    labelRadius: 0.68,
    minLabelAngle: 0.15
  },
  tooltip: {
    background: 'rgba(15, 23, 42, 0.94)',
    color: '#f8fafc',
    border: 'transparent',
    radius: 6,
    padding: '8px 10px',
    fontSize: 12,
    offset: 12,
    shadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  animation: {
    duration: 500,
    easing: 'easeOutCubic'
  }
}

export const darkTheme = deepMerge(defaultTheme, {
  background: '#0f172a',
  text: '#e2e8f0',
  textMuted: '#64748b',
  grid: '#1e293b',
  gridOpacity: 0.8,
  axis: '#334155',
  crosshair: '#64748b',
  tooltip: {
    background: 'rgba(248, 250, 252, 0.96)',
    color: '#0f172a',
    border: 'transparent'
  }
})

const themeRegistry = new Map([
  ['default', defaultTheme],
  ['light', defaultTheme],
  ['dark', darkTheme]
])

export function registerTheme(name, theme) {
  themeRegistry.set(name, deepMerge(defaultTheme, theme))
}

export function resolveTheme(theme) {
  if (!theme) return defaultTheme
  if (typeof theme === 'string') return themeRegistry.get(theme) || defaultTheme
  if (isObject(theme)) {
    const base = theme.base && typeof theme.base === 'string'
      ? themeRegistry.get(theme.base) || defaultTheme
      : defaultTheme
    return deepMerge(base, theme)
  }
  return defaultTheme
}

export function formatNumber(v, maxDigits = 6) {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  if (Number.isInteger(n)) return String(n)
  const abs = Math.abs(n)
  if (abs >= 1e6 || (abs > 0 && abs < 1e-3)) return n.toExponential(2)
  return String(Number(n.toFixed(maxDigits)))
}
