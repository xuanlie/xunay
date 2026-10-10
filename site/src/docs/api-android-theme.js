// setTheme(mode)
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("setTheme(mode)"),
    P("切换明暗主题。简单版：改根背景色和文字色。"),
    H2("签名"),
    Code("setTheme(\"dark\")   // 暗色\\nsetTheme(\"light\")  // 亮色", "xuy"),
    H2("示例"),
    Code("const mode = s(\"light\")\\n\\nconst toggle = () => {\\n  const next = mode() === \"light\" ? \"dark\" : \"light\"\\n  mode(next)\\n  setTheme(next)\\n}\\n\\nmount(() => div(null,\\n  button({ on: { click: () => toggle() } }, \"切换主题\"),\\n  span(null, txt`当前: ${mode}`)\\n), \"#app\")", "xuy"),
    H2("生成的 Java"),
    Code("private void setTheme(String mode) {\\n    boolean dark = \"dark\".equals(mode);\\n    int bg = dark ? 0xFF121212 : 0xFFFFFFFF;\\n    int fg = dark ? 0xFFEEEEEE : 0xFF222222;\\n    android.view.View __root = findViewById(android.R.id.content);\\n    if (__root != null) __root.setBackgroundColor(bg);\\n    applyThemeColors(__root, fg);\\n}", "java"),
    H2("效果"),
    Ul("根背景色切换（白 ↔ 黑）","所有 TextView 文字色切换（深灰 ↔ 浅灰）","只在调用时刷新，不持久化"),
    H2("持久化主题"),
    Code("onMount(() => {\\n  const saved = localStorage.getItem(\"theme\")\\n  if (saved != null) setTheme(saved)\\n})\\n\\nconst toggle = () => {\\n  const next = mode() === \"light\" ? \"dark\" : \"light\"\\n  mode(next)\\n  setTheme(next)\\n  localStorage.setItem(\"theme\", next)\\n}", "xuy"),
    H2("限制"),
    Ul("不跟随系统暗色模式（要自己读 Configuration）","不改按钮 / 输入框等复杂 View 的样式","不支持颜色主题（只明暗两态）"),
  )
}
