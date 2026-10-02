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

swap("    ('api-signal', 'signal(init)', []),", r"""    ('api-signal', 'signal(init)', [
      ('H1','signal(init)'),
      ('P','创建一个响应式信号。'),
      ('H2','签名'),
      ('Code','const n = signal(init)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['init','T','初始值，可以是任意类型'],
      ]),
      ('H2','返回值'),
      ('P','返回一个函数 s：'),
      ('Table',['调用','行为'],[
        ['s()','读当前值'],
        ['s(v)','写新值'],
        ['s(fn)','函数式更新，fn(旧值) 返回新值'],
      ]),
      ('H2','示例'),
      ('Code',"const n = signal(0)\nn()                 // 0\nn(1)                // 1\nn(v => v + 1)       // 2\n\nconst user = signal({ name: 'x' })\nuser({ name: 'y' })                    // 整体替换\nuser(u => ({ ...u, age: 18 }))         // 函数式\n\nconst list = signal([1, 2, 3])\nlist(l => [...l, 4])                   // 追加",'xuy'),
      ('H2','特性'),
      ('Ul',
        'Object.is 比较——新旧值相等不触发更新',
        '自动依赖收集——在 effect 里读就订阅',
        '写入去重——同一 microtask 内多次写只触发一次（配合 batch）'),
      ('H2','扩展方法'),
      ('P','signal 上挂两个辅助方法：'),
      ('Table',['方法','返回'],[
        ['s.subsCount()','当前订阅者数量'],
        ['s.writeCount()','累计写入次数'],
      ]),
      ('H2','陷阱'),
      ('H3','读要加 ()'),
      ('Code',"n      // 是函数本身，不是值\nn()    // 值",'xuy'),
      ('H3','深层对象不自动追踪'),
      ('Code',"const u = signal({ a: { b: 1 } })\nu().a.b = 2         // 不触发\nu(u => ({ ...u, a: { ...u.a, b: 2 } }))   // 触发",'xuy'),
    ]),""", "api-signal")

swap("    ('api-computed', 'computed(fn)', []),", r"""    ('api-computed', 'computed(fn)', [
      ('H1','computed(fn)'),
      ('P','从其他 signal 派生的只读信号，自动缓存。'),
      ('H2','签名'),
      ('Code','const c = computed(fn)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['fn','() => T','计算函数，读依赖 signal'],
      ]),
      ('H2','返回值'),
      ('P','返回一个只读函数 c()。读它返回缓存值；依赖变化时下次读会重算。'),
      ('H2','示例'),
      ('Code',"const a = signal(1)\nconst b = signal(2)\nconst sum = computed(() => a() + b())\n\nsum()      // 3\na(10)\nsum()      // 12\nb(20)\nsum()      // 30",'xuy'),
      ('H2','特性'),
      ('Ul',
        '惰性——只在读时算，不是依赖变就立即算',
        '缓存——依赖没变时直接返回上次结果',
        '只读——没有写接口',
        '可以链式——computed 里用其他 computed'),
      ('H2','依赖链'),
      ('Code',"const price = signal(100)\nconst qty = signal(3)\nconst subtotal = computed(() => price() * qty())\nconst tax = computed(() => subtotal() * 0.13)\nconst total = computed(() => subtotal() + tax())\n\ntotal()   // 100*3 + 100*3*0.13 = 339",'xuy'),
      ('H2','vs signal'),
      ('Table',['','signal','computed'],[
        ['可写','是','否'],
        ['首次计算','立即','读时'],
        ['缓存','无','有'],
        ['依赖','无','自动追踪'],
      ]),
      ('H2','陷阱'),
      ('H3','不要在 computed 里写 signal'),
      ('Code',"const bad = computed(() => {\n  a(1)      // 错误：computed 应该纯\n  return a()\n})",'xuy'),
      ('H3','记得加 ()'),
      ('Code',"const c = computed(() => n() * 2)\nc        // 函数\nc()      // 值",'xuy'),
    ]),""", "api-computed")

swap("    ('api-effect', 'effect(fn)', []),", r"""    ('api-effect', 'effect(fn)', [
      ('H1','effect(fn)'),
      ('P','创建自动追踪依赖的副作用。'),
      ('H2','签名'),
      ('Code','const stop = effect(fn)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['fn','() => void | (() => void)','副作用函数，可返回清理函数'],
      ]),
      ('H2','返回值'),
      ('P','返回一个停止函数 stop()。调用它会 dispose effect。'),
      ('H2','示例'),
      ('Code',"const n = signal(0)\n\nconst stop = effect(() => {\n  console.log('n =', n())\n})\n// 立即执行一次 → 打印 n = 0\n\nn(1)      // 打印 n = 1\nstop()    // 停止\nn(2)      // 不打印",'xuy'),
      ('H2','清理函数'),
      ('Code',"const interval = signal(1000)\n\neffect(() => {\n  const id = setInterval(tick, interval())\n  return () => clearInterval(id)   // 重跑前清理旧的\n})",'xuy'),
      ('H2','特性'),
      ('Ul',
        '立即执行一次',
        '依赖自动收集——执行时读到的 signal 都订阅',
        '下次重跑前先清空旧依赖，重新收集',
        '返回清理函数会在重跑前 / dispose 时调用'),
      ('H2','生命周期'),
      ('Code',"// 1. 首次执行\n// 2. 依赖变化 → 跑清理函数 → 重跑\n// 3. stop() → 跑清理函数 → dispose",'js'),
      ('H2','陷阱'),
      ('H3','不要读写同一个 signal'),
      ('Code',"effect(() => {\n  n(n() + 1)   // 死循环\n})",'xuy'),
      ('H3','异步读不算订阅'),
      ('Code',"effect(() => {\n  setTimeout(() => console.log(n()), 100)   // 不订阅 n\n})",'xuy'),
    ]),""", "api-effect")

swap("    ('api-batch', 'batch(fn)', []),", r"""    ('api-batch', 'batch(fn)', [
      ('H1','batch(fn)'),
      ('P','把 fn 里的多次 signal 写合并成一次更新。'),
      ('H2','签名'),
      ('Code','batch(fn)','js'),
      ('H2','示例'),
      ('Code',"const a = signal(0)\nconst b = signal(0)\n\neffect(() => console.log(a(), b()))\n\n// 不 batch：2 次\na(1)   // 打印 1 0\nb(2)   // 打印 1 2\n\n// 用 batch：1 次\nbatch(() => {\n  a(10)\n  b(20)\n})\n// 只打印一次: 10 20",'xuy'),
      ('H2','嵌套'),
      ('Code',"batch(() => {\n  a(1)\n  batch(() => {\n    b(2)\n  })\n  c(3)\n})\n// 全部改完才更新一次",'xuy'),
      ('H2','特性'),
      ('Ul',
        '可嵌套——只有最外层结束时才真正 flush',
        '只合并"触发"，不合并"值"——中间值写入后立刻可读',
        '不影响 effect 内部——effect 重跑期间的写会自动进队列'),
      ('H2','何时使用'),
      ('Table',['场景','建议'],[
        ['同一事件里改多个 signal','用'],
        ['只改一个 signal','不需要'],
        ['循环里改 signal','用'],
        ['初始化状态','用'],
      ]),
      ('H2','陷阱'),
      ('H3','async 里失效'),
      ('Code',"batch(async () => {\n  a(1)\n  await sleep()\n  b(2)   // await 后已经退出 batch\n})",'xuy'),
    ]),""", "api-batch")

swap("    ('api-mount', 'mount(comp, target)', []),", r"""    ('api-mount', 'mount(comp, target)', [
      ('H1','mount(comp, target)'),
      ('P','把组件挂载到 DOM 容器。'),
      ('H2','签名'),
      ('Code','const unmount = mount(comp, target)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['comp','() => VNode 或 VNode','组件函数或 vnode'],
        ['target','string 或 Element','CSS 选择器或 DOM 元素'],
      ]),
      ('H2','返回值'),
      ('P','返回 unmount 函数——调用会卸载组件、清理所有 scope。'),
      ('H2','示例'),
      ('Code',"import { mount, div, h1, signal } from 'xunay'\n\nconst n = signal(0)\n\nconst unmount = mount(() => div(null,\n  h1(null, 'Hello'),\n  () => String(n())\n), '#app')\n\n// 卸载\nunmount()",'xuy'),
      ('H2','target 两种形式'),
      ('Code',"mount(App, '#app')                         // CSS 选择器\nmount(App, document.getElementById('app')) // DOM 元素",'xuy'),
      ('H2','创建根 scope'),
      ('P','mount 会为根组件建一个 scope，卸载时自动 dispose——里面所有 effect、onMount、onUnmount 一起清理。'),
      ('H2','和 hydrate 的区别'),
      ('Table',['','mount','hydrate'],[
        ['目标容器','空','有 SSR 内容'],
        ['行为','清空 + 重建','复用 + 绑定'],
        ['场景','CSR','SSR'],
      ]),
      ('H2','陷阱'),
      ('H3','target 找不到'),
      ('Code',"mount(App, '#not-exist')   // 抛错：target not found",'xuy'),
      ('H3','重复 mount 同容器'),
      ('Code',"mount(App, '#app')\nmount(App2, '#app')\n// 第二个 mount 会清空第一个的结果",'xuy'),
    ]),""", "api-mount")

swap("    ('api-render', 'render(vnode)', []),", r"""    ('api-render', 'render(vnode)', [
      ('H1','render(vnode)'),
      ('P','把 vnode 转换成真实 DOM 节点。底层 API，一般用 mount。'),
      ('H2','签名'),
      ('Code','const dom = render(vnode)','js'),
      ('H2','处理类型'),
      ('Table',['输入','输出'],[
        ['null / false / true','空文本节点'],
        ['字符串 / 数字','文本节点'],
        ['函数','递归执行后 render'],
        ['vnode','真实 DOM 元素'],
        ['fragment','display:contents 的 span'],
        ['show 对象','display:contents 的 span'],
        ['列表对象','display:contents 的 span'],
      ]),
      ('H2','示例'),
      ('Code',"import { render, div, h1 } from 'xunay'\n\nconst el = render(div(null, h1(null, '标题')))\ndocument.body.appendChild(el)",'xuy'),
      ('H2','特性'),
      ('Ul',
        '不建立根 scope——需要自己用 runInScope 包',
        '不清理旧内容——需要自己管',
        '不执行 onMount——需要 runMountFns',
        '一般用 mount 而不是直接 render'),
      ('H2','和其他 API 的关系'),
      ('Code',"// mount 内部调用 render\nfunction mount(comp, target) {\n  const root = typeof target === 'string' ? document.querySelector(target) : target\n  const scope = createScope(null)\n  runInScope(scope, () => {\n    root.appendChild(render(comp()))\n  })\n  runMountFns(scope)\n  return () => disposeScope(scope)\n}",'js'),
    ]),""", "api-render")

swap("    ('api-list', 'list(arr, key, fn)', []),", r"""    ('api-list', 'list(arr, key, fn)', [
      ('H1','list(arr, key, fn)'),
      ('P','按 key 做 diff 的列表渲染。'),
      ('H2','签名'),
      ('Code','list(arr, keyFn, renderFn)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['arr','T[] 或 () => T[]','数据源'],
        ['keyFn','(item, i) => key','提取唯一 key'],
        ['renderFn','(item, i) => VNode','渲染每一项'],
      ]),
      ('H2','示例'),
      ('Code',"import { list, ul, li, signal } from 'xunay'\n\nconst items = signal(['a', 'b', 'c'])\n\nul(null,\n  list(items, i => i, i => li(null, i))\n)",'xuy'),
      ('H2','diff 行为'),
      ('Table',['变化','处理'],[
        ['新增 item','创建新 DOM'],
        ['删除 item','dispose scope + removeChild'],
        ['重排','DocumentFragment 一次性重排'],
        ['item 引用变','fastUpdate 原地更新或重建'],
        ['key 不变 item 不变','完全跳过'],
      ]),
      ('H2','key 选择'),
      ('Code',"list(todos, t => t.id, ...)        // 正确：稳定 id\nlist(names, n => n, ...)           // 字符串本身\nlist(todos, (t, i) => i, ...)      // 不推荐：索引不稳定",'xuy'),
      ('H2','性能'),
      ('Table',['操作（1000 项）','耗时'],[
        ['首次渲染','~40ms'],
        ['追加 1 项','~0.5ms'],
        ['删除 1 项','~0.5ms'],
        ['改 1 项属性','~0.3ms'],
        ['全重排','~8ms'],
      ]),
      ('H2','常见陷阱'),
      ('H3','key 不唯一'),
      ('H3','直接 push 数组'),
      ('H3','渲染函数里有副作用'),
    ]),""", "api-list")

swap("    ('api-show', 'show(cond, fn)', []),", r"""    ('api-show', 'show(cond, fn)', [
      ('H1','show(cond, fn)'),
      ('P','按条件挂载/卸载 DOM。'),
      ('H2','签名'),
      ('Code','show(cond, renderFn)','js'),
      ('H2','参数'),
      ('Table',['参数','类型','说明'],[
        ['cond','() => boolean','条件函数'],
        ['renderFn','() => VNode','为真时渲染'],
      ]),
      ('H2','示例'),
      ('Code',"import { show, signal, div } from 'xunay'\n\nconst open = signal(false)\n\ndiv(null,\n  show(() => open(), () => div(null, '内容'))\n)",'xuy'),
      ('H2','生命周期'),
      ('Table',['切换','行为'],[
        ['假 → 真','createScope + render + appendChild'],
        ['真 → 假','disposeScope + removeChild'],
      ]),
      ('H2','vs 三目'),
      ('Table',['','show','三目'],[
        ['切换成本','scope 管理','整块重建'],
        ['onMount','自动触发','随父处理'],
        ['适合','复杂子树','简短内容'],
      ]),
      ('H2','特性'),
      ('Ul',
        'cond 变化才切换',
        '每次切换都重建子树——内部 signal 状态会重置',
        '支持嵌套'),
      ('H2','陷阱'),
      ('H3','传值而非函数'),
      ('Code',"show(open(), () => div())         // 错误：立即求值\nshow(() => open(), () => div())   // 正确",'xuy'),
      ('H3','cond 里有副作用'),
      ('Code',"show(() => { fetch('/api'); return n() > 0 }, () => div())   // 错误",'xuy'),
      ('H3','内部 signal 状态会丢'),
    ]),""", "api-show")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("API 8 篇已填")
