// kit: Transfer
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Transfer"),
    P("kit 里的 Transfer 组件。"),
    H2("引入"),
    Code("import { Transfer } from '/root/xunay/core/src/Kit/ui/index.js'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["data","——","——",""],["onChange","——","——","回调"],["titles","——","——",""],["value","——","——","可传 signal（响应式）"]]),
    H2("移动端"),
    P("单列布局。"),
    H2("基础用法"),
    Code("import { Transfer } from '/root/xunay/core/src/Kit/ui/index.js'\n\nTransfer({ value: mySignal, onChange: () => {} })", "js"),
    H2("响应式"),
    P("这些参数可以直接传 signal，值变化时 DOM 会自动更新："),
    Code("import { signal } from '/tmp/xuyg-test/xunay.js'\nimport { Transfer } from '/root/xunay/core/src/Kit/ui/index.js'\n\nconst v = signal('')\n\nTransfer({ value: v })", "js"),
    Tip("不要写成 value: v() —— 传函数给 render.js，让它挂 effect。"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
