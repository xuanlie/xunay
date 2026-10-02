import json, os

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

def item(title, intro, sections):
    blocks = [('h1', title)]
    if intro: blocks.append(('p', intro))
    for s in sections:
        if s[0] == 'h2':
            blocks.append(s)
        elif s[0] == 'p':
            blocks.append(s)
        elif s[0] == 'code':
            blocks.append(s)
        elif s[0] == 'ul':
            blocks.append(s)
        elif s[0] == 'quote':
            blocks.append(s)
        elif s[0] == 'table':
            blocks.append(s)
    return blocks

DOCS = {}

# 生成 26-50 共 25 篇
topics = [
    ('26-响应式原理', '深入 Signal', [
        ('h2','数据结构'), ('code','const subs = new Set()  // 订阅者集合'),
        ('h2','读时收集'), ('code','if (runtime.currentEffect) subs.add(runtime.currentEffect)'),
        ('h2','写时通知'), ('code','for (const x of [...subs]) x.run()'),
        ('h2','自动追踪'), ('p','不需要依赖数组。读了就订阅，没读就不订阅。'),
    ]),
    ('27-批量更新', 'batch 怎么用', [
        ('h2','语法'), ('code','batch(() => {\n  a(1)\n  b(2)\n  c(3)\n})'),
        ('h2','原理'), ('code','runtime.batchDepth++\n// 内部所有 set 加进 pendingEffects\ntry { fn() } finally {\n  runtime.batchDepth--\n  if (!runtime.batchDepth) {\n    for (const e of pendingEffects) e.run()\n  }\n}'),
        ('h2','适用场景'), ('ul',['表单一次改多个字段','初始化大量状态','避免中间状态触发渲染']),
    ]),
    ('28-Effect详解', '副作用', [
        ('h2','创建'), ('code','const dispose = effect(() => {\n  console.log(n())\n})'),
        ('h2','依赖收集'), ('p','执行时收集读过的所有 signal。执行完清空，重新收集。'),
        ('h2','手动销毁'), ('code','dispose()'),
        ('h2','自动销毁'), ('p','在 scope 内创建的 effect 会挂到 scope。scope 销毁时自动清理。'),
    ]),
    ('29-Computed详解', '派生值', [
        ('h2','创建'), ('code','const double = computed(() => n() * 2)'),
        ('h2','缓存'), ('p','依赖没变时返回缓存，不重算。'),
        ('h2','依赖追踪'), ('p','内部是一个 effect，读过的 signal 都订阅。'),
        ('h2','链式'), ('code','const a = computed(() => n() + 1)\nconst b = computed(() => a() * 2)'),
    ]),
    ('30-动态属性', '属性可以是函数', [
        ('h2','class'), ('code','div({ class: () => active() ? "a" : "b" })'),
        ('h2','style'), ('code','div({ style: () => ({ color: n() > 5 ? "red" : "blue" }) })'),
        ('h2','其他属性'), ('code','input({ value: () => text() })'),
        ('h2','不写函数的后果'), ('quote','静态内容只求值一次，不会随信号变化。'),
    ]),
    ('31-动态子节点', '子节点是函数', [
        ('h2','动态文本'), ('code','span(null, () => `n = ${n()}`)'),
        ('h2','动态 vnode'), ('code','div(null, () => cond() ? A() : B())'),
        ('h2','列表'), ('code','ul(null, list(items, i => i.id, i => li(null, i.title)))'),
        ('h2','条件'), ('code','show(() => visible(), () => span(null, "内容"))'),
    ]),
    ('32-事件对象', 'e 是什么', [
        ('h2','原生事件'), ('p','e 就是浏览器的原生事件对象。'),
        ('h2','常用属性'), ('ul',['e.target 目标元素','e.currentTarget 当前元素','e.key 按键','e.target.value 输入值']),
        ('h2','阻止默认'), ('code','e.preventDefault()  // 或 { prevent: true }'),
        ('h2','阻止冒泡'), ('code','e.stopPropagation()  // 或 { stop: true }'),
    ]),
    ('33-表单模式', '常见表单', [
        ('h2','简单输入'), ('code','const val = signal("")\ninput({ value: () => val(), on: { input: e => val(e.target.value) } })'),
        ('h2','多字段'), ('code','const form = signal({ name: "", email: "" })\nconst update = (k, v) => form({ ...form(), [k]: v })'),
        ('h2','校验'), ('code','const err = computed(() => {\n  if (!form().email) return ""\n  return /@/.test(form().email) ? "" : "邮箱格式不对"\n})'),
        ('h2','提交'), ('code','form({ on: { submit: { fn: onSubmit, prevent: true } } })'),
    ]),
    ('34-路由实现', '前端路由', [
        ('h2','signal 存路径'), ('code','const route = signal(location.pathname)'),
        ('h2','监听变化'), ('code','window.addEventListener("popstate", () => route(location.pathname))'),
        ('h2','跳转'), ('code','export function push(path) {\n  history.pushState(null, "", path)\n  route(path)\n}'),
        ('h2','渲染'), ('code','() => route() === "/" ? Home() : About()'),
    ]),
    ('35-状态管理', '跨组件共享', [
        ('h2','顶层 signal'), ('code','// store.js\nexport const user = signal(null)\nexport const theme = signal("light")'),
        ('h2','导入'), ('code','import { user } from "./store.js"'),
        ('h2','多 store'), ('ul',['todos.js 管理待办','user.js 管理用户','ui.js 管理主题/语言']),
        ('h2','避免全局污染'), ('p','只在需要跨组件时提到顶层。组件内部状态用局部 signal。'),
    ]),
    ('36-组合式函数', '把逻辑抽出来', [
        ('h2','创建'), ('code','function useCounter(init = 0) {\n  const n = signal(init)\n  return {\n    n,\n    inc: () => n(v => v + 1),\n    dec: () => n(v => v - 1),\n    reset: () => n(init)\n  }\n}'),
        ('h2','使用'), ('code','const { n, inc, dec } = useCounter(10)'),
        ('h2','命名约定'), ('p','以 use 开头，返回信号和函数。'),
    ]),
    ('37-条件渲染', 'show 和三元', [
        ('h2','show'), ('code','show(() => n() > 5, () => span(null, "多"))'),
        ('h2','三元'), ('code','() => n() > 5 ? A() : B()'),
        ('h2','区别'), ('ul',['show：条件为假时卸载','三元：每次重新创建']),
        ('h2','生命周期'), ('p','show 切换时触发 onMount / onUnmount。'),
    ]),
    ('38-Fragment', '多根节点', [
        ('h2','基本'), ('code','frag(h1(null, "a"), p(null, "b"))'),
        ('h2','别名'), ('code','F(h1(null, "a"), p(null, "b"))'),
        ('h2','不生成包裹元素'), ('p','渲染时用 display:contents 的 span 占位，不影响布局。'),
        ('h2','返回给组件'), ('code','function Card() {\n  return frag(h2(null, "标题"), p(null, "内容"))\n}'),
    ]),
    ('39-Refs数组', '多个 ref', [
        ('h2','动态数量'), ('code','const refs = []\nlist(items, i => i.id, (item, idx) => {\n  const r = ref()\n  refs[idx] = r\n  return input({ ref: r })\n})'),
        ('h2','批量操作'), ('code','onMount(() => {\n  refs.forEach(r => r()?.focus())\n})'),
        ('h2','清理'), ('p','组件卸载时 refs 应手动清空，避免内存泄漏。'),
    ]),
    ('40-和React对比', '一图看懂', [
        ('h2','状态'), ('table',['XuNay','React'],[['signal(0)','useState(0)'],['n()','n'],['n(1)','setN(1)']]),
        ('h2','派生'), ('table',['XuNay','React'],[['computed(fn)','useMemo(fn, deps)']]),
        ('h2','副作用'), ('table',['XuNay','React'],[['effect(fn)','useEffect(fn, deps)']]),
        ('h2','列表'), ('table',['XuNay','React'],[['list(arr, key, fn)','arr.map(fn)']]),
        ('h2','条件'), ('table',['XuNay','React'],[['show(cond, fn)','{cond ? A : B}']]),
    ]),
    ('41-和Vue对比', '语法相近', [
        ('h2','状态'), ('table',['XuNay','Vue'],[['signal(0)','ref(0)'],['n()','n.value']]),
        ('h2','派生'), ('table',['XuNay','Vue'],[['computed(fn)','computed(fn)']]),
        ('h2','副作用'), ('table',['XuNay','Vue'],[['effect(fn)','watchEffect(fn)']]),
        ('h2','列表'), ('table',['XuNay','Vue'],[['list(arr, key, fn)','v-for']]),
    ]),
    ('42-和Svelte对比', '写法差异', [
        ('h2','状态'), ('table',['XuNay','Svelte'],[['signal(0)','let n = 0']]),
        ('h2','读'), ('table',['XuNay','Svelte'],[['n()','n']]),
        ('h2','写'), ('table',['XuNay','Svelte'],[['n(1)','n = 1']]),
        ('h2','编译'), ('p','Svelte 是编译时优化，XuNay 是运行时 Signal。'),
    ]),
    ('43-和Solid对比', '同是 Signal', [
        ('h2','相同'), ('ul',['Signal 内核','无 VDOM','组件只执行一次','精确更新']),
        ('h2','不同'), ('table',['XuNay','Solid'],[['4.5KB','7KB'],['div(...)','<div>...</div>']]),
        ('h2','性能'), ('table',['操作','XuNay','Solid'],[['create 1000','22ms','12ms'],['update 10th','13ms','4ms']]),
    ]),
    ('44-体积优化', '为什么小', [
        ('h2','不实现'), ('ul',['VDOM','Fiber','Hooks 链表','调度器','优先级','Suspense']),
        ('h2','内联'), ('p','10 个源文件，esbuild 打成单文件。'),
        ('h2','短名'), ('p','压缩后变量名 1 字符。'),
        ('h2','结果'), ('p','gzip 4.5KB，比 Preact 大 0.5KB，比 Solid 小 2.5KB。'),
    ]),
    ('45-性能优化技巧', '实战', [
        ('h2','列表'), ('ul',['用 list 不用 map','key 唯一','超过 1 万行虚拟滚动']),
        ('h2','组件'), ('ul',['不要把大对象放 signal','组件拆分到 100 行以内','用 computed 缓存派生']),
        ('h2','事件'), ('ul',['事件委托已内建','不要手动 addEventListener','用 on 属性']),
        ('h2','内存'), ('ul',['及时 unmount','清理定时器','避免闭包引用大对象']),
    ]),
    ('46-测试', '怎么写测试', [
        ('h2','单元测试'), ('code','const n = signal(0)\nn(1)\nassert(n() === 1)'),
        ('h2','DOM 测试'), ('code','const dom = render(div(null, "hi"))\nassert(dom.tagName === "DIV")'),
        ('h2','组件测试'), ('code','mount(() => Counter(), "#app")\nconst btn = document.querySelector("button")\nbtn.click()\nassert(document.body.textContent.includes("1"))'),
        ('h2','推荐工具'), ('p','Vitest + jsdom 或 Playwright。'),
    ]),
    ('47-常见错误', '排错手册', [
        ('h2','组件不更新'), ('p','检查动态值有没有包 () =>。'),
        ('h2','列表全部重建'), ('p','检查 key 是不是唯一。'),
        ('h2','内存泄漏'), ('p','检查定时器、订阅有没有清理。'),
        ('h2','事件不触发'), ('p','检查 on 里的键名是不是小写。'),
        ('h2','样式不生效'), ('p','检查 CSS 有没有被引入到 HTML。'),
    ]),
    ('48-迁移指南', '从React过来', [
        ('h2','API 对照'), ('table',['React','XuNay'],[['useState(0)','signal(0)'],['useEffect(fn, [])','mount(() => { onMount(fn) })'],['useMemo(fn, [])','computed(fn)'],['.map()','list()']]),
        ('h2','写法对照'), ('table',['React','XuNay'],[['<div>','div(...)'],['className','class'],['onClick','on: { click }']]),
        ('h2','不能直接迁'), ('ul',['class 组件','自定义 Hook','HOC','Render Props']),
    ]),
    ('49-设计理念', '为什么这么做', [
        ('h2','目标'), ('ul',['内存最少','速度最快','写法最短']),
        ('h2','不做'), ('ul',['不兼容 React','不用 VDOM','不用 Fiber','不用 Hooks','不写 TS']),
        ('h2','三条铁律'), ('ul',['core 零依赖','frontend 不操作 DOM','backend 不写业务']),
    ]),
    ('50-路线图', '未来计划', [
        ('h2','已完成'), ('ul',['Signal 内核','元素渲染','列表 key 复用','事件委托','生命周期','SSR','后端','WebSocket','编译器','迁移工具','文档站']),
        ('h2','计划'), ('ul',['npm 发布','VS Code 插件','官方 benchmark 收录','社区组件库']),
    ]),
]

os.makedirs('site/src/docs', exist_ok=True)
for name, intro, sections in topics:
    blocks = item(name.split('-')[1], intro, sections)
    code = T.format(body=render(blocks))
    open(f'site/src/docs/{name}.xuy', 'w').write(code)
    print(f'{name}.xuy')
