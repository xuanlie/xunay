// 版本（当前）
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("版本历史"),
    H2("v1.2.8（当前）"),
    H3("基础工具"),
    Ul("auth：令牌管理（4 种存储后端）","storage：通用键值存储（TTL + 响应式）","http：fetch 封装（超时 / 重试 / 拦截器）","i18n：国际化（切换 + 插值）","theme：主题切换（跟随系统）"),
    H3("数据与表单"),
    Ul("query：数据请求 + 缓存 + 失效（类似 TanStack Query）","form：表单校验 + 字段绑定（12 种内置规则）","persist：signal 自动持久化（带版本迁移）","router：hash / history 双模式路由"),
    P("一次大改造：拆包、动画库重写、Kit 扩充。"),
    Ul("核心导出从 65 降到 24，包体积 4.86 → 5.49 KB","新增 untrack / onCleanup / registerTags / signal.equals","computed 改 lazy + dirty，加 dispose","effect 死循环保护","多实例 mount 修复（events.js 从全局单例改栈）","SSR 并发隔离（createRuntime / setRuntime / withRuntime / resetRuntime）","动画库从 15 → 228 个导出，拆 10 个文件","Kit 从 54 → 106 个组件，拆 17 个文件","Kit 支持子路径按需加载（xunay/kit/ui、/charts...）","新增类型声明（index.d.ts / kit.d.ts / anim.d.ts）"),
    H2("v1.2.4"),
    Ul("events.js：修双重绑定 bug（影响所有动态渲染按钮）"),
    H2("v1.2.3"),
    Ul("bin/xuyc3.js：兼容 monorepo 和 npm 扁平目录结构"),
    H2("v1.2.2"),
    Ul("compiler3/src/runtime.js：修 import 路径 + 补 app 导出"),
    H2("v1.1.2"),
    Ul("core：修 sanitize XSS 递归漏检、事件委托 stopPropagation 失效、多 handler 覆盖","core：修 effect.dispose 内存泄漏、applyList 删除判断","core：删 probeDeps 死代码（每次创建元素白跑一次渲染函数）","core：resource / lazy 生命周期修复","mobile：breakpoint 改为响应式 signal（旧版是普通对象）","xuyc：支持动态 import + --splitting 代码分割","xuyc：esbuild alias 硬绑定本地 xunay，修掉双份 runtime","site：322 篇文档懒加载，首屏 656 KB → 65 KB（-90%）","性能：subscribers 1000 快 34%，computed chain 快 22%"),
    H2("v1.0.4"),
    Ul("核心导出从 65 降到 20，包体积 4.86 → 5.60 KB","新增 untrack / onCleanup / registerTags","computed 改 lazy + dirty，加 dispose","effect 死循环保护","多实例 mount 修复","SSR 并发隔离（createRuntime / withRuntime）","动画库从 15 → 228 个导出","Kit 从 54 → 106 个组件，拆 17 个文件，支持子路径按需加载"),
    H2("v1.0.3"),
    Ul("SSR 支持 renderToString + hydrateMount","DevTools 面板（网络 / Signals / 控制台 / 性能）","动画核心 anim.js（11 个预设）"),
    H2("v1.0.2"),
    Ul("sanitize：HTML 白名单防 XSS","resource：异步三态","model：表单绑定","hydration：SSR 校验"),
    H2("v1.0.1"),
    Ul("正式发布",".xuy 编译器（词法 / 语法 / 代码生成）","内置组件库雏形"),
    H2("v1.0.0"),
    Ul("首个版本","signal / computed / effect / batch","mount / list / show / frag / txt"),
  )
}
