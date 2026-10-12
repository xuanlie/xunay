[XUNAY]
ver:1.2.2
kind:frontend-framework
paradigm:compile-first + fine-grained-reactive
lang:javascript
node:>=18
core-gzip:7.06KB
full-gzip:7.85KB
kit106-gzip:29.58KB
anim228-gzip:15.06KB

[LAYOUT]
runtime-entry:core/src/index.js
core-modules:core/src/{core.js,element.js,render.js,runtime.js,misc.js,kit.js}
compiler-entry:bin/xuyc3.js
compiler-src:compiler3/src/{index.js,runtime.js,tags.js}
compile-runtime:compiler3/src/runtime.js
web:web/{site,playground,examples}
bench:bench/

[CLI]
usage:xuyc3 build <input.xuy> [--out dist] [--title T] [--mode compiled|runtime|hybrid]
mode-default:package.json.xunay.compileMode || hybrid
mode-compiled:fully expand to DOM ops, best for static
mode-runtime:keep runtime createElement calls, best for dynamic
mode-hybrid:static compiled + dynamic runtime

[API]
signal(init,opts?) => s
  read:s()
  write:s(v) | s(fn) fn(old)=>new
  ext:s.subsCount() s.writeCount()
  opt:opts.equals=(a,b)=>bool, default Object.is
  note:equal value write is no-op
  note:no .value, s itself is getter/setter fn

computed(fn) => c
  read:c()
  ext:c.dispose()
  note:lazy, cached, dirty-marked on dep change

effect(fn) => dispose
  note:auto-tracks all signals read inside
  note:cleanup runs before re-run via onCleanup
  note:recursion>100 throws Error "[XuNay] effect 递归超 100"

batch(fn)
untrack(fn)
onCleanup(fn)
mount(vnode,selector)
render(vnode)=>dom
list(getArr,keyFn,renderFn)=>vnode
frag(...children)
show(cond,renderFn)
txt`str ${expr}`
onMount(fn)
onUnmount(fn)
ref(init)
ctx(default)
err(fn,fallback)
lazy(loader)

[TAGS]
div span p a button input form label
ul ol li
h1 h2 h3 h4 h5 h6
img br hr
table thead tbody tr td th
pre code blockquote
header footer nav main section article
select option textarea
checkbox radio progress slider
tabs tab
canvas video audio
summary details

[TAG-CALL]
tag(props?,...children)
props.on={event:handler}
props.style={} | 'css string'
props.class|className=string
props.ref=(el)=>{}
props.value|checked|disabled=any
props.other=string=>setAttribute

[XUY]
head:const { app } = __rt__
body:app(()=>vnode, selector)
rt-globals:app bindText bindAttr bindStyle renderChild applyProps applyStyle classNames createStatic toString
output:single IIFE, self-contained, embedded runtime

[ERRORS]
id:E001
  sym:Could not resolve "./core.js"
  loc:compiler3/src/runtime.js:2:34
  cause:import path wrong, files live in core/src
  fix:sed -i "s|from './core.js'|from '../../core/src/core.js'|" compiler3/src/runtime.js
  fix:sed -i "s|from './render.js'|from '../../core/src/render.js'|" compiler3/src/runtime.js
  fix:sed -i "s|from './runtime.js'|from '../../core/src/runtime.js'|" compiler3/src/runtime.js

id:E002
  sym:TypeError: app is not a function
  cause:compiler3/src/runtime.js doesn't export app
  fix:import { mount } from '../../core/src/render.js'
  fix:append `export const app = mount` to compiler3/src/runtime.js

id:E003
  sym:XuNay: target not found
  cause:mount called before #app exists in DOM
  fix:wrap in document.addEventListener('DOMContentLoaded',...)

id:E004
  sym:[XuNay] effect 递归超 100
  cause:effect reads and writes same signal
  fix:wrap writes in untrack(()=>{...})

id:E005
  sym:[XuNay] list key 重复
  fix:keyFn must return unique, don't use array index if array reorders

id:E006
  sym:5000 items -> 731KB single arrow function
  cause:compiled mode fully expands each li
  fix:use list() API for arrays >200 elements
  note:JSDOM shows high variance, real browser unverified

id:E007
  sym:signal 在订阅它的 effect 里被写入
  cause:dev mode warning, self-subscribe write
  fix:same as E004

[PERF]
env:node v22.23.3 + jsdom, 1core2G
note:jsdom noise ±50%, trend only
100items:  runtime 30ms   compiled 5ms    preact 22ms
1000items: runtime 67ms   compiled 55ms   preact 75ms
5000items: runtime 270ms  compiled 270ms  preact 350ms
5000-min:  loop 291ms     compiled 270ms
compile-10k:not-tested
compile-time:100→414ms 1000→549ms 5000→862ms

[DESIGN-DECISIONS]
d1:why no .value -> signal is callable getter/setter, saves property access
d2:why no JSX -> tag names are fns, compiler inlines to createElement
d3:why __rt__ symbol -> compiled output self-contained, avoids multi-import
d4:why effect recursion guard -> prod needs it, deadloop burns CPU
d5:why list holder is <span display:contents> -> layout transparent
d6:why hybrid default -> dynamic structure can't be statically expanded
d7:why listener-list on signal._listeners -> bypass subscribe/propagate for hot path

[TESTS]
core:test/core.test.js
compiler3:compiler3/test/{basic,props,syntax,edge,tags,batch}.test.js
run:npm test
verify:npm run verify (lint + compile + check output)

[COMMANDS]
install:npm i xunay
build-core:cd core && node build.js
compile-xuy:node bin/xuyc3.js build app.xuy --out dist
site-dev:npm run site:dev
lint:npm run lint
format:npm run format

[ONLINE]
docs:http://107.172.190.220:12342/
playground:http://107.172.190.220:12342/playground/
examples:http://107.172.190.220:12342/examples/
github:https://github.com/xuanlie/xunay

[MOD-ROUTER]
entry:core/src/router.js
export:createRouter(opts={})
note:default export = createRouter
usage:
  const router = createRouter({ routes, mode:'history'|'hash' })
  router.push(path) router.replace(path) router.back()
  router.current() -> 当前路由
  router.onChange(fn) -> unsub

[MOD-SSR]
entry:core/src/ssr.js
export:renderToString(component, opts={})
export:hydrateMount(component, target, opts={})
export:hydrate = hydrateMount
usage:
  const html = renderToString(() => App(), {})
  hydrateMount(() => App(), '#app')

[MOD-ANIM]
entry:core/src/anim.js
export:anim(el, keyframes, options={}) -> 返回 controller
export:timeline() -> { add, play, pause, cancel }
export:spring(el, opts={}) -> 弹性动画
export:sequence(items) -> 顺序执行
export:parallel(fns) -> 并行执行
export:stagger(els, fn, delay=50) -> 错开执行
export:wait(ms) -> Promise
export:cancelAll(el) -> 取消该元素所有动画
export:easings -> 缓动函数表
export:ease = easings
export:trans(duration=200) -> CSS transition 快捷

[MOD-THEME]
entry:core/src/theme.js
export:createTheme(opts={})
export:theme -> 单例
note:default export = theme
usage:
  const t = createTheme({ dark:{...}, light:{...} })
  t.set('dark') t.toggle() t.current() t.onChange(fn)

[MOD-I18N]
entry:core/src/i18n.js
export:createI18n(opts={})
export:i18n -> 单例
usage:
  const i18n = createI18n({ locale:'zh', messages:{ zh:{...}, en:{...} } })
  i18n.t('key') i18n.locale('en') i18n.onChange(fn)

[MOD-STORAGE]
entry:core/src/storage.js
export:createStore(opts={}) -> backend:'local'|'session'|'memory'
export:storage -> local backend 单例
export:session -> session backend 单例
export:memory -> memory backend 单例
usage:
  const s = createStore({ backend:'local', prefix:'app:' })
  s.get(key, default) s.set(key, val) s.remove(key) s.clear()

[MOD-HTTP]
entry:core/src/http.js
export:createHttp(opts={})
export:setHttpAuth(a) -> 设置默认 auth
export:http -> 单例
usage:
  const h = createHttp({ base:'/api', timeout:5000 })
  h.get(url, opts) h.post(url, body, opts) h.put(...) h.del(...)
  h.interceptors.request.use(fn) h.interceptors.response.use(fn)

[MOD-QUERY]
entry:core/src/query.js
export:query(opts={}) -> 声明式数据查询
export:invalidateQueries(prefix) -> 失效缓存
export:clearQueryCache() -> 清空
export:subscribeQuery(fn) -> 订阅变化
usage:
  query({ key:'user', fetcher:() => http.get('/user'), staleTime:5000 })

[MOD-FORM]
entry:core/src/form.js
export:createForm(opts={})
export:rules -> { required, email, min, max, pattern, ... }
usage:
  const f = createForm({ initial:{}, validate:{} })
  f.value('name') f.set('name', v) f.errors() f.submit(fn)

[MOD-PERSIST]
entry:core/src/persist.js
export:persist(init, opts={}) -> 自动持久化的 signal
export:persistWithMigration(init, opts={})
usage:
  const s = persist(0, { key:'count' })
  // s 是 signal，变化自动写 storage

[MOD-MOBILE]
entry:core/src/mobile.js
export:lockScroll() -> 锁定页面滚动
export:isMobile() -> bool
export:isTouch() -> bool
export:breakpoint(opts={}) -> 响应式断点
export:swipe(el, handlers={}) -> 滑动手势
export:longpress(el, handler, ms=500) -> 长按手势

[MOD-GAPS]
note:以下模块在 package.json 中 export 但 spec 未覆盖
  - alias:别名系统
  - advanced:高级 API
  - devtools:开发工具
  - auth / model / resource / game / babylon / music / audio:特定领域模块
  - 228 个 anim-* 动画 / 106 个 kit-* 组件
note:未覆盖的原因：模块数量大、领域特定，需要时按需查看对应源码
note:各模块路径统一为 core/src/<name>.js，导出入口 core/src/<name>-entry.js
