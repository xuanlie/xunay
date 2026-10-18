[XUYG-OVERVIEW]
name: Xuyg
purpose: XuNay 极简语法编译器（编译期展开，运行时零开销）
entry: node ~/xunay/bin/Xuyg.js
principle: 只读 xuyc.js（内存替换），绝不修改磁盘上的 xuyc.js
output: 标准 JS（走原有 xuyc + esbuild 流程）
compiler: core/compiler4/
  - index.js     入口（needsCompile4 + compile4）
  - cpt.js       cpt / pag / dt 转换 + 隐式 return
  - sdu.js       sdu 模板 + @绑定 + vmodel + if + @media
  - builtins.js  20 个内置模板 + BUILTIN_CSS
  - event.js     @click / onClick 转换 + on 键合并
  - vmodel.js    vmodel 双向绑定（合并已有 on）

[XUYG-COMMANDS]
build:  node ~/xunay/bin/Xuyg.js build app.xuy --out dist
serve:  node ~/xunay/bin/Xuyg.js build app.xuy --out dist --serve 12343
open:   node ~/xunay/bin/Xuyg.js build app.xuy --out dist --serve 12343 --open
minify: node ~/xunay/bin/Xuyg.js build app.xuy --out dist --minify
dev:    node ~/xunay/bin/Xuyg.js dev app.xuy --out dist --port 12344
debug:  XUYG_DEBUG=1 node ~/xunay/bin/Xuyg.js build app.xuy --out dist
notes:
  - --serve 前台跑（SSH 断会死），长期跑用 nohup python3 -m http.server
  - --minify 会设 NODE_ENV=production

[XUYG-DETECT]
# 一个 .xuy 文件含有以下任一标记 → 走 compiler4
- /\b(cpt|pag|dt)\s+[A-Za-z_$]/   → cpt / pag / dt
- /sdu\s*[<A-Z]/                    → sdu 模板
# 否则走原 xuyc（旧代码零影响）

[XUYG-KEYWORDS]
# 4 个关键字，全部编译期转成 export function

cpt: 组件
  cpt Card(p) { div({ class: 'card' }, p.title) }
  → export function Card(p) { return div({ class: 'card' }, p.title) }
  规则：最后一句是【表达式】→ 自动 return；是【语句/声明】→ 不返回

pag: 页面（路由扫描 + 参数自动传）
  pag Home() { div(null, ...) }
  pag User(id) { div(null, id) }  ← 路由 /user/:id 时 id 自动注入
  → export function Home() { ... }

dt: 数据模板（生成假数据）
  dt goods(12) {
    id: seq
    name: '商品 ' + seq
    price: rand(99, 9999)
    orig: price + 100            ← 可引用上面字段
    img: '/p/' + seq + '.jpg'
  }
  → 调用 goods(12) 生成 12 条数组
  内置变量：seq（自增序号）/ rand(a,b) / pick([...]) / price（已定义的字段）
  数量语义：
    dt goods()     → 默认 20 条
    dt goods(0)    → 全部（默认 100 条上限）
    dt goods(5)    → 5 条
    dt goods(n)    → 用变量 n 作数量

sdu: 模板调用（批量生成 + 数据绑定）
  格式 1（内置模板，无 <N>）：
    sdu NavBar({ brand: 'ShopX', search: '搜索' })
    sdu GoodsList({ items: goods(12) })
    sdu Empty()  → 无参数
  
  格式 2（自定义模板，带 <N>）：
    sdu<4> GoodsCard($goods)({
      img: @img              ← @字段 取当前项
      h3: @name
      p: '¥' + @price        ← 表达式里也能用 @
      span: { text: @name, c:'x' }
    })
  数量：sdu<4> 生成 4 个；不写默认 1

[XUYG-BINDING]
# 三个前缀
$数据源    → 循环数组，如 $goods / $LIST / goods(12)
@字段     → 当前项的字段，如 @img / @name / @price
@全局     → 无数据源时查全局 signal / computed / 函数

查找规则：
  1. 有 $数据源 → 先查当前项字段
  2. 找不到 → 查全局

标签默认属性（写 @值 时自动对应）：
  img / video / audio / source  →  src
  h1~h6 / p / span / a          →  text
  input / textarea / select     →  value

属性简写：
  c: 'xxx'  →  class: 'xxx'
  i: 'xxx'  →  id: 'xxx'
  s: 'xxx'  →  style: 'xxx'

三档写法：
  最简：  h2: 'ShopX'
  中等：  h2: 'ShopX', c:'cbrand'
  完整：  h2: { text: 'ShopX', c: 'brand', onClick: fn }

[XUYG-EVENTS]
# 原生 vnode 和 sdu 里都支持

@click: fn            → on: { click: fn }
@click.stop: fn       → on: { click: (e) => { e.stopPropagation(); fn(e) } }
@click.prevent: fn    → on: { click: (e) => { e.preventDefault(); fn(e) } }
@click.stop.prevent   → 两个都有
@keydown: fn          → on: { keydown: fn }
@focus / @blur / @input / @change / @enter ...

onClick: fn           → on: { click: fn }（sdu 外也支持）

注意：多个 @xxx 在同一对象会合并成一个 on: {...}

[XUYG-VMODEL]
# 双向绑定（自动展开 value + on.input）

input({ vmodel: kw })              → input({ value: () => kw(), on: { input: (e) => kw(e.target.value) } })
input({ vmodel: kw, on: {...} })   → 合并：value + on: {...已有, input: ...}

支持：input / textarea / select / checkbox / radio

[XUYG-IF]
# 条件渲染（在 sdu 里）

sdu<4> Card($goods)({
  if: hasData()              ← 为 false 时整块不渲染
  h3: @name
})
编译成：
  ((function(){ var _c = (hasData()); if (!_c) return null; return (function(){...})() })())

[XUYG-MEDIA]
# 响应式（在 sdu 里）

sdu<4> Card($goods)({
  @media (max-width: 600px): { width: 100%; margin: 8px 0; display: block; }
  h3: @name
})
编译：注入 <style id="sdu-xxx-css"> 到 head
可多个 @media

[XUYG-BUILTINS]
# 20 个内置模板（编译期内联展开，零运行时）

NavBar({ brand, search, ops })           → 顶栏
Hero({ slides, index })                  → 轮播（只显示当前）
CateGrid({ items })                      → 分类网格
GoodsCard({ item })                      → 商品卡
GoodsList({ items })                     → 商品列表
SeckillBar({ title, sec })               → 秒杀条
Footer({ cols, copy })                   → 页脚
SideBar({ items })                       → 侧边浮窗
StatCard({ label, value })               → 统计卡
StatRow({ items })                       → 统计行
UserCard({ item })                       → 用户卡
UserRow({ item })                        → 用户行
ListItem({ title, desc, icon })          → 列表项
Tabs({ items, model })                   → 标签页
Breadcrumb({ items })                    → 面包屑
Empty({ icon, text })                    → 空状态
Loading({ text })                        → 加载中
Table({ rows, cols })                    → 表格
Modal({ title, open })                   → 弹窗
Form({ fields })                         → 表单

# 用了任何内置模板 → 编译产物自动注入 BUILTIN_CSS

[XUYG-CHARTS]
# 用 kit/charts（36 种图表）

import LineChart from 'xunay/kit/charts/line'
import BarChart  from 'xunay/kit/charts/bar'
import PieChart  from 'xunay/kit/charts/pie'

# 封装组件推荐（每个项目写一次）
cpt ChartBox(Ctor, optsFn) {
  div({
    style: 'width:100%;height:280px;position:relative',
    ref: (el) => {
      if (!el || el.__c) return
      el.__c = true
      try {
        const c = new Ctor(el, { height: 280, legend: false, tooltip: true, ...optsFn() })
        c.replay && c.replay()
      } catch (e) { el.textContent = '图表加载失败: ' + e.message }
    }
  })
}

# 用法
ChartBox(LineChart, () => ({
  mode: 'smooth', area: true,
  colors: ['#667eea'],
  series: [{ name: '销量', data: [
    { label: '1月', value: 120 }, { label: '2月', value: 200 }
  ]}]
}))

# 图表通用选项
width, height, padding, title, subtitle, theme:'light'|'dark', colors,
legend:boolean, tooltip:boolean, animation:{duration,easing,stagger},
onHover, onBarClick / onPointClick

# 图表通用方法
setData(data), setOptions(opts), render({animate}), replay(), destroy()

# 关键坑
1. 数据源必须用【模块级常量】，不能在 cpt/pag 里现调 goods(4)
   ❌ pag Home() { ...goods(4).map(...) }  ← 每次渲染新数组 → effect 死循环
   ✅ const LIST = goods(24)  在模块顶层
      pag Home() { ...LIST.map(...) }

2. 渲染函数（pag/cpt）里【只读 signal，不写】
   ❌ pag List(c) { if (c) cat(c); ... }   ← 写 signal → 死循环
   ✅ export function setCat(c) { cat(c) }  在外面调

3. 图表的容器必须有【高度】
   ❌ div({ class: 'chart' }, ChartBox(...))  ← 容器高度 0 → 画不出来
   ✅ div({ style: 'height:280px' }, ChartBox(...))

4. LineChart 数据格式是 series 数组：
   { series: [{ name: 'x', data: [{label,value}] }] }
   不是 { data: [{label,value}] }

[XUYG-COMPLETE-EXAMPLE]
# pages/home.xuy —— 完整电商首页

import { div, h2, a, img, input, span } from 'xunay/tags'
import { s, computed, show } from 'xunay'
import LineChart from 'xunay/kit/charts/line'

// ── 数据（模块级常量）──
dt banner(3) {
  title: pick(['618 大促', '新品首发', '会员日'])
  sub:   pick(['5 折起', '免运费', '满减'])
  bg:    pick(['linear-gradient(135deg,#667eea,#764ba2)', 'linear-gradient(135deg,#f6d365,#fda085)'])
}

dt goods(12) {
  id:    seq
  name:  pick(['iPhone', 'AirPods', '小米手环', '扫地机']) + ' ' + seq
  price: rand(99, 9999)
  sales: rand(100, 9999)
  hue:   rand(0, 360)
  img:   'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="hsl(' + hue + ',55%,82%)"/></svg>'
}

const BANNERS = banner(3)
const LIST    = goods(12)

// ── 状态 ──
const kw   = s('')
const cart = s([])
const bi   = s(0)
setInterval(() => bi((bi() + 1) % 3), 4000)

function addCart(g) { cart([...cart(), g]) }

// ── 组件 ──
cpt TopBar() {
  div({ class: 'topbar' },
    div({ class: 'brand', onClick: () => go('/') }, 'ShopX'),
    input({ class: 'search', vmodel: kw, placeholder: '搜索商品' }),
    div({ class: 'cart', onClick: () => go('/cart') }, '🛒', () => String(cart().length))
  )
}

cpt GoodsCard(g) {
  div({ class: 'goods', onClick: () => go('/p/' + g.id) },
    img({ src: g.img, alt: g.name }),
    h3(null, g.name),
    div({ class: 'price' }, '¥' + g.price),
    div({ class: 'btn', '@click.stop': () => addCart(g) }, '加入购物车')
  )
}

// ── 页面 ──
pag Home() {
  div(null,
    TopBar(),
    div({ class: 'banner', style: () => 'background:' + BANNERS[bi()].bg },
      h1(null, () => BANNERS[bi()].title),
      p(null, () => BANNERS[bi()].sub)
    ),
    h2(null, '🔥 商品'),
    div({ class: 'goods-grid' },
      ...LIST.map(g => GoodsCard(g))
    ),
    ChartBox(LineChart, () => ({
      mode: 'smooth', area: true,
      series: [{ name: '销量', data: [
        { label: '1月', value: 120 }, { label: '2月', value: 200 },
        { label: '3月', value: 180 }, { label: '4月', value: 260 }
      ]}]
    }))
  )
}

[XUYG-SDU-EXAMPLE]
# 自定义 sdu 模板 + 用法

// 用 dt 造数据
dt user(3) {
  id: seq
  name: pick(['张三', '李四', '王五'])
  role: pick(['管理员', '编辑', '访客'])
  hue: rand(0, 360)
}

const USERS = user(3)

pag List() {
  div(null,
    // 用 sdu<N> 循环生成
    sdu<3> UserCard($USERS)({
      if: USERS.length > 0            ← 条件
      @media (max-width: 600px): { width: 100%; }
      div.avatar: { text: @name[0], s: 'background:hsl(' + @hue + ',60%,70%)' }
      div.name: @name
      div.role: @role
      span.btn: { text: '查看', c: 'btn', '@click.stop': () => alert(@name) }
    })
  )
}

# 说明：
# - `$USERS` 是数据源
# - `@name` / `@hue` / `@role` 从当前项取字段
# - `div.avatar:` 是 div 标签，class 为 avatar
# - `span.btn: {...}` 属性对象形式（text/c/事件）
# - `@click.stop: fn` 事件修饰符

[XUYG-STRUCTURE]
# 一个标准 Xuyg 项目
project/
├── app.xuy              入口（import 各页 + mount）
├── package.json         "type": "module" + xunay 依赖
├── src/
│   ├── data.xuy         数据（dt + 导出的常量）
│   ├── store.xuy        全局状态（s / computed / 函数）
│   ├── components/      组件（cpt）
│   │   ├── TopBar.xuy
│   │   ├── GoodsCard.xuy
│   │   └── Chart.xuy    ChartBox 封装
│   └── pages/           页面（pag）
│       ├── home.xuy
│       ├── list.xuy
│       ├── detail.xuy
│       ├── cart.xuy
│       ├── checkout.xuy
│       ├── orders.xuy
│       ├── user.xuy
│       └── ...
└── dist/                编译产物

[XUYG-ROUTING]
# 路由由 scan-pages.js 自动扫描 src/pages/*.xuy
# 文件名 → 路由
pages/home.xuy      → /home
pages/user/index.xuy → /user
pages/[id].xuy      → /:id
pag Detail(id)      → 参数 id 自动从路由拿

# 手动分发（app.xuy）
import { route } from './src/store.xuy'
import { Home } from './src/pages/home.xuy'
import { Detail } from './src/pages/detail.xuy'

mount(() => div(null, () => {
  const r = route()
  if (r === '/' || r === '') return Home()
  if (r.startsWith('/p/')) return Detail(r.slice(3))
  return Home()
}), '#app')

[XUYG-ANTIPATTERNS]
# 常见错误

❌ 在 pag/cpt 里调 dt 函数
   pag Home() { ...goods(4).map(...) }
   → 每次渲染新数组 → effect 死循环
   ✅ 模块级 const LIST = goods(24)

❌ 在 pag/cpt 里写 signal
   pag List(c) { if (c) cat(c) }
   → 写 signal 触发重渲染 → 死循环
   ✅ export function setCat(c) { cat(c) }，在 app.xuy 里调

❌ 图表容器无高度
   div(null, ChartBox(...))
   ✅ div({ style: 'height:280px' }, ChartBox(...))

❌ LineChart 传 data 而不是 series
   LineChart(el, { data: [...] })
   ✅ LineChart(el, { series: [{ name, data: [...] }] })

❌ sdu 引用不存在的字段
   sdu<4> Card($goods)({ xxx: @notexist })
   → 运行时 undefined

❌ 忘了 mount 是响应式函数
   mount(() => { if (route()==='/') return Home() })   ← 只跑一次
   ✅ mount(() => div(null, () => { if (route()==='/') return Home() }))

❌ 图片 404 触发 xuyc 内置错误捕获清屏
   → Xuyg 已自动修：只在 e.error 存在时才显示错误
   → 用 data:image/svg+xml 内联图避免 404

[XUYG-BEST-PRACTICES]
1. 数据一律模块级常量，如 const LIST = goods(24)
2. 渲染函数（pag / cpt）只读 signal，不写
3. 状态变更用独立函数（export function setXxx / addCart / go）
4. 图表容器必须有固定高度
5. ChartBox 封装成一次，全项目复用
6. 用 dt 造假数据，用 data:image/svg 造占位图
7. 组件拆小（TopBar / GoodsCard / Chart 各一个文件）
8. app.xuy 只负责路由分发，不写业务

[XUYG-LIMITS]
- 不支持 JSX
- 不支持 TypeScript 类型注解
- sdu 的 if 只支持一个条件
- sdu 的 @media 只支持 media query（不写 CSS 全量）
- 不支持自定义 sdu 模板声明（只能用内置 + sdu<N> 匿名）
- 增量编译未实现（每次全量）
- 图表必须手写 ChartBox 包装（未内置到 sdu）

[XUYG-FIXES]
# 已修 bug
1. dt 字段引用（orig: price + 100 → row.price + 100）
2. 隐式 return 保留缩进
3. sdu 结尾 `)` 消费
4. sdu 数据源调用（typeof goods === 'function' ? goods(n) : goods）
5. sdu if / @media 逗号表达式
6. 多个 @xxx 合并 on 键
7. vmodel 合并已有 on
8. img 404 触发清屏（e.error 过滤）

