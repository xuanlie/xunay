// kit: BarChart
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: BarChart"),
    P("kit 里的 BarChart 组件。"),
    H2("引入"),
    Code("import { BarChart } from 'xunay/kit/charts'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["color","——","——",""],["data","——","——",""],["height","——","——","高度"],["labels","——","——",""],["showValue","——","——",""]]),
    H2("基础用法"),
    Code("import { BarChart } from 'xunay/kit/charts'\n\nBarChart({ /* see table above */ })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
