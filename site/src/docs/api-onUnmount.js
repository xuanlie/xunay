// onUnmount(fn)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("onUnmount(fn)"),
    P("注册\"元素即将卸载\"的回调。"),
    H2("签名"),
    Code("onUnmount(fn)", "js"),
    H2("示例"),
    Code("import { onMount, onUnmount, div } from 'xunay'\n\nfunction Timer() {\n  onMount(() => {\n    const id = setInterval(tick, 1000)\n    onUnmount(() => clearInterval(id))\n  })\n  return div(null, '定时器')\n}", "xuy"),
    H2("执行时机"),
    Table(["触发","时机"], [["show 切换假","卸载时"],["list 删除项","卸载时"],["父组件卸载","递归卸载时"],["unmount() 调用","卸载根组件时"]]),
    H2("执行顺序"),
    P("子 scope 的 onUnmount 先于父 scope。"),
    Code("// <Parent><Child /></Parent>\n// 卸载顺序：Child onUnmount → Parent onUnmount", "js"),
    H2("用途"),
    Ul("清定时器","取消订阅","关闭 WebSocket","保存草稿"),
    H2("陷阱"),
    H3("不能在 onUnmount 里访问 DOM"),
    P("卸载时元素可能已经被移除，用捕获的引用而非 querySelector。"),
  )
}
