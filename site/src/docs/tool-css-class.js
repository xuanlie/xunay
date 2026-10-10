// @title class 属性
// @group CSS
// @order 3
// @slug tool-css-class

import { D, H1, H2, H3, P, Code, Ul, Tip, Warn, Note, Table } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('class 属性'),
    P('元素上 class 的完整写法。静态、动态、条件、拼接。'),

    H2('静态'),
    Code('div({ class: "p-4 bg-white rounded" }, "内容")', 'xuy'),

    H2('动态 class（函数）'),
    P('写函数，依赖的信号变化时自动重算。'),
    Code('const active = s(false)\n\ndiv({ class: () => active() ? "bg-blue-500" : "bg-gray-200" }, "切换")', 'xuy'),

    H2('模板拼接'),
    Code('const size = s("md")\n\ndiv({ class: () => `p-4 bg-white ${size()}` })', 'xuy'),

    H2('多类名'),
    Code('div({ class: "flex items-center justify-between p-4 border-b" })', 'xuy'),

    H2('常见错误'),
    Warn('div({ class: active() ? "on" : "off" })  ← 立即求值，不会响应'),
    Tip('必须写 () => active() ? "on" : "off"，或 class: () => ...'),

    H2('跟 id 一起用'),
    Code('div({ id: "main", class: "p-4" })', 'xuy'),

    H2('和 style 混用'),
    Code('div({\n  class: "p-4 rounded",\n  style: () => ({ width: n() + "%" })\n})', 'xuy'),
    Note('class 管静态样式，style 管运行时计算的（如百分比宽度）。'),

    H2('Android 端行为'),
    Ul(
      '静态 class：编译时映射成 Java/XML 属性',
      '动态 class：生成 Java 里根据信号切换背景/边框的代码',
      '模板拼接：只处理 {信号} 部分，其余当静态',
      '无法解析的类：忽略（不报错）',
    ),

    H2('和 tw.css / ui.css 关系'),
    Table(['样式表', '用途'], [
      ['tw.css', '工具类（flex / p-4 / bg-red-500 等，Tailwind 风格）'],
      ['ui.css', '组件类（btn / card / modal 等，Bootstrap 风格）'],
      ['const CSS = ...', '页面自定义样式（写在 .xuy 里）'],
      ['jit.css', '构建时自动生成（任意值 w-[200px]）'],
    ]),
  )
}
