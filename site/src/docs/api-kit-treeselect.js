// kit: TreeSelect
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: TreeSelect"),
    P("kit 里的 TreeSelect 组件。"),
    H2("引入"),
    Code("import { TreeSelect } from 'xunay/kit/data'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["data","——","——",""],["onChange","——","——","回调"],["placeholder","——","''","占位文字"],["value","——","——","可传 signal（响应式）"]]),
    H2("基础用法"),
    Code("import { TreeSelect } from 'xunay/kit/data'\n\nTreeSelect({ value: mySignal, placeholder: 'example', onChange: () => {} })", "js"),
    H2("响应式"),
    P("这些参数可以直接传 signal，值变化时 DOM 会自动更新："),
    Code("import { signal } from 'xunay'\nimport { TreeSelect } from 'xunay/kit/data'\n\nconst v = signal('')\n\nTreeSelect({ value: v })", "js"),
    Tip("不要写成 value: v() —— 传函数给 render.js，让它挂 effect。"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
