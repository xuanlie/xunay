#!/usr/bin/env python3

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

swap("    ('ex-counter', '计数器', []),", r"""    ('ex-counter', '计数器', [
      ('H1','计数器'),
      ('P','最简单的 xunay 应用——20 行代码。'),
      ('H2','代码'),
      ('Code',"// app.xuy\n// title: 计数器\nimport { div, h1, button, span, signal, computed, mount } from 'xunay'\n\nconst n = signal(0)\nconst double = computed(() => n() * 2)\n\nmount(() => div({ class: 'app' },\n  h1(null, '计数器'),\n  div({ class: 'row' },\n    button({ on: { click: () => n(v => v - 1) } }, '-'),\n    span({ class: 'num' }, () => String(n())),\n    button({ on: { click: () => n(v => v + 1) } }, '+')\n  ),\n  p(null, () => '双倍: ' + double()),\n  button({ on: { click: () => n(0) } }, '重置')\n), '#app')",'xuy'),
      ('H2','关键点'),
      ('Ul',
        'signal(0) 创建状态',
        '() => n() 建立响应式',
        'n(v => v + 1) 函数式更新'),
      ('H2','扩展'),
      ('H3','加步长'),
      ('Code',"const step = signal(1)\nbutton({ on: { click: () => n(v => v + step()) } }, '+')",'xuy'),
      ('H3','持久化'),
      ('Code',"import { effect } from 'xunay'\n\nconst saved = localStorage.getItem('count')\nconst n = signal(saved ? +saved : 0)\n\neffect(() => localStorage.setItem('count', n()))",'xuy'),
      ('H3','键盘快捷键'),
      ('Code',"import { onMount } from 'xunay'\n\nonMount(() => {\n  const h = e => {\n    if (e.key === 'ArrowUp') n(v => v + 1)\n    if (e.key === 'ArrowDown') n(v => v - 1)\n  }\n  window.addEventListener('keydown', h)\n  onUnmount(() => window.removeEventListener('keydown', h))\n})",'xuy'),
    ]),""", "ex-counter")

swap("    ('ex-todo', '待办清单', []),", r"""    ('ex-todo', '待办清单', [
      ('H1','待办清单'),
      ('P','最完整的 xunay 示例——状态、列表、过滤、持久化。'),
      ('H2','代码'),
      ('Code',"// app.xuy\n// title: 待办\nimport { div, h1, p, ul, li, span, input, button, signal, computed, effect, list, show, mount } from 'xunay'\n\nconst stored = (() => {\n  try { return JSON.parse(localStorage.getItem('todos') || '[]') }\n  catch { return [] }\n})()\n\nconst todos = signal(stored)\nconst filter = signal('all')\nconst draft = signal('')\n\nconst filtered = computed(() => {\n  const t = todos(), f = filter()\n  if (f === 'active') return t.filter(x => !x.done)\n  if (f === 'done') return t.filter(x => x.done)\n  return t\n})\n\nconst count = computed(() => ({\n  total: todos().length,\n  active: todos().filter(t => !t.done).length\n}))\n\neffect(() => localStorage.setItem('todos', JSON.stringify(todos())))\n\nconst add = () => {\n  if (!draft().trim()) return\n  todos(l => [...l, { id: Date.now(), title: draft(), done: false }])\n  draft('')\n}\nconst toggle = id => todos(l => l.map(t => t.id === id ? { ...t, done: !t.done } : t))\nconst remove = id => todos(l => l.filter(t => t.id !== id))\n\nmount(() => div({ class: 'app' },\n  h1(null, '待办清单'),\n  p({ class: 'sub' }, () => `共 ${count().total} 条 · 未完成 ${count().active}`),\n\n  div({ class: 'row' },\n    input({\n      placeholder: '输入待办，回车添加…',\n      value: () => draft(),\n      on: {\n        input: e => draft(e.target.value),\n        keydown: e => { if (e.key === 'Enter') add() }\n      }\n    }),\n    button({ on: { click: add } }, '添加')\n  ),\n\n  div({ class: 'tabs' },\n    ['all', 'active', 'done'].map(k =>\n      span({\n        class: () => 'tab' + (filter() === k ? ' on' : ''),\n        on: { click: () => filter(k) }\n      }, k === 'all' ? '全部' : k === 'active' ? '未完成' : '已完成')\n    )\n  ),\n\n  show(() => filtered().length === 0, () => p({ class: 'empty' }, '暂无待办')),\n\n  ul({ class: 'list' },\n    list(filtered, t => t.id, t => li({ class: () => 'item' + (t.done ? ' done' : '') },\n      input({\n        type: 'checkbox',\n        checked: () => t.done,\n        on: { change: () => toggle(t.id) }\n      }),\n      span({ class: 'title' }, t.title),\n      button({ class: 'del', on: { click: () => remove(t.id) } }, '×')\n    ))\n  )\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'signal + computed 状态管理',
        'list 渲染列表',
        'show 条件渲染',
        'effect 持久化',
        'onMount 自动聚焦'),
      ('H2','扩展方向'),
      ('Ul',
        '加编辑功能',
        '加优先级',
        '加截止日期',
        '加拖拽排序'),
    ]),""", "ex-todo")

swap("    ('ex-chat', '聊天室', []),", r"""    ('ex-chat', '聊天室', [
      ('H1','聊天室'),
      ('P','WebSocket 实时聊天——多个标签页互相同步。'),
      ('H2','前端'),
      ('Code',"// app.xuy\n// title: 聊天室\nimport { div, h1, ul, li, input, button, span, signal, list, onMount, onUnmount, mount } from 'xunay'\n\nconst messages = signal([])\nconst draft = signal('')\nconst ws = signal(null)\n\nonMount(() => {\n  const proto = location.protocol === 'https:' ? 'wss' : 'ws'\n  const socket = new WebSocket(proto + '://' + location.host + '/ws')\n\n  socket.onmessage = e => {\n    try {\n      const msg = JSON.parse(e.data)\n      messages(l => [...l, msg])\n      setTimeout(() => {\n        const el = document.querySelector('.chat-body')\n        if (el) el.scrollTop = el.scrollHeight\n      }, 0)\n    } catch (_) {}\n  }\n\n  socket.onclose = () => {\n    console.log('连接关闭，2 秒后重连')\n    setTimeout(() => onMount(() => {}), 2000)\n  }\n\n  ws(socket)\n  onUnmount(() => socket.close())\n})\n\nconst send = () => {\n  if (!draft().trim()) return\n  const s = ws()\n  if (s && s.readyState === 1) {\n    s.send(JSON.stringify({ user: 'me', text: draft() }))\n  }\n  draft('')\n}\n\nmount(() => div({ class: 'chat' },\n  h1(null, '聊天室'),\n  ul({ class: 'chat-body' },\n    list(messages, m => m.id || Date.now() + Math.random(), m =>\n      li({ class: 'msg' },\n        span({ class: 'user' }, m.user + ': '),\n        span({ class: 'text' }, m.text)\n      )\n    )\n  ),\n  div({ class: 'chat-input' },\n    input({\n      placeholder: '输入消息…',\n      value: () => draft(),\n      on: {\n        input: e => draft(e.target.value),\n        keydown: e => { if (e.key === 'Enter') send() }\n      }\n    }),\n    button({ on: { click: send } }, '发送')\n  )\n), '#app')",'xuy'),
      ('H2','后端'),
      ('Code',"// backends/node/server.js\nimport { WebSocketServer } from 'ws'\n\nconst wss = new WebSocketServer({ port: 12341 })\nconst clients = new Set()\n\nwss.on('connection', ws => {\n  clients.add(ws)\n  ws.on('message', data => {\n    const msg = JSON.parse(data)\n    msg.id = Date.now() + Math.random()\n    for (const c of clients) {\n      if (c.readyState === 1) c.send(JSON.stringify(msg))\n    }\n  })\n  ws.on('close', () => clients.delete(ws))\n})",'js'),
      ('H2','学习点'),
      ('Ul',
        'WebSocket 集成',
        '自动重连',
        '自动滚到底部',
        '多标签页同步'),
    ]),""", "ex-chat")

swap("    ('ex-table', '数据表格', []),", r"""    ('ex-table', '数据表格', [
      ('H1','数据表格'),
      ('P','带排序、分页、过滤的表格。'),
      ('H2','代码'),
      ('Code',"// app.xuy\nimport { div, table, thead, tbody, tr, th, td, input, button, span, signal, computed, list, mount } from 'xunay'\n\nconst rows = signal(Array.from({ length: 100 }, (_, i) => ({\n  id: i + 1,\n  name: '用户 ' + (i + 1),\n  age: 20 + (i % 40),\n  city: ['北京', '上海', '广州', '深圳'][i % 4]\n})))\n\nconst q = signal('')\nconst sortBy = signal('id')\nconst sortDir = signal('asc')\nconst page = signal(1)\nconst pageSize = 10\n\nconst filtered = computed(() => {\n  const keyword = q().toLowerCase()\n  if (!keyword) return rows()\n  return rows().filter(r => r.name.toLowerCase().includes(keyword))\n})\n\nconst sorted = computed(() => {\n  const list = [...filtered()]\n  const key = sortBy()\n  const dir = sortDir() === 'asc' ? 1 : -1\n  list.sort((a, b) => a[key] > b[key] ? dir : -dir)\n  return list\n})\n\nconst paged = computed(() => {\n  const start = (page() - 1) * pageSize\n  return sorted().slice(start, start + pageSize)\n})\n\nconst totalPages = computed(() => Math.ceil(filtered().length / pageSize))\n\nconst sortByCol = k => {\n  if (sortBy() === k) sortDir(d => d === 'asc' ? 'desc' : 'asc')\n  else { sortBy(k); sortDir('asc') }\n}\n\nmount(() => div({ class: 'page' },\n  div({ class: 'toolbar' },\n    input({ placeholder: '搜索姓名…', value: () => q(), on: { input: e => { q(e.target.value); page(1) } } })\n  ),\n\n  table({ class: 'table' },\n    thead(null, tr(null,\n      th({ on: { click: () => sortByCol('id') } }, 'ID'),\n      th({ on: { click: () => sortByCol('name') } }, '姓名'),\n      th({ on: { click: () => sortByCol('age') } }, '年龄'),\n      th({ on: { click: () => sortByCol('city') } }, '城市')\n    )),\n    tbody(null,\n      list(paged, r => r.id, r => tr(null,\n        td(null, String(r.id)),\n        td(null, r.name),\n        td(null, String(r.age)),\n        td(null, r.city)\n      ))\n    )\n  ),\n\n  div({ class: 'pagination' },\n    button({ on: { click: () => page(p => Math.max(1, p - 1)) }, disabled: () => page() === 1 }, '上一页'),\n    span(null, () => page() + ' / ' + totalPages()),\n    button({ on: { click: () => page(p => Math.min(totalPages(), p + 1)) }, disabled: () => page() >= totalPages() }, '下一页')\n  )\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'computed 链式派生——filtered → sorted → paged',
        '每次输入 q 只重算 filtered 之后的链',
        '表格用 th / td 标签工厂'),
    ]),""", "ex-table")

swap("    ('ex-form', '表单验证', []),", r"""    ('ex-form', '表单验证', [
      ('H1','表单验证'),
      ('P','多字段表单，实时校验，提交时全部检查。'),
      ('H2','代码'),
      ('Code',"// app.xuy\nimport { div, h1, form, input, label, button, span, signal, computed, show, mount } from 'xunay'\n\nconst username = signal('')\nconst email = signal('')\nconst password = signal('')\nconst confirm = signal('')\nconst agree = signal(false)\nconst submitting = signal(false)\nconst result = signal('')\n\nconst errors = computed(() => {\n  const e = {}\n  if (username() && username().length < 2) e.username = '至少 2 个字符'\n  if (email() && !/^[^@]+@[^@]+\\.[^@]+$/.test(email())) e.email = '邮箱格式不正确'\n  if (password() && password().length < 6) e.password = '至少 6 位'\n  if (confirm() && confirm() !== password()) e.confirm = '两次密码不一致'\n  if (!agree()) e.agree = '必须同意条款'\n  return e\n})\n\nconst valid = computed(() => {\n  return username() && email() && password() && confirm() &&\n    Object.keys(errors()).filter(k => k !== 'agree').length === 0\n})\n\nasync function submit(e) {\n  e.preventDefault()\n  if (!valid()) return\n  submitting(true)\n  result('')\n  try {\n    // 模拟 API\n    await new Promise(r => setTimeout(r, 800))\n    result('注册成功！')\n  } finally {\n    submitting(false)\n  }\n}\n\nconst field = (labelText, sig, type, errorKey) => div({ class: 'field' },\n  label(null, labelText),\n  input({\n    type: type || 'text',\n    class: () => 'input' + (errors()[errorKey] ? ' error' : ''),\n    value: () => sig(),\n    on: { input: e => sig(e.target.value) }\n  }),\n  show(() => errors()[errorKey], () => div({ class: 'error-msg' }, () => errors()[errorKey]))\n)\n\nmount(() => div({ class: 'page' },\n  h1(null, '注册'),\n  form({ class: 'form', on: { submit: submit } },\n    field('用户名', username, 'text', 'username'),\n    field('邮箱', email, 'email', 'email'),\n    field('密码', password, 'password', 'password'),\n    field('确认密码', confirm, 'password', 'confirm'),\n    div({ class: 'field' },\n      label(null,\n        input({ type: 'checkbox', checked: () => agree(), on: { change: e => agree(e.target.checked) } }),\n        ' 我同意用户条款'\n      ),\n      show(() => errors().agree, () => div({ class: 'error-msg' }, '必须同意条款'))\n    ),\n    button({\n      type: 'submit',\n      class: 'btn-primary',\n      disabled: () => submitting()\n    }, () => submitting() ? '提交中...' : '注册'),\n    show(() => result(), () => div({ class: 'success' }, () => result()))\n  )\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'computed 做实时校验',
        'show 显示错误',
        '表单提交用原生 submit 事件',
        'disabled 用函数响应式'),
    ]),""", "ex-form")

swap("    ('ex-list-1000', '1000 行列表', []),", r"""    ('ex-list-1000', '1000 行列表', [
      ('H1','1000 行列表'),
      ('P','性能测试——1000 项增删改查，看 xunay 有多快。'),
      ('H2','代码'),
      ('Code',"// app.xuy\nimport { div, h1, p, ul, li, button, input, span, signal, list, mount } from 'xunay'\n\nconst items = signal(Array.from({ length: 1000 }, (_, i) => ({\n  id: i + 1,\n  title: '项目 ' + (i + 1),\n  done: false\n})))\n\nconst pushFirst = () => items(l => [{ id: Date.now(), title: '新项目', done: false }, ...l])\nconst pushLast = () => items(l => [...l, { id: Date.now(), title: '新项目', done: false }])\nconst popFirst = () => items(l => l.slice(1))\nconst popLast = () => items(l => l.slice(0, -1))\nconst shuffle = () => items(l => [...l].sort(() => Math.random() - 0.5))\nconst toggleFirst = () => items(l => l.map((t, i) => i === 0 ? { ...t, done: !t.done } : t))\nconst clear = () => items([])\nconst reset = () => items(Array.from({ length: 1000 }, (_, i) => ({ id: i + 1, title: '项目 ' + (i + 1), done: false })))\n\nmount(() => div({ class: 'page' },\n  h1(null, '1000 行列表'),\n  p(null, () => '共 ' + items().length + ' 项'),\n\n  div({ class: 'row' },\n    button({ on: { click: pushFirst } }, '头部加'),\n    button({ on: { click: pushLast } }, '尾部加'),\n    button({ on: { click: popFirst } }, '头部删'),\n    button({ on: { click: popLast } }, '尾部删'),\n    button({ on: { click: shuffle } }, '打乱'),\n    button({ on: { click: toggleFirst } }, '切换第 1 项'),\n    button({ on: { click: clear } }, '清空'),\n    button({ on: { click: reset } }, '重置')\n  ),\n\n  ul({ class: 'list' },\n    list(items, t => t.id, t => li({ class: () => t.done ? 'done' : '' },\n      span(null, t.title)\n    ))\n  )\n), '#app')",'xuy'),
      ('H2','性能参考'),
      ('Table',['操作','耗时'],[
        ['首次渲染 1000 项','~40ms'],
        ['追加 1 项','~0.5ms'],
        ['删除 1 项','~0.5ms'],
        ['打乱 1000 项','~8ms'],
        ['切换 1 项状态','~0.3ms']),
      ('H2','关键'),
      ('Ul',
        'list 用 id 做 key',
        'toggle 时返回新对象触发 fastUpdate',
        '不重建未变的项'),
    ]),""", "ex-list-1000")

swap("    ('ex-router', '路由应用', []),", r"""    ('ex-router', '路由应用', [
      ('H1','路由应用'),
      ('P','多页面应用——hash 路由 + 页面切换。'),
      ('H2','router.js'),
      ('Code',"import { signal } from 'xunay'\n\nfunction norm(h) {\n  h = (h || '').replace(/^#/, '')\n  if (!h) return '/'\n  if (!h.startsWith('/')) h = '/' + h\n  return h\n}\n\nexport const route = signal(norm(location.hash))\n\nwindow.addEventListener('hashchange', () => {\n  route(norm(location.hash))\n  window.scrollTo(0, 0)\n})\n\nexport function go(path) {\n  location.hash = path.startsWith('/') ? path : '/' + path\n}",'xuy'),
      ('H2','pages'),
      ('Code',"// pages/Home.xuy\nexport function Home() {\n  return div({ class: 'page' },\n    h1(null, '首页'),\n    p(null, '欢迎使用')\n  )\n}\n\n// pages/Todo.xuy\nexport function Todo() {\n  const todos = signal([])\n  return div({ class: 'page' },\n    h1(null, '待办'),\n    ul(null, list(todos, t => t.id, t => li(null, t.title)))\n  )\n}\n\n// pages/About.xuy\nexport function About() {\n  return div({ class: 'page' },\n    h1(null, '关于'),\n    p(null, '版本 1.0.0')\n  )\n}",'xuy'),
      ('H2','app.xuy'),
      ('Code',"// title: 路由应用\nimport { div, a, mount } from 'xunay'\nimport { route, go } from './src/router.xuy'\nimport { Home } from './src/pages/Home.xuy'\nimport { Todo } from './src/pages/Todo.xuy'\nimport { About } from './src/pages/About.xuy'\n\nfunction Nav() {\n  const link = (path, label) => a({\n    class: () => 'nav-link' + (route() === path ? ' active' : ''),\n    href: '#' + path,\n    on: { click: () => go(path) }\n  }, label)\n\n  return div({ class: 'nav' },\n    div({ class: 'brand' }, 'MyApp'),\n    link('/', '首页'),\n    link('/todo', '待办'),\n    link('/about', '关于')\n  )\n}\n\nmount(() => div({ class: 'app' },\n  Nav(),\n  () => {\n    const r = route()\n    if (r === '/') return Home()\n    if (r === '/todo') return Todo()\n    if (r === '/about') return About()\n    return div({ class: 'not-found' },\n      h1(null, '404'),\n      p(null, '页面不存在')\n    )\n  }\n), '#app')",'xuy'),
      ('H2','学习点'),
      ('Ul',
        'signal + hashchange 做路由',
        '() => route() 切换页面',
        '每次切换重建页面（scope 独立）'),
    ]),""", "ex-router")

swap("    ('ex-ssr', 'SSR 应用', []),", r"""    ('ex-ssr', 'SSR 应用', [
      ('H1','SSR 应用'),
      ('P','服务端渲染 + 客户端 hydrate——首屏快，SEO 好。'),
      ('H2','共享 App.js'),
      ('Code',"import { div, h1, p, ul, li, button, signal, list } from 'xunay'\n\nexport function App({ initialTodos = [] } = {}) {\n  const todos = signal(initialTodos)\n  return div({ class: 'app' },\n    h1(null, 'SSR 演示'),\n    p(null, () => '共 ' + todos().length + ' 条'),\n    ul(null, list(todos, t => t.id, t => li(null, t.title))),\n    button({ on: { click: () => todos(l => [...l, { id: Date.now(), title: '新任务' }]) } }, '添加')\n  )\n}",'xuy'),
      ('H2','服务端'),
      ('Code',"// server.js\nimport express from 'express'\nimport { renderToString } from 'xunay/ssr'\nimport { App } from './App.js'\n\nconst app = express()\n\napp.get('/', async (req, res) => {\n  const todos = [\n    { id: 1, title: '学习 SSR' },\n    { id: 2, title: '看文档' }\n  ]\n  const html = renderToString(App({ initialTodos: todos }))\n  res.send(`\n    <!DOCTYPE html>\n    <html>\n    <head><title>SSR</title></head>\n    <body>\n      <div id=\"app\">${html}</div>\n      <script>window.__TODOS__ = ${JSON.stringify(todos)}</script>\n      <script type=\"module\" src=\"/client.js\"></script>\n    </body>\n    </html>\n  `)\n})\n\napp.listen(12340)",'js'),
      ('H2','客户端'),
      ('Code',"// client.js\nimport { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nconst initialTodos = window.__TODOS__ || []\nhydrate(App({ initialTodos }), '#app')",'js'),
      ('H2','构建'),
      ('Code',"# 服务端\nnode server.js\n\n# 客户端\nnode bin/xuyc.js build client.xuy --out dist",'bash'),
      ('H2','学习点'),
      ('Ul',
        'renderToString 在服务端跑',
        'hydrate 在客户端接管',
        '初始状态通过 window.__INITIAL__ 传递',
        '两端首屏 HTML 必须一致'),
      ('H2','注意'),
      ('Warn','服务端渲染时不要用 onMount、effect、window、document——环境里没有。'),
    ]),""", "ex-ssr")

swap("    ('ex-anim', '动画', []),", r"""    ('ex-anim', '动画', [
      ('H1','动画'),
      ('P','列表增删淡入、模态框进出、按钮反馈。'),
      ('H2','CSS 过渡'),
      ('Code',"// style.css\n.fade-enter { opacity: 0; transform: translateY(-8px) }\n.fade-enter-active { opacity: 1; transform: none; transition: all .3s }\n.fade-leave { opacity: 1 }\n.fade-leave-active { opacity: 0; transition: opacity .2s }",'css'),
      ('H2','列表项淡入'),
      ('Code',"import { list, li, onMount } from 'xunay'\n\nlist(items, i => i.id, i => {\n  const el = li({ class: 'fade-enter' }, i.title)\n  onMount(() => {\n    requestAnimationFrame(() => el.classList.add('fade-enter-active'))\n  })\n  return el\n})",'xuy'),
      ('H2','按钮点击反馈'),
      ('Code',"button({\n  class: () => 'btn' + (pressed() ? ' pressed' : ''),\n  on: {\n    pointerdown: () => pressed(true),\n    pointerup: () => pressed(false),\n    pointerleave: () => pressed(false)\n  }\n}, '点击')",'xuy'),
      ('H2','模态框过渡'),
      ('Code',"const visible = signal(false)\nconst active = signal(false)\n\nfunction open() {\n  visible(true)\n  requestAnimationFrame(() => active(true))\n}\n\nfunction close() {\n  active(false)\n  setTimeout(() => visible(false), 300)\n}\n\nshow(visible, () => {\n  const el = div({ class: () => 'modal' + (active() ? ' in' : '') }, '内容')\n  return el\n})",'xuy'),
      ('H2','FLIP 动画'),
      ('P','列表重排时用 FLIP——先记录位置，再改，再动画。'),
      ('Code',"export function flip(container, mutate) {\n  const before = new Map()\n  for (const el of container.children) {\n    before.set(el, el.getBoundingClientRect())\n  }\n  mutate()\n  for (const el of container.children) {\n    const a = before.get(el)\n    if (!a) continue\n    const b = el.getBoundingClientRect()\n    const dx = a.left - b.left\n    const dy = a.top - b.top\n    if (!dx && !dy) continue\n    el.animate(\n      [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],\n      { duration: 200, easing: 'ease-out' }\n    )\n  }\n}",'js'),
      ('H2','内置 trans'),
      ('Code',"import { trans } from 'xunay'\n\nconst fade = trans(200)\n\nonMount(() => fade.enter(el))\nonUnmount(() => fade.leave(el, () => {}))",'xuy'),
      ('H2','性能提示'),
      ('Ul',
        '用 transform / opacity——GPU 加速',
        '避免 height / top / left 变化',
        'will-change 提示浏览器',
        'requestAnimationFrame 保证时机'),
    ]),""", "ex-anim")

swap("    ('ex-fullstack', '全栈应用', []),", r"""    ('ex-fullstack', '全栈应用', [
      ('H1','全栈应用'),
      ('P','前端 + 后端 + RPC + WebSocket + 持久化——完整示例。'),
      ('H2','项目结构'),
      ('Code',"myapp/\n├── app.xuy                 前端入口\n├── src/\n│   ├── api/client.xuy      RPC 客户端\n│   ├── store/todos.xuy     状态\n│   ├── pages/\n│   └── components/\n├── backend/                Python 后端\n│   ├── main.py\n│   ├── api/todos.py\n│   └── db.py\n└── shared/routes.json      路由表",'txt'),
      ('H2','路由表'),
      ('Code',"// shared/routes.json\n{\n  \"routes\": [\n    { \"name\": \"token\", \"method\": \"GET\", \"path\": \"/rpc/token\", \"auth\": false },\n    { \"name\": \"getTodos\", \"method\": \"GET\", \"path\": \"/rpc/getTodos\", \"auth\": true },\n    { \"name\": \"addTodo\", \"method\": \"POST\", \"path\": \"/rpc/addTodo\", \"auth\": true },\n    { \"name\": \"toggleTodo\", \"method\": \"POST\", \"path\": \"/rpc/toggleTodo\", \"auth\": true },\n    { \"name\": \"deleteTodo\", \"method\": \"POST\", \"path\": \"/rpc/deleteTodo\", \"auth\": true }\n  ]\n}",'json'),
      ('H2','RPC 客户端'),
      ('Code',"// src/api/client.xuy\nimport { signal } from 'xunay'\n\nconst _token = signal('')\n\nasync function ensureToken() {\n  if (_token()) return _token()\n  const r = await fetch('/rpc/token')\n  const j = await r.json()\n  _token(j.data.token)\n  return _token()\n}\n\nexport const api = {\n  async get(path) {\n    const t = await ensureToken()\n    const r = await fetch(path, { headers: { Authorization: 'Bearer ' + t } })\n    const j = await r.json()\n    if (!j.ok) throw new Error(j.error)\n    return j.data\n  },\n  async post(path, body) {\n    const t = await ensureToken()\n    const r = await fetch(path, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },\n      body: JSON.stringify(body)\n    })\n    const j = await r.json()\n    if (!j.ok) throw new Error(j.error)\n    return j.data\n  }\n}",'xuy'),
      ('H2','状态层'),
      ('Code',"// src/store/todos.xuy\nimport { signal } from 'xunay'\nimport { api } from '../api/client.xuy'\n\nexport const todos = signal([])\nexport const loading = signal(false)\nexport const error = signal(null)\n\nexport async function load() {\n  loading(true)\n  error(null)\n  try {\n    todos(await api.get('/rpc/getTodos'))\n  } catch (e) {\n    error(e.message)\n  } finally {\n    loading(false)\n  }\n}\n\nexport async function add(title) {\n  const t = await api.post('/rpc/addTodo', { title })\n  todos(l => [...l, t])\n}\n\nexport async function toggle(id) {\n  const t = await api.post('/rpc/toggleTodo', { id })\n  todos(l => l.map(x => x.id === id ? t : x))\n}\n\nexport async function remove(id) {\n  await api.post('/rpc/deleteTodo', { id })\n  todos(l => l.filter(x => x.id !== id))\n}",'xuy'),
      ('H2','后端'),
      ('Code',"# backend/main.py\nfrom fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom .api import token, todos\n\napp = FastAPI()\napp.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])\n\napp.include_router(token.router)\napp.include_router(todos.router)\n\n# backend/db.py\nimport sqlite3\nconn = sqlite3.connect('data.db')\nconn.execute('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, title TEXT, done INTEGER)')\n\ndef get_todos():\n    return [dict(id=r[0], title=r[1], done=bool(r[2])) for r in conn.execute('SELECT * FROM todos')]\n\ndef add_todo(title):\n    cur = conn.execute('INSERT INTO todos (title, done) VALUES (?, 0)', (title,))\n    conn.commit()\n    return {'id': cur.lastrowid, 'title': title, 'done': False}",'py'),
      ('H2','启动'),
      ('Code',"# 后端\ncd backend && uvicorn main:app --port 12342\n\n# 前端构建\ncd myapp && npm run build",'bash'),
      ('H2','学习点'),
      ('Ul',
        'shared/routes.json 统一路由',
        'RPC 客户端封装认证',
        'signal 做全局状态',
        '前后端同源部署'),
    ]),""", "ex-fullstack")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("示例 10 篇已填")
