// s 别名
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("s 别名"),
    P("signal 的短别名。"),
    H2("等价"),
    Code("import { s, signal } from '/tmp/xuyg-test/xunay.js'\ns(0) === signal(0)", "js"),
    H2("示例"),
    Code("import { s } from '/tmp/xuyg-test/xunay.js'\n\nconst n = s(0)\n\ndiv(null,\n  span(null, () => String(n())),\n  () => n(v => v + 1)\n)", "xuy"),
  )
}
