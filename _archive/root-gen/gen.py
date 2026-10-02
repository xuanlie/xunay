import os, json

T = """import {{ div, h1, h2, h3, p, ul, li, pre, code, blockquote }} from 'xunay'

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
        if t in ('h1','h2','h3','p','quote'):
            tag = 'blockquote' if t == 'quote' else t
            out.append(f"    {tag}(null, {json.dumps(b[1], ensure_ascii=False)}),")
        elif t == 'ul':
            out.append("    ul(null,")
            for it in b[1]:
                out.append(f"      li(null, {json.dumps(it, ensure_ascii=False)}),")
            out.append("    ),")
        elif t == 'code':
            out.append(f"    pre(null, code(null, {json.dumps(b[1], ensure_ascii=False)})),")
    return '\n'.join(out)

DOCS = {
'01-总览': [
    ('h1','总览'),
    ('p','内存最少、速度最快的前端框架。gzip 4.5KB，零依赖，无 VDOM，无 Fiber。'),
    ('h2','数字'),
    ('ul',['gzip 4.5KB (React 45KB)','create 1000 22ms (React 35ms)','update 10th 13ms (React 20ms)','内存 9.5MB 稳 (React 18MB)']),
    ('h2','特性'),
    ('ul',['Signal 内核，组件只执行一次','无 VDOM，直接操作真实 DOM','无 Fiber，无 Hooks 链表','前后端直连，RPC 风格','零依赖，纯 JS']),
    ('h2','30 秒上手'),
    ('code','const { div, button, span, signal, mount } = XuNay\nconst n = signal(0)\nmount(() => div(null,\n  button({ on: { click: () => n(v => v + 1) } }, "+1"),\n  span(null, () => `n = ${n()}`)\n), "#app")'),
],
'02-安装': [
    ('h1','安装'),
    ('p','三种方式：CDN、npm、源码。'),
    ('h2','CDN'),
    ('code','<script src="https://unpkg.com/xunay/dist/xunay.min.js"></script>'),
    ('h2','npm'),
    ('code','npm install xunay'),
    ('h2','源码'),
    ('code','git clone https://github.com/xunay/xunay.git\ncd xunay\nnode core/build.js'),
    ('h2','浏览器兼容'),
    ('ul',['Chrome 90+','Firefox 88+','Safari 14+','Edge 90+','不支持 IE']),
],
'03-快速开始': [
    ('h1','快速开始'),
    ('p','从零写一个计数器。'),
    ('h2','完整代码'),
    ('code','const { div, button, span, signal, mount } = XuNay\nconst n = signal(0)\nmount(() => div({ class: "box" },\n  button({ on: { click: () => n(v => v - 1) } }, "-"),\n  span(null, () => `n = ${n()}`),\n  button({ on: { click: () => n(v => v + 1) } }, "+")\n), "#app")'),
    ('h2','逐行解释'),
    ('ul',['signal(0) 创建信号，初值 0','mount 把组件挂到 #app','button 的 on.click 是点击事件','span 的第二个参数是函数，读了 n 就自动订阅']),
    ('h2','点 + 时发生什么'),
    ('ul',['执行 n(v => v + 1)','n 从 0 变成 1','XuNay 遍历订阅了 n 的 effect','只有 span 里的函数重跑','新字符串写进文本节点']),
    ('quote','没有 diff，没有虚拟 DOM，没有组件重渲染。'),
],
'04-思考方式': [
    ('h1','思考方式'),
    ('p','XuNay 里只写两种东西：信号 和 元素。'),
    ('h2','信号'),
    ('code','const n = signal(0)\n\nn()          // 读\nn(1)         // 写\nn(v => v+1)  // 更新'),
    ('p','谁读了它，它一变就通知谁。没有依赖数组，读了就自动追踪。'),
    ('h2','元素'),
    ('code','div({ class: "box" },\n  span(null, "hello"),\n  button({ on: { click: fn } }, "点我")\n)'),
    ('h2','关键：函数作为动态值'),
    ('ul',['静态：span(null, "hello")','动态：span(null, () => n())']),
    ('h2','跟 React 的区别'),
    ('p','React 组件重跑生成新树再 diff。XuNay 组件只跑一次，n 变时只有用到它的函数重跑。'),
    ('quote','只有传给元素的函数才会被追踪，组件本身不是响应式的。'),
],
'05-描述界面': [
    ('h1','描述界面'),
    ('p','直接写标签名，不用 JSX。'),
    ('h2','基本元素'),
    ('code','div({ class: "box" },\n  span(null, "hello"),\n  button({ on: { click: fn } }, "点我")\n)'),
    ('h2','支持的标签'),
    ('p','div span p a button input form label ul ol li h1-h6 table thead tbody tr td th img br hr'),
    ('h2','class'),
    ('code','div({ class: "box" })\ndiv({ class: () => active() ? "box active" : "box" })\ndiv({ class: { box: true, active: () => active() } })'),
    ('h2','style'),
    ('code','div({ style: { color: "red", fontSize: "16px" } })\ndiv({ style: () => ({ color: n() > 5 ? "red" : "blue" }) })'),
    ('h2','动态文本'),
    ('code','span(null, "hello")\nspan(null, () => `n = ${n()}`)'),
    ('h2','条件渲染'),
    ('code','show(() => n() > 5, () => span(null, "太多了"))'),
],
}

os.makedirs('site/src/docs', exist_ok=True)
for name, blocks in DOCS.items():
    code = T.format(body=render(blocks))
    open(f'site/src/docs/{name}.xuy', 'w').write(code)
    print(f'{name}.xuy')
