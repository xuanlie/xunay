// ctx(default)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("ctx(default)"),
    P("创建跨层级传递值的上下文。"),
    H2("签名"),
    Code("const C = ctx(defaultValue)", "js"),
    H2("返回值"),
    Table(["方法","作用"], [["C.get()","读最近一次 provide 的值"],["C.provide(value, fn)","在 fn 执行期间提供值"]]),
    H2("示例"),
    Code("import { ctx, div } from 'xunay'\n\nconst ThemeCtx = ctx('light')\n\n// 祖先\nThemeCtx.provide('dark', () => Card())\n\n// 后代\nfunction Card() {\n  const theme = ThemeCtx.get()\n  return div(null, 'theme: ' + theme)\n}", "xuy"),
    H2("特性"),
    Ul("同步栈——provide 期间的 get 才有效","可嵌套——内层覆盖外层","默认值——没人 provide 时返回"),
    H2("嵌套"),
    Code("const C = ctx('root')\nC.provide('a', () => {\n  C.get()   // 'a'\n  C.provide('b', () => {\n    C.get()   // 'b'\n  })\n  C.get()   // 'a'\n})", "xuy"),
    H2("陷阱"),
    H3("异步里失效"),
    Code("C.provide('x', async () => {\n  await sleep(100)\n  C.get()   // 已经退出 provide，读不到 'x'\n})", "xuy"),
  )
}
