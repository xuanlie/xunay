#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
if (!args[0]) {
  console.error('用法: node bin/xuyc-android.js <entry.xuy> [--out build/android] [--build] [--install]')
  process.exit(1)
}

const entryPath = path.resolve(args[0])
if (!fs.existsSync(entryPath)) { console.error('入口不存在:', entryPath); process.exit(1) }

const outIdx = args.indexOf('--out')
const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.resolve('build/android')
fs.mkdirSync(outDir, { recursive: true })

const src = fs.readFileSync(entryPath, 'utf8')
const { parse } = await import('file://' + path.join(ROOT, 'android/src/parser.js').replace(/\\/g, '/'))
const { genAndroid } = await import('file://' + path.join(ROOT, 'android/src/gen.js').replace(/\\/g, '/'))

const ast = parse(src)
console.log('[xuyc] 源码长度:', src.length, ' AST:', ast.length)

const { files } = genAndroid(src, ast)
for (const [rel, content] of Object.entries(files)) {
  const full = path.join(outDir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
  console.log('  →', rel)
}

// 打包 @font-face 里的字体
;(function() {
  const __fontRe = /@font-face\s*\{([^}]+)\}/g
  let __fontM
  while ((__fontM = __fontRe.exec(src)) !== null) {
    const __body = __fontM[1]
    const __nameM = __body.match(/font-family\s*:\s*['"]?([^;'"]+)['"]?/)
    const __srcM = __body.match(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/)
    if (!__nameM || !__srcM) continue
    const __fname = __nameM[1].trim().replace(/['"]/g, '')
    const __src0 = __srcM[1].trim()
    const __cands = [
      path.resolve(ROOT, __src0),
      path.resolve(path.dirname(path.resolve(args[0])), __src0),
      path.resolve(__src0),
    ]
    const __fpath = __cands.find(p => fs.existsSync(p))
    const __dstDir = path.join(outDir, 'app/src/main/assets/fonts')
    fs.mkdirSync(__dstDir, { recursive: true })
    if (__fpath) {
      fs.copyFileSync(__fpath, path.join(__dstDir, __fname + '.ttf'))
      console.log('[xuyc] 字体:', __srcM[1], '->', __fname + '.ttf', '(' + fs.statSync(__fpath).size + ' bytes)')
    } else {
      console.warn('[xuyc] 字体找不到，尝试过:'); __cands.forEach(p => console.warn('  ', p))
    }
  }
})()

if (args.includes('--build') || args.includes('--install')) {
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
  const gradlewPath = path.join(outDir, gradlew)
  if (!fs.existsSync(gradlewPath)) {
    console.log('[xuyc] 未找到 gradle wrapper，尝试用系统 gradle 生成...')
    const g = spawnSync('gradle', ['wrapper', '--gradle-version', '8.7'], {
      cwd: outDir, stdio: 'inherit', shell: process.platform === 'win32'
    })
    if (g.status !== 0 || !fs.existsSync(gradlewPath)) {
      // 自动拷 gradle wrapper（从 android-3d-filament 或 android-3d）
      let __wrapperCopied = false
      for (const __src of [path.join(ROOT, "android-3d-filament"), path.join(ROOT, "android-3d")]) {
        if (!fs.existsSync(path.join(__src, "gradlew"))) continue
        try {
          fs.copyFileSync(path.join(__src, "gradlew"), path.join(outDir, "gradlew"))
          fs.copyFileSync(path.join(__src, "gradlew.bat"), path.join(outDir, "gradlew.bat"))
          const __lp = path.join(__src, "local.properties")
          if (fs.existsSync(__lp)) fs.copyFileSync(__lp, path.join(outDir, "local.properties"))
          const __gd = path.join(__src, "gradle")
          if (fs.existsSync(__gd)) fs.cpSync(__gd, path.join(outDir, "gradle"), { recursive: true })
          console.log("[xuyc] 从 " + path.basename(__src) + " 拷了 gradle wrapper")
          __wrapperCopied = true
          break
        } catch (e) {}
      }
      if (!__wrapperCopied) {
      console.error('[xuyc] 无法生成 gradle wrapper。三种方案：')
      console.error('  1. 安装 Gradle 8.x  https://gradle.org/install/  后重试')
      console.error('  2. 用 Android Studio 打开  build/android  目录')
      console.error('  3. 从任意 Android 工程拷贝 gradlew / gradlew.bat / gradle/ 到 build/android/')
      process.exit(1)
    }
  }
  console.log('\n[xuyc] 编译 APK ...')
  const r = spawnSync(gradlew, ['assembleDebug', '--no-daemon'], {
    cwd: outDir, stdio: 'inherit', shell: process.platform === 'win32'
  })
  if (r.status !== 0) { console.error('[xuyc] 编译失败'); process.exit(1) }
  const apk = path.join(outDir, 'app/build/outputs/apk/debug/app-debug.apk')
  console.log('[xuyc] APK:', apk)

  if (args.includes('--install')) {
    console.log('[xuyc] 安装到设备 ...')
    const a = spawnSync('adb', ['install', '-r', apk], { stdio: 'inherit' })
    if (a.status === 0) {
      spawnSync('adb', ['shell', 'am', 'start', '-n', 'com.xunay.app/.MainActivity'], { stdio: 'inherit' })
      console.log('[xuyc] 已启动')
    }
  }
}}
