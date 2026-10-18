# xunay 1.3.0 正式发布

**发布通道**：npm（`xunay@1.3.0`）
**仓库 tag**：`v1.3.0`
**发布日期**：2026-10-18
**包体积**：1.0 MB packed / 4.2 MB unpacked / 332 files

---

## 一句话概括

xunay 1.3.0 引入 **xuyg 极简语法编译器**，在保持原有编译优先 + 细粒度响应式范式不变的前提下，把页面开发从“写 vnode 调用”降到“声明式极简语法”，并集中修复 **8 项高危安全问题**与一批响应式/路由/CLI 缺陷。

---

## 核心亮点

### 1. xuyg 极简语法编译器（新增）

**定位**：编译期展开，运行时零开销。xuyg 不改变 xunay 运行时，也不增加 core bundle 体积（core gzip 仍为 **7.06 KB**）。

**设计原则**
- 只读 `xuyc.js` 内存替换，绝不修改磁盘上的编译器源码
- 编译产物是标准 JS，走原有 `xuyc + esbuild` 流程
- 检测到 xuyg 标记才启用，旧 `.xuy` 文件零影响

**4 个关键字**

| 关键字 | 作用 | 编译结果 |
|---|---|---|
| `cpt` | 组件 | `export function` + 隐式 return |
| `pag` | 页面 | 路由扫描 + 参数自动注入 |
| `dt` | 假数据模板 | 生成数组，内置 `seq / rand / pick` |
| `sdu` | 模板调用 | 批量生成 + 数据绑定 |

**sdu 模板系统**
- `sdu<4> Card($goods)({ ... })`：一次生成 4 个
- `$数据源`：循环数组
- `@字段`：取当前项字段，找不到回退全局 signal
- `vmodel`：双向绑定，自动合并已有 `on`
- `if`：条件渲染
- `@media`：响应式样式，自动注入 `<style>`
- `@click.stop.prevent`：事件修饰符

**20 个内置模板**（编译期内联，零运行时）
`NavBar / Hero / CateGrid / GoodsCard / GoodsList / SeckillBar / Footer / SideBar / StatCard / StatRow / UserCard / UserRow / ListItem / Tabs / Breadcrumb / Empty / Loading / Table / Modal / Form`

**图表与图标集成**
- 36 种零依赖 SVG 图表（`xunay/kit/charts/*` 支持按需导入）
- 2001 个图标（`xunay/kit/icons`，tree-shaking 后只留用到的）
- 228 个动画原语

**CLI**
```bash
# 构建
npx xuyg build app.xuy --out dist

# 构建 + 本地服务 + 自动打开
npx xuyg build app.xuy --out dist --serve 12343 --open

# 开发模式（HMR）
npx xuyg dev app.xuy --out dist --port 12344

# 压缩
npx xuyg build app.xuy --out dist --minify
```

**最小示例**
```js
// app.xuy
dt goods(12) {
  id: seq
  name: pick(['iPhone', 'AirPods']) + ' ' + seq
  price: rand(99, 9999)
}
const LIST = goods(12)

cpt GoodsCard(g) {
  div({ class: 'goods' },
    h3(null, g.name),
    div({ class: 'price' }, '¥' + g.price)
  )
}

pag Home() {
  div(null, ...LIST.map(g => GoodsCard(g)))
}
```

---

### 2. 安全加固（8 项高危修复）

本次发版最重要的内容之一，所有条目均附带回归测试。

| 编号 | 问题 | 修复 |
|---|---|---|
| V036+V038+V040+V048 | `xai-server` 路径穿越 / 未鉴权 RCE | 路径白名单 + 鉴权 |
| V016 | `RichText` / `Markdown` XSS | 接入 `sanitize` |
| V015 | `pushNotification` 使用 innerHTML | 改 `textContent` |
| V023 | `anim-svg` / `anim-kit2` SVG innerHTML 注入 | 颜色白名单 |

同时修复的响应式与工具链缺陷：

- **V001** signal 级联 effect 丢更新（快速路径 bug）
- **V002** query 成功时 `retriesLeft` 未重置
- **V005** query `hashKey` 未递归排序，缓存键不稳定
- **V004** auth `isValid()` 副作用订阅
- **V008** `modelNum` 空串被转成 0
- **V009** `breakpoint()` 未提供 `dispose`
- **V028** `createInput` 未提供 `dispose`
- **V030** `safeArea()` 缺 `right/bottom`
- **V031** xuyc 构建中断未恢复源码
- **V035** xuyc 注释模式扫描与 compiler3 不一致（改为扫前 10 行）
- **V077–V081** `xuyc3` 多文件 `.xuy` 支持（entry 位置、loader、runtime 模式、路径重写、site-entry）
- **V067** 假测试改为 skip，不再伪造全绿

---

### 3. React 风格 API 兼容层

以 `core/src/react-compat.js` 为实现依据，提供：
- `createElement / Fragment / Children / cloneElement / isValidElement`
- `useState / useEffect / useMemo / useRef / useContext / useReducer / useId …`
- `Component / PureComponent / memo / forwardRef / lazy / Suspense`
- `createRoot / hydrateRoot / render / createPortal / flushSync / act`

**兼容边界（务必注意）**
- 这是 **API 层兼容**，不是完整 React 行为兼容
- `hydrateRoot` 是“清空重建”，非真 hydration
- `startTransition` 不带 concurrent rendering 语义
- `PureComponent` 需自行验证浅比较语义
- 所有语义等级按 `web/AI.spec` 的 `REACT-COMPAT-SEMANTICS` 分级

---

## 包体积与性能

**各入口 gzip 后体积**

| 入口 | 体积 |
|---|---|
| core | 7.06 KB |
| full | 7.85 KB |
| kit（106 组件） | 29.58 KB |
| anim（228 动画） | 15.06 KB |
| charts（36 图表，源码） | ~120 KB（未打包） |
| icons（2001 图标，源码） | ~90 KB（未打包） |

**xuyg 不增加运行时体积**：所有转换在编译期完成。

**编译耗时**（1 核 2G，仅作趋势参考）

| 规模 | 编译耗时 |
|---|---|
| 100 元素 | 414 ms |
| 1000 元素 | 549 ms |
| 5000 元素 | 862 ms |

**运行时**（jsdom，±50% 噪声，仅作趋势）

| 规模 | runtime 模式 | compiled 模式 |
|---|---|---|
| 100 | 30 ms | 5 ms |
| 1000 | 67 ms | 55 ms |
| 5000 | 270 ms | 270 ms |

> 性能数据环境为 1 核 2G + jsdom，噪声较大，仅供趋势参考，不作为绝对指标。

---

## 升级指南

```bash
npm i xunay@1.3.0
```

**兼容性**：1.3.0 对 1.2.x 的 `.xuy` 文件和 API 完全向后兼容，旧项目无需改动即可升级。xuyg 为新入口，不影响既有编译流程。

**新增 bin**：`xuyg`

**版本对齐**：
- `core/package.json`: `1.3.0`
- `web/AI.spec`: `ver:1.3.0` / `update:2026-10-18`
- `CHANGELOG.md`: 首段 `v1.3.0`

---

## 已知限制

**xuyg**
- 不支持 JSX / TypeScript 类型注解
- `sdu` 的 `if` 只支持单条件
- `sdu` 的 `@media` 只支持 media query，不支持全量 CSS
- 不支持自定义 sdu 模板声明（只能用内置 + 匿名 `sdu<N>`）
- 增量编译未实现（每次全量）
- 图表必须手写 `ChartBox` 包装（未内置到 sdu）

**React Compat**
- 行为兼容分级，不能宣称“完整 React 兼容”
- `hydrateRoot` / `startTransition` / `PureComponent` 等语义均有明确边界

**部署**
- `V059` `xunay.service` 端口/后端配置不一致
- `V063` `nginx.conf` 无 HTTPS + `Connection` 头硬编码
- `V064` `xunay.service` 使用 `User=root` + 路径硬编码
- 以上 3 条需按部署环境人工决策，不阻塞本版发布

**包内残留（1.3.1 处理）**
- `src/Kit/ui_old/`、`src/Kit/ui/css.old/` 旧文件仍在包内
- `web/site/src/docs-kit.js` 需在文档站构建前修复绝对路径污染

---

## 验证

| 项 | 结果 |
|---|---|
| core 测试 | **268 pass / 0 fail / 0 skipped**（7 文件） |
| npm pack | `xunay-1.3.0.tgz`，332 files，1.0 MB |
| xuyg 冒烟 | 最小 `.xuy` 编译通过，产出 `app.js + index.html` |
| 版本三方对齐 | package.json / AI.spec / CHANGELOG 均为 1.3.0 |
| 包内 `.bak` 残留 | 0 |

---

## 链接

- 文档：http://107.172.190.220:12342/
- Playground：http://107.172.190.220:12342/playground/
- 示例：http://107.172.190.220:12342/examples/
- GitHub：https://github.com/xuanlie/xunay
- 完整规范：`web/AI.spec`
- xuyg 规范：`/xuyg.spec`
- CHANGELOG：仓库 `CHANGELOG.md`

---

**感谢所有参与 1.3.0 测试与漏洞提交的贡献者。xuyg 与 React 兼容层的详细语义边界请以 `web/AI.spec` 为准；遇到问题请提交 issue 并附运行环境与复现步骤。**
