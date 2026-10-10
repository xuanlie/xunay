// f 别名
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("f 别名"),
    P("effect(fn) 的短别名。"),
    H2("等价"),
    Code("effect(fn)", "js"),
    H2("说明"),
    P("effect 的短别名。"),
    H2("示例"),
    Code("import { s, f, div } from 'xunay'\n\nconst n = s(0)\n\nf(() => console.log('n =', n()))\n\ndiv(null, () => String(n()))", "xuy"),
  )
}
