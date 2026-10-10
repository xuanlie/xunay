// 约束清单
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("约束清单"),
    P("写 xunay 代码必须遵守的硬约束。违反会出错或性能差。"),
    H2("编译器约束"),
    Table(["约束","说明"], [[".xuy 里不能写 JSX","用 div(...) 函数调用"],[".xuy 里不能写 type 注解",".xuy 是 JS"],["参数化模板必须包箭头函数","(r) => div(...) 而不是 div(...)"],["字符串里的 div( 可能误处理","避免字符串里写代码"],["正则字面量可能误判","用 new RegExp()"],["不能动态生成标签名","用 createElement"]]),
    H2("运行时约束"),
    Table(["约束","说明"], [["signal 读要加 ()","n() 不是 n"],["动态值要包函数","() => n() 不是 n()"],["深层对象要整体替换","{ ...u, a: {...} }"],["数组操作返回新数组","不 push / splice"],["effect 里不能读写同一 signal","会死循环"],["list 的 key 必须唯一稳定","不用索引"]]),
    H2("生命周期约束"),
    Table(["约束","说明"], [["onMount 必须在组件内","模块顶层不生效"],["onUnmount 里不能访问 DOM","元素可能已移除"],["show 切换会重建子树","内部 signal 状态重置"],["list 删除项会 dispose scope","内部 effect 自动清理"]]),
    H2("性能约束"),
    Table(["约束","说明"], [["函数返回 vnode 会整块重建","大子树用 show / list"],["一个 effect 不要读超过 10 个 signal","拆成多个"],["列表项渲染不要有副作用","纯函数"],["不要深层嵌套对象做 signal","内存和性能都差"]]),
    H2("SSR 约束"),
    Table(["约束","说明"], [["服务端不能访问 document / window","用 typeof window 判断"],["服务端不跑 onMount / effect","只渲染结构"],["hydrate 时 DOM 必须匹配","否则警告 + 重建"],["两端 initial state 必须一致","否则闪变"]]),
    H2("安全约束"),
    Table(["约束","说明"], [["html 属性有 XSS 风险","先 sanitize"],["用户输入不直接写 innerHTML","用 textContent"],["CORS 不用 *","明确列出来源"],["SQL 必须参数化","防注入"]]),
    H2("设计约束"),
    Table(["约束","说明"], [["不写 TypeScript","设计哲学"],["不加不必要的依赖","核心零依赖"],["不用 Hooks 概念","用 scope"],["不引入 VDOM","用 effect 精确更新"]]),
  )
}
