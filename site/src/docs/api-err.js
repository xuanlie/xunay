// err(fn, fallback)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("err(fn, fallback)"),
    P("错误边界——同步捕获 fn 里的异常，出错时返回 fallback。"),
    H2("签名"),
    Code("err(fn, fallback)", "js"),
    H2("参数"),
    Table(["参数","类型","说明"], [["fn","() => T","可能抛错的函数"],["fallback","T 或 (e) => T","出错时的返回值"]]),
    H2("示例"),
    Code("import { err, div } from 'xunay'\n\nerr(\n  () => JSON.parse(userInput),\n  (e) => div(null, '错误: ' + e.message)\n)", "xuy"),
    H2("默认行为"),
    P("不传 fallback 时，打印 console.error 并返回 undefined。"),
    H2("特性"),
    Ul("只捕获同步异常","fallback 可以是值或函数","可以嵌套"),
    H2("陷阱"),
    H3("不捕获异步"),
    Code("err(() => { fetch('/api').then(...) })   // 异步 reject 捕不到", "xuy"),
  )
}
