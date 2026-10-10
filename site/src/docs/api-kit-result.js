// kit: Result
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Result"),
    P("kit 里的 Result 组件。"),
    H2("引入"),
    Code("import { Result } from 'xunay/kit/display'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["extra","——","——",""],["status","——","——",""],["subTitle","——","——",""],["title","——","——","标题"]]),
    H2("基础用法"),
    Code("import { Result } from 'xunay/kit/display'\n\nResult({ title: 'example' })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
