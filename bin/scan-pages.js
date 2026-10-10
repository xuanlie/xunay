#!/usr/bin/env node
import { scanPages } from './lib/scan-pages.js'

const r = scanPages()
if (!r.ok) {
  console.error('❌ ' + r.reason)
  process.exit(1)
}
console.log('✅ 已扫描 ' + r.count + ' 个页面 → src/router.xuy')
for (const rt of r.routes) {
  console.log('  ' + rt.url.padEnd(30) + ' → ' + rt.rel)
}
