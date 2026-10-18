// 反模式
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Xuyg · 常见错误"),
    H2("1. 渲染函数里调 dt"),
    Danger("❌ pag Home() { ...goods(4).map(...) }\n   每次渲染生成新数组 → effect 死循环"),
    Code("// ✅ 模块级常量\nconst LIST = goods(24)\n\npag Home() {\n  div(null, ...LIST.map(g => Card(g)))\n}", "js"),
    H2("2. 渲染函数里写 signal"),
    Danger("❌ pag List(c) { if (c) cat(c) }\n   写 signal 触发重渲染 → 死循环"),
    Code("// ✅ 在外部调\nexport function setCat(c) { cat(c) }\n\n// app.xuy 路由分发时\nif (r.startsWith('/list')) {\n  setCat(parseRoute(r))\n  return List()\n}", "js"),
    H2("3. 图表容器无高度"),
    Danger("❌ div(null, ChartBox(...))   ← 容器高度 0 → 画不出来"),
    Code("✅ div({ style: 'height:280px' }, ChartBox(...))", "js"),
    H2("4. LineChart 数据格式错"),
    Danger("❌ LineChart(el, { data: [{label,value}] })"),
    Code("✅ LineChart(el, {\n  series: [{ name: '销量', data: [{label,value}] }]\n})", "js"),
    H2("5. mount 不响应"),
    Danger("❌ mount(() => { if (route()==='/') return Home() })\n   只跑一次，路由变了不重渲"),
    Code("✅ mount(() => div(null, () => {\n  if (route()==='/') return Home()\n}))", "js"),
    H2("6. 图片 404 触发清屏"),
    Tip("Xuyg 已自动修：只在 e.error 存在时才显示错误。用 data:image/svg+xml 内联图避免 404。"),
  )
}
