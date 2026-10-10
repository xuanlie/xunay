// render(vnode)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("render(vnode)"),
    P("把 vnode 转换成真实 DOM 节点。底层 API，一般用 mount。"),
    H2("签名"),
    Code("const dom = render(vnode)", "js"),
    H2("处理类型"),
    Table(["输入","输出"], [["null / false / true","空文本节点"],["字符串 / 数字","文本节点"],["函数","递归执行后 render"],["vnode","真实 DOM 元素"],["fragment","display:contents 的 span"],["show 对象","display:contents 的 span"],["列表对象","display:contents 的 span"]]),
    H2("示例"),
    Code("import { render, div, h1 } from 'xunay'\n\nconst el = render(div(null, h1(null, '标题')))\ndocument.body.appendChild(el)", "xuy"),
    H2("特性"),
    Ul("不建立根 scope——需要自己用 runInScope 包","不清理旧内容——需要自己管","不执行 onMount——需要 runMountFns","一般用 mount 而不是直接 render"),
    H2("和其他 API 的关系"),
    Code("// mount 内部调用 render\nfunction mount(comp, target) {\n  const root = typeof target === 'string' ? document.querySelector(target) : target\n  const scope = createScope(null)\n  runInScope(scope, () => {\n    root.appendChild(render(comp()))\n  })\n  runMountFns(scope)\n  return () => disposeScope(scope)\n}", "js"),
  )
}
