// 已知限制
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("已知限制"),
    P("compiler3 用 acorn 做解析，比 compiler2 稳。但仍有边界。"),
    H2("不支持"),
    Table(["类别","说明"], [["JSX","没有 <div> 语法，标签必须写 div(...)"],["模板","没有 {{ }} / v-if 之类"],["TypeScript 类型注解","纯 JS，类型写在 .d.ts 里"],["动态标签名","createElement(Tag) 不做编译"],["自定义标签","除非用 registerTags 注册"]]),
    H2("运行时的部分"),
    Ul("大写 kit 组件（Card / Btn 等）走运行时 vnode 渲染，不走编译器","动态表达式里嵌套的复杂函数调用，只有标签子串被替换，其余原样"),
    H2("已知边界"),
    Table(["场景","行为","说明"], [["变量遮蔽标签名","不编译","const div = x; div() 保留原样"],["属性对象是变量","运行时应用","div(props) 会在运行时遍历对象"],["展开运算符","运行时应用","div({ ...props }) 走 __rt__.applyProps"],["嵌套 map","递归编译","每层重新 parseExpressionAt"]]),
    H2("属性 key 的限制"),
    Code("// 合法\ndiv({ 'data-id': 1 })\ndiv({ for: 'x' })\n\n// 不能直接写保留字\ndiv({ class: 'x', for: 'y' })  // for 是保留字", "js"),
    H2("和 compiler2 相比"),
    Table(["问题","compiler2","compiler3"], [["value 响应式","el.value = () => 错","bindAttr 对"],["变量遮蔽","误编译","不编译"],["属性 key 引号","setAttribute(\"'data-id'\")","setAttribute('data-id')"],["死代码","tokenizer.js 未用","无"],["语法错误","字符串扫描容易死循环","acorn 抛 SyntaxError"]]),

  )
}
