#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
if (!args[0]) { console.error('用法: node bin/xuyc-3d.js <scene.xuy> [--out build/android-3d]'); process.exit(1) }
const entry = path.resolve(args[0])
if (!fs.existsSync(entry)) { console.error('入口不存在:', entry); process.exit(1) }

const outIdx = args.indexOf('--out')
const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.resolve('build/android-3d')
fs.mkdirSync(outDir, { recursive: true })

const src = fs.readFileSync(entry, 'utf8')
const { parseScene } = await import('file://' + path.join(ROOT, 'android-3d/src/parser.js').replace(/\\/g, '/'))
const { genAndroid3D } = await import('file://' + path.join(ROOT, 'android-3d/src/gen.js').replace(/\\/g, '/'))

const scene = parseScene(src)

// 读取 model 里引用的 .obj
const baseDir = path.dirname(entry)
const assets = {}
for (const obj of scene.objects) {
  if (obj.texture) {
    const texPath = path.resolve(baseDir, obj.texture)
    if (fs.existsSync(texPath)) {
      const name = path.basename(texPath)
      assets[name] = fs.readFileSync(texPath)
      obj.textureAsset = name
      console.log('[3d] 加载纹理:', obj.texture, '(' + assets[name].length + ' bytes)')
    } else {
      console.warn('[3d] 找不到纹理:', texPath)
    }
  }
  if (obj.type === 'model' && obj.src) {
    const objPath = path.resolve(baseDir, obj.src)
    if (fs.existsSync(objPath)) {
      assets[path.basename(objPath)] = fs.readFileSync(objPath, 'utf8')
      obj.assetName = path.basename(objPath)
      console.log('[3d] 加载模型:', obj.src, '(' + assets[obj.assetName].length + ' bytes)')
    } else {
      console.warn('[3d] 找不到:', objPath)
    }
  }
}

console.log('[3d] 对象数:', scene.objects.length, ' 相机距离:', scene.camera.distance)
const { files } = genAndroid3D(scene, assets)
for (const [rel, content] of Object.entries(files)) {
  const full = path.join(outDir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  if (Buffer.isBuffer(content)) fs.writeFileSync(full, content)
  else fs.writeFileSync(full, content, 'utf8')
  console.log('  →', rel)
}
console.log('[3d] 输出:', outDir)