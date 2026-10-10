// kit: Cascader
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Cascader"),
    P("kit 里的 Cascader 组件。"),
    H2("引入"),
    Code("import { Cascader } from 'xunay/kit/form'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["onChange","——","——","回调"],["options","——","——","选项列表"],["placeholder","——","''","占位文字"],["value","——","——","可传 signal（响应式）"]]),
    H2("移动端"),
    P("全屏选择。"),
    H2("基础用法"),
    Code("import { Cascader } from 'xunay/kit/form'\n\nCascader({ value: mySignal, placeholder: 'example', options: [] })", "js"),
    H2("响应式"),
    P("这些参数可以直接传 signal，值变化时 DOM 会自动更新："),
    Code("import { signal } from 'xunay'\nimport { Cascader } from 'xunay/kit/form'\n\nconst v = signal('')\n\nCascader({ value: v })", "js"),
    Tip("不要写成 value: v() —— 传函数给 render.js，让它挂 effect。"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
