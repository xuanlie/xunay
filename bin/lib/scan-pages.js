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
  const effective = segs.filter(s => s !== 'index')
  const urlSegs = []
  const params = []
  const nameSegs = []
  for (const seg of effective) {
    if (seg.startsWith('[') && seg.endsWith(']')) {
      const pname = seg.slice(1, -1).toLowerCase()
      urlSegs.push(':' + pname)
      params.push(pname)
      nameSegs.push(pname.charAt(0).toUpperCase() + pname.slice(1))
    } else {
      urlSegs.push(seg.toLowerCase())
      nameSegs.push(seg.charAt(0).toUpperCase() + seg.slice(1))
    }
  }
  const url = '/' + urlSegs.join('/')
  const compName = nameSegs.length > 0 ? nameSegs.join('') : 'Index'
  return { url: url === '/' ? '/' : url, compName, params, rel }
}

function generateRouter(routes) {
  let out = '// 自动生成，请勿手改\n'
  out += '// 源：src/pages/\n'
  out += '// 用 node bin/scan-pages.js 或 xuyc build 同步\n\n'
  out += "import { signal } from 'xunay'\n"
  for (const r of routes) {
    out += "import { " + r.compName + " } from './pages/" + r.rel + "'\n"
  }
  out += '\n'
  out += "export const route = signal(norm(location.hash))\n\n"
  out += "if (typeof window !== 'undefined') {\n"
  out += "  window.addEventListener('hashchange', () => {\n"
  out += "    route(norm(location.hash))\n"
  out += "    window.scrollTo(0, 0)\n"
  out += "  })\n"
  out += "}\n\n"
  out += "function norm(h) {\n"
  out += "  h = (h || '').replace(/^#/, '')\n"
  out += "  if (!h) return '/'\n"
  out += "  if (!h.startsWith('/')) h = '/' + h\n"
  out += "  return h\n"
  out += "}\n\n"
  out += "export function go(p) {\n"
  out += "  location.hash = p.startsWith('/') ? p : '/' + p\n"
  out += "}\n\n"
  out += 'const TABLE = [\n'
  for (const r of routes) {
    out += '  { url: ' + JSON.stringify(r.url) + ', Comp: ' + r.compName + ', params: ' + JSON.stringify(r.params) + ' },\n'
  }
  out += ']\n\n'
  out += "export function match(path) {\n"
  out += "  for (const r of TABLE) {\n"
  out += "    const m = parse(r, path)\n"
  out += "    if (m) return m\n"
  out += "  }\n"
  out += "  return null\n"
  out += "}\n\n"
  out += "function parse(r, path) {\n"
  out += "  if (r.params.length === 0) {\n"
  out += "    return r.url === path ? { Comp: r.Comp, params: {} } : null\n"
  out += "  }\n"
  out += "  const parts = path.split('/').filter(Boolean)\n"
  out += "  const tpl = r.url.split('/').filter(Boolean)\n"
  out += "  if (parts.length !== tpl.length) return null\n"
  out += "  const params = {}\n"
  out += "  for (let i = 0; i < tpl.length; i++) {\n"
  out += "    const t = tpl[i]\n"
  out += "    if (t.startsWith(':')) params[t.slice(1)] = decodeURIComponent(parts[i])\n"
  out += "    else if (t !== parts[i]) return null\n"
  out += "  }\n"
  out += "  return { Comp: r.Comp, params }\n"
  out += "}\n"
  return out
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
