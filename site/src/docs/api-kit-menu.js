// kit: Menu
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Menu"),
    P("kit 里的 Menu 组件。"),
    H2("引入"),
    Code("import { Menu } from 'xunay/kit/nav'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["items","——","——","数据项"],["mode","——","——",""],["onSelect","——","——","回调"],["selected","——","——","可传 signal（响应式）"]]),
    H2("移动端"),
    P("触摸区 44px。"),
    H2("基础用法"),
    Code("import { Menu } from 'xunay/kit/nav'\n\nMenu({ items: [], onSelect: () => {}, selected: mySignal })", "js"),
    H2("响应式"),
    P("这些参数可以直接传 signal，值变化时 DOM 会自动更新："),
    Code("import { signal } from 'xunay'\nimport { Menu } from 'xunay/kit/nav'\n\nconst v = signal(false)\n\nMenu({ selected: v })", "js"),
    Tip("不要写成 selected: v() —— 传函数给 render.js，让它挂 effect。"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
