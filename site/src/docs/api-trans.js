// trans(duration)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("trans(duration)"),
    P("创建过渡助手——返回 enter / leave 两个方法。"),
    H2("签名"),
    Code("const t = trans(200)", "js"),
    H2("返回值"),
    Table(["方法","参数","行为"], [["t.enter(el)","DOM 元素","淡入"],["t.leave(el, done)","元素 + 回调","淡出后调 done"]]),
    H2("示例"),
    Code("import { trans, div, onMount, onUnmount } from 'xunay'\n\nconst fade = trans(200)\n\nconst el = div(null, '内容')\nonMount(() => fade.enter(el))\nonUnmount(() => fade.leave(el, () => {}))", "xuy"),
    H2("实现"),
    Code("function trans(d) {\n  return {\n    enter(el) {\n      el.style.transition = 'opacity ' + d + 'ms'\n      el.style.opacity = '0'\n      requestAnimationFrame(() => el.style.opacity = '1')\n    },\n    leave(el, done) {\n      el.style.transition = 'opacity ' + d + 'ms'\n      el.style.opacity = '0'\n      setTimeout(done, d)\n    }\n  }\n}", "js"),
    H2("注意"),
    P("show 切换是同步的——leave 阶段元素已被移除。需要真过渡时手动控制挂载。"),
  )
}
