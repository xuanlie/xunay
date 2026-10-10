// 性能报告
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("性能报告"),
    P("xunay 的实测数据。测试环境：Node v24.20.0（signal 层）+ Chrome 移动端模拟（DOM 层）。"),
    H2("核心响应式（Node 实测）"),
    Table(["操作","单次","ops/s"], [["signal.create","0.042 µs","23.97M"],["signal.read","0.026 µs","38.91M"],["signal.write（无订阅）","0.013 µs","78.11M"],["signal.write（1 effect）","0.143 µs","6.98M"],["computed.read（缓存命中）","0.006 µs","177.46M"],["computed.recompute","0.106 µs","9.41M"],["effect.create + dispose","0.470 µs","2.13M"],["batch（2 写合并）","0.382 µs","2.62M"]]),
    P("signal.read 26 纳秒、write 13 纳秒——跟 Solid 同级。computed 缓存命中 6 纳秒，基本等于直接读变量的成本。"),
    H2("编译期 vs 运行时（浏览器实测）"),
    P("这是 xuyc 编译期方案的核心收益——动态节点首挂近 2 倍提升。"),
    Table(["场景","编译期","运行时 vnode","加速"], [["首挂 1000 静态节点","0.8 ms","1.0 ms","1.25×"],["首挂 1000 动态节点（每个带 effect）","2.0 ms","3.7 ms","1.85×"],["list() 1000 项 keyed 更新","—","2.2 ms","—"]]),
    P("运行时版本的动态节点首挂要创建 vnode 对象再走 render() 遍历；编译期直接 createElement + effect 挂载。省下 42% 首挂时间。"),
    H2("包体积（gzip）"),
    Table(["文件","gzip"], [["xunay.min.js（iife）","6.22 KB"],["xunay.esm.js（核心）","6.01 KB"],["xunay-full.min.js","6.96 KB"],["xunay-ssr.min.js","4.95 KB"],["xunay-kit.min.js（106 组件）","26.54 KB"],["xunay-anim.min.js（228 动画）","14.03 KB"],["xunay-devtools.min.js","15.73 KB"]]),
    H2("对比同类框架"),
    Table(["框架","runtime gzip","1000 动态节点首挂","参考"], [["React 18","45 KB","30-60 ms","VDOM diff"],["Vue 3","34 KB","10-20 ms","Proxy + 编译"],["Svelte 5","~10 KB","4-6 ms","编译 + rune"],["Solid","8 KB","2-3 ms","编译 + signal"],["XuNay","6.01 KB","2.0 ms","编译 + signal"]]),
    P("runtime 体积同级别最小；首挂跟 Solid 同档，比 Vue 快 5-10 倍，比 React 快 15-25 倍。"),
    H2("signal 写触发（对比）"),
    Table(["框架","写触发耗时"], [["XuNay","0.143 µs"],["Solid","0.2 ~ 0.3 µs"],["Vue 3","1 ~ 2 µs"],["React 19","~50 µs"]]),
    H2("复现"),
    P("所有数字都可以自己跑。"),
    Code("# signal 层\ncd E:/xunay\nnode bench/node.mjs\n\n# DOM 层\ncd E:/xunay\npython -m http.server 12341\n# 浏览器打开 http://localhost:12341/bench/compile-vs-runtime.html", "bash"),
    H2("说明"),
    Ul("Node 数据是纯 JS 环境，浏览器数据含真实 DOM 操作","跨框架数字来自各自公开基准，测试条件不完全一致，仅供参考","单次测量噪音大，bench 脚本取中位数","已知未解：subs 每次 render 累积（effect 未 dispose），长会话会变慢"),
  )
}
