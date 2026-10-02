#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CONFIG = path.join(ROOT, 'xunay.config.json')

const BACKENDS = ['python', 'go', 'cpp', 'node']

const target = process.argv[2]
if (!target || !BACKENDS.includes(target)) {
  console.error('用法: node bin/switch.js <' + BACKENDS.join('|') + '>')
  console.error('当前: ' + JSON.parse(fs.readFileSync(CONFIG, 'utf8')).backend)
  process.exit(1)
}

const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'))
cfg.backend = target
fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n')

console.log('已切换到: ' + target)
console.log('端口: ' + cfg.ports[target])
console.log('')
console.log('启动:')
const cmds = {
  python: 'cd backends/python && pip install fastapi uvicorn pydantic && python -m uvicorn main:app --host 0.0.0.0 --port 12346',
  go: 'cd backends/go && go mod tidy && go run .',
  cpp: 'cd backends/cpp && mkdir -p build && cd build && cmake .. && make && ./server',
  node: 'cd backends/node && node server.js'
}
console.log('  ' + cmds[target])
