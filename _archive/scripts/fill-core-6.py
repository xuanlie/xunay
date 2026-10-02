#!/usr/bin/env python3
import re

p = "site/gen-docs.py"
with open(p, 'r', encoding='utf-8') as f:
    s = f.read()

def swap(anchor, replacement, label):
    global s
    if anchor not in s:
        print("未命中:", label)
        return
    s = s.replace(anchor, replacement)

# ============ err ============
err_block = r"""    ('core-err', 'err', [
      ('H1','err'),
      ('P','err 是错误边界——把一段可能抛错的代码包起来，出错时返回兜底内容，不炸整个应用。'),
      ('H2','基础用法'),
      ('Code',"import { err, div } from 'xunay'\n\nerr(() => {\n  return risky()   // 可能抛错\n}, () => div(null, '出错了'))",'xuy'),
      ('H2','两个参数'),
      ('Table',['参数','类型','作用'],[
        ['fn','() => T','可能抛错的函数'],
        ['fallback','T 或 (e) => T','出错时的兜底'],
      ]),
      ('H2','fallback 是函数'),
      ('P','fallback 是函数时会拿到错误对象。'),
      ('Code',"err(\n  () => JSON.parse(userInput),\n  (e) => div(null, 'JSON 格式错误: ' + e.message)\n)",'xuy'),
      ('H2','fallback 是值'),
      ('P','fallback 是普通值时直接返回。'),
      ('Code',"const data = err(() => JSON.parse(str), null)\n// str 不是合法 JSON 时返回 null",'xuy'),
      ('H2','什么时候用'),
      ('Ul',
        'JSON.parse 用户输入',
        '访问可能不存在的字段',
        '第三方库调用',
        '可能为 null 的 API 结果'),
      ('H2','默认行为'),
      ('P','不传 fallback 时，出错会打印 console.error，返回 undefined。'),
      ('Code',"err(() => JSON.parse('bad'))\n// console: [XuNay] SyntaxError: ...\n// 返回 undefined",'xuy'),
      ('H2','和 try/catch 对比'),
      ('Table',['','err','try/catch'],[
        ['写法','表达式','语句'],
        ['返回值','有','手动 return'],
        ['日志','自动','手动'],
        ['嵌在 JSX 里','是','否'],
      ]),
      ('H2','完整示例：容错解析'),
      ('Code',"import { err, div, input, signal, span, mount } from 'xunay'\n\nfunction JsonViewer() {\n  const text = signal('{\"name\":\"x\"}')\n  const parsed = () => err(\n    () => JSON.parse(text()),\n    (e) => ({ __error: e.message })\n  )\n\n  return div(null,\n    input({\n      value: () => text(),\n      on: { input: e => text(e.target.value) }\n    }),\n    () => {\n      const p = parsed()\n      if (p && p.__error) return div({ class: 'error' }, '错误: ' + p.__error)\n      return div({ class: 'ok' }, JSON.stringify(p, null, 2))\n    }\n  )\n}\n\nmount(() => JsonViewer(), '#app')",'xuy'),
      ('H2','异步错误不归 err 管'),
      ('Warn','err 只捕获同步抛错。异步 Promise 拒绝要用 .catch 或 try/catch 包 async。'),
      ('Code',"// 错误：err 抓不到异步错误\nerr(() => {\n  fetch('/api').then(r => r.json().then(j => { throw new Error() }))\n})\n\n// 正确：手动 catch\nfetch('/api')\n  .then(r => r.json())\n  .catch(e => console.error(e))",'xuy'),
    ]),"""

swap("    ('core-err', 'err', []),", err_block, "err")

with open(p, 'w', encoding='utf-8') as f:
    f.write(s)
print("err 已填")
