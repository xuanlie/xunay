// 调试技巧
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("调试技巧"),
    P("xunay 应用的调试方法。"),
    H2("用 devtools"),
    P("最直接——装 devtools，4 个面板看运行时状态。"),
    Code("import 'xunay/devtools'", "xuy"),
    H2("Console 里访问内部状态"),
    Code("// 全局 runtime\nwindow.__XUNAY_RUNTIME__\n\n// 所有 signal\nwindow.__XD__?.signals\n\n// 某个 DOM 的 scope\ndocument.querySelector('#app').__xunay_scope\n\n// 所有请求\nwindow.__XD__?.nets", "js"),
    H2("加标记日志"),
    Code("const n = signal(0)\neffect(() => {\n  console.log('[n]', n())\n})\n\n// 输出带前缀，好过滤\n// [n] 0\n// [n] 1", "js"),
    H2("性能分析"),
    Code("// 手动计时\nconst t0 = performance.now()\nsomeOperation()\nconsole.log(performance.now() - t0, 'ms')\n\n// Performance API\nperformance.mark('start')\nsomeOperation()\nperformance.mark('end')\nperformance.measure('op', 'start', 'end')\nconsole.table(performance.getEntriesByType('measure'))", "js"),
    H2("断点"),
    P("浏览器 F12 Sources 面板——在 .js 里打断点，跟普通 JS 一样。"),
    H2("看 effect 重跑"),
    Code("let count = 0\nconst stop = effect(() => {\n  count++\n  console.log('effect 跑了', count, '次')\n})\n// 如果很快到 100+，说明有循环依赖", "js"),
    H2("常见问题排查"),
    Table(["症状","排查"], [["页面不变","检查是否用了 () => 包动态值"],["重复执行","effect 里是否读写同一 signal"],["内存涨","onUnmount 是否清理定时器"],["列表错乱","list 的 key 是否唯一稳定"],["性能差","devtools 性能面板看长任务"]]),
  )
}
