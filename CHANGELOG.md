v1.1.0

编译期架构迁移

  .xuy 从"运行时 vnode"改成"编译期 DOM 生成"
  DOM 原语（div/span/button 等）编译成 document.createElement
  kit 组件（Card/Btn/Modal 等 106 个）也编译
  map / 三元 / 表达式里的 tag 递归编译

编译器修复

  parser.js
    字符串 / 注释里的 tag 不再误识别
    .name( 方法调用不误判为标签
    支持无 children 单标签（hr({...})）
    词边界检查（Col 不拆成 C + ol(）
    多事件 on: { a: f, b: g } 正确解析
    表达式子节点递归扫描

  gen.js
    html 属性走 innerHTML（原 setAttribute）
    动态 class 走 bindAttr（原赋函数）
    动态 disabled 走 bindAttr
    动态子节点用 span 容器（原 textNode）
    多事件解析
    ref 属性处理
    expr 分支（map / 三元内嵌套 tag）

运行时改造

  core/src/rt.js        新增 __rt__ 全局 + bindText / bindAttr / renderChild
  core/src/render.js    DOM 透传 + 数组支持 + Node 分支
  core/src/render.js    泄漏修复：3 处 onCleanup 清理 scope 树
  core/src/element.js   标签白名单 30 → 50

构建链

  core/build.js         kit-compile plugin（esbuild 前过 compiler2）
  bin/xuyc.js           接入 compile() + XUYC_NO_COMPILE + @runtime
  build-site.mjs        修 hash 清理 bug（原来误删刚生成的文件）
  bin/xuyc.js           devtools hash 6→8 位
  bin/xuyc.js           PWA cache 动态 BUILD_ID
  bin/xuyc.js           生产剥离错误面板
  core/bin/xuyc.js      同步以上 3 项 P0 修复

性能（实测）

  signal.read              25 ns（38.9M ops/s）
  signal.write（无订阅）    13 ns（78.1M ops/s）
  computed 缓存命中        5.6 ns（177M ops/s）
  1000 静态节点首挂        0.8 ms（编译期）/ 1.0 ms（运行时）
  1000 动态节点首挂        2.0 ms（编译期）/ 3.7 ms（运行时）· 1.85×
  xunay.esm.js gzip       6.01 KB

测试

  test/compiler.test.js    2 → 19 个用例
  测试抓到 2 个真 bug：
    parser.js 单行 if 语法错误（非字面量内层节点全走 text 分支）
    gen.js expr 分支用空数组（变量定义丢失）

文档

  12 篇 compiler 文档同步代码
  新增 compiler-arch（编译架构）
  重写 misc-perf / misc-philosophy / misc-handoff
  322 篇文档全部重建

清理

  根目录 43 → 8 个文件
  316 个一次性脚本归 _archive/cleanup-20261009/
  43 个临时文件归 _archive/cleanup-20261009-final/

回退机制

  XUYC_NO_COMPILE=1             全局关闭编译期转换
  // @runtime 头注释             单文件退回运行时 vnode
  注释 core/build.js 的 plugin   临时关闭 kit 编译

v1.0.1

核心加固

  sanitize.js     HTML 白名单净化，堵 innerHTML 的 XSS
  resource.js     异步三态（loading / data / error）
  model.js        表单双向绑定
  transition.js   列表 FLIP 过渡
  hydration.js    SSR 校验，服务端客户端 DOM 对齐
  devpanel.js     调试面板，看 effect 重跑计数

编译器

  errors.js       报错带行号 + 光标位置
  parser.js       接入 wrapError，expect 失败给人话

工程

  types/xunay.d.ts              类型声明，编辑器补全
  build/vite-plugin-xunay.js    vite 构建插件
  test/core.test.js             core 测试 5 个
  test/compiler.test.js         编译器测试 2 个
  docs/13-编译器限制.md          记录参数化模板规则
  .gitignore                    忽略 .venv / node_modules 等

性能

  列表增删           不再强制布局查询
  列表纯重排         才走 FLIP，增删走快路径
  fastUpdate         纯静态 props 原地改，不重建 DOM
  动态子节点         旧代码错误复用，现正确重建

修 bug

  example.xuy  的 row 模板
    原 const row = div(...) 引用未定义的 r，加载即崩
    改 (r) => div(...) 后编译成工厂函数

  fastUpdate 的错误复用
    旧代码遇函数子节点 continue 跳过，最后却 return true
    父节点被复用但动态子节点没更新
    现遇动态立即 return false，走重建

测试

  core        5 / 5 通过
  compiler    2 / 2 通过

速度

  列表增删        零布局查询
  列表行内更新    原地改 prop，不重建
  动态内容        正确重建，不再错误复用

v1.0.0

核心
  Signal 内核（signal / computed / effect / batch）
  元素渲染（createElement + render + mount）
  列表（list + key 复用 + fastUpdate）
  事件委托 / 条件渲染 / Fragment / 生命周期
  进阶（ref / ctx / err / lazy / trans / ssr / hydrate / devtool）
  gzip 4.5KB，零依赖

全栈
  shared/routes.json 路由唯一真相源
  四个后端：Node / Python / Go / C++
  统一 RPC 客户端，前端不写 URL
  端口配置化（xunay.config.json）
  一键切换后端
  路由一致性校验

工具
  bin/create.js 脚手架
  bin/xuyc.js .xuy 构建工具
  bin/switch.js 后端切换
  bin/check-routes.js 路由校验
  bin/sync-routes.js 路由同步
  bin/start.sh 启动脚本

文档
  文档站 125 篇（12 组）
  Playground 在线编辑器
  代码块复制按钮
  上一篇 / 下一篇导航

示例
  计数器 / Todo / 1000 行列表 / 生命周期
  完整 Todo / 聊天 / 表格 / 表单验证
  myapp 大项目骨架
  demo 脚手架示例

后端能力
  Token 校验
  SQLite / JSON 持久化
  Pydantic 风格校验（四语言各自实现）
  CORS 内建
  统一返回格式 { ok, data, error }