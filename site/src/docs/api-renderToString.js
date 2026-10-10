// renderToString
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("renderToString"),
    P("服务端把 vnode 转成 HTML 字符串。"),
    H2("签名"),
    Code("import { renderToString } from \"xunay/ssr\"\nconst html = renderToString(vnode)", "js"),
    H2("示例"),
    Code("import { renderToString, div, h1, p } from 'xunay/ssr'\n\nconst html = renderToString(\n  div({ class: 'app' },\n    h1(null, '标题'),\n    p(null, '正文')\n  )\n)\n// '<div class=\"app\"><h1>标题</h1><p>正文</p></div>'", "xuy"),
    H2("不支持"),
    Ul("onMount / onUnmount","effect（不收集）","事件绑定","ref"),
    H2("限制"),
    P("服务端环境没有 document / window。所有用到它们的代码都要判断 typeof window。"),
  )
}
