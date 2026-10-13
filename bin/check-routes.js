#!/usr/bin/env node
// bin/check-routes.js —— 路由一致性检查 + 自动补 handler 骨架
//
// 用法：
//   node bin/check-routes.js                     # 检查
//   node bin/check-routes.js --fix               # 检查并补缺失的
//   node bin/check-routes.js --lang=node         # 只看某个后端
//   node bin/check-routes.js --lang=node --fix   # 只补某个后端

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function toSnake(name) {
  return name.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
}

// V033 修复：去除注释后的源码，避免注释掉的 handler 被误判为存在
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(line => line.replace(/\/\/.*$/, ''))
    .join('\n')
}

const BACKENDS = {
  node: {
    file: 'backends/node/handlers.js',
    has: (src, name) =>
      new RegExp('export\\s+(?:async\\s+)?function\\s+' + name + '\\b').test(stripComments(src)),
    stub: (name) =>
      '\nexport async function ' + name + '(ctx) {\n' +
      '  // TODO: 实现\n' +
      "  ctx.fail('未实现')\n" +
      '}\n',
  },
  python: {
    file: 'backends/python/handlers.py',
    has: (src, name) =>
      new RegExp('def\\s+' + toSnake(name) + '\\b').test(stripComments(src)),
    stub: (name) =>
      '\n\ndef ' + toSnake(name) + '(ctx):\n' +
      '    # TODO: 实现\n' +
      '    ctx["fail"]("未实现")\n',
  },
  go: {
    file: 'backends/go/handlers.go',
    has: (src, name) =>
      new RegExp('func\\s+' + name + '\\b').test(stripComments(src)),
    stub: (name) =>
      '\nfunc ' + name + '(w http.ResponseWriter, r *http.Request) {\n' +
      '\t// TODO: 实现\n' +
      '\twriteJSON(w, 500, fail("未实现"))\n' +
      '}\n',
  },
  cpp: {
    file: 'backends/cpp/handlers.cpp',
    has: (src, name) =>
      new RegExp('void\\s+' + name + '\\b').test(stripComments(src)),
    stub: (name) =>
      '\nvoid ' + name + '(const httplib::Request& req, httplib::Response& res) {\n' +
      '    // TODO: 实现\n' +
      '    send(res, 500, false, "", "未实现");\n' +
      '}\n',
  },
}

const args = process.argv.slice(2)
const FIX = args.includes('--fix')
const LANG = args.find(a => a.startsWith('--lang='))?.split('=')[1]

const routesFile = path.join(ROOT, 'shared/routes.json')
if (!fs.existsSync(routesFile)) {
  console.error('❌ 找不到 shared/routes.json')
  process.exit(1)
}
const routes = JSON.parse(fs.readFileSync(routesFile, 'utf8')).routes || []

console.log('检查 shared/routes.json...')
console.log('  ✓ ' + routes.length + ' 条路由')
console.log()

let failedBackends = 0
let totalFixed = 0

for (const [lang, cfg] of Object.entries(BACKENDS)) {
  if (LANG && lang !== LANG) continue

  const filepath = path.join(ROOT, cfg.file)
  if (!fs.existsSync(filepath)) {
    console.log('检查 ' + cfg.file + '...')
    console.log('  ✗ 文件不存在')
    failedBackends++
    continue
  }

  let src = fs.readFileSync(filepath, 'utf8')
  const missing = []
  for (const route of routes) {
    if (!route.handler) continue
    if (!cfg.has(src, route.handler)) missing.push(route.handler)
  }

  console.log('检查 ' + cfg.file + '...')

  if (missing.length === 0) {
    console.log('  ✓ ' + routes.length + ' 个 handler')
    continue
  }

  if (FIX) {
    if (!src.endsWith('\n')) src += '\n'
    for (const name of missing) src += cfg.stub(name)
    fs.writeFileSync(filepath, src)
    console.log('  ✓ 补充 ' + missing.length + ' 个: ' + missing.join(', '))
    totalFixed += missing.length
  } else {
    console.log('  ✗ 缺少 ' + missing.length + ' 个: ' + missing.join(', '))
    failedBackends++
  }
}

console.log()
if (FIX) {
  console.log('结果: 补充 ' + totalFixed + ' 个 handler')
  console.log('下一步：在各语言的 handlers 里把 // TODO 填掉')
} else if (failedBackends === 0) {
  console.log('结果: 全部通过 ✅')
} else {
  console.log('结果: ' + failedBackends + ' 个后端缺 handler')
  console.log("跑 'node bin/check-routes.js --fix' 自动补骨架")
  process.exit(1)
}
