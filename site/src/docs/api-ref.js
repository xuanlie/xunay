// ref(init)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("ref(init)"),
    P("创建一个可写、可读的普通变量容器。常用于 DOM 引用。"),
    H2("签名"),
    Code("const r = ref(init)", "js"),
    H2("参数"),
    Table(["参数","类型","说明"], [["init","T","初始值（可选）"]]),
    H2("返回值"),
    Table(["调用","行为"], [["r()","读当前值"],["r(v)","写新值"]]),
    H2("示例"),
    Code("import { ref, input, onMount } from 'xunay'\n\nconst inputRef = ref()\n\ninput({ ref: el => inputRef(el) })\nonMount(() => inputRef().focus())", "xuy"),
    H2("特性"),
    Ul("可读可写","非响应式——写不会触发 effect","不是 signal，不需要 () 之外的额外操作"),
    H2("vs signal"),
    Table(["","ref","signal"], [["响应式","否","是"],["触发更新","否","是"],["用途","DOM 引用 / 内部状态","UI 状态"]]),
    H2("陷阱"),
    H3("在 onMount 之前读"),
    Code("const r = ref()\ndiv({ ref: e => r(e) })\nconsole.log(r())   // 可能 null\nonMount(() => console.log(r()))   // 一定非空", "xuy"),
  )
}
