#!/usr/bin/env node
// 后处理：javascript-obfuscator 混淆（不重复 minify —— xuyc 已压缩）
// 用法：node bin/post-build.mjs <outDir>
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const outDir = process.argv[2]
if (!outDir) { console.error('用法: node bin/post-build.mjs <outDir>'); process.exit(1) }

function readCfg() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
    return j.xunay || {}
  } catch (e) { return {} }
}
const CFG = readCfg()
const DO_OBF = CFG.obfuscate === true

const files = fs.readdirSync(outDir)
const appJs = files.includes('app.js')
  ? 'app.js'
  : files.find(f => /^app\.[a-f0-9]+\.js$/.test(f))
if (!appJs) { console.error('找不到 app.js in ' + outDir); process.exit(1) }

const appPath = path.join(outDir, appJs)
let js = fs.readFileSync(appPath, 'utf8')
console.log('[post] 输入: ' + appJs + ' (' + js.length + ' bytes)')

if (!DO_OBF) {
  console.log('[post] obfuscate 未开启，跳过')
  process.exit(0)
}

try {
  const Obfuscator = (await import('javascript-obfuscator')).default
  const obf = Obfuscator.obfuscate(js, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: false,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  })
  const code = obf.getObfuscatedCode()
  console.log('[post] obfuscator: ' + js.length + ' → ' + code.length + ' bytes')
  js = code
} catch (e) {
  console.warn('[post] obfuscator 跳过:', e.message)
}

fs.writeFileSync(appPath, js, 'utf8')
console.log('[post] 输出: ' + appJs + ' (' + js.length + ' bytes)')
console.log('[post] 完成')
