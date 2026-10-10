// tags 对象
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("tags 对象"),
    P("所有内置标签工厂的集合。"),
    H2("结构"),
    Code("import { tags } from 'xunay'\n\ntags.div({ class: 'x' }, 'hello')\ntags.span(null, 'world')", "xuy"),
    H2("内置标签"),
    Code("div span p a button input form label ul ol li\nh1 h2 h3 h4 h5 h6 img br hr table thead tbody tr td th pre code blockquote\ncheckbox switch radio progress slider tabs tab", "txt"),
    P("后 6 个（checkbox / switch / radio / progress / slider / tabs / tab）是 xunay kit 的自定义标签，不是标准 HTML。"),
    H2("展开"),
    Code("import { tags } from 'xunay'\n\nfor (const name in tags) {\n  console.log(name)\n}", "xuy"),
    H2("用途"),
    P("动态选择标签时有用："),
    Code("function Dynamic({ as, ...rest }) {\n  return tags[as](rest, '内容')\n}\nDynamic({ as: 'h1' })", "xuy"),
  )
}
