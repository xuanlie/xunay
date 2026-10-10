API

信号

  sig / s / state / signal
  读：n()
  写：n(1)
  更新：n(v => v + 1)

派生

  cmp / c / memo / computed

副作用

  eff / f / watch / effect

批量

  batch / bat

挂载

  app / a / mount

列表

  list / l / each

条件

  show(cond, renderFn)

Fragment

  frag / F

生命周期

  onMount(fn)
  onUnmount(fn)

响应式文本

  txtn = ${n}

事件

  on: { click: fn }
  on: { click: { fn, prevent, stop, self, value } }

进阶

  ref()
  ctx(defaultValue)
  err(fn, fallback)
  lazy(() => import(...))
  trans(duration)

SSR

  renderToString(Component)
  hydrate(Component, '#app')
