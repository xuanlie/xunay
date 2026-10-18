// 图表集成
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Xuyg · 图表（kit/charts）"),
    P("Xuyg 支持 XuNay 内置的 36 种零依赖 SVG 图表，推荐封装一个通用 ChartBox。"),
    H2("封装 ChartBox"),
    Code("// src/components/Chart.xuy\nimport { div } from '/tmp/xuyg-test/xunay-tags.js'\n\nexport function ChartBox(Ctor, optsFn) {\n  return div({\n    style: 'width:100%;height:280px;position:relative',\n    ref: (el) => {\n      if (!el || el.__c) return\n      el.__c = true\n      try {\n        const c = new Ctor(el, { height: 280, legend: false, tooltip: true, ...optsFn() })\n        c.replay && c.replay()\n        el.__chart = c\n      } catch (e) { el.textContent = '图表加载失败: ' + e.message }\n    }\n  })\n}", "js"),
    H2("用法"),
    Code("import LineChart from '/tmp/xuyg-test/xunay-kit.js'\nimport BarChart  from '/tmp/xuyg-test/xunay-kit.js'\nimport PieChart  from '/tmp/xuyg-test/xunay-kit.js'\nimport { ChartBox } from '../components/Chart.js'\n\npag Dashboard() {\n  div(null,\n    ChartBox(LineChart, () => ({\n      mode: 'smooth', area: true,\n      colors: ['#667eea'],\n      series: [{ name: '销量', data: [\n        { label: '1月', value: 120 },\n        { label: '2月', value: 200 }\n      ]}]\n    })),\n\n    ChartBox(PieChart, () => ({\n      shape: 'donut',\n      data: [\n        { label: '手机', value: 1200 },\n        { label: '电脑', value: 800 }\n      ]\n    }))\n  )\n}", "js"),
    H2("常用选项"),
    Table(["项","值"], [["width","number | null（null 撑满容器）"],["height","number（默认 340）"],["theme","'light' | 'dark'"],["colors","string[]（调色板）"],["legend","boolean"],["tooltip","boolean"],["animation","{ duration, easing, stagger }"],["onHover / onBarClick / onPointClick","回调"]]),
    H2("关键坑"),
    Warn("LineChart 数据格式是 series 数组：{ series: [{ name, data: [{label,value}] }] }，不是 { data: [{label,value}] }。"),
    Danger("图表容器必须有固定高度，否则 _measure() 拿到宽高为 0，什么都画不出来。"),
    Tip("36 种图表可通过 xunay/kit/charts 导入，单独导入可用 xunay/kit/charts/line。"),
  )
}
