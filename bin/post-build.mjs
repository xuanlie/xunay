#!/usr/bin/env node
// 后处理：terser 压缩 + javascript-obfuscator 混淆 + CSS 类名 hash
// 用法：node bin/post-build.mjs <outDir>
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
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
const DO_HASH = CFG.cssHash === true

const files = fs.readdirSync(outDir)
const appJs = files.find(f => /^app(\.[a-f0-9]+)?\.js$/.test(f))
if (!appJs) { console.error('找不到 app.js in ' + outDir); process.exit(1) }

const appPath = path.join(outDir, appJs)
let js = fs.readFileSync(appPath, 'utf8')
console.log('[post] 输入: ' + appJs + ' (' + js.length + ' bytes)')

// ============ 1. CSS 类名 hash ============
if (DO_HASH) {
  const cssFiles = files.filter(f => f.endsWith('.css'))
  const classMap = {}  // 'doc-card' → 'x_a1b2c3'

  // 1a. 扫所有 CSS，收集类名
  const allClasses = new Set()
  for (const cf of cssFiles) {
    const css = fs.readFileSync(path.join(outDir, cf), 'utf8')
    const re = /\.([a-zA-Z_][a-zA-Z0-9_-]*)/g
    let m
    while ((m = re.exec(css)) !== null) allClasses.add(m[1])
  }
  console.log('[post] CSS 类名总数: ' + allClasses.size)

  // 1b. 生成 hash
  for (const cls of allClasses) {
    const h = crypto.createHash('md5').update(cls).digest('hex').slice(0, 8)
    classMap[cls] = 'x_' + h
  }

  // 1c. 改 CSS 文件
  for (const cf of cssFiles) {
    const p = path.join(outDir, cf)
    let css = fs.readFileSync(p, 'utf8')
    // 精确替换 .classname 边界（前面非 - 后面非字母数字-_）
    css = css.replace(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/g, (full, cls) => {
      return classMap[cls] ? '.' + classMap[cls] : full
    })
    fs.writeFileSync(p, css, 'utf8')
  }
  console.log('[post] CSS 文件已 hash')

  // 1d. 改 app.js 里的类名字符串
  // 策略：所有字符串字面量中，只要整个字符串是「由空格分隔的类名列表」且每个词都在 classMap，就替换
  // 或：字符串里出现的 token 完全匹配某个类名时替换
  let replaced = 0
  js = js.replace(/(['"])((?:[^'"\\]|\\.)*?)\1/g, (full, q, inner) => {
    // 只处理看起来像 className 的字符串（不含特殊字符，长度合理）
    if (inner.length > 200) return full
    // 拆成 token（按空格）
    const tokens = inner.split(/\s+/)
    let changed = false
    const newTokens = tokens.map(t => {
      if (classMap[t]) { changed = true; replaced++; return classMap[t] }
      return t
    })
    if (!changed) return full
    return q + newTokens.join(' ') + q
  })
  console.log('[post] app.js 替换 ' + replaced + ' 个类名')
}

// ============ 2. terser 压缩 ============
if (DO_OBF) {
  try {
    const esbuild = (await import('esbuild')).default
    const r = await esbuild.transform(js, {
      minify: true,
      target: 'es2020',
      legalComments: 'none',
    })
    if (r.code) {
      console.log('[post] esbuild minify: ' + js.length + ' → ' + r.code.length + ' bytes')
      js = r.code
    }
  } catch (e) {
    console.warn('[post] esbuild 压缩失败，跳过:', e.message)
  }

  // ============ 3. javascript-obfuscator 字符串加密 ============
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
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: false,
      unicodeEscapeSequence: false,
    })
    const code = obf.getObfuscatedCode()
    console.log('[post] obfuscator: ' + js.length + ' → ' + code.length + ' bytes')
    js = code
  } catch (e) {
    console.warn('[post] obfuscator 跳过:', e.message)
  }
}

// ============ 4. 写回 ============
fs.writeFileSync(appPath, js, 'utf8')
console.log('[post] 输出: ' + appJs + ' (' + js.length + ' bytes)')
console.log('[post] 完成')
