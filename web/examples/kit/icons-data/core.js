export const SVG_NS = 'http://www.w3.org/2000/svg'
export const P = (d) => `<path d="${d}"/>`
export const C = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`
export const R = (x, y, w, h, r = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${r ? ` rx="${r}"` : ''}/>`
export const L = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`

export function polygonPoints(n, cx, cy, r, rotation = -Math.PI / 2) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const a = rotation + (i / n) * Math.PI * 2
    pts.push([+(cx + Math.cos(a) * r).toFixed(2), +(cy + Math.sin(a) * r).toFixed(2)])
  }
  return pts
}
export function polygonPath(n, cx, cy, r, rotation) {
  const pts = polygonPoints(n, cx, cy, r, rotation)
  return 'M' + pts.map((p) => p.join(' ')).join(' L') + ' Z'
}
export function starPath(points, outer, inner, cx, cy) {
  const all = []
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2
    const r = i % 2 === 0 ? outer : inner
    all.push([+(cx + Math.cos(a) * r).toFixed(2), +(cy + Math.sin(a) * r).toFixed(2)])
  }
  return 'M' + all.map((p) => p.join(' ')).join(' L') + ' Z'
}
export function arcPath(cx, cy, r, startA, endA) {
  const large = endA - startA > Math.PI ? 1 : 0
  const x1 = +(cx + Math.cos(startA) * r).toFixed(2)
  const y1 = +(cy + Math.sin(startA) * r).toFixed(2)
  const x2 = +(cx + Math.cos(endA) * r).toFixed(2)
  const y2 = +(cy + Math.sin(endA) * r).toFixed(2)
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
}
export function rotateAround(angle, px, py, cx, cy) {
  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = px - cx
  const dy = py - cy
  return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos]
}
