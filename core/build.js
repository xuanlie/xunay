import esbuild from 'esbuild'
import fs from 'fs'
import zlib from 'zlib'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ===== kit 编译期转换 plugin =====
const { compile: compileXuy } = await import('../compiler3/src/index.js')
const KIT_SKIP = /kit-util\.js$|element\.js$|\.bak/
const kitCompilePlugin = {
  name: 'kit-compile',
  setup(build) {
    build.onLoad({ filter: /kit.*\.js$/ }, async (args) => {
      if (args.path.includes('node_modules')) return
      if (KIT_SKIP.test(args.path)) return
      let src = fs.readFileSync(args.path, 'utf8')
      try {
        src = compileXuy(src)
      } catch (e) {
        console.warn('[kit-compile] ' + args.path.split(/[\\/]/).pop() + ': ' + e.message)
      }
      return { contents: src, loader: 'js' }
    })
  }
}

const _origBuild = esbuild.build.bind(esbuild)
async function build(opts) {
  opts.plugins = (opts.plugins || []).concat([kitCompilePlugin])
  return _origBuild(opts)
}

await build({
  entryPoints: [path.join(__dirname, 'src/index.js')],
  bundle: true, minify: true, format: 'iife', globalName: 'XuNay',
  outfile: path.join(__dirname, 'dist/xunay.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

await build({
  entryPoints: [path.join(__dirname, 'src/index.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay.esm.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

await build({
  entryPoints: [path.join(__dirname, 'src/kit-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-kit.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

await build({
  entryPoints: [path.join(__dirname, 'src/full-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-full.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

for (const [entry, out] of [
  ['ssr-entry.js', 'xunay-ssr.min.js'],
  ['babylon-entry.js', 'xunay-babylon.min.js'],
  ['audio-entry.js', 'xunay-audio.min.js'],
  ['music-entry.js', 'xunay-music.min.js'],
  ['game-entry.js', 'xunay-game.min.js'],
  ['game-mobile-entry.js', 'xunay-game-mobile.min.js'],
  ['anim-entry.js', 'xunay-anim.min.js'],
  ['dev-entry.js', 'xunay-dev.min.js'],
]) {
  await build({
    entryPoints: [path.join(__dirname, 'src/' + entry)],
    bundle: true, minify: true, format: 'esm',
    outfile: path.join(__dirname, 'dist/' + out),
    target: ['es2020'], charset: 'utf8', legalComments: 'none',
  })
}

await build({
  entryPoints: [path.join(__dirname, 'src/devtools-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-devtools.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})


// kit 各分组独立打包
for (const [entry, out] of [
  ['kit-form.js', 'xunay-kit-form.min.js'],
  ['kit-display.js', 'xunay-kit-display.min.js'],
  ['kit-nav.js', 'xunay-kit-nav.min.js'],
  ['kit-data.js', 'xunay-kit-data.min.js'],
  ['kit-upload.js', 'xunay-kit-upload.min.js'],
  ['kit-editor.js', 'xunay-kit-editor.min.js'],
  ['kit-overlay.js', 'xunay-kit-overlay.min.js'],
  ['kit-layout.js', 'xunay-kit-layout.min.js'],
  ['kit-charts.js', 'xunay-kit-charts.min.js'],
  ['kit-virtual.js', 'xunay-kit-virtual.min.js'],
]) {
  await build({
    entryPoints: [path.join(__dirname, 'src/' + entry)],
    bundle: true, minify: true, format: 'esm',
    outfile: path.join(__dirname, 'dist/' + out),
    target: ['es2020'], charset: 'utf8', legalComments: 'none',
  })
}

await build({
  entryPoints: [path.join(__dirname, 'src/site-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-site.esm.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})


await build({
  entryPoints: [path.join(__dirname, 'src/auth-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-auth.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})


for (const name of ['storage', 'http', 'i18n', 'theme']) {
  await build({
    entryPoints: [path.join(__dirname, 'src/' + name + '-entry.js')],
    bundle: true, minify: true, format: 'esm',
    outfile: path.join(__dirname, 'dist/xunay-' + name + '.min.js'),
    target: ['es2020'], charset: 'utf8', legalComments: 'none',
  })
}


for (const name of ['query', 'form', 'persist', 'router']) {
  await build({
    entryPoints: [path.join(__dirname, 'src/' + name + '-entry.js')],
    bundle: true, minify: true, format: 'esm',
    outfile: path.join(__dirname, 'dist/xunay-' + name + '.min.js'),
    target: ['es2020'], charset: 'utf8', legalComments: 'none',
  })
}


await build({
  entryPoints: [path.join(__dirname, 'src/mobile-entry.js')],
  bundle: true, minify: true, format: 'esm',
  outfile: path.join(__dirname, 'dist/xunay-mobile.min.js'),
  target: ['es2020'], charset: 'utf8', legalComments: 'none',
})

const a = fs.readFileSync(path.join(__dirname, 'dist/xunay.min.js'))
const b = fs.readFileSync(path.join(__dirname, 'dist/xunay.esm.js'))
console.log('iife:', a.length, '| gzip', zlib.gzipSync(a, { level: 9 }).length)
console.log('esm: ', b.length, '| gzip', zlib.gzipSync(b, { level: 9 }).length)
