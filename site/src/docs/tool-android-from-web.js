// 从 Web 迁移到 Android
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("从 Web 端迁移"),
    P("已有 Web 端 .xuy 想跑 Android 端，需要知道两边的差异。"),
    H2("直接能跑的"),
    Ul("signal / computed / effect","txt 模板","show / list","on.click / input / change","静态 CSS（大部分）","自定义组件（function / 箭头）","onMount / onUnmount"),
    H2("要改的"),
    Table(["Web 写法","Android 改法"], [["document.querySelector(...)","用 ref() 拿引用"],["window.location.href","用 goto(\"page\") 或 back()"],["history.pushState","用 page / goto"],["localStorage","直接用（已映射）"],["fetch(...).then(...)","改 async / await"],["setTimeout(fn, ms)","直接用（已支持）"],["requestAnimationFrame","用 setInterval 或 effect"],["canvas.getContext(\"2d\")","不支持，用 3D 路或原生 View"]]),
    H2("直接不支持的"),
    Table(["Web 特性","Android 状态"], [["WebSocket","❌"],["Service Worker","❌"],["IndexedDB","❌"],["EventSource","❌"],["Clipboard API","❌"],["Notification API","⚠️ 有 showNotification 内联"],["Geolocation","❌"],["WebRTC","❌"],["AudioContext","❌"],["WebGL / Babylon","❌ 用 3D 路"]]),
    H2("CSS 差异"),
    Table(["CSS","Web","Android"], [["display: flex","✅","✅ 转 FlexboxLayout"],["display: grid","✅","⚠️ 模拟不准"],[":hover","✅","❌"],[":active / :focus","✅","❌"],["position: fixed","✅","⚠️ 近似"],["@media","✅","⚠️ 部分支持"],["transition","✅","❌ 用 animate 属性"]]),
    H2("迁移步骤"),
    Ul("1. 复制 .xuy 到 examples/","2. 删掉 import 里没有的东西","3. 把 DOM 操作改 ref","4. 把 Web API 换成 Android 等价","5. 跑 run.ps1 看报错","6. 逐步修"),
    H2("例子"),
    Code("// Web 版\\nconst btn = document.querySelector(\".btn\")\\nbtn.addEventListener(\"click\", () => { ... })\\n\\n// Android 版\\nconst btnRef = ref()\\nbutton({ ref: btnRef, on: { click: () => { ... } } }, \"点我\")", "xuy"),
  )
}
