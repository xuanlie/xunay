// SSR 应用
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("SSR 应用"),
    P("服务端渲染 + 客户端 hydrate——首屏快，SEO 好。"),
    H2("共享 App.js"),
    Code("import { div, h1, p, ul, li, button, signal, list } from 'xunay'\n\nexport function App({ initialTodos = [] } = {}) {\n  const todos = signal(initialTodos)\n  return div({ class: 'app' },\n    h1(null, 'SSR 演示'),\n    p(null, () => '共 ' + todos().length + ' 条'),\n    ul(null, list(todos, t => t.id, t => li(null, t.title))),\n    button({ on: { click: () => todos(l => [...l, { id: Date.now(), title: '新任务' }]) } }, '添加')\n  )\n}", "xuy"),
    H2("服务端"),
    Code("// server.js\nimport express from 'express'\nimport { renderToString } from 'xunay/ssr'\nimport { App } from './App.js'\n\nconst app = express()\n\napp.get('/', async (req, res) => {\n  const todos = [\n    { id: 1, title: '学习 SSR' },\n    { id: 2, title: '看文档' }\n  ]\n  const html = renderToString(App({ initialTodos: todos }))\n  res.send(`\n    <!DOCTYPE html>\n    <html>\n    <head><title>SSR</title></head>\n    <body>\n      <div id=\"app\">${html}</div>\n      <script>window.__TODOS__ = ${JSON.stringify(todos)}</script>\n      <script type=\"module\" src=\"/client.js\"></script>\n    </body>\n    </html>\n  `)\n})\n\napp.listen(12340)", "js"),
    H2("客户端"),
    Code("// client.js\nimport { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nconst initialTodos = window.__TODOS__ || []\nhydrate(App({ initialTodos }), '#app')", "js"),
    H2("构建"),
    Code("# 服务端\nnode server.js\n\n# 客户端\nnode bin/xuyc.js build client.xuy --out dist", "bash"),
    H2("学习点"),
    Ul("renderToString 在服务端跑","hydrate 在客户端接管","初始状态通过 window.__INITIAL__ 传递","两端首屏 HTML 必须一致"),
    H2("注意"),
    Warn("服务端渲染时不要用 onMount、effect、window、document——环境里没有。"),
  )
}
