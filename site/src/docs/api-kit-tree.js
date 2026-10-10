// kit: Tree
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Tree"),
    P("kit 里的 Tree 组件。"),
    H2("引入"),
    Code("import { Tree } from 'xunay/kit/data'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["data","——","——",""],["render","——","——",""]]),
    H2("移动端"),
    P("触摸区 44px。"),
    H2("基础用法"),
    Code("import { Tree } from 'xunay/kit/data'\n\nTree({ /* see table above */ })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
