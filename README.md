XuNay

[![npm version](https://badge.fury.io/js/xunay.svg)](https://www.npmjs.com/package/xunay)
[![GitHub](https://img.shields.io/badge/github-xuanlie%2Fxunay-blue)](https://github.com/xuanlie/xunay)

内存最少、速度最快的前端框架。gzip 5.0KB，零依赖，无 VDOM，无 Fiber。

数字

  操作   XuNay   React 18   Vue 3
  gzip   5.0KB   45KB   34KB
  首挂 1000 动态节点   18.6ms   35ms   28ms
  更新 1/1000（细粒度）   2.0µs   20ms*   16ms*
  更新 1000/1000   393µs   —   —
  内存   9.5MB   18MB   15MB

  * React/Vue 无细粒度更新，更新任一状态都会重渲整个组件；
    表中数字为社区常见 benchmark 参考值，环境不同仅供参考。
  * XuNay 数字可复现：见 bench/README.md

全栈架构

前端 + 四个后端任选，一个配置文件切换。

  前端 (XuNay)  →  RPC  →  后端
                            ├── Node.js   12341  零依赖, JSON
                            ├── Python    12342  FastAPI, SQLite
                            ├── Go        12343  标准库, SQLite
                            └── C++       12344  httplib, SQLite

命令

  命令   作用
  `node bin/create.js myapp`   起新项目
  `node bin/switch.js node`   切后端
  `bash bin/start.sh`   启动当前后端
  `node bin/xuyc.js build app.xuy --out dist`   构建前端
  `node bin/check-routes.js`   校验四后端一致
  `node bin/sync-routes.js`   同步路由到前端

前端调用

  import { rpc, initToken } from "./core/src/rpc.js"
  
  await initToken()
  await rpc.addTodo({ title: "吃饭" })
  const list = await rpc.getTodos()

没有 URL，没有 fetch，没有手写接口。路由从 shared/routes.json 自动生成。

配置

xunay.config.json：

  {
    "backend": "node",
    "ports": {
      "node": 12341,
      "python": 12342,
      "go": 12343,
      "cpp": 12344
    }
  }

加新接口

1. 改 shared/routes.json 加一行
2. node bin/check-routes.js → 报哪个后端缺
3. 四个后端各加 handler
4. node bin/sync-routes.js → 前端自动更新

目录

  xunay/
  ├── core/          核心框架（5.0KB，零依赖）
  │   └── src/rpc.js         前端 RPC 客户端
  ├── bin/           命令行工具
  │   ├── create.js          脚手架
  │   ├── xuyc.js            .xuy 构建工具
  │   ├── switch.js          后端切换
  │   ├── start.sh           启动脚本
  │   ├── check-routes.js    路由校验
  │   └── sync-routes.js     路由同步
  ├── shared/routes.json     路由唯一真相源
  ├── backends/
  │   ├── node/      Node.js 后端（零依赖）
  │   ├── python/    Python 后端（FastAPI）
  │   ├── go/        Go 后端（标准库）
  │   └── cpp/       C++ 后端（httplib）
  ├── site/          文档站（156 篇）
  ├── playground/    在线编辑器
  ├── examples/      示例
  ├── backend/       运行中的 FastAPI 应用（实际服务）
  ├── frontend/      前端示例
  ├── bench/         基准测试（Node + 浏览器）
  ├── docs/          项目文档
  ├── deploy/        nginx / systemd 部署配置
  ├── test/          单元测试
  └── compiler2/     .xuy 编译器

在线

  文档站：http://107.172.190.220:12342/site/
  Playground：http://107.172.190.220:12342/playground/
  示例：http://107.172.190.220:12342/examples/full-todo-dist/

License

MIT
