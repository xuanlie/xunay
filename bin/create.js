#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const name = process.argv[2] || 'myapp'
const dir = path.resolve(name)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const xunayRoot = path.resolve(__dirname, '..')

if (fs.existsSync(dir)) {
  console.error('目录已存在: ' + dir)
  process.exit(1)
}

function write(rel, content) {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content)
}

// ==================== package.json ====================
write('package.json', JSON.stringify({
  name,
  version: '1.0.0',
  type: 'module',
  scripts: {
    dev: 'xuyc build app.xuy --out dist && cd dist && python3 -m http.server 8080',
    build: 'xuyc build app.xuy --out dist',
    preview: 'cd dist && python3 -m http.server 8080'
  },
  xunay: {
    alias: { '@': './src' },
    css: ['tw', 'ui'],
    devtools: true
  },
  devDependencies: {
    xunay: 'file:' + xunayRoot,
    esbuild: '^0.24.0'
  }
}, null, 2) + '\n')

// ==================== .gitignore ====================
write('.gitignore', `node_modules/
dist/
*.log
.DS_Store
.env
`)

// ==================== README.md ====================
write('README.md', `# ${name}

用 XuNay 构建。

## 目录

    ${name}/
    ├── app.xuy              入口（mount + 路由）
    └── src/
        ├── router.xuy       路由
        ├── store/app.xuy    全局状态
        ├── components/      可复用组件
        ├── pages/           页面
        └── api/client.xuy   RPC 客户端（可选）

## 开发

    npm install
    npm run dev

打开 http://localhost:8080

## 构建

    npm run build

产物在 dist/。

## 路径别名

\`@/\` 指向 \`src/\`，配置在 package.json 的 \`xunay.alias\`：

    import { Header } from '@/components/Header.xuy'
    import { route } from '@/router.xuy'

## 加页面

1. 在 \`src/pages/\` 新建 \`Foo.xuy\`
2. 在 \`app.xuy\` 的 \`pages\` 映射里注册
3. 在 \`src/components/Header.xuy\` 加导航链接
`)

// ==================== app.xuy ====================
write('app.xuy', `// title: ${name}
import { div, mount } from 'xunay'
import { route } from '@/router.xuy'
import { Header } from '@/components/Header.xuy'
import { Home } from '@/pages/Home.xuy'
import { About } from '@/pages/About.xuy'

function NotFound() {
  return div({ class: 'not-found' },
    div({ class: 'nf-code' }, '404'),
    div({ class: 'nf-msg' }, '页面不存在'),
    div({ class: 'nf-path' }, () => route())
  )
}

function App() {
  return div({ class: 'app' },
    Header(),
    div({ class: 'main' }, () => {
      const r = route()
      if (r === '/') return Home()
      if (r === '/about') return About()
      return NotFound()
    })
  )
}

mount(() => App(), '#app')
`)

// ==================== src/router.xuy ====================
write('src/router.xuy', `import { signal } from 'xunay'

function norm(hash) {
  hash = (hash || '').replace(/^#/, '')
  if (!hash) return '/'
  if (!hash.startsWith('/')) hash = '/' + hash
  return hash
}

export const route = signal(norm(location.hash))

window.addEventListener('hashchange', () => {
  route(norm(location.hash))
  window.scrollTo(0, 0)
})

export function go(path) {
  location.hash = path.startsWith('/') ? path : '/' + path
}
`)

// ==================== src/store/app.xuy ====================
write('src/store/app.xuy', `import { signal, computed } from 'xunay'

// 全局状态。所有跨组件共享的 signal 放这里。
export const count = signal(0)
export const theme = signal('light')
export const user = signal(null)

// 派生状态
export const isLoggedIn = computed(() => user() !== null)
export const doubled = computed(() => count() * 2)

// 动作
export const inc = () => count(c => c + 1)
export const dec = () => count(c => c - 1)
export const reset = () => count(0)
export const toggleTheme = () => theme(t => t === 'light' ? 'dark' : 'light')
`)

// ==================== src/api/client.xuy ====================
write('src/api/client.xuy', `// RPC 客户端（需要后端时取消注释）
// 后端启动后，把 baseURL 指向它。
//
// import { rpc, initToken, setBase } from 'xunay'
//
// setBase('http://localhost:12342')
//
// export async function connect() {
//   await initToken()
// }
//
// export async function listTodos() {
//   return rpc.getTodos({})
// }
//
// export async function addTodo(title) {
//   return rpc.addTodo({ title })
// }

export {}
`)

// ==================== src/components/Header.xuy ====================
write('src/components/Header.xuy', `import { div, span, a } from 'xunay'
import { route, go } from '@/router.xuy'

const LINKS = [
  { path: '/', label: '首页' },
  { path: '/about', label: '关于' }
]

export function Header() {
  return div({ class: 'header' },
    div({ class: 'brand', on: { click: () => go('/') } }, '${name}'),
    div({ class: 'nav' },
      ...LINKS.map(link =>
        a({
          class: () => 'nav-link' + (route() === link.path ? ' on' : ''),
          href: '#' + link.path,
          on: { click: () => go(link.path) }
        }, link.label)
      )
    )
  )
}
`)

// ==================== src/components/Counter.xuy ====================
write('src/components/Counter.xuy', `import { div, button, span } from 'xunay'
import { count, doubled, inc, dec, reset } from '@/store/app.xuy'

export function Counter() {
  return div({ class: 'counter' },
    div({ class: 'counter-display' }, () => count()),
    div({ class: 'counter-hint' }, '翻倍：', () => doubled()),
    div({ class: 'counter-actions' },
      button({ class: 'btn', on: { click: dec } }, '−'),
      button({ class: 'btn primary', on: { click: inc } }, '+'),
      button({ class: 'btn ghost', on: { click: reset } }, '重置')
    )
  )
}
`)

// ==================== src/pages/Home.xuy ====================
write('src/pages/Home.xuy', `import { div, h1, p } from 'xunay'
import { Counter } from '@/components/Counter.xuy'
import { user, isLoggedIn } from '@/store/app.xuy'

export function Home() {
  return div({ class: 'page' },
    h1(null, '欢迎'),
    p({ class: 'lead' }, '编辑 src/pages/Home.xuy 开始。'),
    div({ class: 'card' },
      div({ class: 'card-title' }, '计数器示例'),
      Counter()
    ),
    div({ class: 'card' },
      div({ class: 'card-title' }, '状态示例'),
      div(null, () => isLoggedIn() ? '已登录' : '未登录')
    )
  )
}
`)

// ==================== src/pages/About.xuy ====================
write('src/pages/About.xuy', `import { div, h1, p, a } from 'xunay'

export function About() {
  return div({ class: 'page' },
    h1(null, '关于'),
    p(null, '这是一个用 XuNay 创建的项目。'),
    p(null, '文档：', a({ href: 'https://github.com', target: '_blank' }, 'GitHub')),
    p(null, '返回 ', a({ href: '#/' }, '首页'))
  )
}
`)

// ==================== src/style.css ====================
write('src/style.css', `* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #f5f5f7;
  color: #222;
  line-height: 1.6;
  padding: 24px;
}

.app {
  max-width: 720px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .04);
}

.brand {
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  color: #1f6feb;
}

.nav { display: flex; gap: 4px; }

.nav-link {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: background .15s;
}

.nav-link:hover { background: #f0f0f0; }
.nav-link.on { background: #1f6feb; color: #fff; }

.main { display: flex; flex-direction: column; gap: 16px; }

.page { display: flex; flex-direction: column; gap: 16px; }
.page h1 { font-size: 26px; }
.lead { color: #888; font-size: 15px; }

.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .04);
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #888;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.counter-display {
  font-size: 64px;
  font-weight: 700;
  color: #1f6feb;
  line-height: 1;
}

.counter-hint {
  font-size: 13px;
  color: #888;
}

.counter-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  padding: 10px 20px;
  font-size: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #eee;
  color: #222;
  transition: background .15s;
}

.btn:hover { background: #e0e0e0; }
.btn.primary { background: #1f6feb; color: #fff; }
.btn.primary:hover { background: #388bfd; }
.btn.ghost { background: transparent; color: #888; }

.not-found {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
}

.nf-code { font-size: 72px; font-weight: 700; color: #ddd; line-height: 1; }
.nf-msg { font-size: 18px; color: #666; margin-top: 12px; }
.nf-path { font-size: 13px; color: #aaa; margin-top: 8px; font-family: monospace; }

a { color: #1f6feb; }
`)

// ==================== 完成 ====================
console.log('创建完成: ' + name)
console.log('')
console.log('目录结构:')
console.log('  ' + name + '/')
console.log('  ├── app.xuy')
console.log('  ├── package.json')
console.log('  ├── .gitignore')
console.log('  ├── README.md')
console.log('  └── src/')
console.log('      ├── router.xuy')
console.log('      ├── style.css')
console.log('      ├── api/client.xuy')
console.log('      ├── store/app.xuy')
console.log('      ├── components/')
console.log('      │   ├── Header.xuy')
console.log('      │   └── Counter.xuy')
console.log('      └── pages/')
console.log('          ├── Home.xuy')
console.log('          └── About.xuy')
console.log('')
console.log('下一步:')
console.log('  cd ' + name)
console.log('  npm install')
console.log('  npm run dev')
