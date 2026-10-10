// 路由应用
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("路由应用"),
    P("多页面应用——hash 路由 + 页面切换。"),
    H2("router.js"),
    Code("import { signal } from 'xunay'\n\nfunction norm(h) {\n  h = (h || '').replace(/^#/, '')\n  if (!h) return '/'\n  if (!h.startsWith('/')) h = '/' + h\n  return h\n}\n\nexport const route = signal(norm(location.hash))\n\nwindow.addEventListener('hashchange', () => {\n  route(norm(location.hash))\n  window.scrollTo(0, 0)\n})\n\nexport function go(path) {\n  location.hash = path.startsWith('/') ? path : '/' + path\n}", "xuy"),
    H2("pages"),
    Code("// pages/Home.xuy\nexport function Home() {\n  return div({ class: 'page' },\n    h1(null, '首页'),\n    p(null, '欢迎使用')\n  )\n}\n\n// pages/Todo.xuy\nexport function Todo() {\n  const todos = signal([])\n  return div({ class: 'page' },\n    h1(null, '待办'),\n    ul(null, list(todos, t => t.id, t => li(null, t.title)))\n  )\n}\n\n// pages/About.xuy\nexport function About() {\n  return div({ class: 'page' },\n    h1(null, '关于'),\n    p(null, '版本 1.0.0')\n  )\n}", "xuy"),
    H2("app.xuy"),
    Code("// title: 路由应用\nimport { div, a, mount } from 'xunay'\nimport { route, go } from './src/router.js'\nimport { Home } from './src/pages/Home.js'\nimport { Todo } from './src/pages/Todo.js'\nimport { About } from './src/pages/About.js'\n\nfunction Nav() {\n  const link = (path, label) => a({\n    class: () => 'nav-link' + (route() === path ? ' active' : ''),\n    href: '#' + path,\n    on: { click: () => go(path) }\n  }, label)\n\n  return div({ class: 'nav' },\n    div({ class: 'brand' }, 'MyApp'),\n    link('/', '首页'),\n    link('/todo', '待办'),\n    link('/about', '关于')\n  )\n}\n\nmount(() => div({ class: 'app' },\n  Nav(),\n  () => {\n    const r = route()\n    if (r === '/') return Home()\n    if (r === '/todo') return Todo()\n    if (r === '/about') return About()\n    return div({ class: 'not-found' },\n      h1(null, '404'),\n      p(null, '页面不存在')\n    )\n  }\n), '#app')", "xuy"),
    H2("学习点"),
    Ul("signal + hashchange 做路由","() => route() 切换页面","每次切换重建页面（scope 独立）"),
  )
}
