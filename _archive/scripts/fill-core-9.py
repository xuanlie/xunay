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

# ============ ssr ============
swap("    ('core-ssr', 'SSR', []),", r"""    ('core-ssr', 'SSR', [
      ('H1','SSR'),
      ('P','服务端渲染——在服务器把 vnode 转成 HTML 字符串，直接送到浏览器。首屏不用等 JS 加载，内容立刻显示。'),
      ('H2','两个 API'),
      ('Table',['API','运行环境','作用'],[
        ['renderToString(vnode)','Node / 服务器','vnode 转 HTML 字符串'],
        ['hydrate(vnode, target)','浏览器','接管已有的 HTML'],
      ]),
      ('H2','renderToString'),
      ('Code',"import { renderToString, div, h1, p } from 'xunay'\n\nconst html = renderToString(\n  div({ class: 'app' },\n    h1(null, '标题'),\n    p(null, '正文')\n  )\n)\n// html = '<div class=\"app\"><h1>标题</h1><p>正文</p></div>'",'xuy'),
      ('H2','hydrate'),
      ('P','客户端拿服务端渲染好的 HTML，不重新创建 DOM，而是"接管"——绑定事件、建立 effect、恢复响应式。'),
      ('Code',"import { hydrate, div, h1, p } from 'xunay'\n\nhydrate(\n  div({ class: 'app' },\n    h1(null, '标题'),\n    p(null, '正文')\n  ),\n  '#app'   // 已有的 DOM 容器\n)",'xuy'),
      ('H2','完整流程'),
      ('Code',"// ===== 服务端 =====\nimport { renderToString } from 'xunay/ssr'\nimport { App } from './App.js'\n\napp.get('/', (req, res) => {\n  const html = renderToString(App())\n  res.send(`<!DOCTYPE html>\n<html><body>\n  <div id=\"app\">${html}</div>\n  <script src=\"/app.js\"></script>\n</body></html>`)\n})\n\n// ===== 浏览器 =====\nimport { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nhydrate(App(), '#app')",'xuy'),
      ('H2','服务端能做和不能做的'),
      ('Table',['能做','不能做'],[
        ['创建 vnode','访问 document'],
        ['拼 HTML 字符串','访问 window'],
        ['计算 initial 状态','绑定事件'],
        ['读写数据','使用定时器'],
      ]),
      ('Warn','服务端渲染时不要写 onMount、effect、setTimeout——环境里没有 DOM。用 if (typeof window !== "undefined") 判断。'),
      ('H2','hydration 不匹配'),
      ('P','服务端和客户端渲染的内容不一致时，xunay 会报警告。原因通常是：'),
      ('Ul',
        '服务端和客户端的初始 signal 不同',
        '用了 Date.now() / Math.random()',
        '用了 typeof window 分支'),
      ('Code',"// 错误：不一致，服务端渲染的是 server\ndiv(null, () => typeof window !== 'undefined' ? 'browser' : 'server')\n\n// 正确：用 onMount 之后才更新\nconst isBrowser = signal(false)\nonMount(() => isBrowser(true))\ndiv(null, () => isBrowser() ? 'browser' : 'server')",'xuy'),
      ('H2','性能'),
      ('Table',['','CSR','SSR + hydrate'],[
        ['首屏内容','等 JS 加载后显示','HTML 到达立即显示'],
        ['交互','立即可用','hydrate 后可用'],
        ['服务器成本','低','高'],
        ['SEO','差','好'],
      ]),
      ('H2','什么时候用 SSR'),
      ('Ul',
        'SEO 重要（博客、电商、新闻）',
        '首屏速度关键',
        '有服务端渲染能力'),
      ('P','纯后台 / 内部工具不需要 SSR——CSR 更快更简单。'),
      ('H2','完整示例'),
      ('Code',"// ===== 共享 App =====\n// App.js\nimport { div, h1, p, button, signal } from 'xunay'\n\nexport function App() {\n  const n = signal(0)\n  return div({ class: 'app' },\n    h1(null, 'SSR 演示'),\n    p(null, () => '计数: ' + n()),\n    button({ on: { click: () => n(v => v + 1) } }, '+1')\n  )\n}\n\n// ===== 服务端 =====\nimport { renderToString } from 'xunay/ssr'\nimport { App } from './App.js'\n\nconst html = renderToString(App())\n// <div class=\"app\"><h1>SSR 演示</h1><p>计数: 0</p><button>+1</button></div>\n\n// ===== 浏览器 =====\nimport { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nhydrate(App(), '#app')",'xuy'),
    ]),""", "ssr")

# ============ hydrate ============
swap("    ('core-hydrate', 'hydrate', []),", r"""    ('core-hydrate', 'hydrate', [
      ('H1','hydrate'),
      ('P','hydrate 是"接管已有 DOM"——服务端已经渲染好 HTML，客户端不再重建，而是给这些 DOM 挂上事件和响应式。'),
      ('H2','和 mount 的区别'),
      ('Table',['','mount','hydrate'],[
        ['目标','空容器','有内容的容器'],
        ['行为','清空后重建','复用已有 DOM'],
        ['速度','慢（从头创建）','快（绑定即可）'],
        ['场景','纯客户端','SSR 后的客户端'],
      ]),
      ('H2','基础用法'),
      ('Code',"import { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nhydrate(App(), '#app')\n// 假设 #app 里已经有服务端渲染的 HTML",'xuy'),
      ('H2','内部做什么'),
      ('P','hydrate 遍历已有的 DOM 和 vnode，一一对应：'),
      ('Ul',
        'DOM 元素类型和 vnode.type 一致 → 复用',
        '挂上事件监听',
        '建立 effect',
        '给动态文本节点挂更新'),
      ('H2','不匹配检测'),
      ('P','如果服务端和客户端 vnode 结构不同，会打印警告到 console，然后降级到重建。'),
      ('Code',"// 服务端渲染：<div><span>0</span></div>\n// 客户端 vnode：div(null, span(null, '0'))\n// 匹配 → 只挂事件\n\n// 服务端渲染：<div><span>0</span></div>\n// 客户端 vnode：div(null, p(null, '0'))\n// 不匹配 → 警告 + 重建",'js'),
      ('H2','什么时候用 hydrate'),
      ('Ul',
        '服务端已渲染',
        '希望复用已有 DOM',
        '首屏已有 HTML'),
      ('Warn','如果容器是空的，用 mount 而不是 hydrate——hydrate 期望已有内容。'),
      ('H2','数据一致性'),
      ('P','服务端和客户端的初始 signal 值必须一致，否则会出现"闪变"。'),
      ('Code',"// 服务端：把初始数据序列化到 HTML\nconst initial = await fetchData()\nconst html = renderToString(App({ initial }))\n\nres.send(`\n  <div id=\"app\">${html}</div>\n  <script>window.__INITIAL__ = ${JSON.stringify(initial)}</script>\n`)\n\n// 客户端：读 window.__INITIAL__ 恢复状态\nconst initial = window.__INITIAL__\nhydrate(App({ initial }), '#app')",'xuy'),
      ('H2','完整示例'),
      ('Code',"// ===== 服务端 =====\nimport { renderToString } from 'xunay/ssr'\nimport { App } from './App.js'\n\napp.get('/', async (req, res) => {\n  const todos = await db.getTodos()\n  const html = renderToString(App({ initialTodos: todos }))\n  res.send(\n    '<!DOCTYPE html><html><body>' +\n    '<div id=\"app\">' + html + '</div>' +\n    '<script>window.__TODOS__ = ' + JSON.stringify(todos) + '</script>' +\n    '<script src=\"/client.js\"></script>' +\n    '</body></html>'\n  )\n})\n\n// ===== 浏览器 =====\nimport { hydrate } from 'xunay/ssr'\nimport { App } from './App.js'\n\nconst initialTodos = window.__TODOS__ || []\nhydrate(App({ initialTodos }), '#app')",'xuy'),
      ('H2','常见陷阱'),
      ('H3','陷阱 1：容器里没内容'),
      ('Code',"// 错误：空的容器用 hydrate\n// <div id=\"app\"></div>\nhydrate(App(), '#app')\n\n// 正确：用 mount\nmount(App(), '#app')",'xuy'),
      ('H3','陷阱 2：服务端和客户端初次渲染不同'),
      ('Code',"// 服务端：按 UTC 时间渲染\n// 客户端：按本地时间渲染\n// → hydration 不匹配警告",'js'),
      ('P','所有依赖环境（时间、随机数、用户代理）的逻辑都放到 onMount 之后再执行。'),
    ]),""", "hydrate")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("ssr / hydrate 已填")
