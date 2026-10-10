import fs from 'node:fs'
import { execSync } from 'node:child_process'

process.chdir('site')

console.log('[1/5] 生成文档...')
execSync('python gen-docs.py', { stdio: 'inherit' })

console.log('\n[2/5] 编译 app.xuy...')
execSync('node ../bin/xuyc.js build app.xuy --out dist', { stdio: 'inherit' })

console.log('\n[3/5] JIT 任意值...')
execSync('node ../scripts/gen-jit.mjs src', { stdio: 'inherit' })

console.log('\n[4/5] 后处理...')
execSync('node ../bin/post-build.mjs dist', { stdio: 'inherit' })

console.log('\n[5/5] 清 dist 缓存...')
let html = fs.readFileSync('dist/index.html', 'utf8')
const referenced = new Set()
html.replace(/(?:src|href)="\.\/([^"?]+)/g, (_, name) => { referenced.add(name) })
for (const f of fs.readdirSync('dist')) {
  if (/\.[a-z0-9]{8}\.(js|css)$/.test(f)) {
    if (referenced.has(f)) continue
    fs.unlinkSync('dist/' + f)
    console.log('  删旧 hash 文件: ' + f)
  }
}
html = html.replace(/(src|href)="\.\/((?:[^"?]+?)\.[a-z0-9]{8})\.(js|css)(?:\?[^"]*)?"/g,
  (m, attr, base, ext) => attr + '="./' + base + '.' + ext + '"')
fs.writeFileSync('dist/index.html', html)

console.log('\n完成: ' + process.cwd() + '/dist')
console.log('启动: node site/serve.mjs 8080')
