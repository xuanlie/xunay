// 绑定系统
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Xuyg · 数据绑定"),
    H2("三个前缀"),
    Table(["前缀","含义","例子"], [["$","数据源（数组）","$goods / $LIST"],["@","字段 / 全局","@img / @cartCount"],["（无）","字面值 / 全局","'ShopX' / kw"]]),
    H2("标签默认属性"),
    P("写 @值 时自动对应到标签的默认属性："),
    Table(["标签","默认属性"], [["img / video / audio / source","src"],["h1~h6 / p / span / a","text"],["input / textarea / select","value"]]),
    Code("// 这两种等价\nimg: @img\nimg: { src: @img }\n\nh3: @name\nh3: { text: @name }", "js"),
    H2("属性简写"),
    Table(["写法","展开"], [["c: \"xxx\"","class: \"xxx\""],["i: \"xxx\"","id: \"xxx\""],["s: \"xxx\"","style: \"xxx\""]]),
    H2("三档写法"),
    Code("// 最简\nh2: 'ShopX'\n\n// 中等\nh2: 'ShopX', c:'cbrand'\n\n// 完整\nh2: { text: 'ShopX', c: 'brand', '@click': fn }", "js"),
    H2("vmodel 双向绑定"),
    Code("input({ vmodel: kw })", "js"),
    P("编译成："),
    Code("input({\n  value: () => kw(),\n  on: { input: (e) => kw(e.target.value) }\n})", "js"),
    Tip("若同时写了 on: {...}，会自动合并（不会产生两个 on 键）。"),
  )
}
