Changelog

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

  types/xunay.d.ts     类型声明，编辑器补全
  build/vite-plugin-xunay.js   vite 构建插件
  test/core.test.js            core 测试 5 个
  test/compiler.test.js        编译器测试 2 个
  docs/13-编译器限制.md        记录参数化模板规则
  .gitignore                  忽略 .venv / node_modules 等

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
