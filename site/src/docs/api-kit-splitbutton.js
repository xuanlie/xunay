// kit: SplitButton
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: SplitButton"),
    P("kit 里的 SplitButton 组件。"),
    H2("引入"),
    Code("import { SplitButton } from 'xunay/kit/editor'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["items","——","——","数据项"],["onClick","——","——","回调"],["text","——","——","文本"]]),
    H2("基础用法"),
    Code("import { SplitButton } from 'xunay/kit/editor'\n\nSplitButton({ text: 'example', items: [], onClick: () => {} })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
