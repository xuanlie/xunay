// m 别名
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("m 别名"),
    P("mount(comp, target) 的短别名。"),
    H2("等价"),
    Code("mount(comp, target)", "js"),
    H2("说明"),
    P("mount 的短别名。"),
    H2("示例"),
    Code("import { m, div } from 'xunay'\n\nm(() => div(null, 'Hello'), '#app')", "xuy"),
  )
}
