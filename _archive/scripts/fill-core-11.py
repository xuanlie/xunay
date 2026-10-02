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

# ============ model ============
swap("    ('core-model', '表单绑定', []),", r"""    ('core-model', '表单绑定', [
      ('H1','表单绑定'),
      ('P','xunay 没有内置 v-model——但可以用几个工具函数简化双向绑定。'),
      ('H2','手写双向绑定'),
      ('Code',"import { signal, input } from 'xunay'\n\nconst name = signal('')\n\ninput({\n  value: () => name(),\n  on: { input: e => name(e.target.value) }\n})",'xuy'),
      ('H2','model 辅助'),
      ('P','把上面的模式封成函数：'),
      ('Code',"export function model(sig) {\n  return {\n    value: () => sig(),\n    on: {\n      input: e => sig(e.target.value),\n      change: e => sig(e.target.value)\n    }\n  }\n}\n\n// 用\ninput({ class: 'input', ...model(name) })",'xuy'),
      ('H2','数字输入'),
      ('Code',"export function modelNum(sig) {\n  return {\n    value: () => sig(),\n    on: { input: e => sig(Number(e.target.value) || 0) }\n  }\n}\n\ninput({ type: 'number', ...modelNum(age) })",'xuy'),
      ('H2','复选框'),
      ('Code',"export function modelCheck(sig) {\n  return {\n    checked: () => sig(),\n    on: { change: e => sig(e.target.checked) }\n  }\n}\n\ninput({ type: 'checkbox', ...modelCheck(agree) })",'xuy'),
      ('H2','下拉框'),
      ('Code',"const color = signal('red')\n\nselect({\n  value: () => color(),\n  on: { change: e => color(e.target.value) }\n},\n  ...['red', 'green', 'blue'].map(c =>\n    option({ value: c, selected: () => color() === c }, c)\n  )\n)",'xuy'),
      ('H2','多字段表单'),
      ('Code',"import { signal, batch, div, input, button } from 'xunay'\n\nfunction Form() {\n  const name = signal('')\n  const email = signal('')\n  const agree = signal(false)\n\n  const submit = () => {\n    console.log({ name: name(), email: email(), agree: agree() })\n  }\n\n  return div(null,\n    input({ placeholder: '姓名', ...model(name) }),\n    input({ placeholder: '邮箱', ...model(email) }),\n    label(null,\n      input({ type: 'checkbox', ...modelCheck(agree) }),\n      ' 我同意条款'\n    ),\n    button({ on: { click: submit }, disabled: () => !agree() }, '提交')\n  )\n}",'xuy'),
      ('H2','实时校验'),
      ('Code',"import { signal, computed } from 'xunay'\n\nconst email = signal('')\nconst emailErr = computed(() => {\n  const v = email()\n  if (!v) return ''\n  if (!/^[^@]+@[^@]+$/.test(v)) return '邮箱格式不正确'\n  return ''\n})\n\ninput({\n  class: () => 'input' + (emailErr() ? ' error' : ''),\n  ...model(email)\n})\nshow(emailErr, () => div({ class: 'error-msg' }, () => emailErr()))",'xuy'),
      ('H2','受控 vs 非受控'),
      ('Table',['','受控','非受控'],[
        ['值来源','signal','DOM 自己'],
        ['读写','双向绑定','只读取'],
        ['适用','需要实时校验/联动','简单输入'],
      ]),
      ('H2','完整示例：多步表单'),
      ('Code',"import { signal, div, input, button, show, mount } from 'xunay'\n\nfunction MultiStep() {\n  const step = signal(1)\n  const name = signal('')\n  const email = signal('')\n  const pwd = signal('')\n\n  const next = () => step(step() + 1)\n  const prev = () => step(step() - 1)\n\n  return div({ class: 'wizard' },\n    div({ class: 'steps' }, () => '步骤 ' + step() + ' / 3'),\n\n    show(() => step() === 1, () =>\n      div(null,\n        input({ placeholder: '姓名', ...model(name) }),\n        button({ on: { click: next }, disabled: () => !name() }, '下一步')\n      )\n    ),\n    show(() => step() === 2, () =>\n      div(null,\n        input({ placeholder: '邮箱', ...model(email) }),\n        button({ on: { click: prev } }, '上一步'),\n        button({ on: { click: next }, disabled: () => !email() }, '下一步')\n      )\n    ),\n    show(() => step() === 3, () =>\n      div(null,\n        input({ type: 'password', placeholder: '密码', ...model(pwd) }),\n        button({ on: { click: prev } }, '上一步'),\n        button({ on: { click: () => console.log('提交') }, disabled: () => !pwd() }, '完成')\n      )\n    )\n  )\n}\n\nmount(() => MultiStep(), '#app')",'xuy'),
    ]),""", "model")

# ============ scope ============
swap("    ('core-scope', 'Scope', []),", r"""    ('core-scope', 'Scope', [
      ('H1','Scope'),
      ('P','Scope（作用域）是 xunay 的资源管理单元——每个 DOM 节点挂一个 scope，管理它下面所有 effect、子 scope、mount/unmount 回调。'),
      ('H2','为什么要它'),
      ('P','组件卸载时，它内部的定时器、事件监听、effect 都要清理。scope 让这件事自动化——disposeScope 递归清理整棵树。'),
      ('H2','scope 树'),
      ('Code',"mount(App)\n// └── scope (root)\n//     ├── scope (App)\n//     │   ├── scope (Nav)\n//     │   └── scope (Page)\n//     │       ├── effect\n//     │       └── scope (list item)\n//     │           └── effect",'js'),
      ('H2','scope 里有什么'),
      ('Table',['字段','作用'],[
        ['effects','这个 scope 下所有 effect'],
        ['children','子 scope 集合'],
        ['mountFns','onMount 回调列表'],
        ['unmountFns','onUnmount 回调列表'],
        ['parent','父 scope 引用'],
        ['disposed','是否已销毁'],
      ]),
      ('H2','生命周期'),
      ('Code',"// 创建：进入新元素时\nconst s = createScope(parentScope)\n\n// 使用：runInScope 让代码在 scope 里执行\nrunInScope(s, () => {\n  // 这里创建的 effect 属于 s\n})\n\n// 销毁：disposeScope 递归清理\ndisposeScope(s)\n// 1. 跑 onUnmount 回调\n// 2. dispose 所有 effect\n// 3. 递归 dispose 子 scope\n// 4. 从父 scope 移除自己",'js'),
      ('H2','手动使用 scope'),
      ('P','很少需要手动——框架自动处理。但写库/高级用法时可能用到：'),
      ('Code',"import { createScope, disposeScope, runInScope, effect, signal } from 'xunay'\n\nconst s = createScope(null)\nconst n = signal(0)\n\nrunInScope(s, () => {\n  effect(() => console.log('n =', n()))\n})\n\nn(1)            // 打印 n = 1\n\ndisposeScope(s)  // 清理\nn(2)            // 不打印', 'xuy'),
      ('H2','和 effect 的关系'),
      ('P','在 scope 里创建的 effect 自动加入 scope.effects。disposeScope 时批量清理。'),
      ('Code',"runInScope(myScope, () => {\n  effect(() => n())    // 加入 myScope.effects\n  effect(() => m())    // 同上\n  const stop = effect(() => k())  // 也可以手动 stop\n})\n\n// myScope 被 dispose 时，3 个 effect 一起清理",'xuy'),
      ('H2','和列表的关系'),
      ('P','list 每一项都是一个子 scope——删除项时自动 dispose 它下面的所有 effect。'),
      ('Code',"list(todos, t => t.id, t => {\n  // 每一项有自己的 scope\n  const editing = signal(false)\n  effect(() => console.log('item', t.id, editing()))\n  return li(null, t.title)\n})\n// 删除项 → scope dispose → effect 清理",'xuy'),
      ('H2','内存安全'),
      ('P','scope 树保证：只要父 scope dispose，所有子 scope 递归清理。不需要手动追踪每个 effect。'),
      ('Code',"// 假设 DOM 结构：\n// <div>\n//   <span>{counter1}</span>\n//   <div>\n//     <span>{counter2}</span>\n//   </div>\n// </div>\n\n// 卸载最外层 div：\n// 1. disposeScope(外层)\n// 2. 递归 disposeScope(span)\n// 3. 递归 disposeScope(内层 div)\n// 4. 递归 disposeScope(内层 span)\n// 5. 所有 effect 清理完毕",'js'),
      ('H2','性能'),
      ('Table',['操作','耗时'],[
        ['createScope','~100ns'],
        ['runInScope','~50ns'],
        ['disposeScope（无 effect）','~100ns'],
        ['disposeScope（10 effect）','~5µs'],
      ]),
      ('H2','调试 scope'),
      ('P','devtools 的 Scopes 面板能看到活跃 scope 的树结构和 effect 数量。'),
      ('H2','完整示例：可复用的定时器'),
      ('Code',"import { signal, effect, div, span, mount } from 'xunay'\n\nfunction Timer() {\n  const n = signal(0)\n\n  // effect 自动加入当前 scope\n  effect(() => {\n    const id = setInterval(() => n(v => v + 1), 1000)\n    return () => clearInterval(id)\n  })\n\n  return div(null, '秒数: ', () => n())\n}\n\n// 卸载 Timer 时，setInterval 自动清理——因为 effect 属于 Timer 的 scope",'xuy'),
    ]),""", "scope")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("model / scope 已填")
