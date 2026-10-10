// onMount(fn)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("onMount(fn)"),
    P("组件挂载时执行一次。对应 Android 的 onCreate 末尾。"),
    H2("签名"),
    Code("onMount(() => { /* 初始化 */ })", "xuy"),
    H2("示例"),
    Code("const now = signal(\"\")\\n\\nonMount(() => {\\n  const v = localStorage.getItem(\"userName\")\\n  if (v != null) name(v)\\n  now(\"已挂载\")\\n})", "xuy"),
    H2("生成的 Java"),
    P("代码插入到 onCreate 里所有 subscribe 之后。"),
    Code("protected void onCreate(Bundle savedInstanceState) {\\n    super.onCreate(savedInstanceState);\\n    setContentView(R.layout.activity_main);\\n    ...bindings...\\n    String v = getPref(\"userName\");\\n    if ((v != null)) { name.set(v); }\\n    now.set(\"已挂载\");\\n}", "java"),
    H2("多个 onMount"),
    P("多个 onMount 按书写顺序执行。"),
    H2("注意事项"),
    Ul("同步执行，不要做耗时操作","异步用 async () => { await fetch(...) } 或 setTimeout","不要在 onMount 里操作还没有的 view"),
  )
}
