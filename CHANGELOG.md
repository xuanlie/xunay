v1.3.0

xuyg 极简语法 + 安全加固

  xuyg
    bin/Xuyg.js 极简语法 CLI（分流到 compiler4）
    4 关键字：cpt 组件 / pag 页面 / dt 假数据 / sdu 模板
    sdu<N> 批量生成 + $数据源 + @字段绑定 + vmodel + @media
    20 个内置模板（NavBar / GoodsCard / Table / Form ...）
    编译期展开，运行时零开销，core bundle 体积不变

  安全修复
    xai-server 路径穿越 / 未鉴权 RCE（V036+V038+V040+V048）
    RichText / Markdown 加 sanitize（V016）
    pushNotification 改 textContent（V015）
    SVG innerHTML 颜色白名单（V023）

  修复
    signal 级联 effect 丢更新（V001）
    query hashKey 排序 / retriesLeft 重置（V005/V002）
    auth isValid 副作用订阅（V004）
    xuyc3 多文件 .xuy 支持（V077-V081）
    xuyc 中断兜底恢复源码（V031）
    根 bin/xuyc.js 转发到 core/bin/xuyc.js，消除双版本分叉

  已知限制
    xuyg 不支持 JSX / TypeScript / 增量编译
    React Compat 为 API 层兼容，行为语义按 AI.spec 分级
    V059/V063/V064 部署配置待人工决策

v1.2.8

开发服务器 + 版本号动态注入

  dev-server
    bin/xuyc-dev.js 新增开发服务器
    监听 .xuy / CSS 文件改动
    HMR 自动刷新浏览器（无需手动刷新）

  site
    scripts/build-site.mjs 构建时读 core/package.json
    Home.xuy 版本号自动注入，不再硬编码

  修复
    bin/xuyc.js 修 CSS 复制多层目录 bug
    bin/create.js 兼容 monorepo 和 npm 扁平布局

v1.2.5

项目创建模板（npx xunay）全面优化

  Logo 内置
    新项目自带 Logo（base64 内嵌，零文件依赖）
    导航栏左侧：28×28 圆角方块 + 品牌名
    首页 Hero：120×120 圆角方块，悬停放大+旋转
    品牌名规则：项目名 + " app"（已含 app 不重复）

  首页改为 Vue/React 风格欢迎页
    Hero：Logo + 大标题 + 标语 + 3 个 CTA 按钮
    3 个特性卡：⚡极速构建 / 📦极小体积 / 🎯细粒度响应式
    按钮：查看示例 / 查看文档 / AI 文档
    Footer：文档 · AI 文档 · GitHub

  导航栏重构
    5 项链接：首页 / 示例 / 关于 / 文档 / AI 文档
    外链自动 target="_blank"
    品牌名 + Logo 一起点击回首页

  新增 /demo 页
    计数器示例从首页移出
    演示 signal / computed / 组件拆分

  CSS 内联
    移除独立 src/style.css
    样式全部内联到 app.xuy（约 200 行）
    渐变主题（紫→青），暗色兼容

  新增文件
    src/components/Footer.xuy
    src/pages/demo.xuy

  文档链接指向
    文档：http://107.172.190.220:12342/
    AI.spec：http://107.172.190.220:12342/AI.spec

站点更新

  Logo 接入文档站
    web/site/dist/logo.png（512×512）
    favicon.png（64×64）+ favicon-32.png（32×32）
    icons/icon-192.png（PWA 图标）
    构建时自动复制 + 注入 favicon links

  README 更新
    导航栏新增 Logo + 品牌名
    Hero 加 logo 展示

v1.2.4

事件系统修复

  core/src/events.js
    mount() 完成后动态创建的元素，之前会双重绑定：
      既存 el.__xunay_handlers（由 root 委托调用）
      又 addEventListener（直接绑定）
    结果：一次点击触发两次 handler，toggle 类操作失效
    修复：无委托 root 时只 addEventListener；有 root 只登记委托
    影响：所有"数据加载后动态渲染"的按钮

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