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
    preview: 'cd dist && python3 -m http.server 8080',
    test: 'node --test test/',
    lint: 'eslint .',
    format: 'prettier --write \"**/*.{js,mjs,xuy,css,html,json,md}\"'
  },
  xunay: {
    alias: { '@': './src' },
    css: ['tw', 'ui'],
    devtools: true
  },
  devDependencies: {
    xunay: 'file:' + xunayRoot,
    esbuild: '^0.24.0',
    eslint: '^9.0.0',
    prettier: '^3.0.0'
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
import { Index } from '@/pages/index.xuy'
import { About } from '@/pages/about.xuy'

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
      if (r === '/') return Index()
      if (r === '/about') return About()
      return NotFound()
    })
  )
}

mount(() => App(), '#app')
`)

// ==================== src/router.xuy ====================
// 注意：跑 `xuyc build` 时会被 scan-pages 自动覆盖（源：src/pages/）
// 下面是初始手写版，格式跟自动生成一致
write('src/router.xuy', `import { signal } from 'xunay'
import { Index } from './pages/index.xuy'
import { About } from './pages/about.xuy'

function norm(hash) {
  hash = (hash || '').replace(/^#/, '')
  if (!hash) return '/'
  if (!hash.startsWith('/')) hash = '/' + hash
  return hash
}

export const route = signal(norm(location.hash))

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    route(norm(location.hash))
    window.scrollTo(0, 0)
  })
}

export function go(path) {
  location.hash = path.startsWith('/') ? path : '/' + path
}

const TABLE = [
  { url: '/', Comp: Index, params: [] },
  { url: '/about', Comp: About, params: [] }
]

export function match(path) {
  for (const r of TABLE) {
    const m = parse(r, path)
    if (m) return m
  }
  return null
}

function parse(r, path) {
  if (r.params.length === 0) {
    return r.url === path ? { Comp: r.Comp, params: {} } : null
  }
  const parts = path.split('/').filter(Boolean)
  const tpl = r.url.split('/').filter(Boolean)
  if (parts.length !== tpl.length) return null
  const params = {}
  for (let i = 0; i < tpl.length; i++) {
    const t = tpl[i]
    if (t.startsWith(':')) params[t.slice(1)] = decodeURIComponent(parts[i])
    else if (t !== parts[i]) return null
  }
  return { Comp: r.Comp, params }
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
write('src/components/Header.xuy', `import { div, a } from 'xunay'
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
write('src/components/Counter.xuy', `import { div, button } from 'xunay'
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

// ==================== src/pages/index.xuy ====================
write('src/pages/index.xuy', `import { div, h1, p } from 'xunay'
import { Counter } from '@/components/Counter.xuy'
import { isLoggedIn } from '@/store/app.xuy'

export function Index() {
  return div({ class: 'page' },
    h1(null, '欢迎'),
    p({ class: 'lead' }, '编辑 src/pages/index.xuy 开始。'),
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

// ==================== src/pages/about.xuy ====================
write('src/pages/about.xuy', `import { div, h1, p, a } from 'xunay'

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

// ==================== 工程化文件 ====================

// ESLint flat config
write('eslint.config.js', `export default [
  {
    files: ['**/*.js', '**/*.mjs', '**/*.xuy'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        console: 'readonly', fetch: 'readonly', WebSocket: 'readonly',
        location: 'readonly', history: 'readonly', localStorage: 'readonly',
        setTimeout: 'readonly', clearTimeout: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly',
        requestAnimationFrame: 'readonly', performance: 'readonly',
        URL: 'readonly', URLSearchParams: 'readonly', Blob: 'readonly',
        TextDecoder: 'readonly', TextEncoder: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  { ignores: ['dist/**', 'node_modules/**'] }
]
`)

// Prettier
write('.prettierrc', JSON.stringify({
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100
}, null, 2) + '\n')

// Git hooks
write('.githooks/pre-commit', `#!/bin/sh
files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(js|mjs|xuy)$' || true)
if [ -z "$files" ]; then exit 0; fi
npx eslint $files --quiet || exit 1
`)

// 测试
write('test/example.test.js', `import { test } from 'node:test'
import assert from 'node:assert/strict'

test('example: 1 + 1 = 2', () => {
  assert.equal(1 + 1, 2)
})

test('example: 数组 map', () => {
  const arr = [1, 2, 3]
  assert.deepEqual(arr.map(x => x * 2), [2, 4, 6])
})

// 要测 src/ 下的 .xuy 文件：
// 1. 先跑 'xuyc build app.xuy --out dist'
// 2. 从 dist 或 src 里的编译产物导入
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
console.log('          ├── index.xuy')
console.log('          └── about.xuy')
console.log('')
console.log('下一步:')
console.log('  cd ' + name)
console.log('  npm install')
console.log('')
console.log('启用 git hooks（可选）:')
console.log('  git init')
console.log('  git config core.hooksPath .githooks')
console.log('  chmod +x .githooks/pre-commit')
console.log('')
console.log('  npm run dev      # 开发')
console.log('  npm run build    # 构建')
console.log('  npm run test     # 测试')
console.log('  npm run lint     # 代码检查')
