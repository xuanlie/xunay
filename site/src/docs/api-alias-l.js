// l 别名
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("l 别名"),
    P("list(arr, key, fn) 的短别名。"),
    H2("等价"),
    Code("list(arr, key, fn)", "js"),
    H2("说明"),
    P("list 的短别名。"),
    H2("示例"),
    Code("import { s, l, ul, li } from 'xunay'\n\nconst items = s([1, 2, 3])\n\nul(null, l(items, i => i, i => li(null, i)))", "xuy"),
  )
}
