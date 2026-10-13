#!/usr/bin/env node
// V075 修复：bench 统一入口
// 用法：
//   node bench/run.mjs              跑核心微基准
//   node bench/run.mjs core         同上
//   node bench/run.mjs compare      对比 Preact
//   node bench/run.mjs full         完整对比
//   node bench/run.mjs list         列出可用

import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUITES = {
  core:        ['core.bench.js'],           // signal/effect/computed 微基准
  compare:     ['compare.mjs'],             // vs Preact（同 JSDOM 环境）
  full:        ['full-compare.mjs'],        // 三方对比
  framework:   ['framework-compare.mjs'],   // 多框架对比
  isolate:     ['bench-isolate.mjs'],       // 隔离场景
  real:        ['bench-real.mjs'],          // 真实场景
  static:      ['bench-static.mjs'],        // 静态内容
  xunay:       ['xunay-bench.mjs'],         // 主要基准
}

const arg = process.argv[2] || 'core'

if (arg === 'list') {
  console.log('可用套件：')
  for (const [name, files] of Object.entries(SUITES)) {
    const exists = files.every(f => fs.existsSync(path.join(__dirname, f)))
    console.log('  ' + (exists ? '✓' : '✗') + ' ' + name.padEnd(12) + ' → ' + files.join(', '))
  }
  process.exit(0)
}

const files = SUITES[arg]
if (!files) {
  console.error('未知套件: ' + arg)
  console.error('跑 `node bench/run.mjs list` 查看可用')
  process.exit(1)
}

for (const f of files) {
  const full = path.join(__dirname, f)
  if (!fs.existsSync(full)) {
    console.error('✗ 找不到: ' + f)
    process.exit(1)
  }
  console.log('\n===== ' + f + ' =====\n')
  await new Promise((resolve, reject) => {
    const child = spawn('node', [full], { stdio: 'inherit', cwd: path.dirname(__dirname) })
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(f + ' 退出 ' + code)))
  })
}
