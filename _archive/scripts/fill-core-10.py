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

# ============ router ============
swap("    ('core-router', '路由', []),", r"""    ('core-router', '路由', [
      ('H1','路由'),
      ('P','xunay 没有内置路由器——只有 signal + 事件监听。20 行代码就能写一个，完全可控。'),
      ('H2','hash 路由（推荐）'),
      ('Code',"import { signal } from 'xunay'\n\nfunction norm(h) {\n  h = (h || '').replace(/^#/, '')\n  if (!h) return '/'\n  if (!h.startsWith('/')) h = '/' + h\n  return h\n}\n\nexport const route = signal(norm(location.hash))\n\nwindow.addEventListener('hashchange', () => route(norm(location.hash)))\n\nexport function go(path) {\n  location.hash = path.startsWith('/') ? path : '/' + path\n}",'xuy'),
      ('H2','history 路由'),
      ('Code',"import { signal } from 'xunay'\n\nexport const route = signal(location.pathname)\n\nwindow.addEventListener('popstate', () => route(location.pathname))\n\nexport function go(path) {\n  history.pushState({}, '', path)\n  route(path)\n}",'xuy'),
      ('P','history 模式需要服务器配合——所有路径回退到 index.html。hash 模式不需要服务器配置。'),
      ('H2','用路由切换页面'),
      ('Code',"import { div } from 'xunay'\nimport { route } from './router.js'\nimport { Home } from './pages/Home.js'\nimport { Todo } from './pages/Todo.js'\n\nfunction App() {\n  return div(null,\n    () => {\n      const r = route()\n      if (r === '/') return Home()\n      if (r === '/todo') return Todo()\n      return div(null, '404')\n    }\n  )\n}",'xuy'),
      ('H2','带参数的路由'),
      ('Code',"// 路由：/user/123\nconst route = signal(location.pathname)\n\nfunction App() {\n  return div(null, () => {\n    const r = route()\n    const m = r.match(/^\/user\/(\\d+)$/)\n    if (m) return UserPage({ id: m[1] })\n    return div(null, '404')\n  })\n}",'xuy'),
      ('H2','查询参数'),
      ('Code',"const query = () => {\n  const s = location.hash.split('?')[1] || ''\n  const p = new URLSearchParams(s)\n  return { page: +(p.get('page') || 1) }\n}\n\n// /#/list?page=2 → { page: 2 }",'xuy'),
      ('H2','导航守卫'),
      ('Code',"function go(path) {\n  if (path === '/admin' && !user()) {\n    path = '/login'\n  }\n  location.hash = path\n}",'xuy'),
      ('H2','懒加载路由'),
      ('Code',"import { lazy } from 'xunay'\n\nconst pages = {\n  '/': lazy(() => import('./pages/Home.js')),\n  '/todo': lazy(() => import('./pages/Todo.js')),\n  '/login': lazy(() => import('./pages/Login.js'))\n}\n\nfunction App() {\n  return div(null, () => {\n    const Page = pages[route()]\n    return Page ? Page({}) : div(null, '404')\n  })\n}",'xuy'),
      ('H2','完整示例'),
      ('Code',"// router.js\nimport { signal } from 'xunay'\n\nexport const route = signal(location.hash.slice(1) || '/')\n\nwindow.addEventListener('hashchange', () => {\n  route(location.hash.slice(1) || '/')\n  window.scrollTo(0, 0)\n})\n\nexport function go(path) {\n  location.hash = path\n}\n\n// app.js\nimport { div, a, mount } from 'xunay'\nimport { route, go } from './router.js'\nimport { Home } from './pages/Home.js'\nimport { Todo } from './pages/Todo.js'\n\nfunction Nav() {\n  return div({ class: 'nav' },\n    a({ class: () => 'link' + (route() === '/' ? ' on' : ''), href: '#/', on: { click: () => go('/') } }, '首页'),\n    a({ class: () => 'link' + (route() === '/todo' ? ' on' : ''), href: '#/todo', on: { click: () => go('/todo') } }, '待办')\n  )\n}\n\nfunction App() {\n  return div({ class: 'app' },\n    Nav(),\n    () => route() === '/' ? Home() :\n          route() === '/todo' ? Todo() :\n          div(null, '404')\n  )\n}\n\nmount(() => App(), '#app')",'xuy'),
      ('H2','路由的性能'),
      ('Table',['操作','耗时','说明'],[
        ['切换路由','~1~5ms','整块重建'],
        ['预加载','0','lazy 已在缓存'],
        ['hashchange 触发','~0.1ms','浏览器原生'],
      ]),
      ('H2','常见陷阱'),
      ('H3','陷阱 1：history 模式刷新 404'),
      ('P','history 模式需要服务器配置回退。用 hash 模式最简单。'),
      ('H3','陷阱 2：忘记 scrollTo'),
      ('Code',"window.addEventListener('hashchange', () => {\n  route(location.hash.slice(1))\n  window.scrollTo(0, 0)   // 别忘了\n})",'xuy'),
    ]),""", "router")

# ============ async ============
swap("    ('core-async', '异步', []),", r"""    ('core-async', '异步', [
      ('H1','异步'),
      ('P','xunay 没有内置异步原语——用原生 fetch / Promise / async，配合 signal 显示状态。'),
      ('H2','基本模式'),
      ('Code',"import { signal, div, onMount, show } from 'xunay'\n\nfunction User({ id }) {\n  const data = signal(null)\n  const error = signal(null)\n  const loading = signal(true)\n\n  onMount(async () => {\n    try {\n      const r = await fetch('/api/user/' + id)\n      if (!r.ok) throw new Error('HTTP ' + r.status)\n      data(await r.json())\n    } catch (e) {\n      error(e.message)\n    } finally {\n      loading(false)\n    }\n  })\n\n  return div(null,\n    show(() => loading(), () => div(null, '加载中...')),\n    show(() => error(), () => div({ class: 'error' }, () => error())),\n    show(() => data(), () => div(null, () => data().name))\n  )\n}",'xuy'),
      ('H2','resource 模式'),
      ('P','把 loading / data / error 打包成一个对象：'),
      ('Code',"import { signal } from 'xunay'\n\nfunction resource(fetcher) {\n  const data = signal(null)\n  const error = signal(null)\n  const loading = signal(false)\n\n  async function reload(...args) {\n    loading(true)\n    error(null)\n    try {\n      data(await fetcher(...args))\n    } catch (e) {\n      error(e.message)\n    } finally {\n      loading(false)\n    }\n  }\n\n  reload()\n  return { data, error, loading, reload }\n}\n\n// 用\nconst todos = resource(() => fetch('/api/todos').then(r => r.json()))\nshow(todos.loading, () => div(null, '加载中'))\nshow(todos.error, () => div(null, () => '错误: ' + todos.error()))\nshow(todos.data, () => ul(null, list(todos.data(), t => t.id, t => li(null, t.title))))",'xuy'),
      ('H2','竞态处理'),
      ('P','快速切换请求时，后发的可能先返回——旧的覆盖新的。用 token 标识：'),
      ('Code',"const data = signal(null)\nlet token = 0\n\nasync function load(id) {\n  const myToken = ++token\n  const r = await fetch('/api/' + id)\n  const j = await r.json()\n  if (myToken !== token) return   // 已有更新请求\n  data(j)\n}",'xuy'),
      ('H2','取消请求'),
      ('Code',"let controller = null\n\nasync function load() {\n  if (controller) controller.abort()\n  controller = new AbortController()\n  try {\n    const r = await fetch('/api', { signal: controller.signal })\n    data(await r.json())\n  } catch (e) {\n    if (e.name === 'AbortError') return\n    error(e.message)\n  }\n}",'xuy'),
      ('H2','并发请求'),
      ('Code',"async function loadAll() {\n  const [user, todos, config] = await Promise.all([\n    fetch('/api/user').then(r => r.json()),\n    fetch('/api/todos').then(r => r.json()),\n    fetch('/api/config').then(r => r.json())\n  ])\n  batch(() => {\n    userSig(user)\n    todosSig(todos)\n    configSig(config)\n  })\n}",'xuy'),
      ('H2','超时控制'),
      ('Code',"function timeout(ms) {\n  return new Promise((_, reject) => {\n    setTimeout(() => reject(new Error('超时')), ms)\n  })\n}\n\nawait Promise.race([fetch('/api').then(r => r.json()), timeout(5000)])",'xuy'),
      ('H2','重试'),
      ('Code',"async function fetchWithRetry(url, n = 3) {\n  for (let i = 0; i < n; i++) {\n    try {\n      const r = await fetch(url)\n      if (r.ok) return r.json()\n      if (r.status < 500) throw new Error('HTTP ' + r.status)\n    } catch (e) {\n      if (i === n - 1) throw e\n      await new Promise(r => setTimeout(r, 1000 * (i + 1)))\n    }\n  }\n}",'xuy'),
      ('H2','轮询'),
      ('Code',"function usePolling(url, interval, onData) {\n  let timer = null\n  let stop = false\n\n  async function tick() {\n    if (stop) return\n    try {\n      const r = await fetch(url)\n      onData(await r.json())\n    } catch (e) {}\n    timer = setTimeout(tick, interval)\n  }\n\n  tick()\n  return () => {\n    stop = true\n    clearTimeout(timer)\n  }\n}",'xuy'),
      ('H2','完整示例：搜索建议'),
      ('Code',"import { signal, div, input, ul, li, list, show, onUnmount } from 'xunay'\n\nfunction Search() {\n  const q = signal('')\n  const results = signal([])\n  const loading = signal(false)\n  let token = 0\n  let timer = null\n\n  function onInput(e) {\n    q(e.target.value)\n    clearTimeout(timer)\n    if (!q()) { results([]); return }\n    loading(true)\n    timer = setTimeout(async () => {\n      const my = ++token\n      try {\n        const r = await fetch('/api/search?q=' + encodeURIComponent(q()))\n        const j = await r.json()\n        if (my === token) results(j)\n      } finally {\n        if (my === token) loading(false)\n      }\n    }, 300)\n  }\n\n  onUnmount(() => { clearTimeout(timer); token++ })\n\n  return div(null,\n    input({ value: () => q(), on: { input: onInput }, placeholder: '搜索…' }),\n    show(() => loading(), () => div(null, '搜索中...')),\n    ul(null, list(results, r => r.id, r => li(null, r.title)))\n  )\n}",'xuy'),
      ('H2','常见陷阱'),
      ('H3','陷阱 1：直接读 signal 的值做闭包'),
      ('Code',"onMount(async () => {\n  const id = props.id          // 固定值，OK\n  const r = await fetch('/api/' + id)\n  const id2 = props.id         // 错误：异步后可能已变\n  // 应该用局部变量\n})",'xuy'),
      ('H3','陷阱 2：忘记 finally'),
      ('Code',"async function load() {\n  loading(true)\n  try {\n    data(await fetch(...).then(r => r.json()))\n  } finally {\n    loading(false)   // 无论成功失败都要关 loading\n  }\n}",'xuy'),
      ('H3','陷阱 3：onMount 里 async 出错不显示'),
      ('Code',"// 错误：错误被吞了\nonMount(async () => {\n  throw new Error('x')\n})\n\n// 正确：try/catch\nonMount(async () => {\n  try { ... } catch (e) { error(e.message) }\n})",'xuy'),
    ]),""", "async")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("router / async 已填")
