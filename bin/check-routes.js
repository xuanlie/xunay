#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const routes = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared/routes.json'), 'utf8')).routes

const BACKENDS = {
  node:   { file: 'backends/node/handlers.js',  regex: /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g },
  python: { file: 'backends/python/handlers.py', regex: /def\s+(\w+)\s*\(/g },
  go:     { file: 'backends/go/handlers.go',     regex: /func\s+(\w+)\s*\(/g },
  cpp:    { file: 'backends/cpp/handlers.cpp',   regex: /void\s+(\w+)\s*\(/g }
}

function extractHandlers(backend) {
  const p = path.join(ROOT, backend.file)
  if (!fs.existsSync(p)) return null
  const src = fs.readFileSync(p, 'utf8')
  const out = new Set()
  let m
  while ((m = backend.regex.exec(src))) out.add(m[1])
  return out
}

console.log('检查 ' + routes.length + ' 个路由...\n')

let allOk = true
const backends = {}
for (const name of Object.keys(BACKENDS)) backends[name] = extractHandlers(BACKENDS[name])

for (const r of routes) {
  const cols = []
  for (const name of Object.keys(BACKENDS)) {
    const handlers = backends[name]
    if (!handlers) { cols.push(name.padEnd(7) + '  -'); continue }
    const has = handlers.has(r.handler)
    cols.push(name.padEnd(7) + '  ' + (has ? '✓' : '✗'))
    if (!has) allOk = false
  }
  console.log('  ' + r.name.padEnd(14) + cols.join('   '))
}

console.log('')
if (allOk) { console.log('全部一致。'); process.exit(0) }
else { console.log('有不一致，请补齐实现。'); process.exit(1) }
