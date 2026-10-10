#!/usr/bin/env node
// 3D 统一入口：--target=3d | filament
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
if (!args[0]) {
  console.error('用法: node bin/xuyc-scene.js <scene.xuy> [--target=3d|filament] [--out dir] [--build] [--install]')
  process.exit(1)
}

const tIdx = args.findIndex(a => a.startsWith('--target='))
let target = tIdx >= 0 ? args[tIdx].split('=')[1] : 'filament'
if (!['3d', 'filament'].includes(target)) {
  console.error('--target 必须是 3d 或 filament，得到:', target)
  process.exit(1)
}

const forwarded = []
for (let i = 0; i < args.length; i++) {
  if (i === tIdx) continue
  if (args[i] === '--target') { i++; continue }
  forwarded.push(args[i])
}

const cli = target === '3d' ? 'xuyc-3d.js' : 'xuyc-filament.js'
console.log('[scene] target=' + target + ' -> ' + cli)

const r = spawnSync('node', [path.join(__dirname, cli), ...forwarded], { stdio: 'inherit' })
process.exit(r.status || 0)
