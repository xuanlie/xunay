// scan-pages 库：扫描 src/pages/**/*.xuy → 生成 src/router.xuy
// 被 bin/scan-pages.js（CLI）和 bin/xuyc.js（build 前自动调）使用
import fs from 'fs'
import path from 'path'

function walk(dir, base) {
  base = base || ''
  const out = []
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const rel = base ? base + '/' + name : name
    const st = fs.statSync(full)
    if (st.isDirectory()) out.push(...walk(full, rel))
    else if (name.endsWith('.xuy')) out.push(rel)
  }
  return out
}

function toRoute(rel) {
  const p = rel.replace(/\.xuy$/, '')
  const segs = p.split('/')
  const effective = segs.filter((s) => s !== 'index')
  const urlSegs = []
  const params = []
  for (const seg of effective) {
    if (seg.startsWith('[') && seg.endsWith(']')) {
      const pname = seg.slice(1, -1).toLowerCase()
      urlSegs.push(':' + pname)
      params.push(pname)
    } else {
      urlSegs.push(seg.toLowerCase())
    }
  }
  const url = '/' + urlSegs.join('/')
  return { url: url === '/' ? '/' : url, params, rel }
}

function generateRouter(routes) {
  const L = []
  L.push('// 自动生成，请勿手改')
  L.push('// 源：src/pages/')
  L.push('// 用 node bin/scan-pages.js 或 xuyc build 同步')
  L.push('')
  L.push("import { signal, show, div } from 'xunay'")
  L.push('')
  L.push("export const route = signal(norm(location.hash))")
  L.push('')
  L.push("if (typeof window !== 'undefined') {")
  L.push("  window.addEventListener('hashchange', () => {")
  L.push('    route(norm(location.hash))')
  L.push('    window.scrollTo(0, 0)')
  L.push('  })')
  L.push('}')
  L.push('')
  L.push('function norm(h) {')
  L.push("  h = (h || '').replace(/^#/, '')")
  L.push("  if (!h) return '/'")
  L.push("  if (!h.startsWith('/')) h = '/' + h")
  L.push('  return h')
  L.push('}')
  L.push('')
  L.push('export function go(p) {')
  L.push("  location.hash = p.startsWith('/') ? p : '/' + p")
  L.push('}')
  L.push('')
  L.push('const TABLE = [')
  for (const r of routes) {
    L.push(
      '  { url: ' + JSON.stringify(r.url) +
      ', load: () => import(' + JSON.stringify('./pages/' + r.rel) + ')' +
      ', params: ' + JSON.stringify(r.params) + ' },'
    )
  }
  L.push(']')
  L.push('')
  L.push('const _pageCache = new Map()')
  L.push('const _loading = new Map()')
  L.push('')
  L.push('export function match(path) {')
  L.push('  for (const r of TABLE) {')
  L.push('    const m = parse(r, path)')
  L.push('    if (m) return { url: r.url, load: r.load, params: m.params }')
  L.push('  }')
  L.push('  return null')
  L.push('}')
  L.push('')
  L.push('export function LazyPage(m) {')
  L.push('  const comp = signal(_pageCache.get(m.url))')
  L.push('  if (!comp() && !_loading.has(m.url)) {')
  L.push('    _loading.set(m.url, true)')
  L.push('    m.load().then((mod) => {')
  L.push('      const fn = Object.values(mod).find((v) => typeof v === "function")')
  L.push('      _pageCache.set(m.url, fn)')
  L.push('      comp(fn)')
  L.push('    }).catch((e) => {')
  L.push('      console.error("[router] lazy load failed:", m.url, e)')
  L.push('      _loading.delete(m.url)')
  L.push('    })')
  L.push('  }')
  L.push('  return show(')
  L.push('    () => comp() !== undefined && comp() !== null,')
  L.push('    () => { const C = comp(); return C ? C(m.params) : div({ class: "x-empty" }, "") }')
  L.push('  )')
  L.push('}')
  L.push('')
  L.push('function parse(r, path) {')
  L.push('  if (r.params.length === 0) {')
  L.push('    return r.url === path ? { params: {} } : null')
  L.push('  }')
  L.push("  const parts = path.split('/').filter(Boolean)")
  L.push("  const tpl = r.url.split('/').filter(Boolean)")
  L.push('  if (parts.length !== tpl.length) return null')
  L.push('  const params = {}')
  L.push('  for (let i = 0; i < tpl.length; i++) {')
  L.push('    const t = tpl[i]')
  L.push("    if (t.startsWith(':')) params[t.slice(1)] = decodeURIComponent(parts[i])")
  L.push('    else if (t !== parts[i]) return null')
  L.push('  }')
  L.push('  return { params }')
  L.push('}')
  L.push('')
  return L.join('\n')
}

export function scanPages(cwd) {
  cwd = cwd || process.cwd()
  const PAGES_DIR = path.join(cwd, 'src/pages')
  const OUT_FILE = path.join(cwd, 'src/router.xuy')

  if (!fs.existsSync(PAGES_DIR)) {
    return { ok: false, reason: 'no src/pages/', count: 0 }
  }

  const files = walk(PAGES_DIR, '')
  if (files.length === 0) {
    return { ok: false, reason: 'src/pages/ is empty', count: 0 }
  }

  const routes = files.map(toRoute)

  const seen = new Map()
  for (const r of routes) {
    if (seen.has(r.url)) {
      return { ok: false, reason: 'route conflict at ' + r.url + ': ' + seen.get(r.url) + ' vs ' + r.rel, count: 0 }
    }
    seen.set(r.url, r.rel)
  }

  routes.sort((a, b) => {
    if (a.params.length !== b.params.length) return a.params.length - b.params.length
    return a.url.localeCompare(b.url)
  })

  fs.writeFileSync(OUT_FILE, generateRouter(routes))
  return { ok: true, count: routes.length, routes }
}
