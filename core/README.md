XuNay

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
