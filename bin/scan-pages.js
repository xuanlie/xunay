#!/usr/bin/env node
// 扫描 src/pages/**/*.xuy → 生成 src/router.xuy
//
// 规则：
//   index.xuy         → /            （目录本身）
//   Home.xuy          → /home
//   About.xuy         → /about
//   user/index.xuy    → /user
//   user/List.xuy     → /user/list
//   user/[id].xuy     → /user/:id    （动态段）
//   user/[id]/[t].xuy → /user/:id/:t

import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const PAGES_DIR = path.join(ROOT, 'src/pages')
const OUT_FILE = path.join(ROOT, 'src/router.xuy')

if (!fs.existsSync(PAGES_DIR)) {
  console.error('❌ 找不到 src/pages/ 目录')
  process.exit(1)
}

// 递归收集 .xuy
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

// 相对路径 → { url, compName, params }
function toRoute(rel) {
  const p = rel.replace(/\.xuy$/, '')
  const segs = p.split('/')

  // index 段省略
  const effective = segs.filter(s => s !== 'index')
  const hasIndex = segs[segs.length - 1] === 'index'

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
      urlSegs.push(seg.toLowerCase())          // URL 段全小写
      nameSegs.push(seg.charAt(0).toUpperCase() + seg.slice(1))  // 组件名首字母大写
    }
  }

  const url = '/' + urlSegs.join('/')
  const compName = nameSegs.length > 0 ? nameSegs.join('') : 'Index'

  return { url: url === '/' ? '/' : url, compName, params, rel }
}

const files = walk(PAGES_DIR, '')
const routes = files.map(toRoute)

// 冲突检测
const seen = new Map()
for (const r of routes) {
  if (seen.has(r.url)) {
    console.error(`❌ 路由冲突：${r.url}`)
    console.error(`  - ${seen.get(r.url)}`)
    console.error(`  - ${r.rel}`)
    process.exit(1)
  }
  seen.set(r.url, r.rel)
}

// 排序：静态优先（params 少的在前）
routes.sort((a, b) => {
  if (a.params.length !== b.params.length) return a.params.length - b.params.length
  return a.url.localeCompare(b.url)
})

// 生成
let out = `// 自动生成，请勿手改
// 源：src/pages/
// 用 node bin/scan-pages.js 同步

import { signal } from 'xunay'
`

for (const r of routes) {
  out += `import { ${r.compName} } from '@/pages/${r.rel}'\n`
}

out += `
export const route = signal(norm(location.hash))

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    route(norm(location.hash))
    window.scrollTo(0, 0)
  })
}

function norm(h) {
  h = (h || '').replace(/^#/, '')
  if (!h) return '/'
  if (!h.startsWith('/')) h = '/' + h
  return h
}

export function go(p) {
  location.hash = p.startsWith('/') ? p : '/' + p
}

const TABLE = [
`

for (const r of routes) {
  out += `  { url: ${JSON.stringify(r.url)}, Comp: ${r.compName}, params: ${JSON.stringify(r.params)} },\n`
}

out += `]

export function match(path) {
  for (const r of TABLE) {
    const m = parse(r, path)
    if (m) return m
  }
  return null
}

function parse(r, path) {
  if (r.params.length === 0) {
    return r.url === path ? { Comp: r.Comp, params: {} } : null
  }
  const parts = path.split('/').filter(Boolean)
  const tpl = r.url.split('/').filter(Boolean)
  if (parts.length !== tpl.length) return null
  const params = {}
  for (let i = 0; i < tpl.length; i++) {
    const t = tpl[i]
    if (t.startsWith(':')) params[t.slice(1)] = decodeURIComponent(parts[i])
    else if (t !== parts[i]) return null
  }
  return { Comp: r.Comp, params }
}
`

fs.writeFileSync(OUT_FILE, out)

console.log(`✅ 已扫描 ${routes.length} 个页面 → src/router.xuy`)
for (const r of routes) {
  console.log(`  ${r.url.padEnd(30)} → ${r.rel}`)
}
