// kit: DragUpload
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: DragUpload"),
    P("kit 里的 DragUpload 组件。"),
    H2("引入"),
    Code("import { DragUpload } from 'xunay/kit/upload'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["accept","——","——",""],["multiple","——","——",""],["onFiles","——","——","回调"],["text","——","——","文本"]]),
    H2("基础用法"),
    Code("import { DragUpload } from 'xunay/kit/upload'\n\nDragUpload({ text: 'example', onFiles: () => {} })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
