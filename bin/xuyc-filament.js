#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
if (!args[0]) {
  console.error('用法: node bin/xuyc-filament.js <scene.xuy> [--out dir] [--build] [--install]')
  process.exit(1)
}
const entry = path.resolve(args[0])
if (!fs.existsSync(entry)) { console.error('入口不存在:', entry); process.exit(1) }

const outIdx = args.indexOf('--out')
const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.resolve('build/filament')
const doBuild = args.includes('--build')
const doInstall = args.includes('--install')

fs.mkdirSync(outDir, { recursive: true })

const src = fs.readFileSync(entry, 'utf8')
const parserMod = await import(pathToFileURL(path.join(ROOT, 'android-3d-filament/src/parser.js')).href)
const genMod = await import(pathToFileURL(path.join(ROOT, 'android-3d-filament/src/gen.js')).href)

const ir = parserMod.parseScene(src)
console.log('[filament] 节点数:', ir.nodes.length, ' 灯光数:', ir.lights.length, ' 相机距离:', ir.camera.distance)

const baseDir = path.dirname(entry)
const assets = {}
function isRemoteUrl(src) { return /^https?:\/\//i.test(String(src || '')) }

async function downloadUrl(url, destPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.writeFileSync(destPath, buf)
  return buf
}

async function fetchRemoteGltf(srcUrl, cacheDir) {
  const urlObj = new URL(srcUrl)
  const filename = path.basename(urlObj.pathname) || 'model.gltf'
  const isGlb = filename.toLowerCase().endsWith('.glb')
  const localPath = path.join(cacheDir, filename)

  console.log('[filament] 下载远程模型:', srcUrl)
  await downloadUrl(srcUrl, localPath)
  console.log('[filament] 保存到:', localPath, '(' + fs.statSync(localPath).size + ' bytes)')

  if (isGlb) return localPath

  // .gltf：递归下载 buffers / images
  const j = JSON.parse(fs.readFileSync(localPath, 'utf8'))
  const baseUrl = srcUrl.replace(/\/[^/]*$/, '/')

  async function fetchDep(uri) {
    if (!uri || uri.startsWith('data:') || uri.startsWith('blob:')) return uri
    const absUrl = isRemoteUrl(uri) ? uri : new URL(uri, baseUrl).href
    const name = path.basename(new URL(absUrl).pathname)
    const dst = path.join(cacheDir, name)
    if (!fs.existsSync(dst)) {
      await downloadUrl(absUrl, dst)
      console.log('[filament] 依赖:', absUrl, '->', name, '(' + fs.statSync(dst).size + ' bytes)')
    }
    return name
  }

  for (const buf of j.buffers || []) {
    if (buf.uri) buf.uri = await fetchDep(buf.uri)
  }
  for (const img of j.images || []) {
    if (img.uri) img.uri = await fetchDep(img.uri)
  }
  fs.writeFileSync(localPath, JSON.stringify(j), 'utf8')
  return localPath
}

function readGlb(buf) {
  const magic = buf.readUInt32LE(0)
  if (magic !== 0x46546C67) throw new Error('not GLB (magic)')
  const version = buf.readUInt32LE(4)
  if (version !== 2) throw new Error('GLB version must be 2, got ' + version)
  let off = 12
  let json = null
  let bin = Buffer.alloc(0)
  while (off + 8 <= buf.length) {
    const chunkLen = buf.readUInt32LE(off); off += 4
    const chunkType = buf.readUInt32LE(off); off += 4
    const chunkData = buf.subarray(off, off + chunkLen); off += chunkLen
    if (chunkType === 0x4E4F534A) json = JSON.parse(chunkData.toString('utf8'))
    else if (chunkType === 0x004E4942) bin = chunkData
  }
  if (!json) throw new Error('GLB missing JSON chunk')
  return { json, bin }
}

for (const n of ir.nodes) {
  const texRel = n.material && n.material.texture
  if (!texRel) continue
  let texPath = path.resolve(baseDir, texRel)
  if (!fs.existsSync(texPath)) texPath = path.resolve(ROOT, texRel)
  if (!fs.existsSync(texPath)) { console.warn('[filament] 纹理找不到:', texRel); continue }
  const name = path.basename(texPath)
  const key = 'textures/' + name
  assets[key] = fs.readFileSync(texPath)
  n.material.textureAsset = key
  console.log('[filament] 纹理:', texRel, '->', key, '(' + assets[key].length + ' bytes)')
}

for (const n of ir.nodes) {
  if (!n.geometry || n.geometry.kind !== 'model') continue
  const srcRel = n.geometry.src
  if (!srcRel) { console.warn('[filament] model 缺 src'); continue }
  let gltfPath
  if (isRemoteUrl(srcRel)) {
    const cacheDir = path.join(ROOT, '.xunay-cache', 'remote')
    try {
      gltfPath = await fetchRemoteGltf(srcRel, cacheDir)
    } catch (e) {
      console.warn('[filament] 远程下载失败:', srcRel, e.message)
      continue
    }
  } else {
    gltfPath = path.resolve(baseDir, srcRel)
    if (!fs.existsSync(gltfPath)) gltfPath = path.resolve(ROOT, srcRel)
    if (!fs.existsSync(gltfPath)) { console.warn('[filament] model 找不到:', srcRel); continue }
  }

  let gltfJson
  let binBufFromGlb = null
  const isGlb = srcRel.toLowerCase().endsWith('.glb')
  if (isGlb) {
    try {
      const glbBuf = fs.readFileSync(gltfPath)
      const r = readGlb(glbBuf)
      gltfJson = r.json
      binBufFromGlb = r.bin
      console.log('[filament] GLB:', srcRel, '-> JSON', (glbBuf.length - binBufFromGlb.length) + 'B + BIN', binBufFromGlb.length + 'B')
    } catch (e) {
      console.warn('[filament] GLB 解析失败:', srcRel, e.message)
      continue
    }
  } else {
    try { gltfJson = JSON.parse(fs.readFileSync(gltfPath, 'utf8')) }
    catch (e) { console.warn('[filament] model 解析失败:', srcRel, e.message); continue }
  }

  const gltfDir = path.dirname(gltfPath)
  const extId = 'ext' + Object.keys(assets).length

  let binBuf = binBufFromGlb || Buffer.alloc(0)
  const buf0 = gltfJson.buffers && gltfJson.buffers[0]
  if (!binBufFromGlb && buf0 && buf0.uri) {
    if (buf0.uri.startsWith('data:')) { console.warn('[filament] model buffer 是 data URI，暂不支持:', srcRel); continue }
    const binPath = path.resolve(gltfDir, buf0.uri)
    if (!fs.existsSync(binPath)) { console.warn('[filament] model .bin 找不到:', buf0.uri); continue }
    binBuf = fs.readFileSync(binPath)
  }

  for (const img of gltfJson.images || []) {
    if (!img.uri || img.uri.startsWith('data:')) continue
    if (isGlb) continue  // GLB 里的 uri 也是外部的（罕见），暂不处理
    const texPath = path.resolve(gltfDir, img.uri)
    if (!fs.existsSync(texPath)) { console.warn('[filament] model 纹理找不到:', img.uri); continue }
    const baseName = path.basename(texPath)
    const newKey = 'textures/' + extId + '_' + baseName
    assets[newKey] = fs.readFileSync(texPath)
    console.log('[filament] model 纹理:', img.uri, '->', newKey)
    img.uri = newKey
  }

  if (buf0) { delete buf0.uri; buf0.byteLength = binBuf.length }

  n.externalGltf = { json: gltfJson, bin: binBuf }
  console.log('[filament] model:', srcRel, '->', (gltfJson.meshes || []).length, 'meshes,', (gltfJson.nodes || []).length, 'nodes')
}

// 扫音频
for (const a of ir.audios || []) {
  if (!a.src) continue
  let audioPath = path.resolve(baseDir, a.src)
  if (!fs.existsSync(audioPath)) audioPath = path.resolve(ROOT, a.src)
  if (!fs.existsSync(audioPath)) { console.warn('[filament] audio 找不到:', a.src); continue }
  const name = path.basename(audioPath)
  const key = 'audios/' + name
  assets[key] = fs.readFileSync(audioPath)
  a.src = key
  console.log('[filament] 音频:', a.src, '->', key, '(' + assets[key].length + ' bytes)')
}

const { files } = genMod.genFilament(ir, assets)
for (const [rel, content] of Object.entries(files)) {
  const full = path.join(outDir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  if (Buffer.isBuffer(content)) fs.writeFileSync(full, content)
  else fs.writeFileSync(full, content, 'utf8')
  console.log('  ->', rel)
}

const srcRoot = path.join(ROOT, 'android-3d-filament')
if (!fs.existsSync(path.join(outDir, 'gradlew'))) {
  const gw = path.join(srcRoot, 'gradlew')
  const gwb = path.join(srcRoot, 'gradlew.bat')
  if (fs.existsSync(gw)) fs.copyFileSync(gw, path.join(outDir, 'gradlew'))
  if (fs.existsSync(gwb)) fs.copyFileSync(gwb, path.join(outDir, 'gradlew.bat'))
  const lp = path.join(srcRoot, 'local.properties')
  if (fs.existsSync(lp) && !fs.existsSync(path.join(outDir, 'local.properties'))) {
    fs.copyFileSync(lp, path.join(outDir, 'local.properties'))
    console.log('  -> local.properties')
  }
  const gd = path.join(srcRoot, 'gradle')
  if (fs.existsSync(gd)) fs.cpSync(gd, path.join(outDir, 'gradle'), { recursive: true })
  console.log('  -> gradle wrapper')
}
const envsSrc = path.join(srcRoot, 'app/src/main/assets/envs')
if (fs.existsSync(envsSrc)) {
  fs.cpSync(envsSrc, path.join(outDir, 'app/src/main/assets/envs'), { recursive: true })
  console.log('  -> envs')
}

console.log('[filament] 输出:', outDir)

if (doBuild) {
  const { spawnSync } = await import('node:child_process')
  console.log('[filament] gradlew assembleDebug ...')
  const r = spawnSync('cmd', ['/c', 'gradlew.bat', 'assembleDebug'], { cwd: outDir, stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status || 1)
  const apk = path.join(outDir, 'app/build/outputs/apk/debug/app-debug.apk')
  console.log('[filament] APK:', apk)
  if (doInstall) {
    spawnSync('adb', ['install', '--no-streaming', '-t', '-r', apk], { stdio: 'inherit', timeout: 90000 })
    spawnSync('adb', ['shell', 'am', 'force-stop', 'com.xunay.filament'], { stdio: 'inherit' })
    spawnSync('adb', ['shell', 'am', 'start', '-n', 'com.xunay.filament/.MainActivity'], { stdio: 'inherit' })
  }
}
