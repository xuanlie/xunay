[XUNAY-VULN]
ver:1.2.8
kind:vulnerability-registry
update:2026-10-13
source:test/core.test.js:252

[V001]
severity:high
status:open
module:core/src/core.js
func:propagate
test:test/core.test.js:252
sym:effect 执行期间修改另一个 signal 不应丢失更新

symptom:
  下游 effect 停留旧值
  直到下一次无关 signal 写入才被顺带 flush
  用户视角：偶发"数据更新了 UI 没变"

repro:
  const source = signal(0)
  const derived = signal(0)
  let latest
  effect(() => { const v = source(); if (v > 0) derived(v * 10) })
  effect(() => { latest = derived() })
  source(2)
  // 期望 latest === 20，实际 latest === 0

cause:
  1. propagate(source) 走快速路径（单订阅者）
     条件：head && !head._nextSub && !_inPropagate
     only.run() 后直接 return，跳过 flushPendingEffects()
  2. effect1 内 derived(value*10) 触发 propagate(derived)
     此时 _inPropagate=true，走慢路径
     isOuter=!_inPropagate=false → 只 enqueue 不 flush
  3. 回到 effect1.run() finally 检查 _inPropagate 仍为 true → 不 flush
     回到快速路径 finally 才置 false，但已 return

fix:
  文件：core/src/core.js
  位置：propagate() 快速路径 else 分支内，only.run() 之后、finally 之前
  代码：
    // 补：快速路径也要收尾 flush（否则 effect 内写 signal 的下游 effect 会丢）
    if (!_currentEffect && runtime.batchDepth === 0 && runtime.pendingEffects.size > 0) {
      flushPendingEffects()
    }

impact:
  触发场景：
    effect A 内写 signal B
    signal B 有独立订阅者 effect C
    且 A 是 source 的唯一订阅者（走快速路径）
  不受影响：
    慢路径（多订阅 / computed / 嵌套）
    _ultraRun / _quickRun 分支
    batch 内（batchDepth>0 时不 flush，由 batch 收尾）
  唯一副本：core/src/core.js
  compiler3/src/runtime.js 无独立 signal 系统

[V002]
severity:medium
status:open
module:core/src/query.js
func:fetchData
test:无

symptom:
  失败 N 次后成功一次，retriesLeft 停在中间值不重置
  下一次 refetch() 只重试剩余次数，不是配置的 retry 次
  用户视角："偶发重试次数变少"

cause:
  retriesLeft 是 query() 闭包变量
  成功路径不重置 retriesLeft
  只有"彻底失败"路径才 retriesLeft = retry

repro:
  const q = query({ key:'x', fetcher, retry: 3 })
  // fetcher 前 2 次 reject，第 3 次 resolve
  // 此时 retriesLeft = 1
  q.refetch()
  // 期望：还能重试 3 次，实际：只能重试 1 次

fix:
  成功路径 data(r) 之后加 retriesLeft = retry
  或把 retriesLeft 从闭包改成 fetchData 内部局部变量

[V003]
severity:medium
status:open
module:core/src/hl.js
func:highlight
test:无

symptom:
  代码块超过 2048 个 token 时高亮全部乱掉
  显示错误字符而不是 token 内容

cause:
  占位符用 String.fromCharCode(0xE100 + idx)
  idx 超过 0xE8FF - 0xE100 = 0x7FF = 2047 时越界
  Unicode 私有区 PUA 是 0xE000-0xF8FF，实际用 0xE100-0xE8FF
  超出范围 fromCharCode 返回 '\u0000' 或错误字符

repro:
  const code = 'const a = 1\n'.repeat(3000)  // 3000+ tokens
  highlight(code, 'js')
  // 期望：正常高亮，实际：部分 token 变乱码

fix:
  方案 A：改用 \u0001\u0002 + 变长编码（如 base36）
  方案 B：用数组拼接，不用占位符替换
  方案 C：占位符上限提到 0xE000-0xF8FF（约 6400 个）

[V004]
severity:medium
status:open
module:core/src/auth.js
func:isValid
test:无

symptom:
  任何 effect 内调用 auth.isValid() 会订阅 token signal
  token 一刷新，整个 effect 重跑
  典型场景：http 请求带 token 校验，token 刷新触发全部请求组件重渲染

cause:
  isValid() 内部 tokenSig() 是 signal 读操作
  在 effect 上下文里会注册订阅

repro:
  effect(() => {
    const ok = auth.isValid()  // 订阅了 tokenSig
    if (ok) http.get('/user')
  })
  // auth.set('newtoken') 会触发此 effect 重跑

fix:
  用内部 read() 代替 tokenSig()
  isValid() {
    const t = read()          // 不订阅
    if (!t) return false
    const exp = readExpiresAt()
    return !exp || Date.now() < exp
  }

[V005]
severity:low
status:open
module:core/src/query.js
func:hashKey
test:无

symptom:
  对象 key 属性顺序不同，命中不同缓存
  { a:1, b:2 } 和 { b:2, a:1 } 是同一个语义 key 但缓存不共享

cause:
  JSON.stringify 保留属性插入顺序

fix:
  递归排序 key 后再 stringify
  或要求用户 key 只用字符串 / 数字

[V006]
severity:low
status:open
module:core/src/devtools.js
func:startHooks
test:无

symptom:
  关闭 DevTools 后 console.log/warn/error 仍被 hook
  日志继续写进 XD.logs（上限 300，shift 是 O(n)）
  长期运行有性能开销

cause:
  startHooks() 只检查 window.__xd_console 防重复包裹
  没有 close 时还原原函数的逻辑

fix:
  close() 时还原 console.log/warn/error
  或者接受这个开销（300 条数组 O(n) 可接受）

[V007]
severity:low
status:open
module:core/src/devtools.js
func:startHooks
test:无

symptom:
  XD.signals 超过 500 时 Array.shift() 是 O(n)
  高频创建 signal 的场景有性能损耗

cause:
  XD.signals.push(s); if (XD.signals.length > 500) XD.signals.shift()

fix:
  改用环形缓冲（固定长度数组 + head 索引）

[V008]
severity:low
status:open
module:core/src/model.js
func:modelNum
test:无

symptom:
  数字输入框清空 → Number('') = 0 → signal 变 0
  输入框显示弹回 "0"，用户无法清空

cause:
  sig(Number(raw) || 0)
  Number('') = 0，falsy 走 || 0

fix:
  const n = raw === '' ? '' : Number(raw)
  sig(n)
  或加 opts.emptyValue 参数

[V009]
severity:low
status:open
module:core/src/mobile.js
func:breakpoint
test:无

symptom:
  breakpoint() 每次调用都注册 window resize 监听
  无卸载接口，SPA 反复调用堆积 listener

cause:
  window.addEventListener('resize', update)
  返回 bp signal，无 unsubscribe

fix:
  返回 { signal: bp, dispose: () => window.removeEventListener('resize', update) }
  或在 effect 内 onCleanup 注册

[SUMMARY]
v001:high   core.js propagate 快速路径跳 flush
v002:medium query.js retriesLeft 不重置
v003:medium hl.js 占位符 2048 上限
v004:medium auth.js isValid 副作用订阅
v005:low    query.js hashKey 属性顺序敏感
v006:low    devtools.js 关闭后 console 仍 hook
v007:low    devtools.js signals 数组 O(n) shift
v008:low    model.js modelNum 空串弹回 0
v009:low    mobile.js breakpoint 无卸载

count:
  high: 1
  medium: 3
  low: 5
  total: 9

[V010]
severity:high
status:open
module:core/src/kit-data2.js
func:QRScanner
test:无

symptom:
  QRScanner 组件调用即崩
  TypeError: video is not a function

cause:
  模块顶部 import { div, span, button, input, img, video } from './element.js'
  其中 video 是标签函数
  QRScanner 内部 const video = document.createElement('video')
  块级作用域遮蔽了 import 的 video
  后续 video({ ref, style }) 调用的是 DOM 元素不是函数

repro:
  import { QRScanner } from 'core/src/kit-data2.js'
  QRScanner({ onScan: console.log })
  // 期望：渲染 video 元素，实际：TypeError

fix:
  重命名局部变量：
    const videoEl = document.createElement('video')
    ...videoEl...
  或 import 时给标签函数重命名：
    import { video as _video } from './element.js'

[V011]
severity:medium
status:open
module:core/src/kit-data.js
func:Calendar
module2:core/src/kit-data2.js
func2:Carousel
test:无

symptom:
  swipe() 注册的 touchstart/touchend 监听永不卸载
  组件重建/条件切换时 listener 累积

cause:
  ref: el => { swipe(el, {...}) }
  swipe() 返回 cleanup 函数，没保存也没调用

repro:
  show(cond, () => Calendar({...}))
  // cond 切换多次，Calendar 每次都新增 2 个 touch listener

fix:
  ref: el => {
    if (!el) return
    const cleanup = swipe(el, {...})
    onCleanup(cleanup)   // 或挂到 scope.unmountFns
  }

[V012]
severity:medium
status:open
module:core/src/kit-data2.js
func:VirtualTable
test:无

symptom:
  滚动时每次 scroll 事件写 signal
  触发订阅的 effect 全量重渲染 visible 行
  滚轮一秒数十次事件 = 数十次重渲染
  长列表滚动卡顿

cause:
  on: { scroll: e => scrollTop(e.target.scrollTop) }
  scrollTop 是 signal，visible() 订阅它
  无 rAF / throttle / debounce

fix:
  方案 A：rAF 节流
    let ticking = false
    on: { scroll: e => {
      const top = e.target.scrollTop
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { scrollTop(top); ticking = false })
    }}
  方案 B：直接操作 DOM 的 translateY（不走 signal）

[V013]
severity:low
status:open
module:core/src/kit-data.js
func:Table
test:无

symptom:
  Table 的 key 属性被 set() 当成 HTML 属性写到 DOM
  生成 <tr key="..."> 这种非法 HTML 属性
  且 Table 走 data.map() 全量重建，不走 list() keyed diff
  key 完全没起到复用作用

cause:
  data.map((row, i) => tr({ key: keyFn ? keyFn(row) : i }, ...))
  tr 是 createElement('tr', props)，props.key 走 setAttribute('key', v)

repro:
  Table({ columns:[...], data:[...], keyFn: r => r.id })
  // 打开 DevTools，看到 <tr key="1"> 但组件树每次都全量重建

fix:
  方案 A：Table 内部改用 list() 做 keyed diff
  方案 B：把 key 从 props 里拿出来，不做 diff（承认全量重建）
  方案 C：createElement 里过滤掉 key（业界 React 做法，key 不渲染到 DOM）

[SUMMARY-UPDATE]
v010:high   kit-data2.js QRScanner video 遮蔽
v011:medium kit-data.js Calendar + kit-data2.js Carousel swipe 泄漏
v012:medium kit-data2.js VirtualTable scroll 无节流
v013:low    kit-data.js Table key 未生效

count-total:
  high: 2     (v001, v010)
  medium: 5   (v002, v003, v004, v011, v012)
  low: 6      (v005, v006, v007, v008, v009, v013)
  total: 13

[V014]
severity:medium
status:open
module:core/src/kit-editor.js
func:CodeEditor
test:无

symptom:
  CodeEditor 的 textarea scroll 监听未卸载
  组件重建时 listener 累积

cause:
  ref: el => { taEl = el; el.addEventListener('scroll', onScroll, {passive:true}) }
  无对应 removeEventListener

fix:
  在 ref 里返回 cleanup（若框架支持）
  或 onUnmount(() => taEl.removeEventListener('scroll', onScroll))

[V015]
severity:medium
status:open
module:core/src/kit-overlay.js
func:pushNotification
test:无

symptom:
  pushNotification 用 el.innerHTML 拼 title/desc
  若 title/desc 来自用户输入或后端数据，会 XSS

cause:
  el.innerHTML = `<div>${title}</div><div>${desc}</div>`

fix:
  改用 el.textContent + 创建子元素
  或调用 sanitize(title) / sanitize(desc)

[V016]
severity:medium
status:open
module:core/src/kit-editor.js
func:RichText
module2:core/src/kit-editor2.js
func2:Markdown
test:无

symptom:
  RichText 用 html: val() 直接插 HTML（contenteditable）
  Markdown 手写替换生成 <a href> 但未过滤 javascript:
  用户可控内容会 XSS

cause:
  RichText: html: val()
  Markdown: .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  两者都不过 sanitize

fix:
  RichText: html: sanitize(val())
  Markdown: 解析后用 sanitize() 输出
  或至少过滤 href: /^(https?:|\/|#)/

[V017]
severity:low
status:open
module:core/src/kit-file.js
func:FilePreview
test:无

symptom:
  URL.createObjectURL(file) 从未 revoke
  多次预览不同文件会累积 blob URL 内存

cause:
  const url = file.url || URL.createObjectURL(file)
  无 revoke 调用

fix:
  onClose 时 URL.revokeObjectURL(url)
  或用 useEffect 式 onCleanup

[V018]
severity:low
status:open
module:core/src/kit-virtual.js
func:Sortable
test:无

symptom:
  touchmove 里脆弱 DOM 遍历
  el.closest('div').parentNode.children
  若 el 不是 div 或结构不匹配会抛错

cause:
  const el = document.elementFromPoint(t.clientX, t.clientY)
  const idx = [...el.closest('div').parentNode.children].indexOf(el.closest('div'))
  两步 closest 结果可能为 null

fix:
  加空值判断
  const target = el && el.closest('[data-sortable]')
  if (!target) return
  用 data-sortable 属性显式标记

[V019]
severity:low
status:open
module:core/src/kit-virtual.js
func:VirtualList
func2:InfiniteList
test:无

symptom:
  同 V012（VirtualTable）
  scroll 事件直接写 signal，无节流
  虚拟列表大量滚动时卡顿

cause:
  on: { scroll: e => scrollTop(e.target.scrollTop) }

fix:
  同 V012 的 rAF 节流方案

[V020]
severity:low
status:open
module:core/src/kit-nav2.js
func:Anchor
test:无

symptom:
  document.querySelector(it.href) 直接用 props 当 CSS 选择器
  href 含非法字符（如 :、.）时抛 SyntaxError

cause:
  const el = document.querySelector(it.href)
  it.href 来自用户传的 items

fix:
  用 getElementById 或 getAttribute 查询
  或 try/catch 包裹

[SUMMARY-UPDATE-2]
v014:medium kit-editor.js CodeEditor scroll listener 未卸载
v015:medium kit-overlay.js pushNotification innerHTML XSS 风险
v016:medium kit-editor.js RichText + kit-editor2.js Markdown HTML 未 sanitize
v017:low    kit-file.js FilePreview blob URL 未 revoke
v018:low    kit-virtual.js Sortable touchmove DOM 遍历脆弱
v019:low    kit-virtual.js VirtualList/InfiniteList scroll 无节流
v020:low    kit-nav2.js Anchor querySelector 选择器未转义

count-total:
  high:   2  (v001, v010)
  medium: 8  (v002, v003, v004, v011, v012, v014, v015, v016)
  low:    10 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020)
  total:  20

[V021]
severity:medium
status:open
module:core/src/anim-kit.js
func:AnimatedValue
func2:AnimatedNumber
module2:core/src/anim-kit2.js
func3:Counter
test:无

symptom:
  ref 回调内调用 effect()
  ref 在 render.js 的 props 处理阶段调用（早于 gs() 创建 scope）
  effect 挂到父 scope 而非本组件 scope
  组件卸载时本 scope dispose，effect 不被清理
  长列表/条件渲染反复创建 → effect 泄漏

cause:
  render.js el(v) 顺序：
    for props → k==='ref' 直接 pv(dom)（当前 runtime.currentScope 是父）
    ... 之后才 gs() 创建本组件 scope
  AnimatedValue/AnimatedNumber/Counter 都在 ref 里 effect()

repro:
  show(cond, () => AnimatedNumber({ value: count }))
  // cond 切换多次 → effect 累积

fix:
  显式在外层作用域注册 effect
  或框架支持 ref 返回 cleanup
  或在 ref 里手动 createScope + effect + onUnmount disposeScope

[V022]
severity:medium
status:open
module:core/src/anim-physics.js
func:particles
test:无

symptom:
  粒子爆发几乎不扩散
  看起来像原地缩放消失
  远离设计意图（发散 100px）

cause:
  anim(p, [
    { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
    { transform: `translate(${dx-50}%,${dy-50}%) scale(0)`, opacity: 0 }
  ])
  translate 的百分比是相对元素自身尺寸（6px）
  dx=100px 实际渲染位移 = 100% * 6px = 6px
  应为 translate(${dx}px, ${dy}px) 或用 CSS 变量 + calc

fix:
  anim(p, [
    { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
  ])

[V023]
severity:medium
status:open
module:core/src/anim-svg.js
func:ringProgress
module2:core/src/anim-kit2.js
func2:ProgressRing
test:无

symptom:
  color / size / stroke 直接拼进 SVG 字符串后 el.innerHTML = ...
  color 若来自 props 且用户可控 → XSS

cause:
  ringProgress: el.innerHTML = `<circle ... stroke="${color}" .../>`
  ProgressRing: el.innerHTML = svg（其中 ${color}）

fix:
  用 createElementNS 创建 SVG 元素
  或至少白名单校验 color（正则 ^#[0-9a-f]{3,8}$ 或 rgb/rgba）

[V024]
severity:low
status:open
module:core/src/anim.js
func:easings
test:无

symptom:
  easings.easeInQuadAlt 和 easings.easeOutQuadAlt 实现完全相同
  easeInQuadAlt: t => t * (2 - t) 实际是 easeOutQuad
  easeInQuadAlt 名字与行为不符

cause:
  复制粘贴错误
  正确 easeInQuad 是 t => t * t（已有 easeInQuad 定义）
  Alt 版本意图不明

fix:
  删除 easeInQuadAlt 或改成正确的 easeIn
  或保留兼容但加注释说明

[V025]
severity:low
status:open
module:core/src/anim-trigger2.js
func:throttle
test:无

symptom:
  throttle(fn, ms) 在间隔内丢弃所有调用
  最后一次调用可能永远不执行
  用户预期"节流后最终会触发一次"

cause:
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last < ms) return     // 丢弃
    last = now
    return fn(...args)
  }

fix:
  方案 A：尾触发（trailing edge）
    let last = 0, timer = null
    return (...args) => {
      const now = Date.now()
      const remaining = ms - (now - last)
      if (remaining <= 0) { last = now; return fn(...args) }
      if (!timer) timer = setTimeout(() => {
        last = Date.now(); timer = null; fn(...args)
      }, remaining)
    }
  方案 B：改名 sample(fn, ms) 表明是采样不是节流

[SUMMARY-UPDATE-3]
v021:medium anim-kit.js AnimatedValue/AnimatedNumber + anim-kit2.js Counter ref 内 effect 泄漏
v022:medium anim-physics.js particles 位移百分比错误
v023:medium anim-svg.js ringProgress + anim-kit2.js ProgressRing innerHTML SVG XSS
v024:low    anim.js easings.easeInQuadAlt 与 easeOutQuadAlt 重复
v025:low    anim-trigger2.js throttle 是抽样不是节流

count-total:
  high:   2  (v001, v010)
  medium: 11 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023)
  low:    12 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025)
  total:  25

[V026]
severity:low
status:open
module:core/src/music.js
func:createSynth
test:无

symptom:
  createSynth 用 setInterval 每 50ms 轮询 volume signal
  synth 不再使用后 interval 永不清理
  每次创建 synth 都累积一个定时器

cause:
  setInterval(() => { if (master) master.gain.value = volume() }, 50)
  没有对外暴露 clearInterval

fix:
  改用 effect(() => { if (master) master.gain.value = volume() })
  或返回 dispose 时 clearInterval

[V027]
severity:low
status:open
module:core/src/music.js
func:progressionToChords
test:无

symptom:
  progressionToChords 里遗留 DEBUG 代码：
    window.__musicDebug = { majorKey: mk, minorKey: mk2 }
  每次调用都覆盖全局，生产环境污染

cause:
  开发时留下未删

fix:
  删除 try { ... window.__musicDebug ... } catch(e) {} 整块

[V028]
severity:medium
status:open
module:core/src/game.js
func:createInput
test:无

symptom:
  createInput 每次调用都注册 window keydown/keyup/blur
  无卸载机制
  SPA 反复调用累积 listener

cause:
  window.addEventListener('keydown', ...)
  window.addEventListener('keyup', ...)
  window.addEventListener('blur', ...)
  无返回 cleanup

fix:
  返回 { keys, vector, isDown, dispose }
  dispose 里 removeEventListener

[V029]
severity:medium
status:open
module:core/src/babylon.js
func:bindTwoWay
test:无

symptom:
  bindTwoWay 用 setInterval 每 50ms 轮询 target[prop] 变化
  虽然返回卸载函数，但用户不调用就永远泄漏
  大量双向绑定 → 定时器爆炸

cause:
  const timer = setInterval(() => {...}, opts.interval ?? 50)
  return () => { stop1(); clearInterval(timer) }
  —— 需用户主动调用

fix:
  文档化必须调用返回值
  或改用 Proxy/Object.defineProperty 监听属性变化

[V030]
severity:low
status:open
module:core/src/game-mobile.js
func:safeArea
test:无

symptom:
  safeArea() 只读 top / left
  bottom / right 硬编码为 0
  iPhone 刘海 / 底部 Home Indicator 场景不准

cause:
  const el = ... 'top:env(safe-area-inset-top,0);left:env(safe-area-inset-left,0);'
  r = { top, left, bottom: 0, right: 0 }

fix:
  补 bottom: env(safe-area-inset-bottom)
  补 right: env(safe-area-inset-right)
  或用 getComputedStyle 一次读全 4 个

[SUMMARY-UPDATE-4]
v026:low    music.js createSynth setInterval 泄漏
v027:low    music.js progressionToChords 遗留 __musicDebug
v028:medium game.js createInput 监听不卸载
v029:medium babylon.js bindTwoWay setInterval 隐式泄漏
v030:low    game-mobile.js safeArea 缺 bottom/right

count-total:
  high:   2  (v001, v010)
  medium: 13 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029)
  low:    15 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030)
  total:  30

[V031]
severity:medium
status:open
module:bin/xuyc.js
func:processFile
test:无

symptom:
  xuyc build 会临时改写 src/*.js（rewriteImports 把 xunay/* 重写成本地路径）
  写入磁盘 → modified Map 记录原文
  如果构建中途崩溃（esbuild 报错 / Ctrl+C / 断电），清理逻辑不执行
  源文件保持被改写状态
  下次构建基于错误内容继续 → 雪崩

cause:
  const original = fs.readFileSync(file, 'utf8')
  let src = rewriteImports(original)
  ...
  } else if (src !== original) {
    if (!modified.has(file)) modified.set(file, original)
    fs.writeFileSync(out, src)   // ← 直接写源文件
  }

fix:
  方案 A：rewriteImports 只在内存做，不改磁盘
    esbuild 的 onLoad 插件钩子里动态替换
  方案 B：写到 outDir 的临时目录，esbuild 从那里解析
  方案 C：至少加 signal handler 保证 SIGINT 时也能恢复

[V032]
severity:low
status:open
module:bin/xuyc3.js
test:无

symptom:
  bin/xuyc.js 和 bin/xuyc3.js 都调用 compiler3/src/index.js
  但打包方式不同：
    xuyc.js  → ESM + 动态 import 重写 + __rt__ 全局
    xuyc3.js → IIFE + import * as __rt__ 内联
  两者产物语义可能有细微差异
  维护需同步

cause:
  README 推荐用 xuyc3 build
  xuyc.js 是主构建工具
  两条路径并行

fix:
  废弃 xuyc3.js，只保留 xuyc.js
  或明确职责（如 xuyc3 = 简单单文件，xuyc = 完整工程）

[V033]
severity:low
status:open
module:bin/check-routes.js
test:无

symptom:
  正则匹配 handler 存在
  // export async function handleXxx(...) 注释掉的也判为"存在"
  无法检测到"注释掉但未实现" 的 handler

cause:
  has: (src, name) =>
    new RegExp('export\\s+(?:async\\s+)?function\\s+' + name + '\\b').test(src)

fix:
  用 AST 解析（acorn）
  或至少排除行首的 // 和 /* 区域

[V034]
severity:low
status:open
module:bin/xuyc-dev.js
test:无

symptom:
  index.html 注入版本轮询脚本每 800ms 请求一次 /__xuyc_version
  长时间开发（8 小时）→ 36000 次请求
  浏览器 Network 面板刷屏

cause:
  setInterval(function(){fetch("/__xuyc_version",{cache:"no-store"})...},800)

fix:
  改用 Server-Sent Events（SSE）单向推送
  或 WebSocket
  或至少 2-3 秒轮询 + 只在 window focused 时轮询

[V035]
severity:medium
status:open
module:bin/xuyc.js
func:shouldCompileFile
test:无

symptom:
  shouldCompileFile 只检查文件第一行
  compiler3 的 __readFileMode 检查前 10 行
  两者不一致 → 用户在第 2-10 行写 // @compiled 时：
    shouldCompileFile 返回 false（不编译）
    compile() 内部会看到 @compiled → 走 compiled 模式
  但既然 shouldCompileFile 返回 false，根本没调 compile()
  用户 @compiled 指令被静默忽略

cause:
  bin/xuyc.js:  /^\s*\/\/\s*@compiled/.test(src)   ← 只匹配开头
  compiler3:    src.split("\n", 10).slice(0, 10)     ← 前 10 行

  spec 说明："指令必须在前 10 行的注释里"

fix:
  shouldCompileFile 与 compiler3 的 __readFileMode 保持一致
  用 compiler3 导出的 readFileMode 或复制相同逻辑

[SUMMARY-UPDATE-5]
v031:medium bin/xuyc.js 构建中改写 .js 源文件风险
v032:low    bin/xuyc3.js 与 xuyc.js 功能重复
v033:low    bin/check-routes.js 正则匹配 handler 误判
v034:low    bin/xuyc-dev.js 版本轮询 800ms 过频
v035:medium bin/xuyc.js shouldCompileFile 与 compiler3 不一致

count-total:
  high:   2  (v001, v010)
  medium: 17 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, + ...)
  low:    17 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034)
  total:  35

[V036]
severity:high
status:open
module:bin/xai-server.js
func:/api/file
test:无

symptom:
  /api/file 端点的路径前缀检查用字符串 startsWith
  root = /home/user/proj
  rel = "../proj2/secret" → full = /home/user/proj2/secret
  full.startsWith(root) 返回 true → 通过检查
  泄露 root 之外任何"前缀相同"目录的文件

cause:
  const full = path.resolve(root, rel)
  if (!full.startsWith(root)) return json(res, { error: 'denied' }, 403)

fix:
  用 path.relative 判断：
    const relCheck = path.relative(root, full)
    if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) {
      return json(res, { error: 'denied' }, 403)
    }
  或加后缀：full === root || full.startsWith(root + path.sep)

[V037]
severity:medium
status:open
module:bin/xai-session.js
func:record
test:无

symptom:
  会话日志里所有换行符都是字面量 \n 两个字符
  用户打开 session.log 看到一行：
    \n$ ls\n输出内容\n\n$ pwd\n/root\n
  而不是正常的换行格式

cause:
  const entry = '\\n$ ' + header + '\\n' + (body || '(无输出)') + '\\n'
  JS 里 '\\n' 是反斜杠 + n 两个字符，不是换行
  应该用 '\n'

fix:
  const entry = '\n$ ' + header + '\n' + (body || '(无输出)') + '\n'
  同样的问题也存在于：
    out = (out ? '\\n' : '') + stderr   → 应为 '\n'
    out.replace(/\\n$/, '')             → 应为 /\n$/
    text = [...warns..., ...errs...].join('\\n') → 应为 '\n'

[V038]
severity:high
status:open
module:bin/xai-server.js
func:静态文件服务
test:无

symptom:
  静态文件服务无路径穿越检查
  GET /../../../package.json 之类可读任意文件
  p 来自 URL，path.join 会规范化 .. 路径

cause:
  if (p === '/' || p === '/index.html') {
    filePath = path.join(__dirname, '..', 'ai', 'ui', 'index.html')
  } else {
    filePath = path.join(__dirname, '..', 'ai', 'ui', p)
  }
  if (!fs.existsSync(filePath)) { res.writeHead(404); return res.end('404') }
  res.end(fs.readFileSync(filePath))

repro:
  curl http://localhost:12350/../../package.json
  → 返回 xunay/package.json 内容

fix:
  用 path.resolve + startsWith(uiDir + sep) 检查
  或 path.normalize(p) 后拒绝含 '..' 的路径

[V039]
severity:low
status:open
module:bin/xai-server.js
func:/api/conn/add
func2:/api/ai/config
test:无

symptom:
  SSH 连接密码明文存在 ~/.xai/connections.json
  AI API key 明文存在 ~/.xai/ai.json
  任何能读用户 home 的进程都能拿到

cause:
  conns.push({ ..., password: b.password || '', ... })
  fs.writeFileSync(CONN_FILE, JSON.stringify(conns, null, 2))
  fs.writeFileSync(AI_CONFIG_FILE, JSON.stringify(cfg, null, 2))

fix:
  至少在配置文档里提醒用户
  或调用系统 keychain（macOS Keychain / Linux libsecret / Windows Credential）
  或让用户用 ssh-agent 免密码

[V040]
severity:high
status:open
module:bin/xai-server.js
func:server.listen
test:无

symptom:
  server.listen(PORT) 未指定 host → 绑定 0.0.0.0
  /api/exec 无任何鉴权，直接 spawnSync('sh', ['-c', cmd])
  局域网内任何设备都能执行任意 shell 命令

cause:
  server.listen(PORT, () => {...})
  http.createServer 里 /api/exec 直接执行
  无 token 校验、无 IP 白名单、无速率限制

repro:
  # 在另一台机器上
  curl -X POST http://目标IP:12350/api/exec \
    -H 'Content-Type: application/json' \
    -d '{"line":"cat /etc/passwd"}'

fix:
  方案 A：默认绑定 127.0.0.1，需要远程时显式 --host
  方案 B：加 localhost-only 检查（req.socket.remoteAddress）
  方案 C：加 token（写入 ~/.xai/token，每次请求校验）

[V041]
severity:low
status:open
module:bin/post-build.mjs
test:无

symptom:
  post-build 只处理 outDir/app.js
  当 xuyc 用 --splitting 时，产物是 app.js + chunks/*.js
  chunks/*.js 不被混淆

cause:
  const appJs = files.includes('app.js')
    ? 'app.js'
    : files.find(f => /^app\.[a-f0-9]+\.js$/.test(f))
  // 只处理 app.js

fix:
  if (fs.existsSync(path.join(outDir, 'chunks'))) {
    for (const f of fs.readdirSync(path.join(outDir, 'chunks'))) {
      if (f.endsWith('.js')) obfuscate(path.join(outDir, 'chunks', f))
    }
  }

[SUMMARY-UPDATE-6]
v036:high   bin/xai-server.js /api/file 路径穿越（startsWith 绕过）
v037:medium bin/xai-session.js record 用 \\n 字面量
v038:high   bin/xai-server.js 静态文件路径穿越
v039:low    bin/xai-server.js 明文存密码/API key
v040:high   bin/xai-server.js 无鉴权 RCE + 0.0.0.0 绑定
v041:low    bin/post-build.mjs 不处理 chunks/*.js

count-total:
  high:   5  (v001, v010, v036, v038, v040)
  medium: 18 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037 + ...)
  low:    18 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034, v039, v041)
  total:  41

[V042]
severity:high
status:open
module:bin/xuyc-filament.js
func:doBuild
test:无

symptom:
  --build 分支用 spawnSync('cmd', ['/c', 'gradlew.bat', 'assembleDebug'])
  只在 Windows 有效
  Linux / macOS 上 cmd 命令不存在 → 报错 "cmd: command not found"
  或返回非零状态码静默失败

cause:
  xuyc-filament.js 的 --build 分支没做平台判断
  对比 xuyc-android.js 有：
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'

fix:
  统一用：
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
    const shell = process.platform === 'win32'
    spawnSync(gradlew, ['assembleDebug'], { cwd: outDir, stdio: 'inherit', shell })

[V043]
severity:medium
status:open
module:bin/xuyc-filament.js
func:downloadUrl
test:无

symptom:
  fetch(url) 无超时
  await res.arrayBuffer() 无大小限制
  服务器不响应 → 构建永远挂起
  返回 GB 级文件 → 内存爆炸

cause:
  async function downloadUrl(url, destPath) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(...)
    const buf = Buffer.from(await res.arrayBuffer())
    ...
  }

fix:
  加 AbortController 超时（30s）
  加 Content-Length 检查（如 > 100MB 拒绝）
  或流式写入 + 累加大小检查

[V044]
severity:low
status:open
module:bin/xuyc-filament.js
func:音频处理
test:无

symptom:
  音频 log 打印的"原路径"实际已被覆盖
  用户看到: audios/ding.wav -> audios/ding.wav
  看不到原始 src 值

cause:
  const name = path.basename(audioPath)
  const key = 'audios/' + name
  assets[key] = fs.readFileSync(audioPath)
  a.src = key      // ← 先赋值
  console.log('[filament] 音频:', a.src, '->', key, ...)   // a.src 已经是 key

fix:
  调换顺序：
    console.log('[filament] 音频:', a.src, '->', key, ...)
    a.src = key

[V045]
severity:low
status:open
module:bin/xuyc-filament.js
func:fetchRemoteGltf
test:无

symptom:
  远程模型下载缓存写在 ROOT/.xunay-cache/remote/
  而不是 outDir 下
  污染项目根
  用户以为删掉的缓存会"复活"

cause:
  const cacheDir = path.join(ROOT, '.xunay-cache', 'remote')

fix:
  改到 outDir 下：
    const cacheDir = path.join(outDir, '.cache', 'remote')
  或者放到 os.tmpdir() 下：
    const cacheDir = path.join(os.tmpdir(), 'xunay-cache', 'remote')

[SUMMARY-UPDATE-7]
v042:high   bin/xuyc-filament.js --build 只支持 Windows
v043:medium bin/xuyc-filament.js 远程下载无超时无大小限制
v044:low    bin/xuyc-filament.js 音频 log 打错值
v045:low    bin/xuyc-filament.js 污染项目根 .xunay-cache

count-total:
  high:   6  (v001, v010, v036, v038, v040, v042)
  medium: 19 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043 + ...)
  low:    20 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034, v039, v041, v044, v045)
  total:  45

[V046]
severity:medium
status:open
module:ai/ui/app.js
func:el
test:无

symptom:
  el() 支持 { html: '...' } 属性 → 直接 innerHTML
  当前调用点未误用，但逃生口存在
  未来加一行 el('div', { html: userInput }) 就 XSS

cause:
  for (const [k, v] of Object.entries(props)) {
    ...
    else if (k === 'html') e.innerHTML = v
    ...
  }

fix:
  删除 html 属性支持
  或加 sanitize(v)（AI 侧无 sanitize）
  或改名为 dangerouslySetInnerHTML（明确意图）

[V047]
severity:medium
status:open
module:ai/lib/verify-state.mjs
func:verify
test:无

symptom:
  SCAN_DIRS 只扫 pages / components 顶层
  fs.readdirSync(full) 不递归
  pages/blog/Post.xuy 不会被检查
  用户以为 verify 通过实际漏检

cause:
  for (const { dir, ext } of SCAN_DIRS) {
    const full = path.join(projectRoot, dir)
    if (!fs.existsSync(full)) continue
    for (const f of fs.readdirSync(full)) {   // ← 不递归
      if (!f.endsWith(ext)) continue
      ...
    }
  }

fix:
  改用递归 walk
  或扫描整个项目树下所有 .xuy（排除 node_modules/dist）

[V048]
severity:high
status:open
module:bin/xai-server.js
func:/api/apply
test:无

symptom:
  写入时只检查 full.startsWith(root)（字符串前缀）
  root = /home/user/proj
  f.path = "../proj2/authorized_keys"
  full = /home/user/proj2/authorized_keys
  full.startsWith(root) → true → 通过检查
  可写入 root 之外的任意文件

cause:
  const full = path.resolve(root, f.path)
  if (!full.startsWith(root)) continue
  fs.writeFileSync(full, f.content, 'utf8')

repro:
  恶意 AI 响应 / 中间人篡改 plan:
  {
    "files": [
      { "path": "../proj2/authorized_keys",
        "content": "ssh-rsa AAAA... attacker@evil" }
    ]
  }
  → 覆盖相邻项目的 authorized_keys
  配合 AI 提示注入可远程代码执行

fix:
  用 path.relative 判断：
    const rel = path.relative(root, full)
    if (rel.startsWith('..') || path.isAbsolute(rel)) continue
  或 full === root || full.startsWith(root + path.sep)

[V049]
severity:low
status:open
module:ai/lib/write-state.mjs
func:appendHistory
test:无

symptom:
  用 fs.existsSync(f) 判断"修改"还是"新增"
  f 是相对项目根的路径
  但 process.cwd() 可能是子目录
  → 永远判为"新增"

cause:
  const verb = fs.existsSync(f) ? '修改' : '新增'

repro:
  cd web/site
  xai log "改了 Home.xuy" --files "src/pages/Home.xuy"
  # cwd 是 web/site，Home.xuy 相对项目根
  # fs.existsSync("src/pages/Home.xuy") 从 web/site 检查 → false
  # 判为"新增"，实际是"修改"

fix:
  appendHistory 接收 projectRoot 参数
  用 path.join(projectRoot, f) 判断

[V050]
severity:medium
status:open
module:bin/xai-server.js
func:execSSH
test:无

symptom:
  ssh.connect(cfg) 未传 hostVerifier
  不校验证书指纹
  可被中间人攻击

cause:
  ssh.connect(cfg)   // 无 hostVerifier

fix:
  cfg.hostVerifier = (keyHash) => {
    // 检查 ~/.ssh/known_hosts 或用户确认
    return true  // 生产环境应做真实校验
  }

[V051]
severity:medium
status:open
module:ai/ui/app.js
func:computeDiff
test:无

symptom:
  LCS 二维数组 O(n*m) 空间
  5000 行文件 → 25M 格 → 浏览器卡死
  AI 生成的代码常见几千行

cause:
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

fix:
  用 Myers diff 算法（O(n+m) 空间）
  或用现成的 diff 库（fast-diff）
  或对超长文件只显示行级统计不做行级 diff

[V052]
severity:medium
status:open
module:bin/xai-server.js
func:/api/apply
test:无

symptom:
  /api/ai/plan 的 prompt 强制要求 plan.files 包含 AI-STATE.md
  但 /api/apply 不检查
  AI 不遵守时：代码改了，state 没更新
  下次 verify 报一堆"未声明"

cause:
  for (const f of plan.files) { ... 写文件 ... }
  // 无 plan.files.some(f => f.path === 'AI-STATE.md') 检查

fix:
  const hasState = plan.files.some(f => /^AI-STATE\.md$/i.test(f.path))
  if (!hasState) return json(res, { error: 'AI 未返回 AI-STATE.md，拒绝应用' }, 400)

[SUMMARY-UPDATE-8]
v046:medium ai/ui/app.js el() 支持 html 属性 XSS 隐患
v047:medium ai/lib/verify-state.mjs 不递归子目录
v048:high   bin/xai-server.js /api/apply 路径穿越（写入版）
v049:low    ai/lib/write-state.mjs appendHistory 相对路径判断
v050:medium bin/xai-server.js SSH 无 host key 校验
v051:medium ai/ui/app.js computeDiff O(n*m) 空间
v052:medium bin/xai-server.js /api/apply 不检查 AI-STATE.md

count-total:
  high:   7  (v001, v010, v036, v038, v040, v042, v048)
  medium: 24 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043, v046, v047, v050, v051, v052 + ...)
  low:    21 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034, v039, v041, v044, v045, v049)
  total:  52

[V053]
severity:high
status:open
module:frontend/app.js
test:无

symptom:
  frontend/app.js 第 1 行：
    import { div, input, button, ul, li, span, sig, app, list } from '/xunay/index.js'
  core/src/index.js 没有导出 sig / app
  实际只导出 signal / mount / ...
  整个前端一加载就 SyntaxError: The requested module does not provide an export named 'sig'

cause:
  api 改名（signal → sig, mount → app）后前端没同步
  或前端从早期版本复制

fix:
  import { signal, mount } from ...
  改 sig(...) → signal(...)
  改 app(...) → mount(...)

[V054]
severity:medium
status:open
module:frontend/app.js
test:无

symptom:
  input({ value: () => inputVal() })   // value 绑 signal
  add() 里 inputVal('') 清空 signal
  但 input DOM 的 value 不自动清空
  用户输入完回车，输入框还显示旧文字

cause:
  依赖 render.js 的 set('value', v) 是否响应 signal
  el(v) 里 'value' 不是绑定分支（bind 只对 class / style / 函数）
  所以 value 只设一次，signal 变化不更新 DOM

fix:
  用 model(sig) 或显式 onCleanup + effect 更新
  或写 on: { input: e => inputVal(e.target.value) } 配合 render 后 ref 手动清

[V055]
severity:medium
status:open
module:frontend/api/todos.js
func:connectWS
test:无

symptom:
  ws.onclose = () => setTimeout(connect, 2000)
  服务器永久下线 → 每 2 秒重连一次，永不停止
  Network 面板刷屏
  100 个客户端 → 服务端被 50 req/s 打爆

cause:
  function connect() {
    const ws = new WebSocket(...)
    ws.onclose = () => setTimeout(connect, 2000)
  }

fix:
  指数退避 + 上限：
    let attempt = 0
    const MAX = 6
    ws.onclose = () => {
      if (attempt >= MAX) return
      const delay = Math.min(30000, 1000 * 2 ** attempt)
      attempt++
      setTimeout(connect, delay)
    }
    ws.onopen = () => { attempt = 0 }

[V056]
severity:low
status:open
module:frontend/i18n/index.js
module2:frontend/router/router.js
test:无

symptom:
  import { signal } from '../../../core/src/index.js'
  直接引用 core 源码
  发布到 npm / 打包时会失败
  应该从 'xunay' 导入

cause:
  import { signal } from '../../../core/src/index.js'

fix:
  改成：
    import { signal } from 'xunay'
  构建时 xuyc 会重写 xunay/* 到本地路径

[V057]
severity:medium
status:open
module:my-blog/store.xuy
module2:templates/blog/store.xuy
test:无

symptom:
  store.xuy 里：
    import { signal } from 'xunay'
    export function Doc() { return div(null, "Home") }
  div 未 import
  调用即 ReferenceError: div is not defined

cause:
  只 import 了 signal，忘了标签函数
  （如果 compileMode 是 compiled，编译器会自动注入 div 的 import；runtime 模式则会崩）

fix:
  import { signal, div } from 'xunay'
  或改文件头加 // @runtime 让编译器注入
  或直接删掉 Doc()（store 里不该有组件）

[SUMMARY-UPDATE-9]
v053:high   frontend/app.js import 不存在的导出 sig / app
v054:medium frontend/app.js inputVal 清空后 DOM 不更新
v055:medium frontend/api/todos.js connectWS 无重连限制
v056:low    frontend/i18n + router 直接 import core/src 相对路径
v057:medium my-blog/store.xuy div 未 import

count-total:
  high:   8  (v001, v010, v036, v038, v040, v042, v048, v053)
  medium: 28 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043, v046, v047, v050, v051, v052, v054, v055, v057 + ...)
  low:    22 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034, v039, v041, v044, v045, v049, v056)
  total:  57

[V058]
severity:low
status:open
module:package.json
func:workspaces
test:无

symptom:
  workspaces 指向 compiler2 / compiler3
  compiler2 已是废弃的旧编译器
  迟早要删，删时 npm install 会报
    "npm ERR! workspaces[1] compiler2 not found"

cause:
  "workspaces": ["core", "compiler2", "compiler3"]

fix:
  删除 compiler2 后同步更新 workspaces
  只保留 core / compiler3

[V059]
severity:medium
status:open
module:deploy/xunay.service
module2:xunay.config.json
module3:deploy/nginx.conf
test:无

symptom:
  systemd service 启动 Python (granian backend.main:app)，端口 12342
  xunay.config.json 说 backend 是 node，端口 12341
  nginx.conf 反代到 127.0.0.1:12342
  三处配置互相不一致
  用户按任一配置部署都会连不上

cause:
  service: ExecStart=...granian --port 12342
  config: { "backend": "node", "ports": { "backend": 12341 } }
  nginx: proxy_pass http://127.0.0.1:12342

fix:
  统一端口约定（比如 backend 永远 12341）
  或用模板：service 从 xunay.config.json 读端口
  确认 backend/requirements.txt 是否含 granian

[V060]
severity:medium
status:open
module:types/xunay.d.ts
module2:core/types/index.d.ts
test:无

symptom:
  两套类型声明同名 API 不一致：
    types/xunay.d.ts:       list() 返回 () => { __xunay_list: true }
    core/types/index.d.ts:  list() 返回 any
    types 只导出 signal/computed/effect/batch
    core/types 导出全部（含 untrack / onCleanup / frag / txt / ref / show / runtime）
  IDE 补全取决于 tsconfig 指向哪个
  大概率指向根 types/，用户看不到完整 API

cause:
  根 types/xunay.d.ts 是早期手写
  core/types/index.d.ts 是后期补齐
  两套并行

fix:
  删除根 types/xunay.d.ts
  在 package.json 里 "types": "./core/types/index.d.ts"
  或让 types/ 目录作为唯一真相源（把 core/types/*.d.ts 移过来）

[V061]
severity:medium
status:open
module:package.json
func:dependencies
test:无

symptom:
  根包 dependencies 混入领域特定大依赖：
    @babylonjs/core      ~15MB
    @babylonjs/loaders
    @babylonjs/materials
    howler               ~100KB
    tonal                ~500KB
  这些对不使用 3D / 音频 / 乐理的用户完全无用
  npm i 会强制装

cause:
  "dependencies": {
    "@babylonjs/core": "^9.29.0",
    ...
  }

fix:
  移到 core/package.json 的 peerDependencies
  用户用 babylon/music/audio 时按需装
  或改为 optionalDependencies

[V062]
severity:low
status:open
module:shared/routes.json
func:updateTodo
test:无

symptom:
  6 条路由里 5 条有 desc 字段
  只有 updateTodo 缺
  UI 显示时会空一格

cause:
  {
    "name": "updateTodo",
    "method": "POST",
    "path": "/rpc/updateTodo",
    "auth": true,
    "handler": "handleUpdateTodo"
    // 缺 "desc": "更新标题"
  }

fix:
  补上 desc

[V063]
severity:medium
status:open
module:deploy/nginx.conf
test:无

symptom:
  1) 只 listen 80，无 443，无 HSTS，无 http → https 重定向
  2) proxy_set_header Connection "upgrade" 硬编码
     普通 HTTP 请求也带 Connection: upgrade 头
     某些后端会误当 WebSocket 处理

cause:
  server {
    listen 80;
    ...
    proxy_set_header Connection "upgrade";
    ...
  }

fix:
  1) 加 listen 443 ssl + 证书配置 + 80→443 重定向
  2) 用 map:
    map $http_upgrade $connection_upgrade {
      default upgrade;
      ''      close;
    }
    server {
      ...
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection $connection_upgrade;
    }

[V064]
severity:low
status:open
module:deploy/xunay.service
test:无

symptom:
  User=root
  后端进程以 root 运行
  任何 RCE（比如 V040 的 xai-server 类似漏洞）即 root 权限
  且 WorkingDirectory=/root/xunay 硬编码，不可移植

cause:
  [Service]
  Type=simple
  User=root
  WorkingDirectory=/root/xunay
  ExecStart=/root/xunay/.venv/bin/granian ...

fix:
  创建专用用户:
    useradd -r -s /sbin/nologin xunay
    chown -R xunay:xunay /opt/xunay
  User=xunay
  WorkingDirectory=/opt/xunay

[SUMMARY-UPDATE-10]
v058:low    package.json workspaces 引用 compiler2
v059:medium deploy/xunay.service 与 xunay.config.json 端口/后端不一致
v060:medium types/xunay.d.ts 与 core/types/index.d.ts 不同步
v061:medium package.json dependencies 混领域特定大依赖
v062:low    shared/routes.json updateTodo 缺 desc
v063:medium deploy/nginx.conf 无 HTTPS + Connection 头硬编码
v064:low    deploy/xunay.service User=root 硬编码路径

count-total:
  high:   8  (v001, v010, v036, v038, v040, v042, v048, v053)
  medium: 32 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043, v046, v047, v050, v051, v052, v054, v055, v057, v059, v060, v061, v063 + ...)
  low:    24 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034, v039, v041, v044, v045, v049, v056, v058, v062, v064)
  total:  64

[V065]
severity:low
status:open
module:my-blog/
module2:templates/blog/
test:diff -rq my-blog templates/blog

symptom:
  my-blog/ 和 templates/blog/ 内容逐字节相同
  7 个文件全部重复
  diff -rq 无输出

cause:
  demo 项目直接复制模板
  或者反过来

fix:
  方案 A：删 my-blog，只留 templates/blog 当 demo
  方案 B：让 my-blog 引用 templates/blog（软链或 workspace）
  方案 C：my-blog 改成真实博客示例，templates/blog 保持空壳

[V066]
severity:low
status:open
module:my-blog/
module2:templates/blog/
test:无

symptom:
  所有组件是空壳：
    Comment() → div(null, "Comment")
    Footer() → div(null, "Footer")
    Header() → div(null, "Header")
    About() / Home() / Post() → div(null, "xxx")
  无实际功能
  xai init 出来的项目也是这套
  用户跑 npm run dev 看到 6 个纯文本

cause:
  模板没写完
  或故意保持最简

fix:
  模板保持最简 OK（用户自己填）
  但 my-blog 作为"演示"应该展示真实用法：
    - Header 有导航
    - Home 列出 posts
    - Post 显示 content + comments
    - store.xuy 里有真实的 signal 交互

[SUMMARY-UPDATE-11]
v065:low my-blog/ 和 templates/blog/ 完全重复
v066:low my-blog/ + templates/blog/ 组件全是空壳

count-total:
  high:   8  (v001, v010, v036, v038, v040, v042, v048, v053)
  medium: 32 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043, v046, v047, v050, v051, v052, v054, v055, v057, v059, v060, v061, v063 + ...)
  low:    26 (v005, v006, v007, v008, v009, v013, v017, v018, v019, v020, v024, v025, v026, v027, v030, v032, v033, v034, v039, v041, v044, v045, v049, v056, v058, v062, v064, v065, v066)
  total:  66

[V067]
severity:low
status:open
module:test/core.test.js
func:list 重复 key 会警告
test:自身

symptom:
  test('list 重复 key 会警告', () => {
    if (typeof document === 'undefined') return   // ← Node 环境直接返回
    ...
  })
  Node 下永远"通过"，实际什么都没测
  测试通过率虚高

cause:
  模板里为浏览器写的测试，Node 跑时短路

fix:
  用 node:test 的 skip 标记：
    test('...', { skip: typeof document === 'undefined' }, () => {...})
  或安装 jsdom 提供 document 后真测

[V068]
severity:low
status:open
module:test/core.test.js
func:registerTags 重复注册跳过
test:自身

symptom:
  测试里断言用 process.env.NODE_ENV !== 'production' 判定
  但 registerTags 内部判定是 runtime.dev
  两者不一致
  CI 里 NODE_ENV=production 时测试静默跳过
  开发环境里执行，生产环境里不执行，结果不一致

cause:
  测试逻辑:
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
      if (a.length !== 1) throw ...
    }
  registerTags 内部:
    if (runtime.dev && !_warnedTags.has(t)) { ... }

fix:
  测试直接检查 runtime.dev：
    if (runtime.dev) { ... }
  或强设 runtime.dev = true 再测

[V069]
severity:medium
status:open
module:test/compiler.test.js
test:自身

symptom:
  import { compile } from '../compiler2/src/index.js'
  测的是 compiler2（已废弃的手写扫描器）
  compiler3 才是当前推荐（基于 acorn）
  compiler3 有独立的 test/compiler3/test/*.test.js (1391 个)
  这个测试文件覆盖死代码，制造"测试覆盖"假象

cause:
  迁移到 compiler3 时忘了删 compiler2 的测试

fix:
  删除 test/compiler.test.js
  或改为 import compiler3/src/index.js（验证同样场景）

[V070]
severity:low
status:open
module:test/subscription-index.test.mjs
test:自身

symptom:
  不使用 node:test 框架
  顶层 await + assert + 最后 console.log
  失败时只报行号，没有测试名
  与其他测试文件风格不一致（其他用 test(...)）

cause:
  早期探索性测试，没迁移到 node:test

fix:
  用 test() 包裹每个断言组
  或保持现状但移入 core/test/

[V071]
severity:low
status:open
module:test/tools.test.js
test:自身

symptom:
  mock 太浅：
    window = { addEventListener, removeEventListener, dispatchEvent }
  缺 location / matchMedia / document.body / navigator
  storage / theme / auth 里这些引用被 try/catch 吞
  测试实际覆盖的代码路径 < 声称的
  theme 里的 matchMedia('(prefers-color-scheme: dark)') 永远不执行

cause:
  mock 只提供了报错不崩的最少字段

fix:
  用 jsdom：
    import { JSDOM } from 'jsdom'
    const dom = new JSDOM('<!DOCTYPE html><body></body>', { pretendToBeVisual: true })
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    globalThis.matchMedia = dom.window.matchMedia
  或补全 mock

[V072]
severity:low
status:open
module:test/backends.test.js
test:自身

symptom:
  killPort 用 fuser -k —— Linux 特有
  macOS / Windows 上不存在
  跨平台 CI 会失败
  且 fuser 输出被 2>/dev/null 吞掉，错误无提示

cause:
  async function killPort(port) {
    try { execSync(`fuser -k ${port}/tcp 2>/dev/null || true`) } catch {}
    await sleep(500)
  }

fix:
  平台分支：
    if (process.platform === 'win32') {
      execSync(`netstat -ano | findstr :${port}`, ...)
    } else if (process.platform === 'darwin') {
      execSync(`lsof -ti:${port} | xargs kill -9`)
    } else {
      execSync(`fuser -k ${port}/tcp`)
    }

[SUMMARY-UPDATE-12]
v067:low    test/core.test.js "list 重复 key" 假测试
v068:low    test/core.test.js registerTags 断言条件用 NODE_ENV 而非 runtime.dev
v069:medium test/compiler.test.js 测的是已废弃的 compiler2
v070:low    test/subscription-index.test.mjs 不用 node:test 框架
v071:low    test/tools.test.js mock 太浅，测试静默跳过
v072:low    test/backends.test.js fuser -k 不跨平台

count-total:
  high:   8  (v001, v010, v036, v038, v040, v042, v048, v053)
  medium: 33 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043, v046, v047, v050, v051, v052, v054, v055, v057, v059, v060, v061, v063, v069 + ...)
  low:    32 (v005-v009, v013, v017-v020, v024-v027, v030, v032-v034, v039, v041, v044, v045, v049, v056, v058, v062, v064, v065, v066, v067, v068, v070, v071, v072)
  total:  73

[V073]
severity:medium
status:open
module:bench/RESULT.md
test:无

symptom:
  同一文档里两张表给出不一致的 5000 项 runtime 数据
  表 1 "稳定版 runtime 对比": 5000 项 = 270.32ms
  表 2 "三方对比":           5000 项 = 405.6ms
  差 50%，同环境同规模
  表 2 的 compiled 5000 项没数据，标"(797ms噪声)"
  把不合预期的数据点直接删掉

cause:
  人工整理数据时取了不同 run
  未说明哪个 run 更可信
  未标注数据变异性

fix:
  用固定 benchmark seed / 多 run 中位数
  标出标准差
  保留所有数据点，不删"异常值"
  或明确说明"这版数据作废，参考 X"

[V074]
severity:medium
status:open
module:bench/RESULT.md
test:无

symptom:
  声明"环境: Node v22.23.3 + JSDOM (1核2G 服务器)"
  1 核机器跑 JS 基准 + JSDOM
  V8 优化被单核竞争打断
  GC 抖动 ±50%
  结论"XuNay 领先 Preact 26%"不可信

cause:
  用生产服务器跑 benchmark
  而非独立 CI 环境

fix:
  在开发者机器或 CI runner 上跑
  标注：核心数、内存、CPU 型号
  用 vmstat / pidstat 确认无其他负载
  或改声明"仅供趋势参考"

[V075]
severity:low
status:open
module:bench/
test:无

symptom:
  bench/ 有 37 个文件
    .mjs:  7 个（xunay-bench / compare / full-compare / framework-compare / ...）
    .html: 15 个（browser / compare / micro / full-test / ...）
    .js:   speed.js / core.bench.js
  无统一 runner
  无 npm script
  无 CI 集成
  各自为战

cause:
  长期演化，未整理

fix:
  归类：
    bench/core/     核心 signal 微基准
    bench/render/   渲染基准
    bench/compare/  跨框架对比
  加 runner: bench/run.mjs
  加 package.json script: "bench": "node bench/run.mjs"

[V076]
severity:low
status:open
module:bench/xunay-bench.mjs
test:无

symptom:
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 0)
  把 rAF 换成 setTimeout(0)
  改变事件循环优先级
  与真实浏览器行为不符
  原本 rAF 调度的 effect 会与 timer 竞争

cause:
  JSDOM 默认无 rAF
  用 setTimeout 伪造

fix:
  JSDOM 的 pretendToBeVisual: true 已提供 rAF
  直接用它：
    globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  或明确说明"这是 JS-only 计时，非浏览器真实场景"

[SUMMARY-UPDATE-13]
v073:medium bench/RESULT.md 5000 项数据自相矛盾
v074:medium bench/RESULT.md 基准环境 1核2G 不可信
v075:low    bench/ 37 个文件无统一入口
v076:low    bench/xunay-bench.mjs 伪造 rAF 影响计时

count-total:
  high:   8  (v001, v010, v036, v038, v040, v042, v048, v053)
  medium: 35 (v002, v003, v004, v011, v012, v014, v015, v016, v021, v022, v023, v028, v029, v031, v035, v037, v043, v046, v047, v050, v051, v052, v054, v055, v057, v059, v060, v061, v063, v069, v073, v074 + ...)
  low:    34 (v005-v009, v013, v017-v020, v024-v027, v030, v032-v034, v039, v041, v044, v045, v049, v056, v058, v062, v064-v068, v070-v072, v075, v076)
  total:  77
