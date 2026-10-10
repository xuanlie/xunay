// XuNay 图表组件（独立文件，按需加载）
import {createElement, canvas} from './element.js'

function px(p) { return p || {} }

// ===== 图表 =====
function setupCanvas(canvas, w, h) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  return ctx
}

export function BarChart(props) {
  const { data = [], labels = [], height = 200, color = '#1f6feb', showValue = true } = px(props)
  const w = 600, h = height
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const cw = w - padding.left - padding.right
  const ch = h - padding.top - padding.bottom
  const max = Math.max(...data, 1)
  const barW = cw / data.length * 0.6
  const gap = cw / data.length
  return canvas( {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, w, h)
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + ch - (ch * i / 4)
        ctx.beginPath()
        ctx.moveTo(padding.left, y)
        ctx.lineTo(w - padding.right, y)
        ctx.stroke()
      }
      data.forEach((v, i) => {
        const barH = (v / max) * ch
        const x = padding.left + gap * i + (gap - barW) / 2
        const y = padding.top + ch - barH
        const g = ctx.createLinearGradient(0, y, 0, y + barH)
        g.addColorStop(0, color)
        g.addColorStop(1, color + 'aa')
        ctx.fillStyle = g
        ctx.fillRect(x, y, barW, barH)
        if (labels[i]) {
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(labels[i], x + barW / 2, h - 10)
        }
        if (showValue) {
          ctx.fillStyle = '#111'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(String(v), x + barW / 2, y - 4)
        }
      })
    }
  })
}

export function LineChart(props) {
  const { data = [], labels = [], height = 200, color = '#1f6feb', fill = true } = px(props)
  const w = 600, h = height
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const cw = w - padding.left - padding.right
  const ch = h - padding.top - padding.bottom
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  return canvas( {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, w, h)
      ctx.clearRect(0, 0, w, h)
      ctx.strokeStyle = '#e5e7eb'
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + ch - (ch * i / 4)
        ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke()
      }
      const step = data.length > 1 ? cw / (data.length - 1) : 0
      const pts = data.map((v, i) => ({ x: padding.left + step * i, y: padding.top + ch - ((v - min) / range) * ch }))
      if (fill) {
        const g = ctx.createLinearGradient(0, padding.top, 0, padding.top + ch)
        g.addColorStop(0, color + '55')
        g.addColorStop(1, color + '00')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(pts[0].x, padding.top + ch)
        pts.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.lineTo(pts[pts.length-1].x, padding.top + ch)
        ctx.closePath()
        ctx.fill()
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y))
      ctx.stroke()
      pts.forEach((p, i) => {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
        ctx.fill()
        if (labels[i]) {
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(labels[i], p.x, h - 10)
        }
      })
    }
  })
}

export function PieChart(props) {
  const { data = [], size = 200, donut = false } = px(props)
  const COLORS = ['#1f6feb','#7c3aed','#e11d48','#ea580c','#16a34a','#0891b2','#db2777','#ca8a04']
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1
  return canvas( {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, size, size)
      ctx.clearRect(0, 0, size, size)
      let start = -Math.PI / 2
      const cx = size / 2, cy = size / 2, r = size / 2 - 10
      data.forEach((d, i) => {
        const angle = (d.value / total) * Math.PI * 2
        ctx.fillStyle = d.color || COLORS[i % COLORS.length]
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, r, start, start + angle)
        ctx.closePath()
        ctx.fill()
        start += angle
      })
      if (donut) {
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#fff'
        ctx.beginPath()
        ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  })
}

export function Sparkline(props) {
  const { data = [], width = 100, height = 30, color = '#1f6feb' } = px(props)
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ')
  return canvas( {
    ref: el => {
      if (!el) return
      const ctx = setupCanvas(el, width, height)
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * height
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }
  })
}
