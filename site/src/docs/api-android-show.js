// show(cond, render)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("show(cond, render)"),
    P("条件渲染。cond 为真时显示，为假时隐藏。生成 FrameLayout + setVisibility。"),
    H2("签名"),
    Code("show(() => cond(), () => tag(...))", "xuy"),
    H2("简单用法"),
    Code("show(() => submitted(), () => div(null, \"注册成功！\"))\\nshow(() => loading(), () => span(null, \"加载中...\"))", "xuy"),
    H2("依赖 computed"),
    Code("show(() => nameErr() !== \"\", () => span({ class: \"err-msg\" }, () => nameErr()))", "xuy"),
    P("cond 引用 computed 时自动展开到它依赖的 signal。这里 nameErr 依赖 name，所以生成 name.subscribe。"),
    H2("生成的 XML"),
    Code("<FrameLayout android:id=\"@+id/v5\"\\n    android:layout_width=\"match_parent\"\\n    android:layout_height=\"wrap_content\"\\n    android:visibility=\"gone\">\\n    ...child...\\n</FrameLayout>", "xml"),
    H2("生成的 Java"),
    Code("// 初值设为 GONE\\nfindViewById(R.id.v5).setVisibility(android.view.View.GONE);\\n\\n// 每个依赖 signal 加订阅\\nname.subscribe(val -> findViewById(R.id.v5).setVisibility(\\n    !nameErr().equals(\"\") ? android.view.View.VISIBLE : android.view.View.GONE\\n));", "java"),
    H2("多依赖"),
    P("computed 依赖多个 signal 时，每个 signal 都会生成一条 subscribe。"),
    Code("const confirmErr = computed(() => {\\n  if (!confirm()) return \"\"\\n  if (confirm() !== password()) return \"两次密码不一致\"\\n  return \"\"\\n})\\n\\n// 生成两条：\\nconfirm.subscribe(val -> ...);\\npassword.subscribe(val -> ...);", "txt"),
    H2("注意事项"),
    Ul("cond 必须是函数（() => ...），不能直接传值","render 必须是函数，且只能返回一个 tag","不支持 else 分支（用两个 show 或三元）","不支持 Fragment"),
  )
}
