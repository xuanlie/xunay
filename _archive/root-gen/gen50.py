import json, os

T = """import {{ div, h1, h2, h3, p, ul, li, pre, code, blockquote, table, thead, tbody, tr, th, td }} from 'xunay'

export function Doc() {{
  return div({{ class: 'doc' }},
{body}
  )
}}
"""

def R(blocks):
    out = []
    for b in blocks:
        t = b[0]
        if t in ('h1','h2','h3','p'):
            out.append(f"    {t}(null, {json.dumps(b[1], ensure_ascii=False)}),")
        elif t == 'q':
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

D = {}

def add(name, blocks):
    D[name] = blocks

# 51-100 共 50 篇
add('51-计数器详解', [
    ('h1','计数器详解'), ('p','逐行拆解经典例子。'),
    ('h2','代码'), ('code','import { div, button, span, signal, mount } from "xunay"\nconst n = signal(0)\nmount(() => div(null,\n  button({ on: { click: () => n(v => v - 1) } }, "-"),\n  span(null, () => `n = ${n()}`),\n  button({ on: { click: () => n(v => v + 1) } }, "+")\n), "#app")'),
    ('h2','导入'), ('code','import { div, button, span, signal, mount } from "xunay"'),
    ('p','div、button、span 是标签。signal 创建信号。mount 挂载。'),
    ('h2','信号'), ('code','const n = signal(0)'), ('p','响应式变量，初值 0。'),
    ('h2','挂载'), ('code','mount(() => div(...), "#app")'), ('p','组件函数 + 选择器。'),
    ('h2','按钮'), ('code','button({ on: { click: () => n(v => v - 1) } }, "-")'),
    ('h2','文本'), ('code','span(null, () => `n = ${n()}`)'), ('p','函数里读 n() 就自动订阅。'),
    ('h2','流程'), ('ul',['点 +','执行 n(v => v + 1)','n 从 0 变 1','订阅者重跑','文本节点更新']),
    ('h2','性能'), ('table',['操作','耗时'],[['挂载','< 1ms'],['点击','< 0.1ms'],['内存','0 增量']]),
    ('q','如果写 span(null, `n = ${n()}`)，不更新。'),
])
add('52-Todo详解', [
    ('h1','Todo 详解'), ('p','列表 + 增删改 + 受控输入。'),
    ('h2','状态'), ('code','const todos = signal([])\nconst inputVal = signal("")'),
    ('h2','添加'), ('code','const add = () => {\n  const t = inputVal().trim()\n  if (!t) return\n  todos([...todos(), { id: Date.now(), title: t, done: false }])\n  inputVal("")\n}'),
    ('h2','勾选'), ('code','const toggle = id => todos(todos().map(t =>\n  t.id === id ? { ...t, done: !t.done } : t))'),
    ('h2','删除'), ('code','const remove = id => todos(todos().filter(t => t.id !== id))'),
    ('h2','输入'), ('code','input({\n  value: () => inputVal(),\n  on: {\n    input: e => inputVal(e.target.value),\n    keydown: e => { if (e.key === "Enter") add() }\n  }\n})'),
    ('h2','列表'), ('code','ul(null, list(todos, t => t.id, t => li(null, t.title)))'),
    ('h2','性能'), ('table',['操作','1000 行'],[['首次','< 50ms'],['勾选','< 5ms'],['删除','< 5ms']]),
])
add('53-计数器扩展', [
    ('h1','计数器扩展'), ('p','步长、复位、历史。'),
    ('h2','步长'), ('code','const step = signal(1)'),
    ('h2','加步长'), ('code','n(v => v + step())'),
    ('h2','复位'), ('code','button({ on: { click: () => n(0) } }, "复位")'),
    ('h2','历史'), ('code','const history = signal([])\nconst update = v => { n(v); history([...history(), v]) }'),
    ('h2','撤销'), ('code','const undo = () => {\n  const h = history()\n  if (h.length < 2) return\n  history(h.slice(0, -1))\n  n(h[h.length - 2])\n}'),
    ('h2','持久化'), ('code','onMount(() => {\n  n(Number(localStorage.getItem("c") || 0))\n  effect(() => localStorage.setItem("c", n()))\n})'),
])
add('54-表单详解', [
    ('h1','表单详解'),
    ('h2','单字段'), ('code','const name = signal("")\ninput({ value: () => name(), on: { input: e => name(e.target.value) } })'),
    ('h2','多字段'), ('code','const form = signal({ name: "", email: "" })\nconst update = (k, v) => form({ ...form(), [k]: v })'),
    ('h2','校验'), ('code','const errors = computed(() => ({\n  name: form().name ? "" : "必填"\n}))'),
    ('h2','提交'), ('code','form({ on: { submit: { fn: submit, prevent: true } } })'),
    ('h2','禁用'), ('code','button({ disabled: () => !!errors().name }, "提交")'),
    ('h2','复选组'), ('code','["a","b"].map(t => input({\n  type: "checkbox",\n  checked: () => tags().includes(t),\n  on: { change: e => tags(e.target.checked ? [...tags(), t] : tags().filter(x => x !== t)) }\n}))'),
    ('h2','下拉'), ('code','select({ value: () => city(), on: { change: e => city(e.target.value) } },\n  option({ value: "bj" }, "北京")\n)'),
])
add('55-筛选排序', [
    ('h1','筛选排序'), ('p','用 computed 组合。'),
    ('h2','数据'), ('code','const items = signal([...])'),
    ('h2','条件'), ('code','const keyword = signal("")\nconst sortKey = signal("id")\nconst sortDir = signal("asc")'),
    ('h2','派生'), ('code','const visible = computed(() => {\n  let r = items()\n  const kw = keyword().trim().toLowerCase()\n  if (kw) r = r.filter(x => x.name.toLowerCase().includes(kw))\n  const k = sortKey(), d = sortDir() === "asc" ? 1 : -1\n  return [...r].sort((a,b) => (a[k] > b[k] ? 1 : -1) * d)\n})'),
    ('h2','切换排序'), ('code','const sortBy = k => {\n  if (sortKey() === k) sortDir(sortDir() === "asc" ? "desc" : "asc")\n  else { sortKey(k); sortDir("asc") }\n}'),
    ('h2','缓存'), ('p','computed 缓存结果，多次读不重算。'),
])
add('56-分页', [
    ('h1','分页'),
    ('h2','状态'), ('code','const page = signal(1)\nconst pageSize = 20\nconst all = signal([])'),
    ('h2','派生'), ('code','const paged = computed(() => {\n  const p = page()\n  return all().slice((p-1)*pageSize, p*pageSize)\n})'),
    ('h2','页数'), ('code','const pageCount = computed(() => Math.max(1, Math.ceil(all().length / pageSize)))'),
    ('h2','按钮'), ('code','button({ disabled: () => page() <= 1, on: { click: () => page(page()-1) } }, "上一页")'),
    ('h2','跳转'), ('code','input({ type: "number", on: { change: e => page(+e.target.value) } })'),
    ('h2','性能'), ('p','只渲染 20 行，不是 2000 行。'),
])
add('57-搜索框', [
    ('h1','搜索框'),
    ('h2','基本'), ('code','const keyword = signal("")\nconst results = computed(() => {\n  const kw = keyword().trim().toLowerCase()\n  if (!kw) return []\n  return allData().filter(x => x.title.toLowerCase().includes(kw))\n})'),
    ('h2','防抖'), ('code','let timer = null\nconst search = v => {\n  clearTimeout(timer)\n  timer = setTimeout(() => keyword(v), 300)\n}'),
    ('h2','输入'), ('code','input({ on: { input: e => search(e.target.value) } })'),
    ('h2','高亮'), ('code','span(null, () => highlight(x.title, keyword()))'),
])
add('58-表格', [
    ('h1','表格'),
    ('h2','结构'), ('code','table(null,\n  thead(null, tr(null, th(null, "ID"), th(null, "姓名"))),\n  tbody(null, list(rows, r => r.id, r => tr(null,\n    td(null, r.id),\n    td(null, r.name)\n  )))\n)'),
    ('h2','排序表头'), ('code','th({ on: { click: () => sortBy("id") } }, () => `ID ${sortKey() === "id" ? (sortDir() === "asc" ? "↑" : "↓") : ""}`)'),
    ('h2','编辑单元格'), ('code','input({ value: r.name, on: { change: e => edit(r.id, e.target.value) } })'),
    ('h2','删除'), ('code','button({ on: { click: () => remove(r.id) } }, "×")'),
])
add('59-模态框', [
    ('h1','模态框'),
    ('h2','状态'), ('code','const open = signal(false)'),
    ('h2','渲染'), ('code','show(() => open(), () => div({ class: "overlay", on: { click: () => open(false) } },\n  div({ class: "modal", on: { click: e => e.stopPropagation() } },\n    h2(null, "标题"),\n    p(null, "内容"),\n    button({ on: { click: () => open(false) } }, "关闭")\n  )\n))'),
    ('h2','样式'), ('code','.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; }\n.modal { background: #fff; padding: 24px; border-radius: 12px; min-width: 320px; }'),
    ('h2','键盘 ESC'), ('code','onMount(() => {\n  const h = e => { if (e.key === "Escape") open(false) }\n  window.addEventListener("keydown", h)\n  onUnmount(() => window.removeEventListener("keydown", h))\n})'),
])
add('60-下拉菜单', [
    ('h1','下拉菜单'),
    ('h2','状态'), ('code','const open = signal(false)'),
    ('h2','渲染'), ('code','div({ class: "dropdown" },\n  button({ on: { click: () => open(!open()) } }, "菜单"),\n  show(() => open(), () => ul({ class: "menu" },\n    list(items, i => i.id, i => li({ on: { click: () => { select(i); open(false) } } }, i.title))\n  ))\n)'),
    ('h2','点击外部关闭'), ('code','onMount(() => {\n  const h = e => { if (!e.target.closest(".dropdown")) open(false) }\n  document.addEventListener("click", h)\n  onUnmount(() => document.removeEventListener("click", h))\n})'),
])
add('61-标签页', [
    ('h1','标签页'),
    ('h2','状态'), ('code','const active = signal("a")'),
    ('h2','渲染'), ('code','div(null,\n  div({ class: "tabs" },\n    ...["a","b","c"].map(k => button({\n      class: () => active() === k ? "active" : "",\n      on: { click: () => active(k) }\n    }, "Tab " + k))\n  ),\n  () => active() === "a" ? PanelA() : active() === "b" ? PanelB() : PanelC()\n)'),
    ('h2','lazy 加载'), ('code','const PanelA = lazy(() => import("./A.js"))'),
])
add('62-手风琴', [
    ('h1','手风琴'),
    ('h2','状态'), ('code','const openIdx = signal(-1)'),
    ('h2','渲染'), ('code','list(items, i => i.id, (item, idx) => div({ class: "item" },\n  div({ class: "head", on: { click: () => openIdx(openIdx() === idx ? -1 : idx) } }, item.title),\n  show(() => openIdx() === idx, () => div({ class: "body" }, item.content))\n))'),
    ('h2','多开'), ('code','const openSet = signal(new Set())'),
])
add('63-轮播图', [
    ('h1','轮播图'),
    ('h2','状态'), ('code','const idx = signal(0)\nconst images = signal([...])'),
    ('h2','自动播放'), ('code','onMount(() => {\n  const t = setInterval(() => idx(v => (v + 1) % images().length), 3000)\n  onUnmount(() => clearInterval(t))\n})'),
    ('h2','上一张/下一张'), ('code','const prev = () => idx(v => (v - 1 + images().length) % images().length)\nconst next = () => idx(v => (v + 1) % images().length)'),
    ('h2','指示器'), ('code','list(images, (_, i) => i, (_, i) => span({\n  class: () => i === idx() ? "dot active" : "dot",\n  on: { click: () => idx(i) }\n}))'),
])
add('64-拖拽排序', [
    ('h1','拖拽排序'),
    ('h2','渲染'), ('code','list(items, i => i.id, i => li({\n  draggable: true,\n  on: {\n    dragstart: e => e.dataTransfer.setData("id", i.id),\n    dragover: e => e.preventDefault(),\n    drop: e => {\n      const fromId = +e.dataTransfer.getData("id")\n      reorder(fromId, i.id)\n    }\n  }\n}, i.title))'),
    ('h2','重排函数'), ('code','const reorder = (fromId, toId) => {\n  const arr = [...items()]\n  const from = arr.findIndex(x => x.id === fromId)\n  const to = arr.findIndex(x => x.id === toId)\n  const [item] = arr.splice(from, 1)\n  arr.splice(to, 0, item)\n  items(arr)\n}'),
])
add('65-无限滚动', [
    ('h1','无限滚动'),
    ('h2','状态'), ('code','const items = signal([])\nconst loading = signal(false)\nconst hasMore = signal(true)'),
    ('h2','加载'), ('code','async function loadMore() {\n  if (loading() || !hasMore()) return\n  loading(true)\n  const newItems = await fetchPage(items().length)\n  if (newItems.length === 0) hasMore(false)\n  items([...items(), ...newItems])\n  loading(false)\n}'),
    ('h2','监听滚动'), ('code','onMount(() => {\n  const h = () => {\n    if (window.innerHeight + scrollY >= document.body.offsetHeight - 500) {\n      loadMore()\n    }\n  }\n  window.addEventListener("scroll", h)\n  onUnmount(() => window.removeEventListener("scroll", h))\n})'),
])
add('66-主题切换', [
    ('h1','主题切换'),
    ('h2','状态'), ('code','const theme = signal(localStorage.getItem("theme") || "light")'),
    ('h2','应用'), ('code','effect(() => {\n  document.body.className = "theme-" + theme()\n  localStorage.setItem("theme", theme())\n})'),
    ('h2','切换按钮'), ('code','button({ on: { click: () => theme(theme() === "light" ? "dark" : "light") } },\n  () => theme() === "light" ? "🌙" : "☀️"\n)'),
    ('h2','CSS 变量'), ('code','.theme-light { --bg: #fff; --tx: #222; }\n.theme-dark { --bg: #111; --tx: #eee; }\nbody { background: var(--bg); color: var(--tx); }'),
])
add('67-国际化', [
    ('h1','国际化'),
    ('h2','字典'), ('code','const dict = {\n  zh: { hello: "你好", bye: "再见" },\n  en: { hello: "Hello", bye: "Bye" }\n}'),
    ('h2','状态'), ('code','const lang = signal("zh")'),
    ('h2','翻译函数'), ('code','const t = key => dict[lang()][key] || key'),
    ('h2','使用'), ('code','h1(null, () => t("hello"))\nbutton({ on: { click: () => lang(lang() === "zh" ? "en" : "zh") } }, "EN/中")'),
    ('h2','持久化'), ('code','effect(() => localStorage.setItem("lang", lang()))'),
])
add('68-权限控制', [
    ('h1','权限控制'),
    ('h2','用户状态'), ('code','const user = signal(null)\nconst role = computed(() => user()?.role || "guest")'),
    ('h2','检查'), ('code','const can = action => {\n  const perms = { admin: ["read","write","delete"], user: ["read"], guest: [] }\n  return perms[role()].includes(action)\n}'),
    ('h2','使用'), ('code','show(() => can("delete"), () => button({ on: { click: del } }, "删除"))'),
    ('h2','路由守卫'), ('code','() => can("admin") ? AdminPanel() : div(null, "无权限")'),
])
add('69-剪贴板', [
    ('h1','剪贴板'),
    ('h2','复制'), ('code','const copy = async text => {\n  await navigator.clipboard.writeText(text)\n  toast("已复制")\n}'),
    ('h2','粘贴'), ('code','const paste = async () => {\n  return await navigator.clipboard.readText()\n}'),
    ('h2','使用'), ('code','button({ on: { click: () => copy(text()) } }, "复制")'),
    ('h2','兼容性'), ('p','需要 HTTPS 或 localhost。'),
])
add('70-本地存储', [
    ('h1','本地存储'),
    ('h2','读写'), ('code','localStorage.setItem("key", "value")\nconst v = localStorage.getItem("key")'),
    ('h2','信号绑定'), ('code','const v = signal(localStorage.getItem("key") || "")\neffect(() => localStorage.setItem("key", v()))'),
    ('h2','存对象'), ('code','const user = signal(JSON.parse(localStorage.getItem("user") || "null"))\neffect(() => localStorage.setItem("user", JSON.stringify(user())))'),
    ('h2','sessionStorage'), ('p','同 API，关标签页就清空。'),
    ('h2','IndexedDB'), ('p','存大数据用 IndexedDB，异步 API。'),
])
add('71-网络请求', [
    ('h1','网络请求'),
    ('h2','基础'), ('code','const data = signal(null)\nconst loading = signal(false)\nconst error = signal(null)\n\nasync function load() {\n  loading(true)\n  try {\n    const r = await fetch("/api/data")\n    data(await r.json())\n  } catch (e) {\n    error(e.message)\n  } finally {\n    loading(false)\n  }\n}'),
    ('h2','渲染'), ('code','show(() => loading(), () => div(null, "加载中"))\nshow(() => error(), () => div(null, () => error()))\nshow(() => data(), () => div(null, () => JSON.stringify(data())))'),
    ('h2','POST'), ('code','await fetch("/api", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ x: 1 })\n})'),
    ('h2','取消'), ('code','const ctl = new AbortController()\nfetch("/api", { signal: ctl.signal })\nctl.abort()'),
])
add('72-轮询', [
    ('h1','轮询'),
    ('h2','setInterval'), ('code','onMount(() => {\n  const t = setInterval(load, 5000)\n  onUnmount(() => clearInterval(t))\n})'),
    ('h2','立即执行 + 轮询'), ('code','onMount(() => {\n  load()\n  const t = setInterval(load, 5000)\n  onUnmount(() => clearInterval(t))\n})'),
    ('h2','暂停'), ('code','const paused = signal(false)\nonMount(() => {\n  const t = setInterval(() => { if (!paused()) load() }, 5000)\n  onUnmount(() => clearInterval(t))\n})'),
])
add('73-WebSocket', [
    ('h1','WebSocket'),
    ('h2','连接'), ('code','const ws = new WebSocket("ws://host/ws")\nws.onopen = () => status("已连接")\nws.onclose = () => status("已断开")\nws.onmessage = e => handle(JSON.parse(e.data))'),
    ('h2','发送'), ('code','ws.send(JSON.stringify({ type: "chat", text: "hi" }))'),
    ('h2','自动重连'), ('code','function connect() {\n  const ws = new WebSocket(url)\n  ws.onclose = () => setTimeout(connect, 2000)\n  return ws\n}'),
    ('h2','心跳'), ('code','const hb = setInterval(() => ws.send("ping"), 30000)'),
])
add('74-SSE', [
    ('h1','Server-Sent Events'),
    ('h2','订阅'), ('code','const es = new EventSource("/events")\nes.onmessage = e => data(JSON.parse(e.data))\nes.onerror = () => es.close()'),
    ('h2','自定义事件'), ('code','es.addEventListener("update", e => handle(e.data))'),
    ('h2','关闭'), ('code','onUnmount(() => es.close())'),
    ('h2','跟 WS 区别'), ('p','SSE 单向（服务器到客户端），WebSocket 双向。'),
])
add('75-上传文件', [
    ('h1','上传文件'),
    ('h2','输入'), ('code','input({ type: "file", on: { change: e => upload(e.target.files[0]) } })'),
    ('h2','上传'), ('code','async function upload(file) {\n  const form = new FormData()\n  form.append("file", file)\n  const r = await fetch("/upload", { method: "POST", body: form })\n  return await r.json()\n}'),
    ('h2','进度'), ('code','const xhr = new XMLHttpRequest()\nxhr.upload.onprogress = e => progress(e.loaded / e.total * 100)'),
    ('h2','预览'), ('code','const url = URL.createObjectURL(file)\nonUnmount(() => URL.revokeObjectURL(url))'),
])
add('76-下载文件', [
    ('h1','下载文件'),
    ('h2','链接下载'), ('code','a({ href: "/file.pdf", download: true }, "下载")'),
    ('h2','动态生成'), ('code','const blob = new Blob([content], { type: "text/plain" })\nconst url = URL.createObjectURL(blob)\na({ href: url, download: "file.txt" }, "下载")'),
    ('h2','清理'), ('code','onUnmount(() => URL.revokeObjectURL(url))'),
])
add('77-剪切板图片', [
    ('h1','剪切板图片'),
    ('h2','读取'), ('code','document.addEventListener("paste", async e => {\n  const items = e.clipboardData.items\n  for (const item of items) {\n    if (item.type.startsWith("image/")) {\n      const file = item.getAsFile()\n      handle(file)\n    }\n  }\n})'),
    ('h2','预览'), ('code','const url = URL.createObjectURL(file)'),
    ('h2','上传'), ('code','await upload(file)'),
])
add('78-拖拽上传', [
    ('h1','拖拽上传'),
    ('h2','区域'), ('code','div({\n  class: "drop-zone",\n  on: {\n    dragover: e => { e.preventDefault(); hovering(true) },\n    dragleave: () => hovering(false),\n    drop: e => { e.preventDefault(); hovering(false); upload(e.dataTransfer.files) }\n  }\n})'),
    ('h2','状态'), ('code','const hovering = signal(false)'),
    ('h2','样式'), ('code','.drop-zone.drag { background: #eef; border-color: #1f6feb; }'),
])
add('79-图片裁剪', [
    ('h1','图片裁剪'),
    ('h2','基础'), ('code','const crop = signal({ x: 0, y: 0, w: 200, h: 200 })'),
    ('h2','拖动'), ('code','on: {\n  mousedown: e => {\n    const startX = e.clientX, startY = e.clientY\n    const move = me => crop({ ...crop(), x: crop().x + me.clientX - startX, y: crop().y + me.clientY - startY })\n    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up) }\n    document.addEventListener("mousemove", move)\n    document.addEventListener("mouseup", up)\n  }\n}'),
    ('h2','导出'), ('code','canvas.toBlob(blob => upload(blob))'),
])
add('80-富文本', [
    ('h1','富文本'),
    ('h2','contenteditable'), ('code','div({\n  contenteditable: true,\n  on: { input: e => html(e.target.innerHTML) }\n})'),
    ('h2','工具栏'), ('code','button({ on: { click: () => document.execCommand("bold") } }, "B")\nbutton({ on: { click: () => document.execCommand("italic") } }, "I")'),
    ('h2','安全'), ('q','存 HTML 前要过滤。用户输入的 script 标签必须删掉。'),
])
add('81-代码高亮', [
    ('h1','代码高亮'),
    ('h2','简易高亮'), ('code','function highlight(code) {\n  return code\n    .replace(/&/g, "&amp;").replace(/</g, "&lt;")\n    .replace(/\\b(const|let|function|return)\\b/g, "<b>$1</b>")\n    .replace(/(["\\\x27]).*?\\1/g, "<i>$&</i>")\n}'),
    ('h2','用组件'), ('code','pre(null, code({ html: () => highlight(src()) }))'),
    ('h2','第三方库'), ('p','复杂场景用 highlight.js 或 Prism。'),
])
add('82-Markdown渲染', [
    ('h1','Markdown 渲染'),
    ('h2','步骤'), ('ul',['转义 HTML','提取代码块','按行处理','处理标题、列表、表格、引用','还原代码块']),
    ('h2','简易实现'), ('code','function md(src) {\n  return src\n    .replace(/^# (.+)$/gm, "<h1>$1</h1>")\n    .replace(/^## (.+)$/gm, "<h2>$1</h2>")\n    .replace(/\\*\\*(.+?)\\*\\*/g, "<b>$1</b>")\n}'),
    ('h2','使用'), ('code','div({ html: () => md(source()) })'),
])
add('83-虚拟滚动', [
    ('h1','虚拟滚动'),
    ('p','10 万行只渲染可见的 30 行。'),
    ('h2','状态'), ('code','const scrollTop = signal(0)\nconst itemHeight = 30\nconst viewport = 600'),
    ('h2','可见范围'), ('code','const start = computed(() => Math.floor(scrollTop() / itemHeight))\nconst end = computed(() => start() + Math.ceil(viewport / itemHeight) + 5)'),
    ('h2','渲染'), ('code','div({ class: "viewport", on: { scroll: e => scrollTop(e.target.scrollTop) } },\n  div({ style: { height: () => (all().length * itemHeight) + "px", position: "relative" } },\n    div({ style: { transform: () => `translateY(${start() * itemHeight}px)` } },\n      list(() => all().slice(start(), end()), i => i.id, i => div({ style: { height: itemHeight + "px" } }, i.title))\n    )\n  )\n)'),
])
add('84-动画', [
    ('h1','动画'),
    ('h2','CSS transition'), ('code','div({\n  style: { opacity: () => visible() ? 1 : 0, transition: "opacity .3s" }\n})'),
    ('h2','requestAnimationFrame'), ('code','function animate(from, to, dur, cb) {\n  const t0 = performance.now()\n  function tick(now) {\n    const p = Math.min((now - t0) / dur, 1)\n    cb(from + (to - from) * p)\n    if (p < 1) requestAnimationFrame(tick)\n  }\n  requestAnimationFrame(tick)\n}'),
    ('h2','数字缓动'), ('code','animate(0, 100, 1000, v => n(Math.round(v)))'),
])
add('85-图表', [
    ('h1','图表'),
    ('h2','用 canvas'), ('code','const canvas = ref()\nonMount(() => {\n  const ctx = canvas().getContext("2d")\n  draw(ctx, data())\n})'),
    ('h2','用第三方'), ('code','import { Chart } from "chart.js/auto"\nconst chart = new Chart(canvas(), { type: "bar", data: {...} })'),
    ('h2','更新'), ('code','effect(() => {\n  if (chart) { chart.data.datasets[0].data = data(); chart.update() }\n})'),
])
add('86-Canvas', [
    ('h1','Canvas'),
    ('h2','基础'), ('code','const c = ref()\nonMount(() => {\n  const ctx = c().getContext("2d")\n  ctx.fillStyle = "red"\n  ctx.fillRect(10, 10, 100, 100)\n})'),
    ('h2','清屏 + 重绘'), ('code','effect(() => {\n  const ctx = c().getContext("2d")\n  ctx.clearRect(0, 0, c().width, c().height)\n  data().forEach(draw)\n})'),
    ('h2','requestAnimationFrame 循环'), ('code','function loop() {\n  render()\n  requestAnimationFrame(loop)\n}'),
])
add('87-拖拽画板', [
    ('h1','拖拽画板'),
    ('h2','状态'), ('code','const shapes = signal([])\nconst dragging = signal(null)'),
    ('h2','拖拽'), ('code','on: {\n  mousedown: (e, shape) => dragging({ shape, dx: e.clientX - shape.x, dy: e.clientY - shape.y })\n}'),
    ('h2','全局移动'), ('code','onMount(() => {\n  const move = e => {\n    const d = dragging()\n    if (!d) return\n    shapes(shapes().map(s => s.id === d.shape.id ? { ...s, x: e.clientX - d.dx, y: e.clientY - d.dy } : s))\n  }\n  const up = () => dragging(null)\n  window.addEventListener("mousemove", move)\n  window.addEventListener("mouseup", up)\n  onUnmount(() => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up) })\n})'),
])
add('88-撤销重做', [
    ('h1','撤销重做'),
    ('h2','状态'), ('code','const history = signal([initial])\nconst idx = signal(0)\nconst current = computed(() => history()[idx()])'),
    ('h2','提交'), ('code','const commit = s => {\n  const h = history().slice(0, idx() + 1)\n  h.push(s)\n  history(h)\n  idx(h.length - 1)\n}'),
    ('h2','撤销'), ('code','const undo = () => { if (idx() > 0) idx(idx() - 1) }'),
    ('h2','重做'), ('code','const redo = () => { if (idx() < history().length - 1) idx(idx() + 1) }'),
])
add('89-快捷键', [
    ('h1','快捷键'),
    ('h2','全局监听'), ('code','onMount(() => {\n  const h = e => {\n    if ((e.metaKey || e.ctrlKey) && e.key === "s") {\n      e.preventDefault()\n      save()\n    }\n    if (e.key === "Escape") close()\n  }\n  window.addEventListener("keydown", h)\n  onUnmount(() => window.removeEventListener("keydown", h))\n})'),
    ('h2','组合键'), ('code','if (e.shiftKey && e.key === "Enter") submit()\nif (e.altKey && e.key === "1") goto(1)'),
])
add('90-右键菜单', [
    ('h1','右键菜单'),
    ('h2','状态'), ('code','const menu = signal(null)'),
    ('h2','监听'), ('code','on: {\n  contextmenu: e => {\n    e.preventDefault()\n    menu({ x: e.clientX, y: e.clientY })\n  }\n}'),
    ('h2','渲染'), ('code','show(() => menu(), () => div({\n  style: { position: "fixed", left: menu().x + "px", top: menu().y + "px" },\n  on: { click: () => menu(null) }\n},\n  list(actions, a => a.id, a => div({ on: { click: () => a.fn() } }, a.title))\n))'),
])
add('91-二维码', [
    ('h1','二维码'),
    ('h2','用库'), ('code','import QRCode from "qrcode"\nQRCode.toCanvas(canvas, "https://example.com")'),
    ('h2','用 API'), ('code','img({ src: () => `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text())}` })'),
])
add('92-日历', [
    ('h1','日历'),
    ('h2','状态'), ('code','const year = signal(2026)\nconst month = signal(10)'),
    ('h2','生成日期'), ('code','const days = computed(() => {\n  const y = year(), m = month()\n  const first = new Date(y, m - 1, 1).getDay()\n  const count = new Date(y, m, 0).getDate()\n  return Array.from({ length: 42 }, (_, i) => {\n    const d = i - first + 1\n    return d >= 1 && d <= count ? d : null\n  })\n})'),
    ('h2','渲染'), ('code','list(days, (_, i) => i, d => div({ class: "day" }, d || ""))'),
])
add('93-时间选择', [
    ('h1','时间选择'),
    ('h2','原生 input'), ('code','input({ type: "date", value: () => date(), on: { change: e => date(e.target.value) } })\ninput({ type: "time", value: () => time(), on: { change: e => time(e.target.value) } })'),
    ('h2','格式化'), ('code','const formatted = computed(() => {\n  const d = new Date(date() + "T" + time())\n  return d.toLocaleString("zh-CN")\n})'),
])
add('94-颜色选择', [
    ('h1','颜色选择'),
    ('h2','原生'), ('code','input({ type: "color", value: () => color(), on: { input: e => color(e.target.value) } })'),
    ('h2','预览'), ('code','div({ style: { background: () => color() } }, () => color())'),
    ('h2','调色板'), ('code','list(colors, c => c, c => div({\n  style: { background: c },\n  on: { click: () => color(c) }\n}))'),
])
add('95-数字输入', [
    ('h1','数字输入'),
    ('h2','基本'), ('code','input({ type: "number", value: () => n(), on: { input: e => n(+e.target.value) } })'),
    ('h2','步进'), ('code','button({ on: { click: () => n(n() + 1) } }, "+")\nbutton({ on: { click: () => n(n() - 1) } }, "-")'),
    ('h2','限制范围'), ('code','const set = v => n(Math.max(0, Math.min(100, v)))'),
    ('h2','格式化'), ('code','span(null, () => n().toLocaleString())'),
])
add('96-富文本编辑器', [
    ('h1','富文本编辑器'),
    ('h2','基本'), ('code','div({\n  contenteditable: true,\n  on: { input: e => html(e.target.innerHTML) }\n})'),
    ('h2','工具栏'), ('code','const cmd = c => document.execCommand(c, false, null)\n\nbutton({ on: { click: () => cmd("bold") } }, "B")\nbutton({ on: { click: () => cmd("italic") } }, "I")\nbutton({ on: { click: () => cmd("underline") } }, "U")\nbutton({ on: { click: () => cmd("insertUnorderedList") } }, "列表")'),
    ('h2','第三方'), ('p','复杂场景用 Quill 或 TipTap。'),
])
add('97-文件树', [
    ('h1','文件树'),
    ('h2','数据'), ('code','const tree = [\n  { name: "src", children: [\n    { name: "app.js" },\n    { name: "utils", children: [{ name: "a.js" }] }\n  ]}\n]'),
    ('h2','递归渲染'), ('code','function Node({ node, depth }) {\n  const open = signal(true)\n  return div(null,\n    div({ style: { paddingLeft: (depth * 16) + "px" }, on: { click: () => open(!open()) } }, node.name),\n    show(() => open() && node.children, () =>\n      list(node.children, c => c.name, c => Node({ node: c, depth: depth + 1 }))\n    )\n  )\n}'),
])
add('98-看板', [
    ('h1','看板'),
    ('h2','状态'), ('code','const columns = signal([\n  { id: "todo", title: "待办", cards: [] },\n  { id: "doing", title: "进行中", cards: [] },\n  { id: "done", title: "完成", cards: [] }\n])'),
    ('h2','拖拽'), ('code','on: {\n  dragstart: e => e.dataTransfer.setData("cardId", card.id),\n  drop: e => {\n    const cardId = e.dataTransfer.getData("cardId")\n    moveCard(cardId, column.id)\n  }\n}'),
    ('h2','移动函数'), ('code','const moveCard = (cardId, toCol) => {\n  const cols = columns().map(c => ({ ...c, cards: c.cards.filter(x => x.id !== cardId) }))\n  const card = columns().flatMap(c => c.cards).find(x => x.id === cardId)\n  const target = cols.find(c => c.id === toCol)\n  target.cards.push(card)\n  columns(cols)\n}'),
])
add('99-聊天界面', [
    ('h1','聊天界面'),
    ('h2','状态'), ('code','const messages = signal([])\nconst draft = signal("")'),
    ('h2','发送'), ('code','const send = () => {\n  if (!draft().trim()) return\n  messages([...messages(), { id: Date.now(), text: draft(), self: true }])\n  draft("")\n}'),
    ('h2','渲染'), ('code','list(messages, m => m.id, m => div({ class: m.self ? "bubble self" : "bubble" }, m.text))'),
    ('h2','自动滚底'), ('code','effect(() => {\n  messages()\n  const el = listEl()\n  if (el) el.scrollTop = el.scrollHeight\n})'),
])
add('100-在线编辑器', [
    ('h1','在线编辑器'),
    ('h2','布局'), ('code','div({ class: "editor" },\n  textarea({ value: () => code(), on: { input: e => code(e.target.value) } }),\n  iframe({ src: () => "data:text/html;charset=utf-8," + encodeURIComponent(buildHtml()) })\n)'),
    ('h2','构建 HTML'), ('code','const buildHtml = () => `<!DOCTYPE html>\n<html><body>${code()}</body></html>`'),
    ('h2','防抖刷新'), ('code','let timer\neffect(() => {\n  const c = code()\n  clearTimeout(timer)\n  timer = setTimeout(() => setPreview(c), 500)\n})'),
])

os.makedirs('site/src/docs', exist_ok=True)
for name, blocks in D.items():
    code = T.format(body=R(blocks))
    open(f'site/src/docs/{name}.xuy', 'w').write(code)
print(f'生成 {len(D)} 篇')
