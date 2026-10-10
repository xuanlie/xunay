// kit: Text
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Text"),
    P("kit 里的 Text 组件。"),
    H2("引入"),
    Code("import { Text } from 'xunay/kit/base'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["bold","——","——",""],["center","——","——",""],["dim","——","——",""],["size","——","'md'","尺寸"],["tag","——","——",""]]),
    H2("基础用法"),
    Code("import { Text } from 'xunay/kit/base'\n\nText({ size: 'md' })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
