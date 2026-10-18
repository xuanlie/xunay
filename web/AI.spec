[XUNAY]
ver:1.3.0
kind:frontend-framework
paradigm:compile-first + fine-grained-reactive
lang:javascript
node:>=18
core-gzip:7.06KB
full-gzip:7.85KB
kit106-gzip:29.58KB
charts36-gzip:~120KB（源码，未打包）
icons2001-gzip:~90KB（源码，未打包）
anim228-gzip:15.06KB
update:2026-10-18
note:此文件从源码实测提取（不手写），对应 74 条漏洞修复后的版本

[LAYOUT]
root:/
core:core/                   运行时 + kit + compiler3 + compiler4
compiler2:compiler2/         旧版（手写扫描器，已废弃）
compiler4:core/compiler4/    极简语法编译器（Xuyg）
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
./kit/icons          → src/Kit/icons.js           2001个图标（见 API-ICONS）
./kit/charts         → src/Kit/charts/index.js   36种图表（见 API-CHARTS）
./kit/charts/*       → src/Kit/charts/*.js        单独导入（tree-shaking最优）
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

[KIT-ENTRY]
# xunay/kit      → core/src/kit-entry.js（全量，re-export 20 个模块）
# xunay/kit/ui   → core/src/Kit/ui/index.js（barrel，18 个模块）
# 页面 import 推荐优先用 'xunay/kit/ui'

[KIT-SUBPATH]
# package.json exports 已注册的 kit subpath：
  xunay/kit          → kit-entry.js（全量）
  xunay/kit/ui       → Kit/ui/index.js（barrel，18 模块）
  xunay/kit/base     → kit.js
  xunay/kit/form     → kit-form.js
  xunay/kit/display  → kit-display.js
  xunay/kit/display2 → kit-display2.js
  xunay/kit/nav      → kit-nav.js
  xunay/kit/data     → kit-data.js
  xunay/kit/upload   → kit-upload.js
  xunay/kit/editor   → kit-editor.js
  xunay/kit/editor2  → kit-editor2.js
  xunay/kit/overlay  → kit-overlay.js
  xunay/kit/file     → kit-file.js
  xunay/kit/layout   → kit-layout.js
  xunay/kit/charts   → Kit/charts/index.js
  xunay/kit/virtual  → kit-virtual.js
# 未在 exports 单独注册（只能从 xunay/kit 全量入口拿）：
  kit-data2   (Carousel/Image/VirtualTable/Kanban/Gantt/QRScanner)
  kit-display2(Typography/Comment/Watermark/Ribbon/Code/Keyboard/Highlight/Ellipsis)
  kit-editor2 (Markdown/JSONViewer/DiffViewer/Terminal/CommandPalette/ContextMenu)
  kit-file    (Upload/FileList/Dropzone/FilePreview)
  kit-form2   (ColorPicker/Slider/Mentions/Transfer/Cascader)
  kit-nav2    (Menu/Anchor/BackTop/Collapse)

[KIT-UI]
# xunay/kit/ui → core/src/Kit/ui/index.js（barrel）
ui/base.js:     Btn Row Col Text Divider Space Card Tag Badge
ui/form.js:     Input Textarea Select Checkbox Radio Switch NumberInput DatePicker TimePicker SearchInput PasswordStrength Rate useForm
ui/form2.js:    ColorPicker Slider Mentions Transfer Cascader
ui/display.js:  Alert Modal Spinner Empty Progress Avatar Result Skeleton Count Stat Descriptions ItemCard QRCode
ui/display2.js: Typography Comment Watermark Ribbon Code Keyboard Highlight Ellipsis
ui/nav.js:      Tabs Breadcrumb Pagination Steps Accordion
ui/nav2.js:     Menu Anchor BackTop Collapse
ui/data.js:     Table List Timeline Tree TreeSelect Calendar SplitPane
ui/data2.js:    Carousel Image VirtualTable Kanban Gantt QRScanner
ui/overlay.js:  Tooltip Popover Dropdown Drawer Popconfirm Message Notification Tour
ui/layout.js:   Layout Grid Flex Affix
ui/upload.js:   DragUpload ImageUpload
ui/file.js:     Upload FileList Dropzone FilePreview
ui/editor.js:   CodeEditor RichText CopyButton useHotkey SplitButton
ui/editor2.js:  Markdown JSONViewer DiffViewer Terminal CommandPalette ContextMenu
ui/virtual.js:  VirtualList Sortable InfiniteList
ui/hooks.js:    usePopup
ui/util.js:     px cx
# kit/ui vs kit：
#   kit/ui 无 charts；多 hooks.js(usePopup)
#   kit    含 charts(BarChart/LineChart/PieChart/Sparkline) + svg + icon

[UI-SIGNATURES]
Btn(props, ...children)
  props: type 'default'|'primary'|... | size ''|'sm'|'lg' | block bool | disabled bool|fn | onClick | icon node
Card(props, ...children)
  props: title | desc | footer | flat bool | hover bool
Tag(props, ...children)
  props: type 'primary'|'success'|'warning'|'danger'|'info' | variant 'solid'|'outline'
Divider(props)
  props: text
Row(props, ...children)
  props: gap 0-6 | align | justify | wrap
Col(props, ...children)
  props: gap | align
Text(props, ...children)
  props: size | dim | bold | center | tag 'p'|'span'|'h1'..|'a'|'code'|'pre'
Space / Badge: 见 core/src/kit.js

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

[API-ICONS]
# core/src/Kit/icons.js + icons-data/ —— 2001 个 SVG 图标
entry:core/src/Kit/icons.js
data:core/src/Kit/icons-data/icons.js
data-batch:core/src/Kit/icons-data/batch5.js
import:import { IconHome, IconUser } from 'xunay/kit/icons'
import-dynamic:import { Icon } from 'xunay/kit/icons'
count:2001
source:
  手绘核心:123          导航/操作/媒体/文件/通讯等常用语义
  手绘扩展:约500        乐器/化学/天文/医疗/海洋/动物/食物/服饰/棋牌/工具/建筑/交通/文具/家居/科技/军事/科学仪器/办公/UI/天气
  程序化:约700          多边形/星形/时钟/徽章/字母/数字/方向箭头/进度环/网格/虚线/波浪/圆点/同心圆/射线/缺口环/圆角矩形/分割圆/仪表
  领域补足:约680        多批手写 + 批量导入

用法:
  # 命名导入（tree-shaking最优）
  import { IconHome, IconUser, IconArrowRight } from 'xunay/kit/icons'
  IconHome({ size: 24, color: '#3b82f6' })

  # 动态导入（全部打包）
  import { Icon, iconNames } from 'xunay/kit/icons'
  Icon({ name: 'home', size: 24 })

  # 查询
  import { iconNames, hasIcon, searchIcons } from 'xunay/kit/icons'
  iconNames()               // 2001 个名称
  searchIcons('arrow')      // 筛选

  # 自定义
  import { registerIcon, unregisterIcon } from 'xunay/kit/icons'
  registerIcon('my-logo', '<path d="..."/>')

导出:
  IconHome, IconUser, ...   2001 个命名导出（Icon<Name> 格式）
  Icon(props)               动态组件（按 name 查表）
  iconNames()               返回全部名称数组
  hasIcon(name)             检查是否存在
  searchIcons(query)        模糊搜索
  registerIcon(name, body)  注册新图标
  unregisterIcon(name)      移除
  icons                     原始对象（name -> svg body 字符串）

命名规则:
  home          -> IconHome
  arrow-right   -> IconArrowRight
  file-js       -> IconFileJs
  chess-king    -> IconChessKing
  badge-42      -> IconBadge42

组件 props:
  size:number               宽高（px），默认 20
  color:string              CSS 颜色，默认 currentColor
  stroke:number             描边宽度，默认 1.8
  style:string              额外内联样式
  class:string              额外类名

特性:
  - 零依赖（纯字符串拼接）
  - 2001 个图标全部有语义名
  - 命名导出，tree-shaking 后只留用到的
  - 支持动态 name 查表
  - SVG 24x24 网格
  - 描边式（stroke-based），颜色随 currentColor

数据格式:
  icons = {
    home: '<path d="M3 12l9-9..."/>',
    'arrow-right': '<path d="M4 12h16"/><path d="M13 5l7 7-7 7"/>',
    ...
  }

[API-CHARTS]
# core/src/Kit/charts/ —— 36 种零依赖 SVG 图表
entry:core/src/Kit/charts/index.js
types:core/src/Kit/charts/index.d.ts
import-all:import { LineChart, SankeyChart } from 'xunay/kit/charts'
import-one:import LineChart from 'xunay/kit/charts/line'
import-factory:import { createChart, chartTypes } from 'xunay/kit/charts'

基础6:
  line:LineChart                折线图 · 平滑/阶梯/面积/回归
  bar:BarChart                  柱状图 · 分组/堆叠/水平/负值
  area:AreaChart                面积图 · 堆叠/百分比/重叠
  pie:PieChart                  饼/环/玫瑰 · 扇区弹出
  scatter:ScatterChart          散点图 · 回归/气泡/四象限
  radar:RadarChart              雷达图 · 多边形/圆形网格

分布6:
  boxplot:BoxplotChart          箱线图 · 5数概括+IQR异常值
  violin:ViolinChart            小提琴图 · KDE核密度+箱线
  ridgeline:RidgelineChart      山脊图 · 多层KDE
  hexbin:HexbinChart            六边形分箱 · 双高斯
  calendar:CalendarHeatmap      日历热力 · GitHub风格
  wordcloud:WordcloudChart      词云 · 螺旋布局

层级6:
  treemap:TreemapChart          矩形树图 · squarified
  sunburst:SunburstChart        旭日图 · 多层环
  circlepack:CirclePackingChart 圆堆积 · 嵌套
  tree:TreeChart                树形图 · 可折叠
  icicle:IcicleChart            冰柱图 · 层级矩形
  marimekko:MarimekkoChart      马赛克图 · 宽柱堆叠

流向6:
  sankey:SankeyChart            桑基图 · 贝塞尔带
  chord:ChordChart              和弦图 · 双向流
  parallel:ParallelChart        平行坐标 · 轴刷选
  voronoi:VoronoiChart          泰森多边形 · 最近点
  network:NetworkChart          关系图 · 力导向+拖拽
  bump:BumpChart                凹凸图 · 排名变化

时间6:
  candlestick:CandlestickChart  K线图 · 影线+MA均线
  gantt:GanttChart              甘特图 · 依赖箭头+今天线
  waterfall:WaterfallChart      瀑布图 · 涨跌连接
  slope:SlopeChart              斜率图 · 前后对比
  dumbbell:DumbbellChart        哑铃图 · 变化量
  lollipop:LollipopChart        棒棒糖图 · 从基线延伸

进阶6:
  waffle:WaffleChart            华夫图 · 百分比格子
  bullet:BulletChart            子弹图 · KPI vs 目标
  stream:StreamChart            流图 · 主题河流
  funnel:FunnelChart            漏斗图 · 转化率
  gauge:GaugeChart              仪表盘 · 阈值分段
  heatmap:HeatmapChart          热力图 · 色阶渐变

通用选项:
  width:number|null             宽度，null=撑满容器
  height:number                 高度，默认340
  padding:number|{top,right,bottom,left}
  title:string                  标题
  subtitle:string               副标题
  theme:'light'|'dark'          主题
  colors:string[]               调色板
  legend:boolean                显示图例
  tooltip:boolean               显示提示
  animation:{duration,easing,stagger}
  onHover:(payload)=>void       悬停回调

通用方法:
  setData(data)                 替换数据，自动重绘
  setOptions(opts)              更新配置，自动重绘
  render({animate})             手动重绘
  replay()                      重播入场动画
  destroy()                     销毁，解绑监听

特性:
  - 零依赖（无D3/echarts）
  - 纯SVG矢量渲染
  - 深色/浅色双主题
  - ResizeObserver响应式
  - 入场动画可配置
  - tree-shaking友好
  - 部分图表支持键盘导航
  - Voronoi用Sutherland-Hodgman手写实现

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
  - 36 个图表（见 API-CHARTS，core/src/Kit/charts/）
  - 228 个 anim-* 动画（见 ANIM-INVENTORY）
note:各模块路径统一为 core/src/<name>.js，导出入口 core/src/<name>-entry.js

[API-REACT-COMPAT]
# React 兼容层：以 core/src/react-compat.js 为实现依据
# 注意：导出 API 不等于完整 React 行为兼容
entry:core/src/react-compat.js
kind:compatibility-layer
goal:让 React 风格组件与 Hooks 能够在 XuNay 运行时中使用
principle:优先保证正确性、可预测性和清晰的兼容边界，不为追求 API 数量伪造兼容

[REACT-COMPAT-ELEMENT]
createElement(type, props, ...children)
cloneElement(element, props, ...children)
isValidElement(value)
Fragment
Children
jsx(type, props, key?)
jsxs(type, props, key?)
jsxDEV(type, props, key?, isStaticChildren?, source?, self?)

[REACT-COMPAT-HOOKS]
useState(initial)
useEffect(create, deps?)
useLayoutEffect(create, deps?)
useMemo(create, deps)
useCallback(callback, deps)
useRef(initial)
useReducer(reducer, initialArg, init?)
useContext(context)
useImperativeHandle(ref, create, deps?)
useId()
useDebugValue(value, format?)
useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?)
useInsertionEffect(create, deps?)
useTransition()
useDeferredValue(value)
useOptimistic(value, reducer?)

[REACT-COMPAT-CONTEXT]
createContext(defaultValue)
memo(component, compare?)
forwardRef(render)
lazy(loader)
Suspense
StrictMode

[REACT-COMPAT-CLASS]
Component
PureComponent
note:必须分别验证类组件更新、props/state、生命周期和浅比较语义
note:PureComponent 只有在实现并验证浅比较后，才能声明具备 PureComponent 语义

[REACT-COMPAT-DOM]
createRoot(container, options?)
hydrateRoot(container, initialChildren, options?)
render(element, container, callback?)
unmountComponentAtNode(container)
findDOMNode(component)
createPortal(children, container, key?)
flushSync(fn)
act(callback)
startTransition(scope)
unstable_batchedUpdates(fn)
unstable_renderSubtreeIntoContainer(parentComponent, element, container, callback?)
createFactory(type)

[REACT-COMPAT-DEFAULT]
default React object
note:默认导出与命名导出必须保持一致
note:JSX runtime 导出必须与 package.json exports 和实际构建产物一致
note:新增或删除导出时同步更新 API 测试和文档

[REACT-COMPAT-SEMANTICS]
rule1:区分 API 存在、基本功能可用、React 语义兼容三个等级
rule2:未实现的语义不得仅通过同名 API 暗示已经兼容
rule3:Hooks 必须验证首次渲染、依赖变化、卸载清理和重复更新
rule4:Context 必须验证默认值、Provider 嵌套和消费组件更新
rule5:ref 必须验证对象 ref、回调 ref、转发 ref 和卸载清理
rule6:Effects 必须验证执行时机、依赖比较、cleanup 顺序和卸载
rule7:DOM 更新必须验证属性覆盖、属性移除、事件替换和事件清理
rule8:Portal 必须验证实际 DOM 挂载位置、更新和卸载清理
rule9:Root 必须验证重复渲染、卸载和多个容器相互隔离
rule10:异步 API 必须验证 Promise、微任务、定时任务和 effect 队列的交互
rule11:StrictMode 不得在未实现对应行为时宣称具有完整 React StrictMode 语义
rule12:hydrateRoot 不得在清空后重新渲染的情况下宣称为真正的 hydration
rule13:startTransition 不得仅因延迟执行就宣称具备 React concurrent rendering 语义
rule14:PureComponent 不得在没有浅比较实现的情况下宣称等价于 React.PureComponent
rule15:act 必须验证异步回调、更新刷新和 effect 完成时机

[REACT-COMPAT-TESTS]
# 测试目录以仓库实际文件为准；新增测试不得替代已有测试
required:命名导出和默认导出完整性
required:JSX Runtime 的 jsx/jsxs/jsxDEV
required:createElement / cloneElement / Children
required:useState / useReducer / useMemo / useCallback
required:useEffect / useLayoutEffect / useInsertionEffect
required:useRef / useImperativeHandle / useId
required:useContext / createContext / memo / forwardRef / lazy
required:class Component / PureComponent
required:createRoot / render / unmount
required:createPortal / findDOMNode
required:flushSync / act / startTransition
required:异常处理与无效输入
required:依赖变化与 effect cleanup
required:多根节点、多容器和卸载后的资源清理
required:重复渲染、事件替换、属性删除和内存泄漏风险
required:React Compat 文档与实际导出的一致性

[REACT-COMPAT-TEST-POLICY]
rule1:测试必须断言可观察结果，不能只断言函数存在
rule2:异步测试必须等待实际更新完成，不得用固定延时掩盖调度错误
rule3:测试失败不得通过跳过、放宽断言或吞掉异常来伪造全绿
rule4:每个修复必须包含可复现的回归测试
rule5:行为不支持时应明确标注限制，不得把未覆盖当作通过
rule6:性能测试与正确性测试分离
rule7:兼容性测试应记录运行环境、测试命令和实际结果
rule8:全量测试通过后才能更新“已验证”状态

[AI-SPEC-MAINTENANCE]
purpose:本文件描述源码可证实的项目事实、API、限制和验证命令
rule1:修改公开 API 时，同步更新对应入口、package.json exports、测试和文档
rule2:修改 React Compat 时，同步检查 core/src/react-compat.js 及其测试
rule3:修改文档生成器时，同步检查 web/site/gen-docs.py、生成文档、docs-index 和 docs-nav
rule4:自动生成文件应修改其源定义，不得只手改生成产物
rule5:新增模块时记录入口路径、公开导出、依赖和测试路径
rule6:删除或废弃 API 时注明迁移方式和废弃状态
rule7:版本号只在真实发布或明确的版本变更时更新
rule8:update 日期表示本规范最后一次实际修改日期，不代表所有功能均已验证
rule9:性能数据必须记录环境、命令、样本规模和测量方法
rule10:禁止将计划实现、部分实现和已验证实现混写

[AI-SPEC-VERIFICATION]
syntax:python3 -c "from pathlib import Path; p=Path('web/AI.spec'); assert p.exists() and p.stat().st_size > 0; print('AI.spec OK')"
react-exports:node --check core/src/react-compat.js
docs-generator:python3 -m py_compile web/site/gen-docs.py
full-tests:npm test
full-verify:npm run verify
note:以上命令仅用于验证；是否通过以实际执行结果为准


# ═════════════════════════════════════════════════════════════
# ══════ Xuyg 极简语法规范（独立文件见 /xuyg.spec）══════
# ═════════════════════════════════════════════════════════════

[XUYG-OVERVIEW]
name: Xuyg
purpose: XuNay 极简语法编译器（编译期展开，运行时零开销）
entry: node ~/xunay/core/bin/Xuyg.js
principle: 只读 xuyc.js（内存替换），绝不修改磁盘上的 xuyc.js
output: 标准 JS（走原有 xuyc + esbuild 流程）
compiler: core/compiler4/
  - index.js     入口（needsCompile4 + compile4）
  - cpt.js       cpt / pag / dt 转换 + 隐式 return
  - sdu.js       sdu 模板 + @绑定 + vmodel + if + @media
  - builtins.js  20 个内置模板 + BUILTIN_CSS
  - event.js     @click / onClick 转换 + on 键合并
  - vmodel.js    vmodel 双向绑定（合并已有 on）
  - xuy.js       嵌套生成器 xuy Name = (tag, data, count).psc(...)

[XUYG-COMMANDS]
build:  node ~/xunay/core/bin/Xuyg.js build app.xuy --out dist
serve:  node ~/xunay/core/bin/Xuyg.js build app.xuy --out dist --serve 12343
open:   node ~/xunay/core/bin/Xuyg.js build app.xuy --out dist --serve 12343 --open
minify: node ~/xunay/core/bin/Xuyg.js build app.xuy --out dist --minify
dev:    node ~/xunay/core/bin/Xuyg.js dev app.xuy --out dist --port 12344
debug:  XUYG_DEBUG=1 node ~/xunay/core/bin/Xuyg.js build app.xuy --out dist
notes:
  - --serve 前台跑（SSH 断会死），长期跑用 nohup python3 -m http.server
  - --minify 会设 NODE_ENV=production

[XUYG-XUYG-JS]
# Xuyg.js 除了分流到 compiler4，还承载 3 个运行时 patch
entry: core/bin/Xuyg.js
mechanism: 读 xuyc.js 源码 → 内存字符串替换 → 写临时 .mjs → spawn
note: xuyc.js 磁盘文件未变（md5 一致），只在内存里被 patch

3 个 patch:
  1. collectCss 跳过 node_modules_xunay
     from: "  'node_modules', '.git', '.craft', '.xunay-cache',"
     to:   "  'node_modules', 'node_modules_xunay', '.git', '.craft', '.xunay-cache',"
     作用: 消除 110 个 node_modules_xunay/*.css 污染 <link>
  2. autoKitUI 短路（不再生成重复的 kit-ui.css）
     from: ';(function autoKitUI() {'
     to:   ';if (false) (function autoKitUI() {'
     作用: 避免 356K 冗余产物（ui.css 已包含全部 kit 样式）
  3. cssTag 过滤
     from: "const cssTag = cssLinks.map(l => '<link rel=\"stylesheet\" href=\"" + l + "\">')"
     to:   "const cssTag = cssLinks.filter(l => !l.includes('node_modules') && !l.includes('/css.old/') && !l.includes('/ui_old/') && !l.includes('/core/src/Kit/ui/css')).map(l => '<link rel=\"stylesheet\" href=\"" + l + "\">')"
     作用: 兜底，未来任何怪目录都不进 <head>

幂等性: 已经 patch 过（to 已存在）→ 打印"补丁已存在，跳过"；from 找不到 → 报错退出
效果: index.html 从 113 个 <link> → 2 个（tw.css + ui.css）；CSS 请求量从 386K+ → 115K

[XUYG-DETECT]
# needsCompile4(source) 实际逻辑：
# 1. maskNonCode(source) —— 先把注释/字符串换成空白
# 2. 对"纯代码结构"跑 4 条正则
- /(^|[\s;{}()])(cpt|pag|dt)\s+[A-Za-z_$][\w$]*\s*\(/m
- /(^|[\s;{}()])xuy\s+[A-Za-z_$][\w$]*\s*=/m
- /\bsdu\s*<\s*[^>\n]+\s*>\s*[A-Za-z_$][\w$]*/m          （sdu<N> 自定义）
- /\bsdu\s+(NavBar|Hero|...|Form)\s*\(/m                     （sdu 20 个内置组件）
# 注释 / 字符串里的 cpt/sdu 关键词【不触发】
# 不命中 → 走原 xuyc（旧代码零影响）

[XUYG-KEYWORDS]
# 4 个关键字，全部编译期转成 export function

cpt: 组件
  cpt Card(p) { div({ class: 'card' }, p.title) }
  → export function Card(p) { return div({ class: 'card' }, p.title) }
  规则：最后一句是【表达式】→ 自动 return；是【语句/声明】→ 不返回

pag: 页面（路由扫描 + 参数自动传）
  pag Home() { div(null, ...) }
  pag User(id) { div(null, id) }  ← 路由 /user/:id 时 id 自动注入
  → export function Home() { ... }

dt: 数据模板（生成假数据）
  dt goods(12) {
    id: seq
    name: '商品 ' + seq
    price: rand(99, 9999)
    orig: price + 100            ← 可引用上面字段
    img: '/p/' + seq + '.jpg'
  }
  → 调用 goods(12) 生成 12 条数组
  内置变量：seq（自增序号）/ rand(a,b) / pick([...]) / price（已定义的字段）
  数量语义：
    dt goods()     → 默认 20 条
    dt goods(0)    → 全部（默认 100 条上限）
    dt goods(5)    → 5 条
    dt goods(n)    → 用变量 n 作数量

xuy: 嵌套生成器（xuy Name = (tag, data, count).psc(...)）
  xuy Home = (div, $LIST, 12)
  xuy Feeds = (div, $feed, 3).psc(article, items, 5)
  → export function Home() { return ($LIST).slice(0, 12).map(i => div(i)) }
  → 数据源：$VAR 全局 / cVAR 全局 / 无前缀 = 从父项取字段

sdu: 模板调用（批量生成 + 数据绑定）
  格式 1（内置模板，无 <N>）：
    sdu NavBar({ brand: 'ShopX', search: '搜索' })
    sdu GoodsList({ items: goods(12) })
    sdu Empty()  → 无参数
  
  格式 2（自定义模板，带 <N>）：
    sdu<4> GoodsCard($goods)({
      img: @img              ← @字段 取当前项
      h3: @name
      p: '¥' + @price        ← 表达式里也能用 @
      span: { text: @name, c:'x' }
    })
  数量：sdu<4> 生成 4 个；不写默认 1

[XUYG-BINDING]
# 三个前缀
$数据源    → 循环数组，如 $goods / $LIST / goods(12)
@字段     → 当前项的字段，如 @img / @name / @price
@全局     → 无数据源时查全局 signal / computed / 函数

查找规则：
  1. 有 $数据源 → 先查当前项字段
  2. 找不到 → 查全局

标签默认属性（写 @值 时自动对应）：
  img / video / audio / source  →  src
  h1~h6 / p / span / a          →  text
  input / textarea / select     →  value

属性简写：
  c: 'xxx'  →  class: 'xxx'
  i: 'xxx'  →  id: 'xxx'
  s: 'xxx'  →  style: 'xxx'

三档写法：
  最简：  h2: 'ShopX'
  中等：  h2: 'ShopX', c:'cbrand'
  完整：  h2: { text: 'ShopX', c: 'brand', onClick: fn }

[XUYG-EVENTS]
# 原生 vnode 和 sdu 里都支持

@click: fn            → on: { click: fn }
@click.stop: fn       → on: { click: (e) => { e.stopPropagation(); fn(e) } }
@click.prevent: fn    → on: { click: (e) => { e.preventDefault(); fn(e) } }
@click.stop.prevent   → 两个都有
@keydown: fn          → on: { keydown: fn }
@focus / @blur / @input / @change / @enter ...

onClick: fn           → on: { click: fn }（sdu 外也支持）

注意：多个 @xxx 在同一对象会合并成一个 on: {...}

[XUYG-VMODEL]
# 双向绑定（自动展开 value + on.input）

input({ vmodel: kw })              → input({ value: () => kw(), on: { input: (e) => kw(e.target.value) } })
input({ vmodel: kw, on: {...} })   → 合并：value + on: {...已有, input: ...}

支持：input / textarea / select / checkbox / radio

[XUYG-IF]
# 条件渲染（在 sdu 里）

sdu<4> Card($goods)({
  if: hasData()              ← 为 false 时整块不渲染
  h3: @name
})
编译成：
  ((function(){ var _c = (hasData()); if (!_c) return null; return (function(){...})() })())

[XUYG-MEDIA]
# 响应式（在 sdu 里）

sdu<4> Card($goods)({
  @media (max-width: 600px): { width: 100%; margin: 8px 0; display: block; }
  h3: @name
})
编译：注入 <style id="sdu-xxx-css"> 到 head
可多个 @media

[XUYG-BUILTINS]
# 20 个内置模板（编译期内联展开，零运行时）

NavBar({ brand, search, ops })           → 顶栏
Hero({ slides, index })                  → 轮播（只显示当前）
CateGrid({ items })                      → 分类网格
GoodsCard({ item })                      → 商品卡
GoodsList({ items })                     → 商品列表
SeckillBar({ title, sec })               → 秒杀条
Footer({ cols, copy })                   → 页脚
SideBar({ items })                       → 侧边浮窗
StatCard({ label, value })               → 统计卡
StatRow({ items })                       → 统计行
UserCard({ item })                       → 用户卡
UserRow({ item })                        → 用户行
ListItem({ title, desc, icon })          → 列表项
Tabs({ items, model })                   → 标签页
Breadcrumb({ items })                    → 面包屑
Empty({ icon, text })                    → 空状态
Loading({ text })                        → 加载中
Table({ rows, cols })                    → 表格
Modal({ title, open })                   → 弹窗
Form({ fields })                         → 表单

# 用了任何内置模板 → 编译产物自动注入 BUILTIN_CSS

[XUYG-CHARTS]
# 用 kit/charts（36 种图表）

# Node 环境下可直接用 subpath（core/package.json 有 ./kit/charts/* exports）
import LineChart from 'xunay/kit/charts/line'
import BarChart  from 'xunay/kit/charts/bar'
import PieChart  from 'xunay/kit/charts/pie'

# ⚠️ esbuild 打包注意（xuyg-test 实测）
# esbuild 0.x（老版本）解析 subpath 时可能落到 ./kit/charts → index.js（只有命名导出），
# 报 `No matching export ... for import "default"`
# 两种安全写法：
#   A) 命名导出（esbuild/Node 都能用，index.js 也有 LineChart 命名导出）
#      import { LineChart } from 'xunay/kit/charts'
#   B) 完整源码路径（class 真身，走 default）
#      import LineChart from 'xunay/core/src/Kit/charts/line.js'
# 实测 xuyg-test 用 B 最稳（Compiler4 走源码级，绕过 xuyc 的 alias 重写）

# 封装组件推荐（每个项目写一次）
cpt ChartBox(Ctor, optsFn) {
  div({
    style: 'width:100%;height:280px;position:relative',
    ref: (el) => {
      if (!el || el.__c) return
      el.__c = true
      try {
        const c = new Ctor(el, { height: 280, legend: false, tooltip: true, ...optsFn() })
        c.replay && c.replay()
      } catch (e) { el.textContent = '图表加载失败: ' + e.message }
    }
  })
}

# 用法
ChartBox(LineChart, () => ({
  mode: 'smooth', area: true,
  colors: ['#667eea'],
  series: [{ name: '销量', data: [
    { label: '1月', value: 120 }, { label: '2月', value: 200 }
  ]}]
}))

# 图表通用选项
width, height, padding, title, subtitle, theme:'light'|'dark', colors,
legend:boolean, tooltip:boolean, animation:{duration,easing,stagger},
onHover, onBarClick / onPointClick

# 图表通用方法
setData(data), setOptions(opts), render({animate}), replay(), destroy()

# 关键坑
1. 数据源必须用【模块级常量】，不能在 cpt/pag 里现调 goods(4)
   ❌ pag Home() { ...goods(4).map(...) }  ← 每次渲染新数组 → effect 死循环
   ✅ const LIST = goods(24)  在模块顶层
      pag Home() { ...LIST.map(...) }

2. 渲染函数（pag/cpt）里【只读 signal，不写】
   ❌ pag List(c) { if (c) cat(c); ... }   ← 写 signal → 死循环
   ✅ export function setCat(c) { cat(c) }  在外面调

3. 图表的容器必须有【高度】
   ❌ div({ class: 'chart' }, ChartBox(...))  ← 容器高度 0 → 画不出来
   ✅ div({ style: 'height:280px' }, ChartBox(...))

4. LineChart 数据格式是 series 数组：
   { series: [{ name: 'x', data: [{label,value}] }] }
   不是 { data: [{label,value}] }

[XUYG-COMPLETE-EXAMPLE]
# pages/home.xuy —— 完整电商首页

import { div, h2, a, img, input, span } from 'xunay/tags'
import { s, computed, show } from 'xunay'
import LineChart from 'xunay/kit/charts/line'

// ── 数据（模块级常量）──
dt banner(3) {
  title: pick(['618 大促', '新品首发', '会员日'])
  sub:   pick(['5 折起', '免运费', '满减'])
  bg:    pick(['linear-gradient(135deg,#667eea,#764ba2)', 'linear-gradient(135deg,#f6d365,#fda085)'])
}

dt goods(12) {
  id:    seq
  name:  pick(['iPhone', 'AirPods', '小米手环', '扫地机']) + ' ' + seq
  price: rand(99, 9999)
  sales: rand(100, 9999)
  hue:   rand(0, 360)
  img:   'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="hsl(' + hue + ',55%,82%)"/></svg>'
}

const BANNERS = banner(3)
const LIST    = goods(12)

// ── 状态 ──
const kw   = s('')
const cart = s([])
const bi   = s(0)
setInterval(() => bi((bi() + 1) % 3), 4000)

function addCart(g) { cart([...cart(), g]) }

// ── 组件 ──
cpt TopBar() {
  div({ class: 'topbar' },
    div({ class: 'brand', onClick: () => go('/') }, 'ShopX'),
    input({ class: 'search', vmodel: kw, placeholder: '搜索商品' }),
    div({ class: 'cart', onClick: () => go('/cart') }, '🛒', () => String(cart().length))
  )
}

cpt GoodsCard(g) {
  div({ class: 'goods', onClick: () => go('/p/' + g.id) },
    img({ src: g.img, alt: g.name }),
    h3(null, g.name),
    div({ class: 'price' }, '¥' + g.price),
    div({ class: 'btn', '@click.stop': () => addCart(g) }, '加入购物车')
  )
}

// ── 页面 ──
pag Home() {
  div(null,
    TopBar(),
    div({ class: 'banner', style: () => 'background:' + BANNERS[bi()].bg },
      h1(null, () => BANNERS[bi()].title),
      p(null, () => BANNERS[bi()].sub)
    ),
    h2(null, '🔥 商品'),
    div({ class: 'goods-grid' },
      ...LIST.map(g => GoodsCard(g))
    ),
    ChartBox(LineChart, () => ({
      mode: 'smooth', area: true,
      series: [{ name: '销量', data: [
        { label: '1月', value: 120 }, { label: '2月', value: 200 },
        { label: '3月', value: 180 }, { label: '4月', value: 260 }
      ]}]
    }))
  )
}

[XUYG-SDU-EXAMPLE]
# 自定义 sdu 模板 + 用法

// 用 dt 造数据
dt user(3) {
  id: seq
  name: pick(['张三', '李四', '王五'])
  role: pick(['管理员', '编辑', '访客'])
  hue: rand(0, 360)
}

const USERS = user(3)

pag List() {
  div(null,
    // 用 sdu<N> 循环生成
    sdu<3> UserCard($USERS)({
      if: USERS.length > 0            ← 条件
      @media (max-width: 600px): { width: 100%; }
      div.avatar: { text: @name[0], s: 'background:hsl(' + @hue + ',60%,70%)' }
      div.name: @name
      div.role: @role
      span.btn: { text: '查看', c: 'btn', '@click.stop': () => alert(@name) }
    })
  )
}

# 说明：
# - `$USERS` 是数据源
# - `@name` / `@hue` / `@role` 从当前项取字段
# - `div.avatar:` 是 div 标签，class 为 avatar
# - `span.btn: {...}` 属性对象形式（text/c/事件）
# - `@click.stop: fn` 事件修饰符

[XUYG-STRUCTURE]
# 一个标准 Xuyg 项目
project/
├── app.xuy              入口（import 各页 + mount）
├── package.json         "type": "module" + xunay 依赖
├── src/
│   ├── data.xuy         数据（dt + 导出的常量）
│   ├── store.xuy        全局状态（s / computed / 函数）
│   ├── components/      组件（cpt）
│   │   ├── TopBar.xuy
│   │   ├── GoodsCard.xuy
│   │   └── Chart.xuy    ChartBox 封装
│   └── pages/           页面（pag）
│       ├── home.xuy
│       ├── list.xuy
│       ├── detail.xuy
│       ├── cart.xuy
│       ├── checkout.xuy
│       ├── orders.xuy
│       ├── user.xuy
│       └── ...
└── dist/                编译产物

[XUYG-ROUTING]
# 路由由 scan-pages.js 自动扫描 src/pages/*.xuy
# 文件名 → 路由
pages/home.xuy      → /home
pages/user/index.xuy → /user
pages/[id].xuy      → /:id
pag Detail(id)      → 参数 id 自动从路由拿

# 手动分发（app.xuy）
import { route } from './src/store.xuy'
import { Home } from './src/pages/home.xuy'
import { Detail } from './src/pages/detail.xuy'

mount(() => div(null, () => {
  const r = route()
  if (r === '/' || r === '') return Home()
  if (r.startsWith('/p/')) return Detail(r.slice(3))
  return Home()
}), '#app')

[XUYG-ANTIPATTERNS]
# 常见错误

❌ 在 pag/cpt 里调 dt 函数
   pag Home() { ...goods(4).map(...) }
   → 每次渲染新数组 → effect 死循环
   ✅ 模块级 const LIST = goods(24)

❌ 在 pag/cpt 里写 signal
   pag List(c) { if (c) cat(c) }
   → 写 signal 触发重渲染 → 死循环
   ✅ export function setCat(c) { cat(c) }，在 app.xuy 里调

❌ 图表容器无高度
   div(null, ChartBox(...))
   ✅ div({ style: 'height:280px' }, ChartBox(...))

❌ LineChart 传 data 而不是 series
   LineChart(el, { data: [...] })
   ✅ LineChart(el, { series: [{ name, data: [...] }] })

❌ sdu 引用不存在的字段
   sdu<4> Card($goods)({ xxx: @notexist })
   → 运行时 undefined

❌ 忘了 mount 是响应式函数
   mount(() => { if (route()==='/') return Home() })   ← 只跑一次
   ✅ mount(() => div(null, () => { if (route()==='/') return Home() }))

❌ 图片 404 触发 xuyc 内置错误捕获清屏
   → Xuyg 已自动修：只在 e.error 存在时才显示错误
   → 用 data:image/svg+xml 内联图避免 404

[XUYG-BEST-PRACTICES]
1. 数据一律模块级常量，如 const LIST = goods(24)
2. 渲染函数（pag / cpt）只读 signal，不写
3. 状态变更用独立函数（export function setXxx / addCart / go）
4. 图表容器必须有固定高度
5. ChartBox 封装成一次，全项目复用
6. 用 dt 造假数据，用 data:image/svg 造占位图
7. 组件拆小（TopBar / GoodsCard / Chart 各一个文件）
8. app.xuy 只负责路由分发，不写业务

[XUYG-LIMITS]
- 不支持 JSX
- 不支持 TypeScript 类型注解
- sdu 的 if 只支持一个条件
- sdu 的 @media 只支持 media query（不写 CSS 全量）
- 不支持自定义 sdu 模板声明（只能用内置 + sdu<N> 匿名）
- 增量编译未实现（每次全量）
- 图表必须手写 ChartBox 包装（未内置到 sdu）

[XUYG-FIXES]
# 已修 bug
1. dt 字段引用（orig: price + 100 → row.price + 100）
2. 隐式 return 保留缩进
3. sdu 结尾 `)` 消费
4. sdu 数据源调用（`typeof fn === 'function' ? (fn.__xunay_signal ? fn() : fn(n)) : fn`）—— signal 走 `()` 取值，普通函数走 `(n)` 传 count
5. sdu if / @media 逗号表达式
6. 多个 @xxx 合并 on 键
7. vmodel 合并已有 on
8. img 404 触发清屏（e.error 过滤）

