```markdown
# XuNay

编译期 DOM 生成 + 细粒度响应式的前端框架。

- **runtime 6 KB** gzip（比 Solid 小 25%）
- **signal 25 ns** 读 / **13 ns** 写
- **1000 动态节点首挂 2.0 ms**（编译期比运行时快 1.85×）
- **零依赖**，纯 JS (ESM)
- **106 个 UI 组件** + **228 个动画导出**
- **322 篇自举文档** + **AI 项目状态工具 xai**

---

## 一句话

`.xuy` 就是 JavaScript，只是标签名可以当函数直接用：

```js
import { signal, mount } from 'xunay'

const count = signal(0)

mount(() => div({ class: 'counter' },
  button({ on: { click: () => count(v => v - 1) } }, '-'),
  span(null, () => String(count())),
  button({ on: { click: () => count(v => v + 1) } }, '+')
), '#app')
```

没有 JSX，没有模板语法，没有 Hooks 规则。**只有函数调用。**

---

## 编译期优先

`.xuy` 里的 DOM 原语、kit 组件、map/三元里的标签**全部编译成 `document.createElement`**：

```js
// 你写的
div({ class: 'box' }, span(null, () => n()))

// 编译后
const _div0 = document.createElement("div")
_div0.className = "box"
const _span1 = document.createElement("span")
_span1.style.display = "contents"
__rt__.bindText(_span1, () => n())
_div0.appendChild(_span1)
return _div0
```

运行时只剩 signal / effect / computed + 一个薄薄的 `__rt__` 适配层。

**没有 VDOM，没有 diff，一个 signal 变化只触发订阅它的 effect。**

---

## 性能

测试环境：Node v24.20.0 + Chrome 移动端。所有数字都能跑 `bench/*` 复现。

### Signal 层

| 操作 | 单次 | 吞吐 |
|---|---|---|
| signal.read | **25 ns** | 38.9M ops/s |
| signal.write（无订阅） | **13 ns** | 78.1M ops/s |
| computed 缓存命中 | **5.6 ns** | 177M ops/s |
| signal.write（1 effect） | 143 ns | 6.98M ops/s |

### DOM 层

| 场景 | 编译期 | 运行时 vnode | 加速 |
|---|---|---|---|
| 1000 静态节点首挂 | 0.8 ms | 1.0 ms | 1.25× |
| 1000 动态节点首挂 | **2.0 ms** | 3.7 ms | **1.85×** |

### 对比同类

| 框架 | runtime gzip | 1000 动态节点首挂 |
|---|---|---|
| React 18 | 45 KB | 30-60 ms |
| Vue 3 | 34 KB | 10-20 ms |
| Svelte 5 | ~10 KB | 4-6 ms |
| Solid | 8 KB | 2-3 ms |
| **XuNay** | **6 KB** | **2.0 ms** |

---

## 快速开始

```bash
npm i xunay
```

创建 `app.xuy`：

```js
// title: 我的应用
import { signal, mount } from 'xunay'

const name = signal('world')

mount(() => div({ class: 'app' },
  h1(null, 'Hello'),
  input({
    value: () => name(),
    on: { input: e => name(e.target.value) }
  }),
  p(null, () => 'Hi, ' + name())
), '#app')
```

构建：

```bash
npx xuyc build app.xuy --out dist
```

输出 `dist/` 里有 `index.html` + `app.js` + `xunay.js`，直接打开浏览器。

---

## .xuy 语法

**唯一约定**：标签名不用 import。

```js
// 内置标签（50 个）
div span p a button input form label ul ol li
h1 h2 h3 h4 h5 h6 img br hr table thead tbody tr th td
pre code blockquote
header footer nav main section article
select option textarea
canvas video audio summary details
checkbox switch radio progress slider tabs tab   // xunay kit
```

其他都是标准 JS——所有语法、运算符、内置对象都能用。

**不支持 JSX、模板语法、类型注解。** `.xuy` 就是 JS。

---

## 核心 API

| API | 说明 |
|---|---|
| `signal(init)` | 响应式状态，`s()` 读 / `s(v)` 写 |
| `computed(fn)` | 派生值（懒计算 + 缓存） |
| `effect(fn)` | 副作用（自动追踪依赖） |
| `batch(fn)` | 合并多次写 |
| `untrack(fn)` | 读 signal 但不订阅 |
| `onCleanup(fn)` | effect 重跑前清理 |
| `mount(comp, target)` | 挂载应用 |
| `render(vnode)` | vnode → DOM |
| `list(arr, key, fn)` | keyed 列表 |
| `show(cond, fn)` | 条件渲染 |
| `frag(...children)` | 多节点容器 |
| `txt\`...\`` | 响应式模板字符串 |
| `onMount / onUnmount` | 生命周期 |
| `ref(init)` | 可变引用 |
| `ctx(default)` | 跨组件传递 |

---

## 项目结构

```
xunay/
├── core/            运行时 + 106 个 kit 组件
│   ├── src/         signal / effect / render / kit-* / rt
│   ├── dist/        编译产物（ESM / IIFE / min）
│   └── bin/         发布的 CLI（xuyc / xunay）
├── compiler2/       编译器（~325 行）
│   ├── src/         parser + gen + index
│   └── test/        parser / gen 回归测试
├── bin/             CLI（xuyc / create / switch / xai）
├── ai/              xai 工具（CLI + server + 页面）
│   ├── lib/         parse / render / verify / write / todo
│   ├── ui/          浏览器界面
│   └── spec.md      规范说明
├── templates/       项目模板（blog 等）
├── site/            文档站（322 篇，自举）
├── backends/        后端参考实现
│   ├── python/      FastAPI
│   ├── go/          net/http
│   ├── node/        原生 http
│   └── cpp/         CMake
├── bench/           性能基准
└── test/            核心测试（45 个用例）
```

---

## 多端支持

| 目标 | 说明 |
|---|---|
| **Web** | 默认，编译成 createElement |
| **SSR** | `renderToString` + `hydrate` |
| **Android** | `.xuy` → Java + OpenGL ES |
| **Android 3D** | Filament 集成（PBR / 粒子 / 后处理） |
| **Babylon 3D** | Web 端 3D 场景 |
| **Godot** | UI DSL 桥接（已归档，加载太慢） |

---

## xai —— AI 项目状态工具

`xai` 是 XuNay 附带的一个命令行 + Web 工具，让 AI 改代码时有据可依。

**核心是一个文件**：`AI-STATE.md`，记录项目的结构、约定、TODO、历史。

**五个命令**：

```bash
xai state       # 终端显示项目状态
xai snapshot    # 输出给 AI 读的紧凑快照
xai verify      # 校验代码与文档一致（双向）
xai log "..."   # 追加历史条目
xai todo        # 管理 TODO
xai serve       # 打开浏览器界面
```

**浏览器界面**（`http://localhost:12350`）：

- **看板** —— 结构 + TODO + 约定 + 历史，可点击
- **终端** —— 本地或 SSH 远程执行命令，累积可复制
- **预览** —— iframe 预览本地/远程 URL
- **AI** —— 对话 / 改代码，AI 生成 diff 后用户批准才写入

**双向校验**：AI 加了文件忘登记 → `verify` 拦住。这是强约束。

---

## 回退机制

编译期出问题可以一键回退：

```bash
# 全局关闭编译期转换
XUYC_NO_COMPILE=1 xuyc build app.xuy

# 单文件退回运行时
// @runtime
import { div } from 'xunay'
```

---

## 设计哲学

- **不发明新语法** —— `.xuy` 就是 JS
- **不做无用抽象** —— 只有 signal 和元素
- **不保留历史包袱** —— 不兼容 React
- **编译期优先** —— 能编译的绝不放到运行时
- **不追求万能** —— 90% 场景够用就好

---

## 已知限制

- 生态为零 —— 没有第三方库适配
- 一人维护 —— 更新节奏不稳定
- 无生产验证 —— 只在文档站自举
- `list()` 只走运行时 —— 编译期版本未实现
- 部分边缘场景退化到运行时 vnode

**适合**：个人项目、内部工具、学习响应式原理。
**不适合**：需要庞大生态、SSR + 复杂数据层、团队已熟悉 React/Vue。

---

## 文档

- 在线文档：`cd site && xai serve`（或 `node build-site.mjs` 后访问 `dist/`）
- 编译器原理：`site/src/docs/compiler-*.xuy`
- 编译架构：`site/src/docs/compiler-arch.xuy`
- 性能报告：`site/src/docs/misc-perf.xuy`
- 交接现状：`site/src/docs/misc-handoff.xuy`

---

## 贡献

项目处于早期阶段。Issue / PR 欢迎，但请先看 `CHANGELOG.md` 了解现状。

---

## License

MIT
```

---

## 相比上一版改了什么

| 改动 | 原因 |
|---|---|
| 加了 **xai 章节** | 新增的工具，是 v1.1.0 的一部分 |
| 更新**项目结构** | 加了 `ai/` / `templates/`，`core/bin/` |
| 补 **npx xuyc** | npm 装完后用户用的是 `npx xuyc`，不是 `node bin/xuyc.js` |
| 删**对比 Solid/Svelte 建议** | 那些是给我的话，不是 README |
| 补**文档章节** | 用户装完后知道去哪看文档 |
| 更新**测试数** | 45 个（19+14+12） |

## 用法

```powershell
notepad E:\xunay\README.md
```

**全选 → 删除 → 粘贴上面的 → Ctrl+S 保存。**

同时**同步一份到 `core/README.md`**（npm 包会读这个）：

```powershell
Copy-Item E:\xunay\README.md E:\xunay\core\README.md -Force
```

---

**跑这两条，然后回到 `npm login` 流程。**