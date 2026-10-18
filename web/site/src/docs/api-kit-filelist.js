// kit: FileList
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: FileList"),
    P("kit 里的 FileList 组件。"),
    H2("引入"),
    Code("import { FileList } from '/root/xunay/core/src/Kit/ui/index.js'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["files","——","——",""],["onPreview","——","——","回调"],["onRemove","——","——","回调"]]),
    H2("基础用法"),
    Code("import { FileList } from '/root/xunay/core/src/Kit/ui/index.js'\n\nFileList({ onPreview: () => {}, onRemove: () => {} })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
