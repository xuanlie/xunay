// kit: Kanban
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Kanban"),
    P("kit 里的 Kanban 组件。"),
    H2("引入"),
    Code("import { Kanban } from 'xunay/kit/data'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["columns","——","——",""],["items","——","——","数据项"],["onMove","——","——","回调"]]),
    H2("基础用法"),
    Code("import { Kanban } from 'xunay/kit/data'\n\nKanban({ items: [], onMove: () => {} })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
