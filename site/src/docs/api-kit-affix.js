// kit: Affix
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Affix"),
    P("kit 里的 Affix 组件。"),
    H2("引入"),
    Code("import { Affix } from 'xunay/kit/layout'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["bottom","——","——",""],["top","——","——",""]]),
    H2("基础用法"),
    Code("import { Affix } from 'xunay/kit/layout'\n\nAffix({ /* see table above */ })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
