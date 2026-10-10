// kit: Progress
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: Progress"),
    P("kit 里的 Progress 组件。"),
    H2("引入"),
    Code("import { Progress } from 'xunay/kit/display'", "js"),
    H2("参数"),
    Table(["参数","类型","默认","说明"], [["color","——","——",""],["max","——","100",""],["showText","——","——",""],["size","——","'md'","尺寸"],["value","——","——","可传 signal（响应式）"]]),
    H2("基础用法"),
    Code("import { Progress } from 'xunay/kit/display'\n\nProgress({ value: mySignal, size: 'md' })", "js"),
    H2("响应式"),
    P("这些参数可以直接传 signal，值变化时 DOM 会自动更新："),
    Code("import { signal } from 'xunay'\nimport { Progress } from 'xunay/kit/display'\n\nconst v = signal('')\n\nProgress({ value: v })", "js"),
    Tip("不要写成 value: v() —— 传函数给 render.js，让它挂 effect。"),
    Tip("完整组件清单见「Kit 组件 → Kit 组件 API」。"),
  )
}
