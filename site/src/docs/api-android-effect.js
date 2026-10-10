// effect(fn)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("effect(fn)"),
    P("副作用。自动追踪 fn 里引用到的 signal，任何一个变化就重新执行。"),
    H2("签名"),
    Code("effect(() => { /* 副作用 */ })", "xuy"),
    H2("示例"),
    Code("const n = s(0)\\nconst log = s(\"\")\\n\\neffect(() => {\\n  log(\"n 变了: \" + n())\\n})", "xuy"),
    H2("生成的 Java"),
    P("依赖的 signal 每个生成一条 subscribe："),
    Code("n.subscribe(val -> {\\n    log.set((\"n 变了: \" + String.valueOf(n.get())));\\n});", "java"),
    H2("多依赖"),
    Code("effect(() => {\\n  save(a() + b())\\n})", "xuy"),
    P("生成两条 subscribe：a.subscribe(...) 和 b.subscribe(...)。"),
    H2("和 computed 的区别"),
    Table(["","computed","effect"], [["用途","派生值","执行副作用"],["返回","有返回值","无返回值"],["依赖追踪","使用时展开","立即订阅"],["执行时机","每次读取","依赖变化时"]]),
    H2("注意事项"),
    Ul("不要产生无限循环（effect 里改它依赖的 signal）","同步执行，耗时操作用 setTimeout / async","effect 只在顶层调用，不能嵌套"),
  )
}
