// kit: Code
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Code"),
    P("kit 里的 Code 组件。"),
    H2("引入"),
    Code("import { Code } from '/root/xunay/core/src/Kit/ui/index.js'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["copyable","——","——",""],["language","——","——",""]]),
    H2("基础用法"),
    Code("import { Code } from '/root/xunay/core/src/Kit/ui/index.js'\n\nCode({ /* see table above */ })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
