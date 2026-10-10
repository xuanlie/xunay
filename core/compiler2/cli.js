#!/usr/bin/env node
// XuNay 编译器 v2 - 命令行
import fs from 'fs'
import path from 'path'
import { compile } from './src/index.js'

const args = process.argv.slice(2)
const target = args[0]
if (!target) {
  console.error('用法: xuyc2 <文件或目录>')
  process.exit(1)
}

function walk(p) {
  const stat = fs.statSync(p)
  if (stat.isDirectory()) {
    for (const f of fs.readdirSync(p)) walk(path.join(p, f))
  } else if (p.endsWith('.xuy')) {
    const src = fs.readFileSync(p, 'utf8')
    const out = compile(src)
    const outPath = p.replace(/\.xuy$/, '.js')
    fs.writeFileSync(outPath, out)
    console.log('OK', p, '->', outPath)
  }
}

walk(target)
