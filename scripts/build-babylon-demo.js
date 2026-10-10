// 用 esbuild 打包 demo, tree-shaking 掉未用的 Babylon 模块
import esbuild from 'esbuild'
import { gzipSync } from 'zlib'
import { readFileSync, statSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const outfile = path.join(root, 'examples/babylon-demo/dist/bundle.js')

await esbuild.build({
  entryPoints: [path.join(root, 'examples/babylon-demo/main.js')],
  bundle: true,
  minify: true,
  format: 'esm',
  target: ['es2020'],
  outfile,
  charset: 'utf8',
  legalComments: 'none',
  splitting: false,
  treeShaking: true,
  metafile: true,
  logLevel: 'info',
})

const raw = readFileSync(outfile)
const gz = gzipSync(raw, { level: 9 })
console.log(`\n📦 bundle: ${(raw.length/1024).toFixed(1)} KB | gzip: ${(gz.length/1024).toFixed(1)} KB`)
