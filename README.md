```markdown
# XuNay

编译期优先 + 细粒度响应式的前端框架。`.xuy` 就是 JavaScript——标签名可以当函数直接用。

```js
import { signal, mount } from 'xunay'

const count = signal(0)

mount(() => div(null,
  button({ on: { click: () => count(v => v - 1) } }, '-'),
  span(null, () => String(count())),
  button({ on: { click: () => count(v => v + 1) } }, '+'),
), '#app')
```

没有 JSX，没有模板语法，没有 Hooks 规则。

快速开始

```bash
npm i xunay
npx xuyc3 build app.xuy --out dist
```

性能（Node.js 22 + V8 实测）

操作 耗时
signal 读 3 ns
signal 写（无订阅） 17 ns
单 effect 触发 27 ns
computed 缓存命中 16 ns

内核走 listener 直挂 + _ultra 快路径，和 Preact Signals / Solid 同量级。

体积（gzip 实测）

模块 大小
xunay.min.js（核心） 7.06 KB
xunay-full.min.js 7.85 KB
xunay-kit.min.js（106 组件） 29.58 KB
xunay-anim.min.js（228 动画） 15.06 KB
xunay-ssr.min.js 5.45 KB

compiler3

用 acorn 解析 .xuy 源码，做作用域分析，把标签调用编译成 DOM 创建代码。

· 作用域分析：const div = x; div() 不会被误编译
· value 响应式正确：input({ value: () => n() }) 生成 bindAttr
· 支持 spread / 嵌套 / 三元里的标签

编译模式

package.json：

```json
{
  "xunay": {
    "compileMode": "compiled"
  }
}
```

· compiled（默认）— 编译期生成 createElement，启动快、体积小
· runtime — 源码原样 + 自动注入标签 import
· hybrid — 无标记走 compiled，文件头写 // @runtime 走 runtime

单文件覆盖：

```js
// @runtime
import { signal, mount } from 'xunay'
```

命令行覆盖：

```bash
npx xuyc3 build app.xuy --mode runtime
```

优先级：文件头 > 命令行 > package.json > 默认。

核心 API

API 说明
signal(init) 响应式状态。s() 读，s(v) 写，s(fn) 函数式更新
computed(fn) 派生值，惰性 + 缓存
effect(fn) 副作用，返回 dispose 函数
batch(fn) 合并多次写
untrack(fn) 读 signal 但不订阅
onCleanup(fn) effect 重跑前清理
mount(comp, target) 挂载应用
list(arr, key, fn) keyed 列表
show(cond, fn) 条件渲染

内置标签（50 个）

div span p a button input form label ul ol li h1–h6 table thead tbody tr td th img br hr pre code blockquote header footer nav main section article select option textarea canvas video audio summary details

不在列表里的标签用 createElement('x', ...) 或 tag('x')。

项目结构

```
xunay/
├── core/           运行时 + 106 个 kit 组件 + compiler2/3
├── compiler3/      acorn AST 编译器（当前推荐）
├── bin/            CLI（xuyc / xuyc3 / create / xai）
├── backends/       后端参考实现（Node / Python / Go / C++）
├── site/           文档站（322 篇，用 XuNay 自举）
├── examples/       .xuy 示例
└── test/           测试
```

测试

```bash
node --test compiler3/test/*.test.js core/test/*.test.js
```

1571 个测试全绿。

许可

MIT

```
