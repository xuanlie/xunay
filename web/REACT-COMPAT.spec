[XUNAY-REACT-COMPAT]
ver:0.1.0
kind:react-runtime-compat-layer
purpose:让 React 库跑在 XuNay 上，产物无 React runtime
date:2026-10-14
status:80% 可用

[ARCH]
方案:运行时模拟（不是编译转换）
入口:xunay/compat  (core/src/react-compat.js)
       xunay/react-dom  (core/src/react-dom-compat.js)
行数:~800
gzip:~8 KB
模式:esbuild alias  react → xunay/compat
     通过 package.json.xunay.compat.react 或 XUNAY_COMPAT=1 开启
配置读取优先级:
  1. 环境变量 XUNAY_COMPAT=1
  2. package.json 的 xunay.compat.react
  3. xunay.config.json 的 compat.react

[DESIGN]
- 不做 vnode diff：state 变重建该组件子树
- 不做 Concurrent：同步渲染
- 不做 Fiber：递归
- 用 comment 节点锚定组件边界
- hooks 按调用顺序索引（跟 React 一致）
- Portal 记录到实例，重渲/卸载时清理

[API-IMPLEMENTED]
# 元素
createElement cloneElement isValidElement Fragment Children createFactory
# Hooks 核心
useState useEffect useLayoutEffect useMemo useCallback useRef
# Hooks 进阶
useReducer useContext useImperativeHandle useId useDebugValue useInsertionEffect
# Hooks 18/19
useSyncExternalStore useTransition useDeferredValue useOptimistic
# Context
createContext useContext
# 渲染
createRoot hydrateRoot render unmountComponentAtNode findDOMNode
# Portal / 调度
createPortal flushSync unstable_batchedUpdates unstable_renderSubtreeIntoContainer
# 包装
memo forwardRef lazy(真) Suspense(预检 pending lazy) StrictMode
# 类组件
Component (函数式，兼容老 Babel 的 Component.call(this))
PureComponent (= Component)
# JSX
jsx jsxs jsxDEV
# 工具
act version
# react-dom 独立入口
createRoot hydrateRoot render unmountComponentAtNode findDOMNode
createPortal flushSync unstable_batchedUpdates

[API-NOT-IMPLEMENTED]
- Server Components（需要 React 序列化协议）
- Streaming SSR（需要 React 流格式）
- Concurrent Rendering（需要 React 调度器）
- React 19 use / useFormStatus / useActionState（部分）
- 完整 Suspense（现在只做 pending lazy 预检，不做挂起恢复）

[LIBS-TESTED]
react-icons            ✅ 通过
antd                   ✅ Button / Tag / Alert / Space / Modal / Table / Dropdown / message / Input / Select / DatePicker 均通过
react-hook-form        ✅ 通过
zustand                ✅ 通过
@tanstack/react-table  ✅ 通过（版本 8.20.5，9.x 改了 API 名）
react-window           ❌ 未通过（见 UNRESOLVED）
recharts               ⏳ 未测
framer-motion          ⏳ 未测
react-select           ⏳ 未测
@tanstack/react-query  ⏳ 未测

[LIBS-INSTALLED]
antd react-icons react-hook-form zustand
@tanstack/react-query @tanstack/react-table recharts
framer-motion react-select react-window
codemirror @codemirror/* lang-javascript lang-python lang-css lang-html
lang-json lang-markdown lang-sql lang-yaml lang-rust lang-java lang-cpp
lang-php lang-xml @lezer/highlight

[UNRESOLVED]
id:RW-001
sym:react-window 只渲染标题，不渲染列表
lib:react-window@1.8.10
symptom:
  - 组件是类组件 List
  - 无报错
  - 容器尺寸测得 w=0 h=0
  - 所有 effect / layoutEffect 都触发
  - listRef.current 拿到类实例（有 scrollToItem 等方法）
root-cause:
  compat 的 effect 时机和 React 不一致
  React 的 commit 顺序：
    render whole tree → commit 到 DOM → 跑 layoutEffect → 跑 effect
  compat 当前：
    render 子树 → append 到 documentFragment → 跑 effect
  问题：effect 跑时，子树还在 fragment 里没进主文档
        react-window 在 useLayoutEffect 里量容器宽高（100% 相对父级）
        父级不在文档里 → offsetWidth/Height = 0
        → react-window 认为可视区域为 0，不渲染任何行
attempts:
  A. 延迟 effect 到 createRoot 挂载后统一 flush
     result:失败。可能原因：
       - createRoot.render 的 flush 只处理根实例，
         子实例的 pending effect 没有统一 flush
       - 或 microtask 触发时机仍早于浏览器布局
  B. 未试：在 createRoot.render 里用 requestAnimationFrame 二次 flush
  C. 未试：在 getComputedStyle 前强制 void element.offsetWidth（reflow）
  D. 未试：修改 react-window demo，给容器固定像素宽高（绕开 100%）
  E. 未试：compat 的 useLayoutEffect 用 rAF 包装

workaround-for-users:
  显式给容器 px 宽高而不是 100%：
    div({ style: 'width:800px;height:400px' },
      FixedSizeList({ height: 400, width: 800, ... }, Row))
  或使用 Modal 时 getContainer: false 绕开 Portal

[KNOWN-ISSUES]
id:ISSUE-001
sym:AntD Modal 需 getContainer: false
cause:Portal 时机（useLayoutEffect 早于清理）
fix:用户侧显式指定

id:ISSUE-002
sym:类组件只能用函数式写法兼容老 Babel
cause:老的 react-window / 老库用 Component.call(this)
status:已修（Component 从 class 改成 function）

id:ISSUE-003
sym:react-window v2 (List) 与 v1 (FixedSizeList) API 不同
cause:库升级改名，不是 compat 问题
fix:降版本到 1.8.10

[MODES]
模式开关:
  XUNAY_COMPAT=1                        临时
  package.json: xunay.compat.react=true 项目级
  xunay.config.json: compat.react=true  项目级

[FILES]
core/src/react-compat.js        主实现 ~800 行
core/src/react-dom-compat.js    react-dom 入口
bin/xuyc3.js                    读配置 + esbuild alias
web/examples/lib-rhf.xuy        测试页
web/examples/lib-zustand.xuy    测试页
web/examples/lib-table.xuy      测试页
web/examples/lib-window.xuy     测试页（未通过）
web/examples/antd-adv.xuy       AntD 测试页

[TODO-NEXT]
P0:修 RW-001（react-window 容器尺寸）
P1:写用户文档 docs/compat.md
P2:集成到 xunay 官方 exports
P3:测 recharts / framer-motion / react-select
P4:测 @tanstack/react-query

[LIMIT-SUMMARY]
能跑:
  - 纯函数组件 + hooks
  - 类组件（含 componentDidMount / componentWillUnmount）
  - Context / Portal / ref / forwardRef / memo / lazy（部分）
  - 大部分纯 React 库（AntD 级别）
跑不了:
  - Suspense 完整语义
  - Server Components
  - Streaming
  - Concurrent（useTransition 只做 rAF 近似）
  - 依赖精确 commit 时机的库（如 react-window 未过）

[NOTES]
- "全代码编译"路线不可行：库代码转不了，只能靠运行时兼容
- 编译转换只适合业务代码，且 ROI 低（非瓶颈）
- compat 路线已在 AntD / 各大库验证，80% 可用
- react-window 卡在 commit 时机，属边缘 case，不阻塞主线

[UNRESOLVED-2]
id:RS-001
sym:react-select 崩溃 "Cannot read properties of undefined (reading 'container')"
lib:react-select
root-cause:
  compat 没实现 class component 的 contextType（legacy context API）
  react-select 用 this.context 拿 selectProps，拿不到
  getStyles 里读 selectProps.styles.container → undefined.container → 崩
attempts:
  A. 已试：报错定位到 Select2._this.getStyles
fix-suggestion:
  compat 需要补 legacy context（class.contextType + this.context）
  或者改造 renderIntoInstance 传 context 到类组件构造函数
status:pending
priority:低（边缘库，不影响主流）
