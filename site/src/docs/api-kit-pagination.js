// kit: Pagination
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Pagination"),
    P("kit 里的 Pagination 组件。"),
    H2("引入"),
    Code("import { Pagination } from 'xunay/kit/nav'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["onChange","——","——","回调"],["page","——","——","可传 signal（响应式）"],["pageSize","——","——",""],["total","——","——",""]]),
    H2("移动端"),
    P("简化（上/下页 + 当前页）。"),
    H2("基础用法"),
    Code("import { Pagination } from 'xunay/kit/nav'\n\nPagination({ onChange: () => {}, page: mySignal })", "js"),
    H2("响应式"),
    P("这些参数可以直接传 signal，值变化时 DOM 会自动更新："),
    Code("import { signal } from 'xunay'\nimport { Pagination } from 'xunay/kit/nav'\n\nconst v = signal(false)\n\nPagination({ page: v })", "js"),
    Tip("不要写成 page: v() —— 传函数给 render.js，让它挂 effect。"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
