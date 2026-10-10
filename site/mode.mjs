#!/usr/bin/env node
// 切换 site 构建模式
//   node site/mode.mjs dev    → 关混淆（默认，快）
//   node site/mode.mjs prod   → 开混淆（发布用，慢但难抄）
//   node site/mode.mjs         → 显示当前状态
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkgPath = path.join(__dirname, '..', 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.xunay = pkg.xunay || {}

const mode = process.argv[2]

if (!mode) {
  console.log('当前 site 配置：')
  console.log('  obfuscate   =', pkg.xunay.obfuscate === true)
  console.log('  cssHash     =', pkg.xunay.cssHash === true)
  console.log('  filenameHash=', pkg.xunay.filenameHash || 'none')
  console.log('')
  console.log('切换：')
  console.log('  node site/mode.mjs dev    → 关混淆（开发，快）')
  console.log('  node site/mode.mjs prod   → 开混淆（发布，难抄）')
  process.exit(0)
}

if (mode === 'dev') {
  pkg.xunay.obfuscate = false
  pkg.xunay.cssHash = false
  pkg.xunay.filenameHash = 'none'
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  console.log('✅ site mode = dev')
  console.log('   obfuscate=false  cssHash=false  filenameHash=none')
  console.log('   → 快，体积 ~475KB')
} else if (mode === 'prod') {
  pkg.xunay.obfuscate = true
  pkg.xunay.cssHash = false
  pkg.xunay.filenameHash = 'none'
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
  console.log('✅ site mode = prod')
  console.log('   obfuscate=true   cssHash=false  filenameHash=none')
  console.log('   → 慢，体积 ~950KB，但难抄')
} else {
  console.error('未知模式:', mode)
  console.error('用 dev 或 prod')
  process.exit(1)
}
