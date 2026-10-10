那个 README 内容过时了（7.2 说 `select` 未支持、7.3 说 CSS P3 未实现、7.5 说 `.glb`/阴影/后处理未实现、7.7 说 CLI 未统一——**今天全做完了**）。直接给最新的：

```powershell
cd E:\xunay
@'
# xunay Android 后端：.xuy → Java 原生

> 记录 `.xuy → Android 原生 APK`（UI 路 + 3D 老路 + 3D Filament 路）的完整状态。
> 最后更新：2026-10-07

---

## 一、项目理解

### 1.1 xunay 是什么

`E:\xunay` 是**自研前端框架 monorepo**（`xunay-monorepo`）：

| 组成 | 位置 | 作用 |
|---|---|---|
| 编译器 | `compiler2/` | `.xuy` → JS（tokenizer / parser / gen / runtime） |
| 运行时 | `core/src/` | signals / computed / effect / onMount / router / i18n / http / rpc / auth |
| UI Kit | `core/src/kit-*.js` | 100+ 组件 |
| DevTools | `core/src/devtools.js` | 控制台 / 网络 / 性能 / 信号面板 |
| 多端 | `android/`、`android-3d/`、`android-3d-filament/` | UI / 3D 老路 / 3D Filament 新路 |
| 后端 | `backend/`、`backends/{python,go,cpp,node}` | 一套接口四种实现 |
| 文档站 | `site/` | 用 `.xuy` 自己写自己（317 篇） |

`.xuy` 是自研 DSL，本质是 **JS 子集 + 约定函数名**（`signal` / `computed` / `show` / `div`…）。

### 1.2 三条独立的路

| | `android/` | `android-3d/` | `android-3d-filament/` |
|---|---|---|---|
| 用途 | UI 应用（表单 / 列表 / 路由） | 3D 场景（老路） | 3D 场景（新路） |
| 入口 | `bin/xuyc-android.js` | `bin/xuyc-3d.js` | `bin/xuyc-filament.js` |
| 统一入口 | `bin/xuyc.js --target=ui` | `--target=3d` | `--target=filament` |
| 输出目录 | `build/android` | `build/android-3d` | `build/filament` |
| 包名 | `com.xunay.app` | `com.xunay.gl` | `com.xunay.filament` |
| 渲染 | Android View | OpenGL ES 2.0（手写） | Filament 1.51.6 |
| 模型 | — | 只 `.obj` | glTF 2.0（含 Draco） |
| DSL | signal / computed / show / 事件 / CSS | scene / 7 形状 / 灯光 / 材质 | 同左 + `model(.gltf)` + 粒子 / 音效 |

### 1.3 关键技术事实

**Web 端和 Android 端是两套完全独立的实现：**

| | Web 端 | Android 端 |
|---|---|---|
| 运行方式 | 浏览器 JS 引擎 | **静态翻译**成 Java 源码，编译成 APK |
| xunay 库 | 运行时依赖 | **不存在** |
| 外部 npm 库 | `import` 直接用 | **完全不可用**，只能手写 Java 等价 |
| 支持语法 | 浏览器支持多少就多少 | **只支持 gen.js / js-to-java.js 写好的规则** |

**acorn 的角色**：只做解析（文本 → AST），不做翻译。翻译靠手写（约 1500 行 `js-to-java.js`）。**没有现成的 JS→Java 转译器，全世界都缺。**

---

## 二、转换链路

### 2.1 UI 路

```
.xuy 源码
    ↓  parser.js（acorn 解析成 ESTree，再转自定义 AST）
自定义 AST
  { type: 'tag', name, props, children }
  { type: 'text', expr }
  { type: 'dyn', expr, ast, isArrow }
  { type: 'show', cond, condAst, child }
  { type: 'list', arr, render }
  { type: 'raw', pageName, node }  ← 多页
    ↓  gen.js + js-to-java.js + css-android.js
Java + XML + Gradle（7 个文件）
    ↓  gradlew assembleDebug
APK
    ↓  adb install / am start
设备运行
```

### 2.2 3D 老路

```
.xuy 源码
    ↓  parser.js
scene 对象 { scene / camera / lights / objects }
    ↓  gen.js + 4 个 Java 模板
Java + Shader + Gradle
    ↓  gradlew assembleDebug
APK
```

### 2.3 3D Filament 新路

```
.xuy 源码
    ↓  parser.js
IR { scene / camera / lights / nodes / audios }
    ↓  gen-gltf.js
glTF 2.0（JSON + scene.bin + 纹理引用 + animations）
    ↓  gen.js + MainActivity.java.tpl
Java + glTF + scene.bin + 纹理 + 音频 + gradle wrapper + envs
    ↓  gradlew assembleDebug
APK
```

**一条命令走完**：

```powershell
node bin\xuyc-filament.js examples\scene-anim.xuy --out build\filament --build --install
```

### 2.4 核心模块

| 文件 | 职责 | 行数 |
|---|---|---|
| `bin/xuyc-android.js` | UI 路 CLI（含 wrapper 自动补 + 字体打包） | ~160 |
| `bin/xuyc-3d.js` | 3D 老路 CLI | ~60 |
| `bin/xuyc-filament.js` | 3D Filament 路 CLI（纹理/model/audio 扫描 + 远程下载 + assets 打包） | ~260 |
| `bin/xuyc.js` | Web 编译器 + `--target` 分发 | ~330 |
| `android/src/parser.js` | `.xuy` → 自定义 AST | ~400 |
| `android/src/gen.js` | AST + CSS → Java/XML/Gradle | ~2600 |
| `android/src/css-android.js` | CSS → 布局决策 | ~520 |
| `android/src/js-to-java.js` | JS 表达式 → Java（含类型推断） | ~1600 |
| `android-3d/src/parser.js` | 3D DSL → scene 对象 | ~80 |
| `android-3d/src/gen.js` | scene → Java + Shader | ~600 |
| `android-3d-filament/src/parser.js` | `.xuy` → IR | ~100 |
| `android-3d-filament/src/gen-gltf.js` | IR → glTF 2.0（7 形状 + UV + PBR + Draco + animations + 实例化 + 粒子） | ~900 |
| `android-3d-filament/src/gen.js` | IR + glTF → MainActivity.java + 资源清单 | ~200 |
| `android-3d-filament/src/templates/MainActivity.java.tpl` | ModelViewer 模板（含后处理 / 粒子 / 音频 / 动画） | ~450 |

---

## 三、已完成（UI 路）

### 3.1 基础链路（100%）

- ✅ CLI 入口（含 wrapper 自动生成 + 从 `android-3d-filament/` 拷贝）
- ✅ 7 个文件生成（多页时 N 个 Activity + N 个 XML）
- ✅ Gradle 编译
- ✅ adb 卸载/安装/启动
- ✅ `run.ps1` 一键脚本
- ✅ release 签名从 `gradle.properties` 读

### 3.2 DSL 支持

| 语法 | 状态 |
|---|---|
| `s(x)` / `signal(x)` | ✅ |
| `app()` / `mount()` | ✅ |
| `computed(fn)`（块体 + 单表达式） | ✅ |
| `show(() => cond, () => tag)` | ✅ |
| `list(() => arr, item => tag)` | ✅ 基础 |
| `page(name, fn)` 多页 | ✅ |
| `goto('page')` / `goto('page', {id: 1})` / `back()` | ✅ |
| `param('key')` 路由传参读取 | ✅ |
| `effect(fn)` | ✅ |
| `onMount` / `onUnmount` | ✅ |
| `ref()` | ✅ |
| 自定义组件（箭头 + function 声明） | ✅ |
| `txt\`...${sig}...\`` | ✅ |

### 3.3 事件

| 事件 | 生成 |
|---|---|
| `on.click` | setOnClickListener |
| `on.input` | TextWatcher.afterTextChanged |
| `on.change` | OnCheckedChange / OnSeekBarChange / Spinner.OnItemSelected |
| `on.submit` | form + button type=submit 自动绑 |
| `on.blur` / `focus` | setOnFocusChangeListener（合并处理） |
| `on.keydown` / `keyup` | setOnKeyListener |
| `on.scroll` | setOnScrollChangeListener |
| `on.mousedown/up` / `touchstart/end` | setOnTouchListener |

### 3.4 属性

静态 class / 条件动态 class / 模板拼接 class / 静态 style / 动态 style（width% + display）/ `value:` 双向 / `disabled:` / `placeholder` / `src` / `type` / `href` / `alt` / `title` / `name` / `max` / `readonly` / `required` / `autofocus` / `checked`

### 3.5 CSS（约 70 项）

**尺寸 / 边距**：`width` / `height`（px/rem/em/%/vh/vw/wrap/match）、`padding` / `margin` 及四向单属性、`gap` / `row-gap` / `column-gap`（半分间距）

**颜色 / 背景**：`color` / `background` / `background-color` / `background-image`（linear-gradient 多色）/ `background-size`（cover / contain / 100% 100%）/ `background-position`（9 方向 + %）/ `border-radius` / `border` / `border-style`（solid / dashed / dotted）/ `outline`（stroke 方式）/ 3 位 / 6 位 / 8 位 hex / 命名色

**字体**：`font-size`（含 rem/em ×16）/ `font-weight` / `font-style` / `font-family`（含 `@font-face` 自定义 .ttf / .otf / .woff2 / .woff）/ `line-height` / `letter-spacing`

**文本**：`text-align` / `text-transform` / `text-decoration` / `text-overflow: ellipsis` / `text-shadow` / `white-space: nowrap` / `word-break: break-all`

**布局**：`display: flex` / `display: grid` / `flex-direction` / `flex-wrap` / `flex-grow` / `flex-shrink` / `align-items` / `align-self` / `align-content` / `justify-content` / `flex: N` / `grid-template-columns`（`repeat(N, 1fr)`）

**定位**：`position`（relative/absolute/fixed）/ `top` / `right` / `bottom` / `left` / `inset` / `z-index`

**视觉**：`opacity` / `visibility` / `box-shadow` / `transform`（rotate / scale / translate / skewX / skewY）/ `overflow: hidden`（真裁剪）/ `overflow-x/y` / `filter`（grayscale / brightness / contrast / saturate / invert / sepia / hue-rotate / blur）/ `backdrop-filter`

**动画**：`animation`（x-fade / x-scale / x-slide-up/down / x-skeleton）/ `@keyframes` 用户自定义

**媒体查询**：`orientation` / `min-width` / `max-width` / `prefers-color-scheme`

**选择器**：tag / class / id / `[attr=value]` / `:first-child` / `:last-child` / `:active`（按下变色/变淡）/ `::before` / `::after`

**变量**：`:root` + `var()` + `calc()`

### 3.6 JS 翻译器（js-to-java.js）

**语句（全通）：**

- `const / let / var` / `return` / `if-else` / `switch`
- `for` / `for...of` / `while` / `do-while` / `break` / `continue`
- `try-catch-finally` / `throw`
- `{ 块 }` / `x++` / `x--` / `x = ...` / `x += ...`

**表达式（全通）：**

- 字面量 / 标识符 / 模板字符串 / 三元
- 全部算术 / 比较 / 逻辑 / 位运算 / `**` / `typeof` / `instanceof` / `in`
- `!x` / `-x` / `delete` / `void`
- 成员访问 `.a.b` / `[i]` / `?.` / `??`
- 数组字面量 / 对象字面量 `{a:1}` / 属性访问
- TaggedTemplate（部分）
- 嵌套箭头函数（仅单层）

**内置对象：**

| 类别 | 支持 |
|---|---|
| Math | abs / floor / ceil / round / min / max / pow / sqrt / random / sign；常量 PI / E / LN2 / LN10 / SQRT2 / SQRT1_2 |
| Number | parseInt / parseFloat / isNaN / isInteger；常量 MAX_VALUE / MIN_VALUE / MAX_SAFE_INTEGER / POSITIVE_INFINITY / NEGATIVE_INFINITY / EPSILON |
| String | 25 个实例方法 + fromCharCode + 正则 replace / match |
| Array | map / filter / forEach / reduce / find / some / every / join / slice / concat / indexOf / includes / reverse / sort / from / isArray |
| Object | keys / values / entries |
| JSON | parse / stringify |
| Date | new Date() / Date.now() / getFullYear / getMonth / getDate / getHours / getMinutes / getSeconds / getDay / getTime |
| 其它 | setTimeout / setInterval / clearInterval / clearTimeout / fetch / console.log/warn/error |
| 路由 | goto / goto(obj) / back / param |

### 3.7 已验证端到端例子（UI 路）

| 例子 | 内容 |
|---|---|
| `counter.xuy` | signal + click + txt |
| `fetch.xuy` | 后台线程 fetch + 状态更新 |
| `form-validation.xuy` | computed + show + 双向绑定 + 动态 class/style + disabled + submit + i18n |
| `test-js.xuy` | Math / Number / String / Array 共 19 个表达式 |
| `test-loops.xuy` | for / while / do-while / break / continue |
| `test-switch-try.xuy` | switch / try-catch / throw |
| `test-array-lambda.xuy` | map / filter / reduce / find / some / every |
| `test-object.xuy` | 对象字面量 + 属性访问 |
| `test-optional.xuy` | ?. / ?? |
| `test-async.xuy` | async/await + fetch |
| `test-a8.xuy` | typeof / instanceof / in / 位运算 / ** |
| `test-a8plus.xuy` | JSON / Object.* / Array.from / Math 常量 / Date / replace / match |
| `test-lifecycle.xuy` | onMount / onUnmount |
| `test-effect.xuy` | effect |
| `test-ref.xuy` | ref + requestFocus |
| `test-storage.xuy` | localStorage 持久化（跨重启验证） |
| `test-theme.xuy` | setTheme 明暗切换 |
| `test-date.xuy` | Date 完整支持 |
| `test-router2.xuy` | page / goto / back 多页路由 |
| `test-router-params.xuy` | goto + param 路由传参 |
| `test-B-tags.xuy` | ul / ol / li / a + 8 种事件 |
| `test-B-attrs.xuy` | 静态属性 + 动态 style |
| `test-css-grad.xuy` | 多色渐变 + transform 扩展 |
| `test-css-kf.xuy` | @keyframes 动画 |
| `test-css-clip.xuy` | overflow:hidden 真裁 + outline |
| `test-bg-size.xuy` | background-size（cover / contain / 100%） |
| `test-bgpos.xuy` | background-position 9 方向 |
| `test-active.xuy` | :active 按下变色/变淡 |
| `test-font.xuy` | @font-face 自定义字体 |
| `test-css-p3.xuy` | max-width% + text-shadow |
| `test-filter-border.xuy` | filter 8 种 + dashed/dotted |
| `test-backdrop.xuy` | backdrop-filter |
| `test-select.xuy` | select / option 下拉框 |

共 **33 个例子全过**。

### 3.8 UI 路生成文件

```
app/src/main/java/com/xunay/app/MainActivity.java
app/src/main/java/com/xunay/app/Signal.java
app/src/main/res/layout/activity_main.xml
app/src/main/AndroidManifest.xml
app/build.gradle
settings.gradle
gradle.properties
```

多页时每个 `page(name, fn)` 生成独立 `XxxActivity.java` + `activity_xxx.xml`。

---

## 四、已完成（3D 老路）

### 4.1 DSL（8 个顶层函数）

| 函数 | 参数 |
|---|---|
| `scene({...})` | bg / autoRotate / camera: { distance, fov } / lights（最多 8 个） |
| `cube` | color / size / position |
| `sphere` | color / size / position / segments |
| `plane` | color / size / position |
| `cylinder` | color / size / height / position / segments |
| `cone` | color / size / height / position / segments |
| `torus` | color / radius / tube / position / segments |
| `pyramid` | color / size / height / position |
| `model` | src(.obj) / color / position / scale |

**逐物体变换**：`position` / `rotate` / `spin: { axis, speed }` / `bob: { amp, speed }` / `metalness` / `roughness` / `texture` / `texScale`

### 4.2 渲染管线

- OpenGL ES 2.0
- GLSurfaceView + Renderer
- 顶点 / 片元 shader（PBR-lite：Lambert + Blinn-Phong + 多光源 + 色调映射 + gamma 校正）
- 透视投影 + LookAt 相机
- 深度测试
- 全局自动旋转 + 手指拖拽旋转
- 逐物体独立 matrix
- OBJ 加载（v/f，自动算法线，面片三角化）
- 纹理 triplanar 投影
- 资源打包（.obj / .png 进 assets）

### 4.3 已验证 3D 例子（老路）

| 例子 | 内容 |
|---|---|
| `scene3d.xuy` | 立方体 + 球 + 自动旋转 |
| `scene-shapes.xuy` | 8 种形状一览 |
| `scene-anim.xuy` | 逐物体 spin / bob 独立动画 |
| `scene-pbr.xuy` | 双光源 + PBR 材质 |
| `scene-tex.xuy` | 纹理（棋盘 / 木纹 / 地砖） |

共 **5 个例子全过**。

### 4.4 生成文件

```
app/src/main/java/com/xunay/gl/MainActivity.java
app/src/main/java/com/xunay/gl/SceneRenderer.java
app/src/main/java/com/xunay/gl/ShaderUtil.java
app/src/main/java/com/xunay/gl/ObjLoader.java
app/src/main/AndroidManifest.xml
app/build.gradle
settings.gradle
gradle.properties
app/src/main/assets/*.obj
app/src/main/assets/*.png
```

---

## 五、已完成（3D Filament 新路）

### 5.1 能力对比

| 能力 | `android-3d/` | `android-3d-filament/` |
|---|---|---|
| 渲染 | 手写 OpenGL ES 2.0 | **Filament 1.51.6** |
| 模型 | 只 .obj | **glTF 2.0（含 Draco / .glb）** |
| 纹理 | triplanar 近似 | **真 UV** |
| 材质 | Lambert + Blinn-Phong | **metallicRoughness PBR** |
| 光照 | 固定 8 光源 | **DIRECTIONAL + IBL** |
| 阴影 | ❌ | **✅** |
| 骨骼动画 | ❌ | **✅** |
| 后处理 | ❌ | **✅ bloom / SSAO / FXAA / ACES+Filmic** |
| 粒子 | ❌ | **✅ 200+ 独立粒子** |
| 音效 | ❌ | **✅ MediaPlayer 池** |
| 远程加载 | ❌ | **✅ https:// 自动下载** |
| 模型归一化 | ❌ | **✅ normalize + targetSize** |
| 实例化 | ❌ | **✅ N 份 + spread** |
| 触摸 | 手写 onTouchEvent | **Manipulator ORBIT** |
| 依赖 | 零外部库 | 4 个 Filament jni |

### 5.2 DSL 支持

| 语法 | 状态 |
|---|---|
| `scene({ bg, camera, lights, autoRotate, ibl })` | ✅ |
| `scene({ shadows, bloom, ssao, aa, tonemap })` | ✅ |
| `camera: { distance, fov, center }` | ✅ 不填按 bbox 自动算 |
| `cube` / `sphere` / `plane` / `cylinder` / `cone` / `torus` / `pyramid` | ✅ |
| `model({ src, position, rotate, scale })`（外部 .gltf / .glb + .bin + 纹理） | ✅ |
| `model({ src: 'https://...' })` 远程加载 | ✅ |
| `model({ normalize: true, targetSize: 3 })` 归一化 | ✅ |
| `model({ count: 12, spread: 20, spreadY: 4 })` 实例化 | ✅ |
| `model({ anim: 2, animSpeed: 1.5 })` 多动画 + 速率 | ✅ |
| `particles({ count, spread, size, color, gravity, speed, life })` | ✅ |
| `audio({ name, src, autoplay, loop, volume })` | ✅ |
| Draco 压缩 glTF | ✅ 自动保留 `KHR_draco_mesh_compression` |
| glTF 自带动画（骨骼 / 节点变换） | ✅ 播所有 animation |
| `metalness` / `roughness` / `texture` / `texScale` | ✅ 真 UV |
| `spin` / `bob` / `rotate` | ✅ |
| 程序化几何体 + 外部 model + 粒子 混放 | ✅ |

### 5.3 CLI

```powershell
node bin\xuyc-filament.js <scene.xuy> [--out dir] [--build] [--install]
```

| 选项 | 说明 |
|---|---|
| `--out <dir>` | 输出目录，默认 `build/filament` |
| `--build` | 生成后立即 `gradlew assembleDebug` |
| `--install` | 生成 + 编译 + `adb install --no-streaming` + `am start`（90s 超时） |

### 5.4 已验证例子（新路）

| 例子 | 内容 |
|---|---|
| `filament-test.xuy` | 3 形状 + 双光源 |
| `filament-shapes.xuy` | 7 种几何体一字排开 |
| `scene3d / scene-shapes / scene-anim` | 老例子同一份，新路直接跑 |
| `scene-pbr / scene-tex` | PBR + 纹理 |
| `filament-drone.xuy` | 外部 Draco glTF（39 mesh + 10 贴图） |
| `filament-anim-box.xuy` | glTF 自带动画（BoxAnimated） |
| `filament-shadow.xuy` | 阴影 |
| `filament-postfx.xuy` | bloom + SSAO + FXAA + Filmic |
| `filament-bloom.xuy` | bloom |
| `filament-instance.xuy` | 12 份实例化 |
| `filament-particles.xuy` | 200 粒子 |
| `filament-audio.xuy` | 音效 |
| `filament-remote.xuy` | 远程 glTF |
| `filament-normalized.xuy` | 模型归一化 |

共 **14 个例子全 PASS**。

### 5.5 生成文件

```
app/src/main/java/com/xunay/filament/MainActivity.java
app/src/main/assets/scene.gltf
app/src/main/assets/scene.bin
app/src/main/assets/textures/*.png / *.jpg
app/src/main/assets/audios/*.wav / *.mp3
app/src/main/AndroidManifest.xml
app/build.gradle / settings.gradle / gradle.properties
build.gradle（根，声明 AGP 8.6.0）
local.properties（sdk.dir）
gradle/（wrapper）
app/src/main/assets/envs/（default_env ibl）
```

### 5.6 已记录的坑

1. `ModelViewer.transformToUnitCube` 是 Kotlin 写的——默认参数 Java 不可见，必须显式传 `new Float3(0f, 0f, 0f)`；且不能传 `null`
2. glTF buffer 不能用 `data:base64`——Filament resolver 不解析，必须外置 `scene.bin`
3. `ModelViewer` 实现 `View.OnTouchListener.onTouch(v, ev)`，不是 `onTouchEvent(ev)`
4. `Manipulator` 没有 `lookAt` / `setOrbitHomePosition`——只能在 `Builder` 构造时定相机
5. `ModelViewer` 每帧用 Manipulator 状态覆盖相机——`camera.lookAt()` 无效
6. `mergeExternal` 必须保留 `KHR_draco_mesh_compression` 扩展
7. `mergeExternal` 必须拷贝 `animations`，node / accessor 引用要加 offset
8. `ModelViewer` 没 `getAnimator()`——走 `asset.getInstance().getAnimator()`
9. `updateAnimations` 里 `animInstances == null` 的早 return 会吞掉 glTF 动画——要先跑 animator 驱动
10. **Filament 1.51.6 没有 `createInstance`**——实例化只能靠「生成 N 份 node + N 份 animation」
11. **`AntiAliasing.MSAA` / `ToneMapping.REINHARD` / `UXPERIMENT` 在 1.51.6 不存在**
12. **`BloomOptions.threshold` 是 boolean 不是 float**
13. **MediaPlayer 必须 `setAudioStreamType(STREAM_MUSIC)` + 强制媒体音量**
14. adb 对这台红米 streaming 模式不稳——统一 `--no-streaming`

---

## 六、站点文档

`site/src/docs/` 下 **47 篇 Android 相关文档**（317 篇总）：

**工具链**：`tool-android` / `tool-android-pipeline` / `tool-android-dsl` / `tool-android-css` / `tool-android-cli` / `tool-android-setup` / `tool-android-errors` / `tool-android-troubleshoot` / `tool-android-limit` / `tool-android-build` / `tool-android-publish` / **`tool-android-cli-unified`**

**API**：`api-android-signal` / `computed` / `show` / `list` / `mount` / `onMount` / `onUnmount` / `effect` / `ref` / `fetch` / `storage` / `theme` / `router` / `txt` / **`select`** / **`router-params`**

**例子**：`ex-android-counter` / `form` / `router` / `todo` / `async` / `3d` / `shapes` / `filament`

**CSS P3**：**`tool-android-css-p3`**（filter / backdrop-filter / background-size / background-position / :active / @font-face / max-% / text-shadow / border-style）

**3D 老路**：`tool-3d` / `tool-android-3d-cli` / `tool-android-3d-shader` / `tool-android-3d-obj` / `tool-android-3d-texture` / `tool-android-3d-choose`

**3D Filament 新路**：`tool-android-filament` / `tool-android-filament-dsl` / `tool-android-filament-gltf` / **`tool-android-filament-postfx`** / **`tool-android-filament-advanced`** / `ex-android-filament`

**迁移 / 契约**：`tool-android-from-web` / `tool-android-3d-migrate` / `ai-android-contract`

生成方式：

```powershell
cd E:\xunay
python site/gen-docs.py    # 重写 docs-*.xuy 和 docs-index.xuy
node build-site.mjs         # 编译 app.xuy → dist
```

---

## 七、未完成

### 7.1 JS 翻译器剩余

| 项 | 状态 |
|---|---|
| `class` / `extends` | ❌ |
| 生成器 `function*` / `yield` | ❌ |
| `Promise.then` 链式（非 await） | ❌ |
| 解构 `const {a} = obj` / `const [a] = arr` | ❌ |
| 展开 `...` | ❌ |
| 动态 `import()` | ❌ |
| `with` / label / `new.target` | ❌ |
| 负索引 `arr.at(-1)` | ⚠️ 生成 charAt(-1)，会崩 |
| 嵌套箭头函数（>1 层） | ❌ |

### 7.2 组件 / 属性剩余

**未支持标签**：`iframe` / `video` / `audio`（UI 路）/ `canvas` / `svg`

**未支持指令**：`each` / `provide` / `inject` / `ctx` / `lazy` / `trans` / `hydrate` / `Fragment`

### 7.3 CSS 剩余

| 类别 | 未实现 |
|---|---|
| 尺寸 | `aspect-ratio` |
| Grid | `grid-template-rows` / `grid-auto-flow` 精确实现 |
| 背景 | `background-repeat` 真平铺 |
| 变换 | `transform: matrix / rotate3d` |
| 过渡 | `transition` 自动映射到动画 |
| 动画 | `animation-*` 全属性 |
| 交互 | `cursor` / `pointer-events` / `:hover`（Android 无鼠标）/ `:focus` |
| 文本 | `direction` / `writing-mode` / `hyphens` |
| 其它 | `mix-blend-mode` / `isolation` / `content-visibility` / `will-change` |
| 组合器 | `a + b` / `a ~ b` |

### 7.4 3D 老路剩余

| 能力 | 状态 |
|---|---|
| 双指缩放 | ❌ |
| 阴影 / 透明 | ❌ |
| `gltf` / `fbx` / `stl` | ❌ 只支持 .obj |
| 骨骼动画 / 粒子 / 物理 | ❌ |
| UV 化顶点 | ❌ 用 triplanar 代替 |
| 多相机 / 后处理 | ❌ |

### 7.5 3D Filament 新路剩余

| 能力 | 状态 |
|---|---|
| KTX2 / webp 纹理 | ❌（需装工具链） |
| KHR_materials_clearcoat / transmission | ⚠️ 忽略，当普通材质 |
| 多相机 / 分屏 | ❌ |
| 光照烘焙 | ❌ |
| 后处理更多（DOF / motion blur / god rays） | ❌ |

### 7.6 运行时剩余

| 类 | 状态 |
|---|---|
| Signal | ✅ |
| ListAdapter | ✅ |
| Computed 自动依赖追踪 | ⚠️ 靠手动 subscribe |
| Effect | ✅ |
| Router | ✅ 基础 + 传参（无守卫 / 无嵌套） |
| Storage | ✅ SharedPreferences 内联 |
| HTTP / RPC 客户端 | ⚠️ 只有 fetchUrl / fetchBlocking |
| i18n 动态切换 | ⚠️ 基础 |
| 动画系统 | ⚠️ 只有几个 preset |
| 主题 | ✅ 明暗切换 |
| DevTools | ❌ |
| 错误边界 | ❌ |
| Context / 依赖注入 | ❌ |

### 7.7 工具链剩余

| 项目 | 状态 |
|---|---|
| 资源打包（UI 路图片） | ⚠️ 字体已支持 |
| 多模块工程 | ❌ |
| 增量编译 | ❌ |
| 单元测试 / 快照测试 / 端到端测试 | ❌ |
| 错误提示友好化 | ❌ |

---

## 八、已知限制 / 坑

### 8.1 编码

- PowerShell `Get-Content` 默认 GBK：文件是 UTF-8，用 `-Encoding UTF8` 读。

### 8.2 JS 类型推断

- 复杂表达式 fallback 到 `Object`
- 局部变量默认 `Object`，算术可能 cast 失败
- 依赖链深了多轮推导可能不收敛
- `Math.floor` 等返回 `double`（Java 语义）
- 除法强制转 double

### 8.3 UI 路特有

- **Signal.set 主线程调度**：主线程直接执行订阅者；子线程 post 到主线程
- **`gap` 靠 margin 半间距**
- **`grid-template-columns` 靠 FlexboxLayout 模拟**
- **`outline` 会覆盖背景色**
- **`clipToOutline` 要 `addOnLayoutChangeListener` 里调**
- **`filter` / `backdrop-filter` 强制 `LAYER_TYPE_SOFTWARE`**（性能略降）
- **`blur` / `backdrop-filter: blur` 需 API 31+**

### 8.4 3D 老路特有

- **triplanar 纹理有接缝伪影**
- **GLSL ES 2.0 不支持动态数组长度**：光源用固定 8 + break
- **ObjLoader 不支持四边形 / 材质分组 / .mtl**
- **法线是 per-face 不平滑**

### 8.5 3D Filament 新路特有（见 5.6）

### 8.6 环境 / 设备

- **Redmi / MIUI**：`INSTALL_FAILED_USER_RESTRICTED` → 开发者选项开「USB 安装」+「USB 调试（安全设置）」+ 关「启用 MIUI 优化」+ 手机管家关「USB 安装管理」
- **adb 不稳**：装 APK 统一 `--no-streaming`
- **首次 Gradle 编译**：要下载 Filament 4 个 jni + Glide / RecyclerView / Flexbox，1-3 分钟
- **媒体音量**：音效需手动调高手机媒体音量；代码已强制设置，但有的设备第一次启动仍为 0

---

## 九、如何跑

### UI 路一键

```powershell
cd E:\xunay
.\run.ps1 -Entry examples\counter.xuy
```

### UI 路分步

```powershell
node bin\xuyc-android.js examples\counter.xuy --out build\android --build --install
```

### 3D 老路

```powershell
node bin\xuyc-3d.js examples\scene3d.xuy --out build\android-3d
cd build\android-3d
.\gradlew.bat assembleDebug
adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.xunay.gl/.MainActivity
```

### 3D Filament 新路

```powershell
node bin\xuyc-filament.js examples\scene-anim.xuy --out build\filament --build --install
```

### 统一 CLI

```powershell
node bin\xuyc.js examples\counter.xuy --target=ui       --out build\android    --build
node bin\xuyc.js examples\scene3d.xuy --target=3d       --out build\android-3d --build
node bin\xuyc.js examples\scene-anim.xuy --target=filament --out build\filament  --build
```

### 抓崩溃日志

```powershell
adb logcat -c
adb shell am force-stop com.xunay.filament
Start-Sleep -Milliseconds 300
adb logcat -c
adb shell am start -n com.xunay.filament/.MainActivity
Start-Sleep -Seconds 5
adb logcat -d -s "XunayFilament:*" "AndroidRuntime:E"
```

### 站点文档

```powershell
python site/gen-docs.py
node build-site.mjs
cd site\dist
python -m http.server 8080
# 浏览器 http://localhost:8080
```

---

## 十、稳定性状态

### UI 路（33 个例子全过）✅

### 3D 老路（5 个例子全过）✅

### 3D Filament 新路（14 个例子全 PASS）✅

**结论**：三条路基础链路 100% 通，简单到中等复杂度应用可完整跑通。

---

## 十一、下一步建议

1. **commit 现状**（改动涉及 3 条路 + 47 篇 site 文档）
2. **3D 多相机 / 分屏**（需绕开 ModelViewer render loop）
3. **KTX2 纹理**（需装 toktx / basisu 工具链）
4. **光照烘焙**（离线 + 加载 lightmap）
5. **UI 路 `video` / `audio` 标签**（类似 select/option）
6. **`transition` 映射到动画**（CSS 补齐）

---

*文档随代码更新。最后更新：2026-10-07*
'@ | Set-Content -Encoding UTF8 xunay-android-README.md

Write-Host "`n===== 已写入 ====="
Get-Item xunay-android-README.md | Select-Object Name, Length
(Get-Content xunay-android-README.md).Count
```

跑完应该 **~700 行 / ~35KB**。

---

## 然后 commit

```powershell
cd E:\xunay
git add -A
git commit -m "docs: 更新 README 至 2026-10-07（33 UI 例子 + 5 老 3D + 14 Filament + 47 site 文档）"
git log --oneline -3
```

**回我**：

1. README 行数
2. `git log --oneline -3`