# docs/xuy/xuyg.py
# 分组：Xuyg 极速开发

GROUP = 'Xuyg'
DOCS = [

# ══════════════════════════════════════════════════════════
('xuyg-overview', '总览', [
  ('H1', 'Xuyg · 最速开发'),
  ('P', 'Xuyg 是 XuNay 的极简语法编译器。编译期把极简语法展开成标准 JS，运行时零开销。一个电商网站全站约 1300 行，比常规写法的 5000 行少 4 倍。'),
  ('Tip', 'Xuyg 只读 xuyc.js（内存替换），绝不修改磁盘上的 xuyc.js。旧代码零影响。'),

  ('H2', '核心优势'),
  ('Table', ['项', '常规', 'Xuyg'], [
    ['import', '每文件 5-10 行', '0 行（自动）'],
    ['export function', '13 字符', 'cpt 3 字符'],
    ['return', '每个函数末尾', '隐式返回'],
    ['数据定义', '12 条商品 72 行', 'dt 6 行'],
    ['嵌套', '手写 map', 'sdu 一行'],
    ['页面', '60 行', '4 行'],
  ]),

  ('H2', '命令'),
  ('Code', """# 构建
node ~/xunay/bin/Xuyg.js build app.xuy --out dist

# 构建 + 起服务（前台，Ctrl+C 停）
node ~/xunay/bin/Xuyg.js build app.xuy --out dist --serve 12343

# 构建 + 起服务 + 自动打开浏览器
node ~/xunay/bin/Xuyg.js build app.xuy --out dist --serve 12343 --open

# 生产压缩
node ~/xunay/bin/Xuyg.js build app.xuy --out dist --minify

# 开发热重载
node ~/xunay/bin/Xuyg.js dev app.xuy --out dist --port 12344

# 调试模式（打印编译产物）
XUYG_DEBUG=1 node ~/xunay/bin/Xuyg.js build app.xuy --out dist""", 'bash'),

  ('H2', '触发条件'),
  ('P', '文件里出现 cpt / pag / dt / sdu 任一关键字 → 走 Xuyg。否则走原 xuyc，零影响。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-keywords', '三大关键字', [
  ('H1', 'Xuyg · cpt / pag / dt'),
  ('P', '三个关键字编译期都展开成 export function。隐式返回：函数体最后一句是表达式就自动 return。'),

  ('H2', 'cpt · 组件'),
  ('Code', """cpt Card(p) {
  div({ class: 'card' }, p.title)
}

cpt Header() {
  div({ class: 'header' }, 'ShopX')
}

// 单表达式写法
cpt Btn(p) => button({ class: 'btn' }, p.text)""", 'js'),
  ('P', '编译成：'),
  ('Code', """export function Card(p) {
  return div({ class: 'card' }, p.title)
}""", 'js'),

  ('H2', 'pag · 页面（路由扫描 + 参数自动传）'),
  ('Code', """pag Home() {
  div(null, Card({ title: 'Hi' }))
}

// 带路由参数
pag Detail(id) {
  const g = LIST.find(x => String(x.id) === String(id))
  div(null, g.name)
}""", 'js'),
  ('Tip', 'pag 定义在 src/pages/*.xuy，会被 scan-pages 自动扫成路由。'),

  ('H2', 'dt · 数据模板'),
  ('Code', """dt goods(12) {
  id: seq
  name: '商品 ' + seq
  price: rand(99, 9999)
  orig: price + 100          // 引用上面的字段
  img: '/p/' + seq + '.jpg'
}

const LIST = goods(12)""", 'js'),
  ('Table', ['内置', '说明'], [
    ['seq', '自增序号（1, 2, 3...）'],
    ['rand(a, b)', '随机整数 [a, b]'],
    ['pick([...])', '随机挑一个'],
    ['其它字段名', '引用上面已定义的字段，自动加 row. 前缀'],
  ]),
  ('Table', ['调用', '结果'], [
    ['goods()', '默认 20 条'],
    ['goods(0)', '全部（默认 100 条上限）'],
    ['goods(5)', '5 条'],
    ['goods(n)', '用变量 n 作数量'],
  ]),
]),

# ══════════════════════════════════════════════════════════
('xuyg-sdu', 'sdu 模板', [
  ('H1', 'sdu · 模板调用'),
  ('P', 'sdu 有两种用法：调用内置模板（一行一个），或者用 <N> 循环生成自定义结构。'),

  ('H2', '用法 1：内置模板'),
  ('Code', """sdu NavBar({ brand: 'ShopX', search: '搜索商品' })
sdu GoodsList({ items: goods(12) })
sdu Empty()""", 'js'),

  ('H2', '用法 2：自定义循环'),
  ('Code', """const LIST = goods(12)

pag Home() {
  div(null,
    sdu<12> GoodsCard($LIST)({
      img: @img
      h3: @name
      p: '¥' + @price
      span: { text: '加入购物车', c: 'btn', '@click.stop': g => addCart(g) }
    })
  )
}""", 'js'),

  ('H2', '格式说明'),
  ('Code', """sdu<数量> 模板名($数据源)({
  子元素: 表达式或属性对象
})""", 'txt'),
  ('Table', ['部分', '说明'], [
    ['<N>', '生成 N 个，不写默认 1'],
    ['$数据源', '循环数组，如 $LIST 或 goods(12)'],
    ['@字段', '取当前项字段，如 @img / @name'],
    ['@全局', '无数据源时查全局 signal / computed / 函数'],
  ]),
  ('Tip', '查找规则：有 $数据源时先查字段，找不到再查全局。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-binding', '绑定系统', [
  ('H1', 'Xuyg · 数据绑定'),

  ('H2', '三个前缀'),
  ('Table', ['前缀', '含义', '例子'], [
    ['$', '数据源（数组）', '$goods / $LIST'],
    ['@', '字段 / 全局', '@img / @cartCount'],
    ['（无）', '字面值 / 全局', "'ShopX' / kw"],
  ]),

  ('H2', '标签默认属性'),
  ('P', '写 @值 时自动对应到标签的默认属性：'),
  ('Table', ['标签', '默认属性'], [
    ['img / video / audio / source', 'src'],
    ['h1~h6 / p / span / a', 'text'],
    ['input / textarea / select', 'value'],
  ]),
  ('Code', """// 这两种等价
img: @img
img: { src: @img }

h3: @name
h3: { text: @name }""", 'js'),

  ('H2', '属性简写'),
  ('Table', ['写法', '展开'], [
    ['c: "xxx"', 'class: "xxx"'],
    ['i: "xxx"', 'id: "xxx"'],
    ['s: "xxx"', 'style: "xxx"'],
  ]),

  ('H2', '三档写法'),
  ('Code', """// 最简
h2: 'ShopX'

// 中等
h2: 'ShopX', c:'cbrand'

// 完整
h2: { text: 'ShopX', c: 'brand', '@click': fn }""", 'js'),

  ('H2', 'vmodel 双向绑定'),
  ('Code', """input({ vmodel: kw })""", 'js'),
  ('P', '编译成：'),
  ('Code', """input({
  value: () => kw(),
  on: { input: (e) => kw(e.target.value) }
})""", 'js'),
  ('Tip', '若同时写了 on: {...}，会自动合并（不会产生两个 on 键）。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-events', '事件系统', [
  ('H1', 'Xuyg · 事件'),

  ('H2', '事件语法'),
  ('Table', ['写法', '展开'], [
    ['@click: fn', 'on: { click: fn }'],
    ['@click.stop: fn', 'e.stopPropagation() 后调 fn'],
    ['@click.prevent: fn', 'e.preventDefault()'],
    ['@click.stop.prevent: fn', '两个都加'],
    ['@keydown: fn', 'on: { keydown: fn }'],
    ['@focus / @blur / @input / @change', '对应原生事件'],
    ['onClick: fn', 'on: { click: fn }'],
  ]),

  ('H2', '示例'),
  ('Code', """div({ class: 'goods', '@click.stop': () => addCart(g) }, '加入购物车')

div({ class: 'btn', onClick: () => go('/') }, 'ShopX')""", 'js'),

  ('H2', '合并 on 键'),
  ('P', '同一对象里的多个 @xxx 会自动合并成一个 on: {...}，不会冲突。'),
  ('Code', """input({
  vmodel: kw,
  '@focus': () => kwFocus(true),
  '@blur': () => kwFocus(false)
})

// 编译成
input({
  value: () => kw(),
  on: {
    focus: () => kwFocus(true),
    blur: () => kwFocus(false),
    input: (e) => kw(e.target.value)
  }
})""", 'js'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-if-media', '条件渲染 + 响应式', [
  ('H1', 'Xuyg · if / @media'),

  ('H2', 'if 条件渲染'),
  ('Code', """sdu<12> Card($LIST)({
  if: LIST.length > 0        // false 时整块不渲染
  h3: @name
})""", 'js'),
  ('P', '编译成：'),
  ('Code', """((function(){
  var _c = (LIST.length > 0)
  if (!_c) return null
  return (function(){ /* 循环渲染 */ })()
})())""", 'js'),

  ('H2', '@media 响应式'),
  ('Code', """sdu<12> Card($LIST)({
  @media (max-width: 600px): { width: 100%; margin: 8px 0; display: block; }
  h3: @name
})""", 'js'),
  ('P', '编译时向 <head> 注入 <style id="sdu-xxx-css">，只注入一次。'),
  ('Tip', '可以写多个 @media，会自动合并。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-builtins', '内置模板', [
  ('H1', 'Xuyg · 20 个内置 sdu 模板'),
  ('P', '所有内置模板编译期内联展开，零运行时依赖。用了任意内置模板，编译产物自动注入 BUILTIN_CSS。'),

  ('H2', '电商'),
  ('Table', ['模板', '参数'], [
    ['NavBar', '{ brand, search, ops }'],
    ['Hero', '{ slides, index }'],
    ['CateGrid', '{ items }'],
    ['GoodsCard', '{ item }'],
    ['GoodsList', '{ items }'],
    ['SeckillBar', '{ title, sec }'],
    ['Footer', '{ cols, copy }'],
    ['SideBar', '{ items }'],
  ]),

  ('H2', '通用'),
  ('Table', ['模板', '参数'], [
    ['StatCard', '{ label, value }'],
    ['StatRow', '{ items }'],
    ['UserCard', '{ item }'],
    ['UserRow', '{ item }'],
    ['ListItem', '{ title, desc, icon }'],
    ['Tabs', '{ items, model }'],
    ['Breadcrumb', '{ items }'],
    ['Empty', '{ icon, text }'],
    ['Loading', '{ text }'],
    ['Table', '{ rows, cols }'],
    ['Modal', '{ title, open }'],
    ['Form', '{ fields }'],
  ]),

  ('H2', '用法'),
  ('Code', """pag Home() {
  div(null,
    sdu NavBar({ brand: 'ShopX', search: '搜索' }),
    sdu GoodsList({ items: goods(12) }),
    sdu Footer({ cols: [], copy: '© 2026' })
  )
}""", 'js'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-charts', '图表集成', [
  ('H1', 'Xuyg · 图表（kit/charts）'),
  ('P', 'Xuyg 支持 XuNay 内置的 36 种零依赖 SVG 图表，推荐封装一个通用 ChartBox。'),

  ('H2', '封装 ChartBox'),
  ('Code', """// src/components/Chart.xuy
import { div } from 'xunay/tags'

export function ChartBox(Ctor, optsFn) {
  return div({
    style: 'width:100%;height:280px;position:relative',
    ref: (el) => {
      if (!el || el.__c) return
      el.__c = true
      try {
        const c = new Ctor(el, { height: 280, legend: false, tooltip: true, ...optsFn() })
        c.replay && c.replay()
        el.__chart = c
      } catch (e) { el.textContent = '图表加载失败: ' + e.message }
    }
  })
}""", 'js'),

  ('H2', '用法'),
  ('Code', """import LineChart from 'xunay/kit/charts/line'
import BarChart  from 'xunay/kit/charts/bar'
import PieChart  from 'xunay/kit/charts/pie'
import { ChartBox } from '../components/Chart.xuy'

pag Dashboard() {
  div(null,
    ChartBox(LineChart, () => ({
      mode: 'smooth', area: true,
      colors: ['#667eea'],
      series: [{ name: '销量', data: [
        { label: '1月', value: 120 },
        { label: '2月', value: 200 }
      ]}]
    })),

    ChartBox(PieChart, () => ({
      shape: 'donut',
      data: [
        { label: '手机', value: 1200 },
        { label: '电脑', value: 800 }
      ]
    }))
  )
}""", 'js'),

  ('H2', '常用选项'),
  ('Table', ['项', '值'], [
    ['width', 'number | null（null 撑满容器）'],
    ['height', 'number（默认 340）'],
    ['theme', "'light' | 'dark'"],
    ['colors', "string[]（调色板）"],
    ['legend', 'boolean'],
    ['tooltip', 'boolean'],
    ['animation', '{ duration, easing, stagger }'],
    ['onHover / onBarClick / onPointClick', '回调'],
  ]),

  ('H2', '关键坑'),
  ('Warn', 'LineChart 数据格式是 series 数组：{ series: [{ name, data: [{label,value}] }] }，不是 { data: [{label,value}] }。'),
  ('Danger', '图表容器必须有固定高度，否则 _measure() 拿到宽高为 0，什么都画不出来。'),
  ('Tip', '36 种图表可通过 xunay/kit/charts 导入，单独导入可用 xunay/kit/charts/line。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-examples', '完整案例', [
  ('H1', 'Xuyg · 完整案例'),

  ('H2', '案例 1：电商首页（4 行）'),
  ('Code', """// pages/home.xuy

dt goods(12) {
  id: seq
  name: pick(['iPhone', 'AirPods', '小米手环']) + ' ' + seq
  price: rand(99, 9999)
  img: '/p/' + seq + '.jpg'
}

const LIST = goods(12)

pag Home() {
  div(null,
    sdu NavBar({ brand: 'ShopX', search: '搜索' }),
    sdu GoodsList({ items: LIST }),
    sdu Footer({ cols: [], copy: '© 2026 ShopX' })
  )
}""", 'js'),
  ('P', '整页 15 行，含数据 + 顶栏 + 商品列表 + 页脚。'),

  ('H2', '案例 2：带状态 + 事件的待办'),
  ('Code', """// pages/todo.xuy

import { div, input, span, button } from 'xunay/tags'
import { s } from 'xunay'

const text = s('')
const list = s([])

function add() {
  if (!text().trim()) return
  list([...list(), { id: Date.now(), title: text().trim(), done: false }])
  text('')
}

pag Todo() {
  div({ class: 'todo' },
    h1(null, '待办事项'),

    div({ class: 'input-row' },
      input({
        vmodel: text,
        placeholder: '添加待办...',
        '@keydown': (e) => { if (e.key === 'Enter') add() }
      }),
      button({ onClick: add }, '添加')
    ),

    sdu<10> TodoItem($list)({
      if: list.length > 0
      span: { text: @title, s: @done ? 'text-decoration:line-through' : '' }
      span: { text: '×', c: 'del', '@click.stop': t => list(list().filter(x => x.id !== @id)) }
    })
  )
}""", 'js'),

  ('H2', '案例 3：带图表的仪表盘'),
  ('Code', """// pages/dashboard.xuy

import LineChart from 'xunay/kit/charts/line'
import PieChart  from 'xunay/kit/charts/pie'
import { ChartBox } from '../components/Chart.xuy'

const trend = [
  { label: '1月', value: 120 }, { label: '2月', value: 200 },
  { label: '3月', value: 180 }, { label: '4月', value: 260 }
]
const mix = [
  { label: '手机', value: 1200 },
  { label: '电脑', value: 800 },
  { label: '服饰', value: 600 }
]

pag Dashboard() {
  div(null,
    h1(null, '数据看板'),

    div({ class: 'chart-card' },
      h3(null, '近 4 月销量'),
      ChartBox(LineChart, () => ({
        mode: 'smooth', area: true,
        colors: ['#667eea'],
        series: [{ name: '销量', data: trend }]
      }))
    ),

    div({ class: 'chart-card' },
      h3(null, '分类占比'),
      ChartBox(PieChart, () => ({
        shape: 'donut',
        centerText: '2600',
        centerSubText: '总数',
        data: mix
      }))
    )
  )
}""", 'js'),

  ('H2', '案例 4：完整电商站结构'),
  ('Code', """project/
├── app.xuy              入口（import 各页 + mount + 路由分发）
├── package.json         "type": "module" + xunay
├── src/
│   ├── data.xuy         数据（dt + 导出常量）
│   ├── store.xuy        全局状态（s / computed / 函数）
│   ├── components/
│   │   ├── TopBar.xuy
│   │   ├── GoodsCard.xuy
│   │   └── Chart.xuy
│   └── pages/           页面（pag）
│       ├── home.xuy
│       ├── list.xuy
│       ├── detail.xuy
│       ├── cart.xuy
│       ├── checkout.xuy
│       ├── orders.xuy
│       └── user.xuy
└── dist/                产物""", 'txt'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-structure', '项目结构', [
  ('H1', 'Xuyg · 项目结构'),

  ('H2', '推荐目录'),
  ('Code', """project/
├── app.xuy               入口
├── package.json          "type": "module" + xunay
├── src/
│   ├── data.xuy          数据（dt + 导出常量）
│   ├── store.xuy         全局状态 + 函数
│   ├── components/       组件（cpt）
│   └── pages/            页面（pag，自动路由）
└── dist/                 编译产物""", 'txt'),

  ('H2', '路由规则'),
  ('Table', ['文件', '路由'], [
    ['pages/home.xuy', '/home'],
    ['pages/user/index.xuy', '/user'],
    ['pages/[id].xuy', '/:id'],
    ['pag Detail(id)', '参数 id 自动注入'],
  ]),

  ('H2', 'app.xuy 入口模板'),
  ('Code', """// app.xuy
import { mount } from 'xunay'
import { div } from 'xunay/tags'
import { route } from './src/store.xuy'
import { Home } from './src/pages/home.xuy'
import { Detail } from './src/pages/detail.xuy'

mount(() => div(null, () => {
  const r = route()
  if (r === '/' || r === '') return Home()
  if (r.startsWith('/p/')) return Detail(r.slice(3))
  return Home()
}), '#app')""", 'js'),
  ('Tip', 'mount 外层是函数只跑一次，内层 div(null, () => {...}) 是响应式 —— route 变了自动重渲。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-antipatterns', '反模式', [
  ('H1', 'Xuyg · 常见错误'),

  ('H2', '1. 渲染函数里调 dt'),
  ('Danger', """❌ pag Home() { ...goods(4).map(...) }
   每次渲染生成新数组 → effect 死循环"""),
  ('Code', """// ✅ 模块级常量
const LIST = goods(24)

pag Home() {
  div(null, ...LIST.map(g => Card(g)))
}""", 'js'),

  ('H2', '2. 渲染函数里写 signal'),
  ('Danger', """❌ pag List(c) { if (c) cat(c) }
   写 signal 触发重渲染 → 死循环"""),
  ('Code', """// ✅ 在外部调
export function setCat(c) { cat(c) }

// app.xuy 路由分发时
if (r.startsWith('/list')) {
  setCat(parseRoute(r))
  return List()
}""", 'js'),

  ('H2', '3. 图表容器无高度'),
  ('Danger', '❌ div(null, ChartBox(...))   ← 容器高度 0 → 画不出来'),
  ('Code', """✅ div({ style: 'height:280px' }, ChartBox(...))""", 'js'),

  ('H2', '4. LineChart 数据格式错'),
  ('Danger', '❌ LineChart(el, { data: [{label,value}] })'),
  ('Code', """✅ LineChart(el, {
  series: [{ name: '销量', data: [{label,value}] }]
})""", 'js'),

  ('H2', '5. mount 不响应'),
  ('Danger', """❌ mount(() => { if (route()==='/') return Home() })
   只跑一次，路由变了不重渲"""),
  ('Code', """✅ mount(() => div(null, () => {
  if (route()==='/') return Home()
}))""", 'js'),

  ('H2', '6. 图片 404 触发清屏'),
  ('Tip', 'Xuyg 已自动修：只在 e.error 存在时才显示错误。用 data:image/svg+xml 内联图避免 404。'),
]),

# ══════════════════════════════════════════════════════════
('xuyg-limits', '限制与修复', [
  ('H1', 'Xuyg · 限制与修复记录'),

  ('H2', '限制'),
  ('Ul', [
    '不支持 JSX',
    '不支持 TypeScript 类型注解',
    'sdu 的 if 只支持一个条件',
    'sdu 的 @media 只支持 media query',
    '不支持自定义 sdu 模板声明（只能用内置 + sdu<N> 匿名）',
    '增量编译未实现（每次全量）',
    '图表需手写 ChartBox 包装（未内置到 sdu）',
  ]),

  ('H2', '已修复的 bug'),
  ('Ol', [
    'dt 字段引用（orig: price + 100 → row.price + 100）',
    '隐式 return 保留缩进',
    'sdu 结尾 ) 消费',
    'sdu 数据源调用（typeof goods === function ? goods(n) : goods）',
    'sdu if / @media 逗号表达式',
    '多个 @xxx 合并 on 键',
    'vmodel 合并已有 on',
    'img 404 触发清屏（e.error 过滤）',
  ]),

  ('H2', '实现位置'),
  ('Table', ['文件', '作用'], [
    ['bin/Xuyg.js', 'CLI 入口（只读 xuyc.js）'],
    ['core/compiler4/index.js', '编译器入口'],
    ['core/compiler4/cpt.js', 'cpt / pag / dt 转换'],
    ['core/compiler4/sdu.js', 'sdu 模板'],
    ['core/compiler4/builtins.js', '20 个内置模板 + CSS'],
    ['core/compiler4/event.js', '@click / onClick'],
    ['core/compiler4/vmodel.js', 'vmodel 双向绑定'],
  ]),
]),

]
