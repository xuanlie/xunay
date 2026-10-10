# XuNay 改造记录

## 做了什么

### 编译器
- 用 acorn 重写编译器（compiler3），替代字符串扫描的 compiler2
- 修了 input value 响应式 bug
- 加作用域分析：const div = x; div() 不再误编译
- 加 compileMode 配置：compiled / runtime / hybrid

### 响应式内核
- 修复 signal 传播的 diamond 重复触发
- 统一 effect 调度，删掉单订阅快速路径直接 run

### 路由
- 修 6 个 bug：通配符、hash+query、守卫全路径、view 副作用、decode 容错、base 前缀

### 工具链
- bin/xuyc3.js: .xuy -> esbuild -> 浏览器 HTML
- 命令行 --mode 覆盖 package.json 的 xunay.compileMode

### 测试
- 1500+ 测试全绿

## compileMode 用法

package.json:
  "xunay": { "compileMode": "compiled" }

命令行覆盖:
  node bin/xuyc3.js build app.xuy --mode runtime

三种模式:
- compiled: 编译器生成 createElement，快启动，小体积
- runtime: 源码原样 + 自动注入标签 import，慢启动，大体积
- hybrid: 暂等同 compiled（未实现）

## 已知问题
- compiler3 未覆盖 async/await、class、解构、正则字面量
- 无 SSR、无 hydration、无 source map
- hybrid 模式未实现

## 未做但值得做
- Solid 式模板克隆
- 编译期常量折叠
- 属性 diff 最小化
