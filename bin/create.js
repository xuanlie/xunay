#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const name = process.argv[2] || 'myapp'
const dir = path.resolve(name)

if (fs.existsSync(dir)) {
  console.error('目录已存在: ' + dir)
  process.exit(1)
}

fs.mkdirSync(dir, { recursive: true })
fs.mkdirSync(path.join(dir, 'src'), { recursive: true })

fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
  name,
  version: '1.0.0',
  type: 'module',
  scripts: {
    dev: 'node ../bin/xuyc.js build app.xuy --out dist && cd dist && python3 -m http.server 8080',
    build: 'node ../bin/xuyc.js build app.xuy --out dist'
  },
  devDependencies: { esbuild: '^0.24.0' }
}, null, 2) + '\n')

fs.writeFileSync(path.join(dir, 'app.xuy'), `// title: ${name}
import { div, h1, p, button, span, signal, mount } from 'xunay'

const n = signal(0)

mount(() => div({ class: 'app' },
  h1(null, '${name}'),
  p(null, '编辑 app.xuy 开始开发'),
  div({ class: 'row' },
    button({ on: { click: () => n(v => v - 1) } }, '-'),
    span(null, () => n()),
    button({ on: { click: () => n(v => v + 1) } }, '+')
  )
), '#app')
`)

fs.writeFileSync(path.join(dir, 'src', 'style.css'), `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f7; color: #222; padding: 40px 20px; }
.app { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,.06); }
h1 { font-size: 28px; margin-bottom: 12px; }
p { color: #888; margin-bottom: 24px; }
.row { display: flex; gap: 12px; align-items: center; }
button { padding: 10px 20px; font-size: 16px; border: none; border-radius: 8px; background: #1f6feb; color: #fff; cursor: pointer; }
button:hover { background: #388bfd; }
`)

fs.writeFileSync(path.join(dir, 'README.md'), `# ${name}

用 XuNay 构建。

## 开发

    node ../bin/xuyc.js build app.xuy --out dist
    cd dist && python3 -m http.server 8080

或：

    npm run dev

## 构建

    npm run build

输出在 dist/。
`)

console.log('创建完成: ' + name)
console.log('')
console.log('下一步：')
console.log('  cd ' + name)
console.log('  node ../bin/xuyc.js build app.xuy --out dist')
console.log('  cd dist && python3 -m http.server 8080')
