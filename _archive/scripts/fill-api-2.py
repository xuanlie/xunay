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

swap("    ('api-frag', 'frag(...children)', []),", r"""    ('api-frag', 'frag(...children)', [
      ('H1','frag(...children)'),
      ('P','返回一组并列节点，不产生包裹层。'),
      ('H2','签名'),
      ('Code','frag(...children)','js'),
      ('H2','示例'),
      ('Code',"import { frag, h1, p } from 'xunay'\n\nfrag(\n  h1(null, '标题'),\n  p(null, '正文')\n)",'xuy'),
      ('H2','别名'),
      ('P','F 是 frag 的别名。'),
      ('Code',"import { F } from 'xunay'\nF(h1(null, 'a'), p(null, 'b'))",'xuy'),
      ('H2','内部'),
      ('P','返回一个 { [FRAGMENT]: true, children: [...] } 对象。render 时创建一个 display:contents 的 span 作为容器。'),
      ('H2','特性'),
      ('Ul',
        '不产生额外 DOM 层（display:contents）',
        '接受任意数量子节点',
        '可嵌套'),
      ('H2','陷阱'),
      ('H3','不接受 props'),
      ('Code',"frag({ class: 'x' }, a, b)   // 错误\nfrag(a, b)                    // 正确",'xuy'),
    ]),""", "api-frag")

swap("    ('api-txt', 'txt 模板标签', []),", r"""    ('api-txt', 'txt 模板标签', [
      ('H1','txt 模板标签'),
      ('P','响应式模板字符串——内部的插值自动追踪 signal。'),
      ('H2','签名'),
      ('Code','txt`文字 ${值}`','js'),
      ('H2','示例'),
      ('Code',"import { txt, signal, span } from 'xunay'\n\nconst n = signal(0)\nspan(null, txt`n = ${n}`)\n// 等价于 span(null, () => 'n = ' + n())",'xuy'),
      ('H2','插值形式'),
      ('Table',['写法','行为'],[
        ['${n}','响应式（signal 或普通值）'],
        ['${n()}','立即求值，不响应式'],
        ['${() => n()}','响应式'],
      ]),
      ('H2','多个插值'),
      ('Code',"const a = signal(1)\nconst b = signal(2)\n\ndiv(null, txt`a=${a} b=${b}`)\n// a 或 b 变化都会更新",'xuy'),
      ('H2','特性'),
      ('Ul',
        '内部创建一个文本节点，更新时只改 textContent',
        '任一插值变化都触发更新',
        '支持任意表达式'),
      ('H2','陷阱'),
      ('H3','不要写模板嵌套'),
      ('Code',"txt`${txt`inner`}`   // 错误：嵌套无法追踪",'xuy'),
    ]),""", "api-txt")

swap("    ('api-onMount', 'onMount(fn)', []),", r"""    ('api-onMount', 'onMount(fn)', [
      ('H1','onMount(fn)'),
      ('P','注册"元素挂载到文档后"的回调。'),
      ('H2','签名'),
      ('Code','onMount(fn)','js'),
      ('H2','示例'),
      ('Code',"import { onMount, ref, input } from 'xunay'\n\nconst el = ref()\ninput({ ref: e => el(e) })\n\nonMount(() => {\n  el().focus()\n})",'xuy'),
      ('H2','特性'),
      ('Ul',
        '只能在组件内部调用（需要 scope）',
        '父 scope 的 onMount 先于子 scope',
        '同一 scope 可多次调用，按注册顺序执行',
        '访问 DOM 安全（元素已在文档里）'),
      ('H2','执行时机'),
      ('Code',"// 1. 元素创建（ref 回调触发）\n// 2. 元素挂载到文档\n// 3. onMount 回调触发",'js'),
      ('H2','陷阱'),
      ('H3','模块顶层不生效'),
      ('Code',"// 错误：模块顶层\nonMount(() => { ... })\n\n// 正确：组件函数体内\nfunction Home() {\n  onMount(() => { ... })\n  return div(null, 'x')\n}",'xuy'),
    ]),""", "api-onMount")

swap("    ('api-onUnmount', 'onUnmount(fn)', []),", r"""    ('api-onUnmount', 'onUnmount(fn)', [
      ('H1','onUnmount(fn)'),
      ('P','注册"元素即将卸载"的回调。'),
      ('H2','签名'),
      ('Code','onUnmount(fn)','js'),
      ('H2','示例'),
      ('Code',"import { onMount, onUnmount, div } from 'xunay'\n\nfunction Timer() {\n  onMount(() => {\n    const id = setInterval(tick, 1000)\n    onUnmount(() => clearInterval(id))\n  })\n  return div(null, '定时器')\n}",'xuy'),
      ('H2','执行时机'),
      ('Table',['触发','时机'],[
        ['show 切换假','卸载时'],
        ['list 删除项','卸载时'],
        ['父组件卸载','递归卸载时'],
        ['unmount() 调用','卸载根组件时'],
      ]),
      ('H2','执行顺序'),
      ('P','子 scope 的 onUnmount 先于父 scope。'),
      ('Code',"// <Parent><Child /></Parent>\n// 卸载顺序：Child onUnmount → Parent onUnmount",'js'),
      ('H2','用途'),
      ('Ul',
        '清定时器',
        '取消订阅',
        '关闭 WebSocket',
        '保存草稿'),
      ('H2','陷阱'),
      ('H3','不能在 onUnmount 里访问 DOM'),
      ('P','卸载时元素可能已经被移除，用捕获的引用而非 querySelector。'),
    ]),""", "api-onUnmount")

swap("    ('api-ref', 'ref(init)', []),", r"""    ('api-ref', 'ref(init)', [
      ('H1','ref(init)'),
      ('P','创建一个可写、可读的普通变量容器。常用于 DOM 引用。'),
      ('H2','签名'),
      ('Code','const r = ref(init)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['init','T','初始值（可选）'],
      ]),
      ('H2','返回值'),
      ('Table',['调用','行为'],[
        ['r()','读当前值'],
        ['r(v)','写新值'],
      ]),
      ('H2','示例'),
      ('Code',"import { ref, input, onMount } from 'xunay'\n\nconst inputRef = ref()\n\ninput({ ref: el => inputRef(el) })\nonMount(() => inputRef().focus())",'xuy'),
      ('H2','特性'),
      ('Ul',
        '可读可写',
        '非响应式——写不会触发 effect',
        '不是 signal，不需要 () 之外的额外操作'),
      ('H2','vs signal'),
      ('Table',['','ref','signal'],[
        ['响应式','否','是'],
        ['触发更新','否','是'],
        ['用途','DOM 引用 / 内部状态','UI 状态'],
      ]),
      ('H2','陷阱'),
      ('H3','在 onMount 之前读'),
      ('Code',"const r = ref()\ndiv({ ref: e => r(e) })\nconsole.log(r())   // 可能 null\nonMount(() => console.log(r()))   // 一定非空",'xuy'),
    ]),""", "api-ref")

swap("    ('api-ctx', 'ctx(default)', []),", r"""    ('api-ctx', 'ctx(default)'),
      ('H1','ctx(default)'),
      ('P','创建跨层级传递值的上下文。'),
      ('H2','签名'),
      ('Code','const C = ctx(defaultValue)','js'),
      ('H2','返回值'),
      ('Table',['方法','作用'],[
        ['C.get()','读最近一次 provide 的值'],
        ['C.provide(value, fn)','在 fn 执行期间提供值'],
      ]),
      ('H2','示例'),
      ('Code',"import { ctx, div } from 'xunay'\n\nconst ThemeCtx = ctx('light')\n\n// 祖先\nThemeCtx.provide('dark', () => Card())\n\n// 后代\nfunction Card() {\n  const theme = ThemeCtx.get()\n  return div(null, 'theme: ' + theme)\n}",'xuy'),
      ('H2','特性'),
      ('Ul',
        '同步栈——provide 期间的 get 才有效',
        '可嵌套——内层覆盖外层',
        '默认值——没人 provide 时返回'),
      ('H2','嵌套'),
      ('Code',"const C = ctx('root')\nC.provide('a', () => {\n  C.get()   // 'a'\n  C.provide('b', () => {\n    C.get()   // 'b'\n  })\n  C.get()   // 'a'\n})",'xuy'),
      ('H2','陷阱'),
      ('H3','异步里失效'),
      ('Code',"C.provide('x', async () => {\n  await sleep(100)\n  C.get()   // 已经退出 provide，读不到 'x'\n})",'xuy'),
    ]),""", "api-ctx")

swap("    ('api-err', 'err(fn, fallback)', []),", r"""    ('api-err', 'err(fn, fallback)', [
      ('H1','err(fn, fallback)'),
      ('P','错误边界——同步捕获 fn 里的异常，出错时返回 fallback。'),
      ('H2','签名'),
      ('Code','err(fn, fallback)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['fn','() => T','可能抛错的函数'],
        ['fallback','T 或 (e) => T','出错时的返回值'],
      ]),
      ('H2','示例'),
      ('Code',"import { err, div } from 'xunay'\n\nerr(\n  () => JSON.parse(userInput),\n  (e) => div(null, '错误: ' + e.message)\n)",'xuy'),
      ('H2','默认行为'),
      ('P','不传 fallback 时，打印 console.error 并返回 undefined。'),
      ('H2','特性'),
      ('Ul',
        '只捕获同步异常',
        'fallback 可以是值或函数',
        '可以嵌套'),
      ('H2','陷阱'),
      ('H3','不捕获异步'),
      ('Code',"err(() => { fetch('/api').then(...) })   // 异步 reject 捕不到",'xuy'),
    ]),""", "api-err")

swap("    ('api-lazy', 'lazy(loader)', []),", r"""    ('api-lazy', 'lazy(loader)', [
      ('H1','lazy(loader)'),
      ('P','延迟加载组件——首次渲染时才 import。'),
      ('H2','签名'),
      ('Code','const C = lazy(loader)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['loader','() => Promise<Module>','返回模块的 Promise'],
      ]),
      ('H2','返回值'),
      ('P','返回一个组件函数。第一次调用触发 loader，加载完渲染，加载中返回 null。'),
      ('H2','示例'),
      ('Code',"import { lazy, div } from 'xunay'\n\nconst Chart = lazy(() => import('./Chart.js'))\n\ndiv(null, Chart({ data }))",'xuy'),
      ('H2','配合 loading'),
      ('Code',"import { lazy, signal, show, span } from 'xunay'\n\nconst loading = signal(true)\nconst Heavy = lazy(() => import('./Heavy.js').then(m => {\n  loading(false)\n  return m\n}))\n\ndiv(null,\n  show(() => loading(), () => span(null, '加载中')),\n  () => loading() ? null : Heavy({})\n)",'xuy'),
      ('H2','陷阱'),
      ('H3','立即执行的 import'),
      ('Code',"// 错误\nconst C = lazy(import('./C.js'))\n\n// 正确\nconst C = lazy(() => import('./C.js'))",'xuy'),
    ]),""", "api-lazy")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("API 8 篇已填（frag / txt / onMount / onUnmount / ref / ctx / err / lazy）")
