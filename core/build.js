import esbuild from 'esbuild'
import fs from 'fs'
import zlib from 'zlib'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/index.js')],
  bundle: true, minify: true, format: 'iife', globalName: 'XuNay',
  outfile: path.join(__dirname, 'dist/xunay.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/index.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay.esm.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/kit-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-kit.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/full-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-full.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

for (const [entry, out] of [
  ['ssr-entry.js', 'xunay-ssr.min.js'],
  ['anim-entry.js', 'xunay-anim.min.js'],
  ['dev-entry.js', 'xunay-dev.min.js'],
]) {
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'src/' + entry)],
    bundle: true, minify: true, format: 'esm',
    outfile: path.join(__dirname, 'dist/' + out),
    target: ['es2020'], charset: 'utf8', legalComments: 'none',
  })
}

await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/devtools-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-devtools.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

const a = fs.readFileSync(path.join(__dirname, 'dist/xunay.min.js'))
const b = fs.readFileSync(path.join(__dirname, 'dist/xunay.esm.js'))
console.log('iife:', a.length, '| gzip', zlib.gzipSync(a, { level: 9 }).length)
console.log('esm: ', b.length, '| gzip', zlib.gzipSync(b, { level: 9 }).length)
