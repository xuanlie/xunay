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

DOCS = {
'14-Context': [
    ('h1','Context 上下文'),
    ('p','跨层级传值。'),
    ('h2','创建'),
    ('code','import { ctx } from "xunay"\n\nconst theme = ctx("light")'),
    ('h2','提供值'),
    ('code','theme.provide("dark", () => {\n  div(null, () => theme.get())  // "dark"\n})'),
    ('h2','读取'),
    ('code','theme.get()  // 没提供时返回默认值 "light"'),
    ('h2','嵌套提供'),
    ('code','theme.provide("dark", () => {\n  theme.provide("blue", () => {\n    theme.get()  // "blue"\n  })\n  theme.get()  // "dark"\n})\ntheme.get()  // "light"'),
    ('h2','常见用途'),
    ('ul',['主题','语言','用户信息','全局配置']),
    ('quote','provide 只在同步调用期间有效。await 之后 get 会拿到默认值。'),
],
'15-Lazy': [
    ('h1','Lazy 懒加载'),
    ('h2','基本用法'),
    ('code','import { lazy } from "xunay"\n\nconst Big = lazy(() => import("./Big.js"))\n\nmount(() => div(null, Big()), "#app")'),
    ('h2','加载中'),
    ('p','首次渲染时开始加载，返回 null。加载完成后自动重渲染。'),
    ('h2','错误处理'),
    ('code','const Big = lazy(() => import("./Big.js"))\n// 加载失败会抛错误，用 err 包一层'),
    ('h2','结合 show'),
    ('code','const Big = lazy(() => import("./Big.js"))\nshow(() => visible(), () => Big())'),
],
'16-Error': [
    ('h1','错误边界'),
    ('h2','基本用法'),
    ('code','import { err } from "xunay"\n\nerr(\n  () => riskyOperation(),\n  (e) => span(null, "出错：" + e.message)\n)'),
    ('h2','包裹组件'),
    ('code','err(\n  () => Child(),\n  (e) => div(null, "组件出错：", e.message)\n)'),
    ('h2','返回值'),
    ('ul',['正常执行返回组件结果','出错时返回 fallback','fallback 可以是函数或 vnode']),
],
'17-Transition': [
    ('h1','过渡动画'),
    ('h2','基本用法'),
    ('code','import { trans } from "xunay"\n\nconst t = trans(200)\n\nt.enter(el)\nt.leave(el, () => {})'),
    ('h2','enter'),
    ('p','淡入：opacity 0 → 1，持续 200ms。'),
    ('h2','leave'),
    ('p','淡出：opacity 1 → 0，完成后调用回调。'),
    ('h2','自定义时长'),
    ('code','const slow = trans(500)'),
],
'18-DevTool': [
    ('h1','调试工具'),
    ('h2','开启'),
    ('code','import { enableDevtool, disableDevtool } from "xunay"\nenableDevtool()'),
    ('h2','查看事件'),
    ('code','import { getEvents, clearEvents } from "xunay"\n\nconst events = getEvents()\nclearEvents()'),
    ('h2','浏览器接口'),
    ('p','开启后，window.__XUNAY_DEVTOOL__ 可用。'),
],
'19-性能优化': [
    ('h1','性能优化'),
    ('h2','核心原则'),
    ('ul',['组件只执行一次','精确更新只改用到信号的节点','事件委托只挂根节点','内存作用域自动清理']),
    ('h2','列表优化'),
    ('ul',['用 list 不用 map','key 用唯一 ID','数组整体替换不 push','超过 10000 行用虚拟滚动']),
    ('h2','避免的坑'),
    ('ul',['不要在组件顶层读信号','不要在循环里创建信号','不要频繁替换大对象','不要在动态函数里做重活']),
    ('h2','实测'),
    ('table',['操作','XuNay','React 18'],[['create 1000','22ms','35ms'],['update 10th','13ms','20ms'],['clear','14ms','15ms'],['内存','9.5MB','18MB']]),
],
'20-常见问题': [
    ('h1','常见问题'),
    ('h2','为什么叫 XuNay'),
    ('p','自创名，不撞 React 商标。'),
    ('h2','为什么不用 VDOM'),
    ('p','VDOM 慢、占内存。Signal 精确更新只改该改的节点。'),
    ('h2','为什么不兼容 React'),
    ('p','兼容 React 就要背它的历史包袱。API 像就够，内核自由。'),
    ('h2','为什么不用 TS'),
    ('p','后端 Pydantic 定义一次，前端直接用，不重复。'),
    ('h2','支持 IE 吗'),
    ('p','不支持。只支持 ES2020+。'),
    ('h2','能用在生产吗'),
    ('p','核心已稳定，能跑 benchmark、SSR、WebSocket。适合中小项目。'),
    ('h2','跟 Solid / Preact / Svelte 比'),
    ('table',['框架','gzip','特点'],[['XuNay','4.5KB','全模块一体、前后端直连'],['Solid','7KB','成熟、生态好'],['Preact','4KB','React 兼容'],['Svelte','编译时','最像 HTML']]),
],
'21-信号详解': [
    ('h1','信号详解'),
    ('h2','内部结构'),
    ('code','function signal(init) {\n  let v = init\n  let subs = null\n  return function s(...a) {\n    if (a.length === 0) {\n      if (runtime.currentEffect) {\n        if (!subs) subs = new Set()\n        subs.add(runtime.currentEffect)\n        runtime.currentEffect.deps.add(subs)\n      }\n      return v\n    }\n    const n = typeof a[0] === "function" ? a[0](v) : a[0]\n    if (Object.is(n, v)) return v\n    v = n\n    if (subs) for (const x of [...subs]) x.run()\n    return v\n  }\n}'),
    ('h2','惰性订阅'),
    ('p','没人读之前，subs 是 null，不分配 Set。节省内存。'),
    ('h2','相同值不触发'),
    ('code','const n = signal(0)\nn(0)  // 不触发\nn(1)  // 触发'),
    ('h2','批量更新'),
    ('code','import { batch } from "xunay"\n\nbatch(() => {\n  a(1)\n  b(2)\n})'),
    ('p','batch 内的多个写操作，只触发一次更新。'),
],
'22-渲染原理': [
    ('h1','渲染原理'),
    ('h2','元素是描述'),
    ('code','div({ class: "box" }, "hello")\n// { type: "div", props: { class: "box" }, children: ["hello"] }'),
    ('h2','render 变成 DOM'),
    ('code','import { render } from "xunay"\n\nconst dom = render(div(null, "hi"))\ndocument.body.appendChild(dom)'),
    ('h2','动态值用 effect'),
    ('code','span(null, () => n())\n// 生成：\nconst t = document.createTextNode("")\neffect(() => {\n  t.textContent = String(fn())\n})'),
    ('h2','静态元素不创建 scope'),
    ('p','判断 props 和 children 有没有函数。没有就是静态，直接 createElement。'),
    ('h2','多个动态值合并'),
    ('p','同一个元素的多个动态值，合并到一个 effect 里。1000 行只创建 1000 个 effect，不是 4000 个。'),
],
'23-列表原理': [
    ('h1','列表原理'),
    ('h2','核心数据结构'),
    ('code','const map = new Map()  // key -> { dom, item }'),
    ('h2','更新流程'),
    ('ul',['遍历新数组的每一项','算 key，查 map','没找到则创建 DOM','找到且 item 变了则更新','旧 key 不在新集合里则删除','顺序变了则重排']),
    ('h2','fastUpdate'),
    ('p','item 变了时，不重建整行 DOM。走遍 vnode 和 DOM 树，只改变化的文本。'),
    ('h2','重排优化'),
    ('p','只在有新项、删除或顺序变化时重排。否则不动。'),
],
'24-事件系统': [
    ('h1','事件系统'),
    ('h2','事件委托'),
    ('code','// 所有事件挂在根节点\nrootEl.addEventListener("click", dispatch)'),
    ('h2','dispatch'),
    ('code','function dispatch(e) {\n  let node = e.target\n  while (node && node !== rootEl) {\n    const hs = node.__xunay_handlers\n    if (hs && hs[e.type]) hs[e.type](e)\n    node = node.parentNode\n  }\n}'),
    ('h2','不冒泡的事件'),
    ('p','focus、blur、load、error 不冒泡，走直绑路径。'),
    ('h2','内存'),
    ('p','1000 个按钮只挂 1 个监听器。DOM 移除时 handler 引用一起消失。'),
],
'25-内存管理': [
    ('h1','内存管理'),
    ('h2','作用域'),
    ('p','每个 DOM 元素一个 scope。scope 管该元素下所有 effect、子 scope、mount/unmount 回调。'),
    ('h2','销毁'),
    ('code','disposeScope(scope)\n// 递归销毁：\n// - 所有 effect.dispose()\n// - 所有 unmount 回调\n// - 所有子 scope'),
    ('h2','卸载时'),
    ('code','const unmount = mount(App, "#app")\nunmount()  // 全部清理'),
    ('h2','反复挂载'),
    ('p','反复挂载卸载 1 万次，内存不涨。因为每次卸载都彻底清理。'),
    ('h2','惰性分配'),
    ('p','scope 里的 effects、mountFns、unmountFns 默认是 null。用到才创建。'),
],
}
os.makedirs('site/src/docs', exist_ok=True)
for name, blocks in DOCS.items():
    code = T.format(body=render(blocks))
    open(f'site/src/docs/{name}.xuy', 'w').write(code)
    print(f'{name}.xuy')
