// 别名
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("别名"),
    Tip("从 xunay/alias 引入：import { s, c, f, bat, m, l } from 'xunay/alias'"),
    P("xunay 为常用 API 提供短别名——写 .xuy 时更短，写代码更省。"),
    H2("8 个别名"),
    Table(["全名","别名","用途"], [["signal","s","信号"],["computed","c","派生"],["effect","f","副作用"],["batch","bat","批量"],["mount","app","挂载"],["mount","m","挂载"],["list","l","列表"],["list","each","列表"]]),
    H2("用法"),
    Code("import { s, c, f, bat, m, l } from 'xunay'\n\nconst n = s(0)\nconst double = c(() => n() * 2)\n\nf(() => console.log('n =', n()))\n\nbat(() => {\n  n(1)\n  n(2)\n})\n\nm(() => div(null, l([1,2,3], i => i, i => span(null, i))), '#app')", "xuy"),
    H2("什么时候用别名"),
    Table(["场景","用全名","用别名"], [[".xuy 文件","","✓ 更短"],["教","程","/","文","档"],["✓"," ","更","清","晰"],[],["大","型","项","目"],["✓"],[],["代","码","高","尔","夫"],[],["✓"]]),
    H2("同时导入"),
    Code("// 全名和别名可以一起用\nimport { signal, s, computed, c } from 'xunay'\n\nconst a = signal(0)   // 全名\nconst b = s(0)        // 别名\n// a 和 b 都是 signal", "xuy"),
    H2("不支持别名的 API"),
    P("以下 API 没有别名，必须用全名："),
    Ul("div / span / button / input 等标签工厂","show / frag / F / txt","onMount / onUnmount / ref / ctx / err / lazy / trans","renderToString / hydrate"),
    H2("alias 全局注册"),
    P("alias 函数可以把 API 挂到全局："),
    Code("import { alias, signal } from 'xunay'\n\nalias('n', signal)   // 全局可访问 window.n\n\n// 之后\nconst x = n(0)   // 不用 import", "xuy"),
    Warn("全局注册会污染 window。除了快速原型，不推荐用。"),
    H2("为什么只有这些别名"),
    P("xunay 的别名只覆盖\"高频 + 短\"的 API。标签工厂（div、span）已经很短，不需要别名；生僻 API（trans、lazy）用全名更好读。"),
    H2("完整示例"),
    Code("// 用别名写一个计数器\nimport { s, c, f, m, div, button, span } from 'xunay'\n\nconst n = s(0)\nconst double = c(() => n() * 2)\n\nf(() => console.log('n 变了:', n()))\n\nm(() => div(null,\n  button({ on: { click: () => n(v => v - 1) } }, '-'),\n  span(null, () => n()),\n  button({ on: { click: () => n(v => v + 1) } }, '+'),\n  span(null, () => '双倍: ' + double())\n), '#app')", "xuy"),
    H2("和原名的对照表"),
    Table(["写法","等价"], [["s(0)","signal(0)"],["c(fn)","computed(fn)"],["f(fn)","effect(fn)"],["bat(fn)","batch(fn)"],["m(comp, target)","mount(comp, target)"],["app(comp, target)","mount(comp, target)"],["l(arr, key, fn)","list(arr, key, fn)"],["each(arr, key, fn)","list(arr, key, fn)"]]),
  )
}
