// 版本历史
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("版本历史"),
    H2("v1.1.2（最新）"),
    Ul("core：修 sanitize XSS 递归漏检、事件委托 stopPropagation 失效、多 handler 覆盖","core：修 effect.dispose 内存泄漏、applyList 删除判断","core：删 probeDeps 死代码（每次创建元素白跑一次渲染函数）","core：resource / lazy 生命周期修复","mobile：breakpoint 改为响应式 signal（旧版是普通对象）","xuyc：支持动态 import + --splitting 代码分割","xuyc：esbuild alias 硬绑定本地 xunay，修掉双份 runtime","site：322 篇文档懒加载，首屏 656 KB → 65 KB（-90%）","性能：subscribers 1000 快 34%，computed chain 快 22%"),
    H2("v1.0.4"),
    Ul("核心导出从 65 降到 20，包体积 4.86 → 5.60 KB","新增 untrack / onCleanup / registerTags","computed 改 lazy + dirty，加 dispose","effect 死循环保护","多实例 mount 修复","SSR 并发隔离（createRuntime / withRuntime）","动画库从 15 → 228 个导出","Kit 从 54 → 106 个组件，拆 17 个文件，支持子路径按需加载"),
    H2("v1.0.3"),
    Ul("SSR 支持 renderToString + hydrateMount","DevTools 面板","动画核心 anim.js"),
    H2("v1.0.0"),
    Ul("首个版本","signal / computed / effect / batch","mount / list / show / frag / txt","xuyc 编译器"),
  )
}
