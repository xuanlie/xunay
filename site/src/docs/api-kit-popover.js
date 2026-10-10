// kit: Popover
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Popover"),
    P("kit 里的 Popover 组件。"),
    H2("引入"),
    Code("import { Popover } from 'xunay/kit/overlay'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["content","——","——",""],["position","——","——",""],["title","——","——","标题"],["trigger","——","——",""]]),
    H2("移动端"),
    P("自动检测触摸设备，改点击触发。"),
    H2("基础用法"),
    Code("import { Popover } from 'xunay/kit/overlay'\n\nPopover({ title: 'example' })", "js"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
