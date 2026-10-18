// 完整案例
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Xuyg · 完整案例"),
    H2("案例 1：电商首页（4 行）"),
    Code("// pages/home.xuy\n\ndt goods(12) {\n  id: seq\n  name: pick(['iPhone', 'AirPods', '小米手环']) + ' ' + seq\n  price: rand(99, 9999)\n  img: '/p/' + seq + '.jpg'\n}\n\nconst LIST = goods(12)\n\npag Home() {\n  div(null,\n    sdu NavBar({ brand: 'ShopX', search: '搜索' }),\n    sdu GoodsList({ items: LIST }),\n    sdu Footer({ cols: [], copy: '© 2026 ShopX' })\n  )\n}", "js"),
    P("整页 15 行，含数据 + 顶栏 + 商品列表 + 页脚。"),
    H2("案例 2：带状态 + 事件的待办"),
    Code("// pages/todo.xuy\n\nimport { div, input, span, button } from '/tmp/xuyg-test/xunay-tags.js'\nimport { s } from '/tmp/xuyg-test/xunay.js'\n\nconst text = s('')\nconst list = s([])\n\nfunction add() {\n  if (!text().trim()) return\n  list([...list(), { id: Date.now(), title: text().trim(), done: false }])\n  text('')\n}\n\npag Todo() {\n  div({ class: 'todo' },\n    h1(null, '待办事项'),\n\n    div({ class: 'input-row' },\n      input({\n        vmodel: text,\n        placeholder: '添加待办...',\n        '@keydown': (e) => { if (e.key === 'Enter') add() }\n      }),\n      button({ onClick: add }, '添加')\n    ),\n\n    sdu<10> TodoItem($list)({\n      if: list.length > 0\n      span: { text: @title, s: @done ? 'text-decoration:line-through' : '' }\n      span: { text: '×', c: 'del', '@click.stop': t => list(list().filter(x => x.id !== @id)) }\n    })\n  )\n}", "js"),
    H2("案例 3：带图表的仪表盘"),
    Code("// pages/dashboard.xuy\n\nimport LineChart from '/tmp/xuyg-test/xunay-kit.js'\nimport PieChart  from '/tmp/xuyg-test/xunay-kit.js'\nimport { ChartBox } from '../components/Chart.js'\n\nconst trend = [\n  { label: '1月', value: 120 }, { label: '2月', value: 200 },\n  { label: '3月', value: 180 }, { label: '4月', value: 260 }\n]\nconst mix = [\n  { label: '手机', value: 1200 },\n  { label: '电脑', value: 800 },\n  { label: '服饰', value: 600 }\n]\n\npag Dashboard() {\n  div(null,\n    h1(null, '数据看板'),\n\n    div({ class: 'chart-card' },\n      h3(null, '近 4 月销量'),\n      ChartBox(LineChart, () => ({\n        mode: 'smooth', area: true,\n        colors: ['#667eea'],\n        series: [{ name: '销量', data: trend }]\n      }))\n    ),\n\n    div({ class: 'chart-card' },\n      h3(null, '分类占比'),\n      ChartBox(PieChart, () => ({\n        shape: 'donut',\n        centerText: '2600',\n        centerSubText: '总数',\n        data: mix\n      }))\n    )\n  )\n}", "js"),
    H2("案例 4：完整电商站结构"),
    Code("project/\n├── app.xuy              入口（import 各页 + mount + 路由分发）\n├── package.json         \"type\": \"module\" + xunay\n├── src/\n│   ├── data.xuy         数据（dt + 导出常量）\n│   ├── store.xuy        全局状态（s / computed / 函数）\n│   ├── components/\n│   │   ├── TopBar.xuy\n│   │   ├── GoodsCard.xuy\n│   │   └── Chart.xuy\n│   └── pages/           页面（pag）\n│       ├── home.xuy\n│       ├── list.xuy\n│       ├── detail.xuy\n│       ├── cart.xuy\n│       ├── checkout.xuy\n│       ├── orders.xuy\n│       └── user.xuy\n└── dist/                产物", "txt"),
  )
}
