XuNay

[![npm version](https://badge.fury.io/js/xunay.svg)](https://www.npmjs.com/package/xunay)
[![GitHub](https://img.shields.io/badge/github-xuanlie%2Fxunay-blue)](https://github.com/xuanlie/xunay)

内存最少、速度最快的前端框架。

安装

  npm install xunay

快速开始

  import { div, button, span, s, app, txt } from 'xunay'

  const n = s(0)

  app(() => div(null,
    button({ on: { click: () => n(v => v + 1) } }, '+1'),
    span(null, txt`n = ${n}`)
  ), '#app')

体积（gzip）

  xunay.esm.js           4.86KB
  xunay.min.js           5.09KB
  xunay-devtools.min.js 13.14KB
  xunay-kit.min.js      14.43KB
  xunay-full.min.js     18.35KB

核心含 signal / computed / effect / batch / render / mount / list / show / frag / txt / SSR / 生命周期，不含 UI 组件和 devtools。

对比（gzip）

  Preact              4KB
  XuNay（核心）        4.86KB
  Solid               7KB
  Vue 3              34KB
  React 18 + DOM     45KB

别名

主名和短名等价，共 8 个：

  signal    s       信号
  computed  c       派生
  effect    f       副作用
  batch     bat     批量
  mount     app / m 挂载
  list      l / each 列表

其余 API 无短名：

  div span button input show frag F txt
  onMount onUnmount ref ctx err lazy trans
  renderToString hydrate

入口

  import { signal } from 'xunay'                  核心
  import { Btn, Input } from 'xunay/kit'          UI 组件
  import { openDevtools } from 'xunay/devtools'   调试面板
  import * as all from 'xunay/full'               全量

API 速览

  信号        signal / s
  派生        computed / c
  副作用      effect / f
  批量        batch / bat
  挂载        mount / app / m
  列表        list / l / each
  标签        div / span / button / input / ...
  条件        show(cond, render)
  Fragment    frag / F
  生命周期    onMount / onUnmount
  响应式文本  txt`n = ${n}`
  SSR         renderToString / hydrate

License

  MIT


<!-- XUNAY_API_TABLE -->

## 核心 API（`xunay`）

| API | 签名 | 说明 |
|---|---|---|
| `signal` | `signal(init)` | 响应式值，读/写 |
| `computed` | `computed(fn)` | 派生值，lazy + dirty，返回函数带 `.dispose()` |
| `effect` | `effect(fn)` | 副作用，返回 stop 函数 |
| `batch` | `batch(fn)` | 合并多次写，只触发一次 |
| `untrack` | `untrack(fn)` | effect 内读 signal 但不订阅 |
| `onCleanup` | `onCleanup(fn)` | effect 重跑前清理 |
| `createElement` | `createElement(type, props, ...children)` | 创建 vnode |
| `createFragment` | `createFragment(children)` | Fragment |
| `tag` | `tag(name)` | 动态标签工厂 |
| `tags` | `tags.div / tags.span / ...` | 29 个标准标签 |
| `registerTags` | `registerTags(names)` | 注册自定义标签 / Web Components |
| `render` | `render(vnode)` | vnode → DOM |
| `mount` | `mount(comp, target)` | 挂载，返回 dispose |
| `list` | `list(arr, keyFn, renderFn)` | 列表渲染 |
| `show` | `show(cond, renderFn)` | 条件渲染 |
| `frag` | `frag(...children)` | Fragment 简写 |
| `txt` | `txt\`...\`` | 文本模板 |
| `onMount` | `onMount(fn)` | 挂载后执行 |
| `onUnmount` | `onUnmount(fn)` | 卸载前执行 |
| `ref` | `ref(init)` | 可变引用 |

## 子路径

| 路径 | 内容 |
|---|---|
| `xunay` | 核心 20 个 API |
| `xunay/tags` | 29 个标准标签 |
| `xunay/advanced` | `ctx` / `err` / `lazy` / `trans` |
| `xunay/alias` | `s` / `c` / `f` / `m` 等别名 |
| `xunay/kit` | 60+ UI 组件 |
| `xunay/ssr` | `renderToString` / `hydrateMount` / `hydrate` |
| `xunay/anim` | 动画预设 + 动画组件 |
| `xunay/devtools` | DevTools 面板 |
| `xunay/dev` | 开发模式辅助 |

## 体积

- `xunay.esm.js` gzip 约 5.27 KB
- `xunay.min.js` gzip 约 5.48 KB

<!-- XUNAY_API_TABLE -->