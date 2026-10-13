[XUNAY]
ver:1.2.8
kind:frontend-framework
paradigm:compile-first + fine-grained-reactive
lang:javascript
node:>=18
core-gzip:7.06KB
full-gzip:7.85KB
kit106-gzip:29.58KB
anim228-gzip:15.06KB
update:2026-10-13
note:此文件从源码实测提取（不手写），对应 74 条漏洞修复后的版本

[LAYOUT]
root:/
core:core/                   运行时 + kit + compiler3
compiler2:compiler2/         旧版（手写扫描器，已废弃）
compiler3:compiler3/         acorn AST 编译器（当前推荐）
bin:bin/                     CLI（xuyc / xuyc3 / xuyc-dev / xai / xuyc-android / xuyc-3d / xuyc-filament / check-routes / switch）
scripts:scripts/             构建脚本
backends:backends/           6 个后端参考（node/python/go/rust/cpp）
backend:backend/             FastAPI 后端（独立）
web:web/                     site + playground + examples
android:android/             Android 原生壳
android-3d:android-3d/       Android 3D 示例
android-3d-filament:android-3d-filament/  Filament 3D
bench:bench/                 基准测试
deploy:deploy/               nginx / systemd
ai:ai/                       xai（AI 项目状态助理）
shared:shared/               路由 schema + DB schema

[CLI]
core-build:cd core && node build.js
xuyc:node bin/xuyc.js build <entry.xuy> [--out dist] [--target=ui|3d|filament]
xuyc-scan:node bin/xuyc.js scan                       # 扫描 src/pages/ → router.xuy
xuyc3:node bin/xuyc3.js build <input.xuy> [--out dist] [--title T] [--mode compiled|runtime|hybrid]
xuyc-dev:node bin/xuyc-dev.js [entry.xuy] [--out dist] [--port 12348]
xuyc-android:node bin/xuyc-android.js <entry.xuy> [--out build/android] [--build] [--install]
xuyc-3d:node bin/xuyc-3d.js <scene.xuy> [--out build/android-3d]
xuyc-filament:node bin/xuyc-filament.js <scene.xuy> [--out dir] [--build] [--install]
xuyc-scene:node bin/xuyc-scene.js <scene.xuy> [--target=3d|filament]
check-routes:node bin/check-routes.js [--fix] [--lang=node]
sync-routes:node bin/sync-routes.js
scan-pages:node bin/scan-pages.js
switch:node bin/switch.js <python|go|cpp|node>
create:node bin/create.js <name>
xai-state:node bin/xai.js state
xai-snapshot:node bin/xai.js snapshot
xai-verify:node bin/xai.js verify
xai-log:node bin/xai.js log "标题" --files "a,b,c"
xai-todo:node bin/xai.js todo <list|add|done|undo|rm>
xai-serve:node bin/xai.js serve

[API-CORE]
# core/src/core.js
signal(init, opts?) => s
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
  note:级联写入（effect 内写 signal，下游订阅者）：已修复 V001

batch(fn)
untrack(fn)
onCleanup(fn)

[API-RENDER]
# core/src/render.js
mount(comp, target) => dispose
render(vnode) => Node
list(arr|getArr, keyFn, renderFn) => () => vnode

# core/src/misc.js
frag(...children)  → vnode
F = frag           → deprecated alias
show(cond|getCond, renderFn) → vnode
txt`str ${expr}`   → () => string
onMount(fn)
onUnmount(fn)
ref(init) => getter/setter
ctx(default) => { id, defaultValue, get(), provide(v, fn) }
err(fn, fallback)
lazy(loader) => component

[API-ELEMENT]
# core/src/element.js
ELEMENT  → Symbol
FRAGMENT → Symbol
createElement(type, props, ...children) => vnode
createFragment(children) => vnode
tags     → { div, span, p, a, button, input, form, label, ul, ol, li, h1..h6, img, br, hr, table, thead, tbody, tr, td, th, pre, code, blockquote, header, footer, nav, main, section, article, select, option, textarea, checkbox, radio, progress, slider, tabs, tab, canvas, video, audio, summary, details }
tag(name) => (props, ...children) => vnode
registerTags(names) => string[]

[API-RUNTIME]
# core/src/runtime.js
runtime                 → 全局运行时单例
createRuntime() => rt
setRuntime(rt)
withRuntime(rt, fn)
resetRuntime()
createScope(parent?) => scope
disposeScope(scope)
runInScope(scope, fn)
runMountFns(scope)

[SUBPATH]
# core/package.json 里的 exports（用户 import 的路径）
.                    → src/index.js          主入口（signal/computed/effect/batch/untrack/onCleanup + createElement/createFragment/tag/tags/registerTags + render/mount/list + frag/show/txt/onMount/onUnmount/ref + runtime 相关）
./tags               → src/tags-entry.js     div/span/p/a/button/input/form/label/ul/ol/li/h1-h6/img/br/hr/table/thead/tbody/tr/td/th/pre/code/blockquote
./advanced           → src/advanced-entry.js ctx / err / lazy
./alias              → src/alias-entry.js    s(=signal) c(=computed) f(=effect) bat(=batch) m(=mount) app(=mount) l(=list) each(=list) alias(n, fn)
./kit                → src/kit-entry.js      106 个组件全量
./kit/base           → src/kit.js            Btn/Row/Col/Text/Card/Divider/Space/Tag/Badge
./kit/form           → src/kit-form.js       Input/Textarea/Select/Checkbox/Radio/Switch/NumberInput/DatePicker/TimePicker/SearchInput/PasswordStrength/Rate/useForm
./kit/display        → src/kit-display.js    Alert/Modal/Spinner/Empty/Progress/Avatar/Result/Skeleton/Count/Stat/Descriptions/ItemCard/QRCode
./kit/nav            → src/kit-nav.js        Tabs/Breadcrumb/Pagination/Steps/Accordion
./kit/data           → src/kit-data.js       Table/List/Timeline/Tree/TreeSelect/Calendar/SplitPane
./kit/upload         → src/kit-upload.js     DragUpload/ImageUpload
./kit/editor         → src/kit-editor.js     CodeEditor/RichText/CopyButton/useHotkey/SplitButton
./kit/overlay        → src/kit-overlay.js    Tooltip/Popover/Dropdown/Drawer/Popconfirm/Message/Notification/Tour
./kit/layout         → src/kit-layout.js     Layout/Grid/Flex/Affix
./kit/charts         → src/kit-charts.js     BarChart/LineChart/PieChart/Sparkline
./kit/virtual        → src/kit-virtual.js    VirtualList/Sortable/InfiniteList
./devtools           → src/devtools-entry.js openDevtools / closeDevtools
./ssr                → src/ssr-entry.js      renderToString / hydrateMount / hydrate
./anim               → src/anim-entry.js     全部动画（anim + presets + trigger + trigger2 + text + svg + physics + tools + kit + kit2）
./dev                → src/dev-entry.js      enableDevtool / disableDevtool / getEvents / clearEvents / recordEvent
./full               → src/full-entry.js     index + kit（不含 tags / alias）
./auth               → src/auth-entry.js     auth / createAuth
./storage            → src/storage-entry.js  storage / session / memory / createStore
./http               → src/http-entry.js     http / createHttp / setHttpAuth
./i18n               → src/i18n-entry.js     i18n / createI18n
./theme              → src/theme-entry.js    theme / createTheme
./query              → src/query-entry.js    query / invalidateQueries / clearQueryCache
./form               → src/form-entry.js     createForm / rules
./persist            → src/persist-entry.js  persist / persistWithMigration
./router             → src/router-entry.js   createRouter
./mobile             → src/mobile-entry.js   lockScroll / isMobile / isTouch / breakpoint / swipe / longpress
./babylon            → src/babylon-entry.js  全部 Babylon 集成（createScene / Box / Sphere / ...）
./game               → src/game-entry.js     createGameLoop / createFollowCamera / createInput / createStateMachine / createTimer / createScore / createPool / createSpawner / collide2D / createLoading
./game-mobile        → src/game-mobile-entry.js  createVirtualJoystick / createHaptics / lockOrientation / preventGestures / safeArea / applyMobileDefaults / deviceInfo
./audio              → src/audio-entry.js    loadHowler / createAudio / createSfx / createBgm / createSpatialSfx
./music              → src/music-entry.js    全部乐理（transpose / ... / createSynth）
./resource           → src/resource-entry.js resource
./model              → src/model-entry.js    model / modelCheck / modelNum

# 未列入 subpath（只能从 xunay/kit 全量入口拿）：
#   kit-data2   (Carousel/Image/VirtualTable/Kanban/Gantt/QRScanner)
#   kit-display2(Typography/Comment/Watermark/Ribbon/Code/Keyboard/Highlight/Ellipsis)
#   kit-editor2 (Markdown/JSONViewer/DiffViewer/Terminal/CommandPalette/ContextMenu)
#   kit-file    (Upload/FileList/Dropzone/FilePreview)
#   kit-form2   (ColorPicker/Slider/Mentions/Transfer/Cascader)
#   kit-nav2    (Menu/Anchor/BackTop/Collapse)

[KIT-INVENTORY]
# xunay/kit 全量 = 17 个文件
kit.js:        Btn Row Col Text Card Divider Space Tag Badge
kit-form.js:   Input Textarea Select Checkbox Radio Switch NumberInput DatePicker TimePicker SearchInput PasswordStrength Rate useForm
kit-form2.js:  ColorPicker Slider Mentions Transfer Cascader
kit-display.js:Alert Modal Spinner Empty Progress Avatar Result Skeleton Count Stat Descriptions ItemCard QRCode
kit-display2.js:Typography Comment Watermark Ribbon Code Keyboard Highlight Ellipsis
kit-nav.js:    Tabs Breadcrumb Pagination Steps Accordion
kit-nav2.js:   Menu Anchor BackTop Collapse
kit-data.js:   Table List Timeline Tree TreeSelect Calendar SplitPane
kit-data2.js:  Carousel Image VirtualTable Kanban Gantt QRScanner
kit-editor.js: CodeEditor RichText CopyButton useHotkey SplitButton
kit-editor2.js:Markdown JSONViewer DiffViewer Terminal CommandPalette ContextMenu
kit-upload.js: DragUpload ImageUpload
kit-file.js:   Upload FileList Dropzone FilePreview
kit-overlay.js:Tooltip Popover Dropdown Drawer Popconfirm Message Notification Tour
kit-layout.js: Layout Grid Flex Affix
kit-charts.js: BarChart LineChart PieChart Sparkline
kit-virtual.js:VirtualList Sortable InfiniteList
kit-util.js:   px cx

[ANIM-INVENTORY]
# xunay/anim 全量 = 10 个文件
anim.js:        anim timeline spring sequence parallel stagger wait cancelAll easings ease trans
anim-presets.js:151 个预设（fadeIn/fadeOut/slide*/zoom*/rotate*/flip*/bounce*/back*/shake*/tada/wobble/jello/rubberBand/flash/glow/shimmer/breathe/drift/blur*/move*/lightSpeed*/roll*/jackInTheBox/hinge/cubeRotate/perspective*/skew*/dropIn/dropOut/popIn/popOut/jelly/blink/rainbow/wave/unfold/fold/neon/bobble/presets 表）
anim-trigger.js:inView onScroll onHover onInterval onVisible once
anim-trigger2.js:throttle debounce onMouseMove onKey onResize onAnimationEnd onSwipe onDrag observeOnce
anim-text.js:   splitText typewriterIn typewriterOut typewriter countUp highlightWords
anim-svg.js:    drawPath followPath morph maskReveal maskHide gradientFlow flip sharedElement parallaxSVG ringProgress svgMorph tiltCard
anim-physics.js:springChain inertia particles trail
anim-tools.js:  queue interruptable cachedAnim prefersReducedMotion safeAnim withWillChange compose once delayed retry scrollProgress parallax followMouse
anim-kit.js:    Entrance Transition AnimatedList AnimatedValue AnimatedNumber Marquee Typewriter Reveal
anim-kit2.js:   Ripple FlipCard TypewriterText Counter SplitTextIn GradientText NeonText OutlineText Marker LazyImage ProgressRing

[API-AUTH]
createAuth(opts) => auth
  storage: 'local'|'session'|'cookie'|'memory'
  key, expiresIn, refresh, refreshBefore, cookie
  auth.token() auth.get() auth.set(v) auth.clear() auth.isValid() auth.isEmpty() auth.expiresAt() auth.remaining() auth.refresh() auth.config(opts)
  note:isValid() 已修复 V004（不再有副作用订阅）

[API-RESOURCE]
resource(fetcher, opts) => { data, error, loading, reload, cancel }
  三态原语，自动取消

[API-MODEL]
model(sig)      → { value: () => sig(), on: { input } }
modelCheck(sig) → { checked, on: { change } }
modelNum(sig)   → { value, on: { input } }   空串保留 ''（已修复 V008）

[API-RPC]
setBase(url) setOptions(opts) getToken() rpc
  rpc 从 core/src/rpc-routes.js 的 ROUTES 生成
  路由源：shared/routes.json

[API-HTTP]
createHttp(opts) => { request get post put patch delete }
setHttpAuth(a)
http → 单例
  注：4xx 不重试，超时会重试（已知设计）

[API-QUERY]
query(opts) => { data, error, loading, fetchedAt, isStale, refetch, invalidate, setData, key }
invalidateQueries(prefix)
clearQueryCache()
subscribeQuery(fn)
  note:V002 修复（成功时重置 retriesLeft）
  note:V005 修复（hashKey 递归排序）

[API-FORM]
createForm(opts) => { values, errors, touched, submitting, isValid, isDirty, get, set, setValues, blur, reset, validate, validateField, handleSubmit, field(key) }
rules = { required minLength maxLength min max pattern email phone url number integer sameAs oneOf custom }

[API-STORAGE]
createStore(opts) => { get set remove clear has ref }
storage / session / memory  → 3 个单例
  opts: backend 'local'|'session'|'memory', prefix, ttl, onChange

[API-PERSIST]
persist(init, opts) => signal
persistWithMigration(init, opts)
  opts: key storage serializer deserializer ttl prefix migrate

[API-I18N]
createI18n(opts) => { locale, t, tr, setLocale, available, addMessages, setMessages }
i18n → 单例

[API-THEME]
createTheme(opts) => { theme, set, toggle, isDark, isLight, available }
theme → 单例

[API-ROUTER]
createRouter(opts) => {
  path, query, matched, params, route,
  push, replace, back, forward, go, view,
  beforeEach(fn) => unsub
}
  opts: routes, mode 'hash'|'history', fallback, notFound, base, scrollBehavior

[API-SSR]
renderToString(component, opts) => string
hydrateMount(component, target, opts) => dispose
hydrate = hydrateMount  @deprecated
  note:hydrateMount 是"清空重建"，非真 hydrate

[API-MOBILE]
lockScroll() => unlock
isMobile() => bool
isTouch() => bool
breakpoint(opts) => signal+dispose      # V009 修复：加了 dispose
swipe(el, handlers) => cleanup
longpress(el, handler, ms) => cleanup

[API-GAME]
createGameLoop(opts) => { start, stop, running, elapsed }
createFollowCamera(camera, opts) => { snap, update }
createInput(opts) => { keys, vector, isDown, dispose }   # V028 修复：加 dispose
createStateMachine(initial, transitions) => { state, get, is, goto, on, history }
createTimer(opts) => { time, running, start, stop, reset, update }
createScore(opts) => { score, best, add, set, reset, commit }
createPool(opts) => { acquire, release, activeCount, freeCount, forEach, clear }
createSpawner(opts) => { update, remove, list, reset }
collide2D(a, b, radius) => bool
createLoading(opts) => { progress, current, done, run, bindDOM }

[API-GAME-MOBILE]
createVirtualJoystick(opts) => { vector, active, show, hide, dispose }
createHaptics() => { light, medium, heavy, custom, supported }
lockOrientation(mode) => Promise<bool>
unlockOrientation()
preventGestures(target) => cleanup
safeArea() => { top, right, bottom, left }    # V030 修复：补 right/bottom
applyMobileDefaults(opts)
deviceInfo() => { mobile, ios, android, touch, dpr, width, height, orientation }

[API-BABYLON]
loadBabylon() => BJS
getCtx() => ctx
createScene(opts) => { canvas, engine, scene, B, camera, lights, onFrame, beforeRender, afterRender, resize, dispose }
setupTouchGestures(canvas, camera, opts) => cleanup
isMobile() => bool
mobilePreset(engine, opts)
createCamera(opts) => cam     type: arc|free|universal|follow|target
createLight(opts) => light    type: hemi|directional|point|spot
Mesh 工厂（全部返回 { mesh, material, name, onFrame, dispose }）:
  Box Sphere Ground Cylinder Torus TorusKnot Plane Disc IcoSphere Capsule
  Polyhedron Lathe Tube Lines DashedLines Ribbon ExtrudeShape Polygon
  GroundFromHeightMap TiledPlane Text3D Mesh
材质：
  PBRMaterial StandardMaterial GridMaterial GradientMaterial NormalMaterial ShaderMaterial
纹理：
  Texture DynamicTexture CubeTexture
资源：
  importMesh(url, opts) => Promise
动画：
  animate(opts) => { anim, target, start, stop }
  animationGroup(opts)
粒子：
  Particles(opts)
交互：
  onPointer(opts) => cleanup
  raycast(scene)
Sprite：
  SpriteManager(url, opts)
  Sprite(manager, opts)
响应式：
  bind(sig, target, prop, opts)
  bindSet(sigs, setter)
  bindTwoWay(sig, target, prop, opts) => dispose   # V029 修复：onCleanup 自动清 timer
  bindColor(sig, target, prop, Color3Class)
性能：
  adaptiveScaling(engine, opts)
  fpsMonitor(engine, sig, interval)

[API-AUDIO]
# 依赖 Howler（CDN 或 npm）
loadHowler() => { Howl, Howler }
createAudio(opts) => { volume, muted, register, play, stop, pause, fade, setBusVolume, getBusVolume, stopAll, pauseAll, unload, unloadAll, unlock, Howl, Howler, sounds, dispose }
createSfx(src, opts) => { play(v), dispose }
createBgm(src, opts) => { volume, playing, howl, play(fade), stop(fade), toggle, dispose }
createSpatialSfx(src, opts) => { howl, attach(listener, emitter), dispose }

[API-MUSIC]
# 依赖 tonal
re-export: Note Chord Scale Interval Key Progression RomanNumeral Midi Range ChordType ScaleType
便捷: transpose noteName noteFreq noteMidi freqToMidi midiToFreq midiToNote
常量: CHORD_TYPES SCALE_MODES
音阶和弦: getScale getChord chordName chordFullName normalizeNote pitchClass
进行: progressionToChords chordsToNotes randomProgression
转调: transposeNotes notesToFreqs chordToFreqs
状态: createMusicState
合成: createSynth(opts) => { volume, tone, chord, playProgression, ctx, resume, dispose }   # V026 修复：加 dispose

[API-HL]
highlight(code, lang) => string
languages → 数组
  支持：js ts py go rust css html json sql yaml bash md xuy
  V003 修复：占位符上限从 2048 提升到 6400

[API-SANITIZE]
sanitize(html) => string
  白名单标签 + data-* / aria-* 属性
  拦截 javascript: / vbscript: / data:text/html

[API-ALIAS]
s = signal, c = computed, f = effect, bat = batch
m = mount, app = mount
l = list, each = list
alias(n, fn) → globalThis[n] = fn

[XUY]
head:const { app } = __rt__
body:app(()=>vnode, selector)
rt-globals:app bindText bindAttr bindStyle renderChild applyProps applyStyle classNames createStatic toString
output:single IIFE, self-contained, embedded runtime

compile-modes:
  compiled:编译器生成 document.createElement（生产，快启动）
  runtime:源码原样 + 自动注入标签 import（开发，动态标签）
  hybrid:文件有 // @runtime 头注释时走 runtime，其余 compiled
优先级:文件头 > 命令行 --mode > package.json.xunay.compileMode > 默认 compiled

file-header:
  // @compiled   强制编译
  // @runtime    强制运行时
  // @hybrid     强制混合
  note:V035 修复后，xuyc.js 与 compiler3 一致扫描前 10 行

[TAG-CALL]
tag(props?, ...children)
props.on={event:handler}
props.style={} | 'css string'
props.class|className=string
props.ref=(el)=>{}
props.value|checked|disabled=any
props.other=string=>setAttribute

[DESIGN-DECISIONS]
d1:why no .value -> signal is callable getter/setter, saves property access
d2:why no JSX -> tag names are fns, compiler inlines to createElement
d3:why __rt__ symbol -> compiled output self-contained, avoids multi-import
d4:why effect recursion guard -> prod needs it, deadloop burns CPU
d5:why list holder is <span display:contents> -> layout transparent
d6:why hybrid default -> dynamic structure can't be statically expanded
d7:why listener-list on signal._listeners -> bypass subscribe/propagate for hot path
d8:why dual-mode event binding -> 有委托 root 走 __xunay_handlers（性能），无 root 直接 addEventListener（动态元素）。两条路互斥，避免双触发

[ERRORS]
id:E001
  sym:Could not resolve "./core.js"
  loc:compiler3/src/runtime.js
  cause:import 路径
  status:已修（V031 系列）

id:E002
  sym:TypeError: app is not a function
  cause:compiler3/src/runtime.js 不导出 app
  fix:末尾加 `export const app = mount`

id:E003
  sym:XuNay: target not found
  cause:mount 早于 #app 存在
  fix:包 DOMContentLoaded

id:E004
  sym:[XuNay] effect 递归超 100
  cause:effect 读写同一 signal
  fix:写入包 untrack(()=>{})

id:E005
  sym:[XuNay] list key 重复
  fix:keyFn 唯一

id:E006
  sym:5000 items -> 731KB 单箭头函数
  status:NOT-A-BUG
  evidence:compiled 270ms 略快于 loop 291ms
  note:for 10000+ items 用 list() API

id:E007
  sym:signal 在订阅它的 effect 里被写入
  cause:dev 警告
  fix:同 E004

id:E008
  sym:动态渲染的按钮点击"没反应"
  cause:mount 完成后动态创建的 DOM 双重绑定
  fix:已修 1.2.4（core/src/events.js aad6b70）

[PERF]
env:node v22.23.3 + jsdom, 1core2G
note:jsdom noise ±50%, trend only
100items:  runtime 30ms   compiled 5ms    preact 22ms
1000items: runtime 67ms   compiled 55ms   preact 75ms
5000items: runtime 270ms  compiled 270ms  preact 350ms
5000-min:  loop 291ms     compiled 270ms
compile-time:100→414ms 1000→549ms 5000→862ms
caveat:1核2G服务器，只作趋势参考

[TESTS]
core:test/core.test.js                     22 用例（V067 假测试改 skip）
compiler3:compiler3/test/{basic,props,syntax,edge,tags,batch}.test.js  1391 用例全绿
core-sub:core/test/*.test.js               180 用例全绿
tools:test/tools.test.js                   12 用例（V071 修复：jsdom）
subscription:test/subscription-index.test.mjs  2 用例（V070 修复：node:test）
backends:test/backends.test.js             需要各后端在对应端口就绪（V072 修复：跨平台）
run:npm test
verify:npm run verify

[COMMANDS]
install:npm i xunay
build-core:cd core && node build.js
compile-xuy:node bin/xuyc3.js build app.xuy --out dist
site-dev:npm run site:dev
lint:npm run lint
format:npm run format
bench:node bench/run.mjs <core|compare|full|framework|isolate|real|static|xunay|list>
xai:node bin/xai.js <state|snapshot|verify|log|todo|serve>

[ONLINE]
docs:http://107.172.190.220:12342/
playground:http://107.172.190.220:12342/playground/
examples:http://107.172.190.220:12342/examples/
github:https://github.com/xuanlie/xunay

[FIXED-HIGHLIGHTS]
# 2026-10-13 修复的高价值条目（详见 git log）
V001:core.js propagate 快速路径丢更新（级联 effect 场景）
V010:kit-data2.js QRScanner video 变量遮蔽
V036+V038+V040+V048:xai-server.js 4 处路径穿越 / 无鉴权 RCE
V042:bin/xuyc-filament.js --build 只支持 Windows
V053:frontend/app.js import 不存在的 sig/app
V077-V081:bin/xuyc3.js 多文件 .xuy 支持（entry 位置、loader、runtime 模式、路径重写、site-entry 入口）
V016:kit-editor.js RichText + kit-editor2.js Markdown 加 sanitize
V015:kit-overlay.js pushNotification 改 textContent
V023:anim-svg.js + anim-kit2.js SVG innerHTML 颜色白名单
V021:anim-kit.js + anim-kit2.js ref 内 effect 泄漏
V005:query.js hashKey 排序
V002:query.js retriesLeft 重置
V004:auth.js isValid 副作用订阅
V031:bin/xuyc.js 中断兜底恢复源码
V066:templates/blog 从空壳填成可用模板
详见 git tag fix-batch1 到 fix-batch8

[PENDING]
V059:deploy/xunay.service 与 xunay.config.json 端口/后端不一致
V063:deploy/nginx.conf 无 HTTPS + Connection 头硬编码
V064:deploy/xunay.service User=root + 路径硬编码
note:这 3 条与部署方式相关，需人工决策（用什么后端 / 是否有 HTTPS / 是否可用非 root 用户）

[MOD-GAPS]
note:以下模块在 package.json 中 export 但独立 spec 未覆盖（本文件 SUBPATH 段已列）
  - alias / advanced / devtools
  - auth / model / resource / game / game-mobile / babylon / music / audio / hl
  - 106 个 kit-* 组件（见 KIT-INVENTORY）
  - 228 个 anim-* 动画（见 ANIM-INVENTORY）
note:各模块路径统一为 core/src/<name>.js，导出入口 core/src/<name>-entry.js
