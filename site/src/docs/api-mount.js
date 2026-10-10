// mount(comp, target)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("mount(comp, target)"),
    P("把组件挂载到 DOM 容器。"),
    H2("签名"),
    Code("const unmount = mount(comp, target)", "js"),
    H2("参数"),
    Table(["参数","类型","说明"], [["comp","() => VNode 或 VNode","组件函数或 vnode"],["target","string 或 Element","CSS 选择器或 DOM 元素"]]),
    H2("返回值"),
    P("返回 unmount 函数——调用会卸载组件、清理所有 scope。"),
    H2("示例"),
    Code("import { mount, div, h1, signal } from 'xunay'\n\nconst n = signal(0)\n\nconst unmount = mount(() => div(null,\n  h1(null, 'Hello'),\n  () => String(n())\n), '#app')\n\n// 卸载\nunmount()", "xuy"),
    H2("target 两种形式"),
    Code("mount(App, '#app')                         // CSS 选择器\nmount(App, document.getElementById('app')) // DOM 元素", "xuy"),
    H2("创建根 scope"),
    P("mount 会为根组件建一个 scope，卸载时自动 dispose——里面所有 effect、onMount、onUnmount 一起清理。"),
    H2("和 hydrate 的区别"),
    Table(["","mount","hydrate"], [["目标容器","空","有 SSR 内容"],["行为","清空 + 重建","复用 + 绑定"],["场景","CSR","SSR"]]),
    H2("陷阱"),
    H3("target 找不到"),
    Code("mount(App, '#not-exist')   // 抛错：target not found", "xuy"),
    H3("重复 mount 同容器"),
    Code("mount(App, '#app')\nmount(App2, '#app')\n// 第二个 mount 会清空第一个的结果", "xuy"),
  )
}
