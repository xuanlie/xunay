#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { compile } from '../compiler3/src/index.js'
import { build } from 'esbuild'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function parseArgs(argv) {
  const args = { input: null, out: 'dist', title: 'XuNay App', mode: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === 'build') continue
    if (a === '--out' || a === '-o') { args.out = argv[++i]; continue }
    if (a === '--title') { args.title = argv[++i]; continue }
    if (a === '--mode') { args.mode = argv[++i]; continue }
    if (!args.input && !a.startsWith('--')) args.input = a
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.input) {
    console.error('用法: xuyc3 build <input.xuy> [--out dist] [--title 标题] [--mode compiled|runtime|hybrid]')
    process.exit(1)
  }

  const src = fs.readFileSync(args.input, 'utf8')
  const m = src.match(/\/\/\s*title:\s*(.+)/)
  if (m) args.title = m[1].trim()

  // 优先：命令行 --mode > package.json.xunay.compileMode > "compiled"
  let compileMode = 'hybrid'
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    if (pkg.xunay && pkg.xunay.compileMode) compileMode = pkg.xunay.compileMode
  } catch {}
  if (args.mode) compileMode = args.mode
  console.log('   编译模式: ' + compileMode)

  const tagModule = path.join(ROOT, 'core/src/element.js')
  const compiled = compile(src, { mode: compileMode, tagModule })

  const coreEntry = path.join(ROOT, 'core/src/index.js')
  const rtEntry = path.join(ROOT, 'compiler3/src/runtime.js')

  const entryCode =
    `import * as __rt__ from ${JSON.stringify(rtEntry)}\n` +
    compiled.replace(/from\s+['"]xunay['"]/g, `from ${JSON.stringify(coreEntry)}`)

  fs.mkdirSync(args.out, { recursive: true })
  const tmpEntry = path.join(args.out, '.entry.js')
  fs.writeFileSync(tmpEntry, entryCode)

  await build({
    entryPoints: [tmpEntry],
    bundle: true,
    format: 'iife',
    outfile: path.join(args.out, 'app.js'),
    platform: 'browser',
    target: 'es2020',
    logLevel: 'error',
  })
  fs.unlinkSync(tmpEntry)

  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${args.title}</title>
<style>
  body { font-family: -apple-system, "PingFang SC", sans-serif; margin: 0; padding: 24px; }
  button { padding: 6px 14px; margin: 0 4px; }
</style>
</head>
<body>
<div id="app"></div>
<script src="./app.js"></script>
</body>
</html>
`
  fs.writeFileSync(path.join(args.out, 'index.html'), html)
  console.log('✅ 构建完成 → ' + args.out + '/index.html')
}

main().catch(e => { console.error(e); process.exit(1) })
