import fs from 'node:fs'
import { execSync } from 'node:child_process'

process.chdir('web/site')

console.log('[1/5] 生成文档...')
execSync('python3 gen-docs.py', { stdio: 'inherit' })

console.log('\n[2/5] 编译 app.xuy...')
execSync('node ../../bin/xuyc.js build app.xuy --out dist --splitting', { stdio: 'inherit' })

console.log('\n[3/5] JIT 任意值...')
execSync('node ../../scripts/gen-jit.mjs src', { stdio: 'inherit' })

console.log('\n[4/5] 清 dist 旧 hash 缓存...')
{
  const html = fs.readFileSync('dist/index.html', 'utf8')
  const referenced = new Set()
  html.replace(/(?:src|href)="\.\/([^"?]+)/g, (_, name) => { referenced.add(name) })
  for (const f of fs.readdirSync('dist')) {
    if (/\.[a-z0-9]{8}\.(js|css)$/.test(f)) {
      if (referenced.has(f)) continue
      fs.unlinkSync('dist/' + f)
      console.log('  删旧 hash 文件: ' + f)
    }
  }
  // 清 chunks 里超过 5 分钟的旧文件（esbuild 每次 hash 都会生成新的）
  const chunksDir = 'dist/chunks'
  if (fs.existsSync(chunksDir)) {
    const now = Date.now()
    let cleaned = 0
    for (const f of fs.readdirSync(chunksDir)) {
      const full = chunksDir + '/' + f
      try {
        const age = now - fs.statSync(full).mtimeMs
        if (age > 5 * 60 * 1000) { fs.unlinkSync(full); cleaned++ }
      } catch {}
    }
    if (cleaned) console.log('  清旧 chunk: ' + cleaned + ' 个')
  }
}

console.log('\n[5/5] 后处理（minify + obfuscate）...')
execSync('node ../../bin/post-build.mjs dist', { stdio: 'inherit' })

console.log('\n[额外] 复制 playground + examples...')
{
  const fs2 = await import('node:fs')
  const cp = (src, dst) => {
    fs2.mkdirSync(dst, { recursive: true })
    for (const f of fs2.readdirSync(src)) {
      const s2 = src + '/' + f, d2 = dst + '/' + f
      if (fs2.statSync(s2).isDirectory()) cp(s2, d2)
      else fs2.copyFileSync(s2, d2)
    }
  }
  if (fs2.existsSync('../playground')) cp('../playground', 'dist/playground')
  if (fs2.existsSync('../examples'))   cp('../examples',   'dist/examples')
  console.log('  ✓ 已复制')
}

// 复制 AI.spec 到 dist
{
  const fs3 = await import('node:fs')
  for (const c of ['../AI.spec', '../../web/AI.spec', 'web/AI.spec', 'AI.spec']) {
    if (fs3.existsSync(c)) {
      fs3.copyFileSync(c, 'dist/AI.spec')
      console.log('  ✓ 已复制 AI.spec ← ' + c)
      break
    }
  }
}

console.log('\n完成: ' + process.cwd() + '/dist')
console.log('启动: node web/site/serve.mjs 8080')
