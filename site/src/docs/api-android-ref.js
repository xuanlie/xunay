// ref()
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("ref()"),
    P("拿到原生 View 引用，直接调 Android API。"),
    H2("签名"),
    Code("const inputRef = ref()", "xuy"),
    H2("示例"),
    Code("const inputRef = ref()\\n\\nconst focusIt = () => {\\n  if (inputRef) {\\n    inputRef.requestFocus()\\n  }\\n}\\n\\nmount(() => div(null,\\n  input({ ref: inputRef, placeholder: \"点按钮聚焦\" }),\\n  button({ on: { click: () => focusIt() } }, \"聚焦\")\\n), \"#app\")", "xuy"),
    H2("生成的 Java"),
    Code("private android.view.View inputRef;\\n\\nprotected void onCreate(Bundle savedInstanceState) {\\n    ...\\n    inputRef = findViewById(R.id.v1);\\n}\\n\\n// onClick 里：inputRef.requestFocus();", "java"),
    H2("类型"),
    P("ref 声明的类型是 android.view.View。可以调 View 的所有方法："),
    Ul("requestFocus() / clearFocus()","setVisibility(int)","setAlpha(float)","setBackgroundColor(int)","getWidth() / getHeight()","setOnClickListener(...)（不建议，用 on 属性）"),
    H2("转成具体类型"),
    Code("if (inputRef instanceof android.widget.EditText) {\\n  ((android.widget.EditText) inputRef).setSelection(0);\\n}", "xuy"),
    P("生成 Java 里 instanceof 和 cast 都支持。"),
    H2("注意事项"),
    Ul("ref 在 onCreate 结束时才有值（不是响应式）","不要在 ref 没赋值前调用方法","不支持多个元素绑同一个 ref"),
  )
}
