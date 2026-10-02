import json

T = """import {{ div, h1, h2, h3, p, ul, li, pre, code, blockquote, table, thead, tbody, tr, th, td }} from 'xunay'

export function Doc() {{
  return div({{ class: 'doc' }},
{body}
  )
}}
"""

def render(blocks):
    out = []
    for b in blocks:
        t = b[0]
        if t in ('h1','h2','h3','p'):
            out.append(f"    {t}(null, {json.dumps(b[1], ensure_ascii=False)}),")
        elif t == 'quote':
            out.append(f"    blockquote(null, {json.dumps(b[1], ensure_ascii=False)}),")
        elif t == 'ul':
            out.append("    ul(null,")
            for it in b[1]:
                out.append(f"      li(null, {json.dumps(it, ensure_ascii=False)}),")
            out.append("    ),")
        elif t == 'code':
            out.append(f"    pre(null, code(null, {json.dumps(b[1], ensure_ascii=False)})),")
        elif t == 'table':
            head, rows = b[1], b[2]
            out.append("    table(null,")
            out.append("      thead(null, tr(null," + ",".join(f"th(null, {json.dumps(h, ensure_ascii=False)})" for h in head) + ")),")
            out.append("      tbody(null,")
            for r in rows:
                out.append("        tr(null," + ",".join(f"td(null, {json.dumps(c, ensure_ascii=False)})" for c in r) + "),")
            out.append("      )")
            out.append("    ),")
    return '\n'.join(out)

DOCS = {
'06-添加交互': [
    ('h1','添加交互'),
    ('h2','事件'),
    ('code','button({ on: { click: () => console.log("点了") } }, "点我")'),
    ('p','事件名用小写，不加 on 前缀。支持 click dblclick input change submit keydown focus blur mouseenter mouseleave touchstart。'),
    ('h2','状态'),
    ('code','const count = signal(0)\n\ncount()          // 读\ncount(1)         // 写\ncount(v => v+1)  // 函数式更新'),
    ('h2','计数器'),
    ('code','const count = signal(0)\n\nmount(() => div(null,\n  button({ on: { click: () => count(v => v - 1) } }, "-"),\n  span(null, () => count()),\n  button({ on: { click: () => count(v => v + 1) } }, "+")\n), "#app")'),
    ('h2','输入框'),
    ('code','const text = signal("")\n\ninput({\n  value: () => text(),\n  on: { input: e => text(e.target.value) }\n})'),
    ('p','value 是函数，用户输入时同步 text。这叫受控组件。'),
    ('h2','事件修饰符'),
    ('code','form({ on: { submit: { fn: onSubmit, prevent: true } } })\nbutton({ on: { click: { fn: onClick, stop: true } } })\ninput({ on: { input: { fn: text, value: true } } })'),
    ('table',['修饰符','作用'],[['prevent','阻止默认'],['stop','阻止冒泡'],['self','只在自己触发'],['value','传 e.target.value']]),
    ('h2','为什么组件不重新渲染'),
    ('p','首次挂载打印 组件执行 和 文本更新。每次点击只打印 文本更新。因为组件函数只执行一次。'),
],
'07-管理状态': [
    ('h1','管理状态'),
    ('h2','单信号'),
    ('code','const count = signal(0)'),
    ('h2','对象信号'),
    ('code','const user = signal({ name: "", email: "", age: 0 })\nuser({ ...user(), name: "张三" })'),
    ('p','对象必须整体替换。user().name = "x" 不触发更新。'),
    ('h2','派生状态'),
    ('code','const first = signal("张")\nconst last = signal("三")\nconst fullName = computed(() => first() + last())\n\nfullName()  // "张三"\nfirst("李")\nfullName()  // "李三"'),
    ('p','派生不会重复计算。值没变时直接返回缓存。'),
    ('h2','跨组件共享'),
    ('p','把 signal 放到模块顶层，模块加载一次，signal 只有一份，所有组件共用。'),
    ('code','// store.js\nexport const user = signal(null)\nexport const theme = signal("light")'),
    ('h2','加载状态'),
    ('code','const loading = signal(false)\nconst data = signal(null)\nconst error = signal(null)\n\nasync function load() {\n  loading(true)\n  error(null)\n  try {\n    const r = await fetch("/api/data")\n    data(await r.json())\n  } catch (e) {\n    error(e.message)\n  } finally {\n    loading(false)\n  }\n}'),
    ('h2','表单'),
    ('code','const form = signal({ name: "", email: "" })\nconst update = (k, v) => form({ ...form(), [k]: v })'),
    ('h2','派生校验'),
    ('code','const email = signal("")\nconst emailError = computed(() => {\n  const v = email()\n  if (!v) return ""\n  if (!/^[^@]+@[^@]+$/.test(v)) return "邮箱格式不对"\n  return ""\n})'),
],
'08-渲染列表': [
    ('h1','渲染列表'),
    ('p','数组用 list，不用 .map()。'),
    ('h2','基本用法'),
    ('code','ul(null,\n  list(items, item => item.id, item => li(null, item.title))\n)'),
    ('p','三个参数：数组、key 函数、渲染函数。'),
    ('h2','key 的作用'),
    ('ul',['key 存在则复用 DOM','key 不存在则创建 DOM','旧 key 消失则删除 DOM','1000 行列表，改一行只动一行']),
    ('h2','增删改'),
    ('code','items([...items(), { id: 3, title: "写代码" }])\nitems(items().filter(i => i.id !== 2))\nitems(items().map(i => i.id === 2 ? { ...i, title: "新" } : i))'),
    ('p','数组必须整体替换，不能 push。'),
    ('h2','key 必须唯一'),
    ('code','list(items, i => i.id, ...)     // ✅\nlist(items, i => i.title, ...)  // ❌ 可能重复'),
    ('h2','Todo 完整'),
    ('code','const todos = signal([])\nconst inputVal = signal("")\n\nconst add = () => {\n  if (!inputVal().trim()) return\n  todos([...todos(), { id: Date.now(), title: inputVal(), done: false }])\n  inputVal("")\n}\n\nconst toggle = id => todos(todos().map(t =>\n  t.id === id ? { ...t, done: !t.done } : t))\n\nconst remove = id => todos(todos().filter(t => t.id !== id))'),
    ('h2','性能'),
    ('table',['操作','1000 行'],[['首次渲染','< 50ms'],['更新一行','< 5ms'],['替换全部','< 50ms']]),
],
'09-生命周期': [
    ('h1','生命周期'),
    ('p','只有两个钩子。'),
    ('h2','onMount'),
    ('code','import { onMount } from "xunay"\n\nmount(() => {\n  onMount(() => {\n    console.log("挂载了")\n  })\n  return div(null, "内容")\n}, "#app")'),
    ('h2','onUnmount'),
    ('code','import { onUnmount } from "xunay"\n\nonUnmount(() => {\n  clearInterval(timer)\n})'),
    ('h2','在 show 内'),
    ('code','show(() => visible(), () => {\n  onMount(() => console.log("显示"))\n  onUnmount(() => console.log("隐藏"))\n  return span(null, "内容")\n})'),
    ('h2','在 list 内'),
    ('code','list(todos, t => t.id, t => {\n  onMount(() => console.log("第", t.id, "项挂载"))\n  onUnmount(() => console.log("第", t.id, "项卸载"))\n  return li(null, t.title)\n})'),
    ('h2','作用域'),
    ('p','每个 DOM 元素一个 scope。scope 销毁时全部自动清理。反复挂载卸载 1 万次，内存不涨。'),
],
'10-进阶API': [
    ('h1','进阶 API'),
    ('h2','ref'),
    ('code','import { ref } from "xunay"\n\nconst inputEl = ref()\ninput({ ref: inputEl })\nonMount(() => inputEl()?.focus())'),
    ('p','ref 是函数，读用 inputEl()。'),
    ('h2','ctx'),
    ('code','import { ctx } from "xunay"\n\nconst theme = ctx("light")\ntheme.provide("dark", () => {\n  div(null, () => theme.get())  // "dark"\n})\ntheme.get()  // "light"'),
    ('h2','err'),
    ('code','import { err } from "xunay"\n\nerr(\n  () => riskyOperation(),\n  (e) => span(null, "出错：" + e.message)\n)'),
    ('h2','lazy'),
    ('code','import { lazy } from "xunay"\n\nconst Big = lazy(() => import("./Big.js"))\nmount(() => div(null, Big()), "#app")'),
    ('h2','trans'),
    ('code','import { trans } from "xunay"\n\nconst t = trans(200)\nt.enter(el)\nt.leave(el, () => {})'),
    ('h2','devtool'),
    ('code','import { enableDevtool, getEvents } from "xunay"\nenableDevtool()\ngetEvents()'),
],
'11-SSR': [
    ('h1','SSR 服务端渲染'),
    ('h2','服务端'),
    ('code','import { renderToString, div, span } from "xunay"\n\nconst html = renderToString(() => div(null,\n  span(null, "hello")\n))\n\n// <div><span>hello</span></div>'),
    ('h2','客户端'),
    ('code','import { hydrate } from "xunay"\n\nhydrate(App, "#app")'),
    ('h2','完整例子'),
    ('code','app.get("/", (req, res) => {\n  const html = renderToString(() => App())\n  res.send(`<!DOCTYPE html>\n<html>\n<body>\n  <div id="app">${html}</div>\n  <script src="/xunay.min.js"></script>\n  <script src="/app.js"></script>\n</body>\n</html>`)\n})'),
    ('h2','性能'),
    ('table',['行数','SSR 耗时'],[['100','2ms'],['1000','17ms'],['10000','180ms']]),
],
'12-构建部署': [
    ('h1','构建与部署'),
    ('h2','.xuy 构建工具'),
    ('code','node bin/xuyc.js build app.xuy --out dist'),
    ('p','输出 dist/ 里 index.html、app.js、xunay.js 三个文件。丢到任何静态服务器就能跑。'),
    ('h2','.xuy 长什么样'),
    ('code','// title: 我的应用\nimport { div, span, signal, mount } from "xunay"\n\nconst n = signal(0)\n\nmount(() => div(null,\n  span(null, () => `n = ${n()}`)\n), "#app")'),
    ('p','// title: 会作为 HTML title。'),
    ('h2','大项目结构'),
    ('code','myapp/\n  app.xuy\n  package.json\n  src/\n    router.xuy\n    components/\n    pages/\n    store/\n    api/'),
    ('h2','后端'),
    ('p','FastAPI + Granian + SQLite + WebSocket。启动：bash scripts/run-backend.sh'),
    ('code','GET  /rpc/token\nGET  /rpc/getTodos\nPOST /rpc/addTodo\nPOST /rpc/toggleTodo\nWS   /ws'),
    ('h2','部署'),
    ('code','bash scripts/install-service.sh\nsystemctl status xunay'),
    ('h2','对比'),
    ('table',['框架','gzip','create 1000','update 10th'],[['XuNay','4.5KB','22ms','13ms'],['Preact','4KB','30ms','18ms'],['Solid','7KB','12ms','4ms'],['Vue 3','34KB','28ms','16ms'],['React 18','45KB','35ms','20ms']]),
],
'13-Ref': [
    ('h1','Ref'),
    ('p','拿 DOM 引用。'),
    ('h2','基本用法'),
    ('code','import { ref } from "xunay"\n\nconst inputEl = ref()\n\ninput({ ref: inputEl })\n\nonMount(() => inputEl()?.focus())'),
    ('h2','多个 ref'),
    ('code','const a = ref()\nconst b = ref()\n\ndiv(null,\n  input({ ref: a }),\n  input({ ref: b })\n)\n\nonMount(() => {\n  a()?.focus()\n})'),
    ('h2','ref 是函数'),
    ('p','读用 inputEl()，不是 inputEl.current。这是 XuNay 跟 React、Vue 不同的地方。'),
    ('h2','在组件间传 ref'),
    ('code','function Child({ elRef }) {\n  return input({ ref: elRef })\n}\n\nconst myRef = ref()\nChild({ elRef: myRef })'),
    ('h2','ref 和生命周期'),
    ('p','ref 在 onMount 之后才有值。onMount 之前是 null。'),
],
}
import os
os.makedirs('site/src/docs', exist_ok=True)
for name, blocks in DOCS.items():
    code = T.format(body=render(blocks))
    open(f'site/src/docs/{name}.xuy', 'w').write(code)
    print(f'{name}.xuy')
