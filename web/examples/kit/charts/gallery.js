// ============================================================
// 100 张图表定义
// 每一项：{ id, name, type, options }
// 数据在定义时即生成，全部可交互
// ============================================================

const rnd = (a, b) => Math.round(a + Math.random() * (b - a))
const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const days = ['周一','周二','周三','周四','周五','周六','周日']

const mkSeries = (n, count = 8) => Array.from({ length: n }, (_, i) => ({
  name: ['收入','支出','利润','A 组','B 组','C 组','系列一','系列二','系列三','新客户'][i % 10],
  data: Array.from({ length: count }, (_, j) => ({ label: months[j], y: rnd(40, 240) }))
}))
const mkPie = (n = 5) => Array.from({ length: n }, (_, i) => ({
  label: ['直接访问','搜索引擎','邮件','联盟','视频','社交','其他'][i % 7],
  value: rnd(50, 600)
}))
const mkRadar = () => ({
  labels: ['性能','易用','功能','生态','文档','稳定','价格'],
  series: [
    { name: '产品 A', data: [90,70,85,60,75,88,80] },
    { name: '产品 B', data: [70,88,65,80,60,72,90] }
  ]
})
const mkScatter = (n = 60) => Array.from({ length: n }, () => ({ x: rnd(0,100), y: rnd(0,100) }))
const mkBubble = (n = 24) => Array.from({ length: n }, () => ({ x: rnd(10,90), y: rnd(20,200), r: rnd(6,26) }))
const mkHeatmap = (rows = 7, cols = 12) => Array.from({ length: rows }, (_, r) =>
  Array.from({ length: cols }, (_, c) => Math.round(20 + Math.sin(r*0.7 + c*0.5) * 40 + Math.random() * 30)))
const mkFunnel = () => [
  { label: '访问', value: 1000 }, { label: '注册', value: 640 },
  { label: '激活', value: 420 }, { label: '付费', value: 180 },
  { label: '复购', value: 75 }
]
const mkTree = () => ({
  label: 'root', children: [
    { label: '前端', children: [{ label: 'React' }, { label: 'Vue' }, { label: 'Svelte' }] },
    { label: '后端', children: [{ label: 'Node' }, { label: 'Go' }, { label: 'Rust' }] },
    { label: '工具', children: [{ label: 'Vite' }, { label: 'esbuild' }] }
  ]
})
const mkBox = () => Array.from({ length: 4 }, (_, i) => ({
  label: ['A 班','B 班','C 班','D 班'][i],
  values: Array.from({ length: 30 }, () => rnd(30, 120))
}))
const mkCandle = (n = 30) => {
  let price = 100
  return Array.from({ length: n }, (_, i) => {
    const open = price
    const close = open + rnd(-8, 8)
    const high = Math.max(open, close) + rnd(0, 6)
    const low = Math.min(open, close) - rnd(0, 6)
    price = close
    return { label: `D${i+1}`, open, close, high, low }
  })
}
const mkSankey = () => {
  const nodes = [
    { label: '访问' }, { label: '注册' }, { label: '激活' }, { label: '付费' },
    { label: '搜索' }, { label: '社交' }, { label: '广告' }
  ]
  return { nodes, links: [
    { source: 4, target: 0, value: 30 }, { source: 5, target: 0, value: 20 }, { source: 6, target: 0, value: 25 },
    { source: 0, target: 1, value: 50 }, { source: 1, target: 2, value: 35 }, { source: 2, target: 3, value: 20 }
  ] }
}
const mkNetwork = () => ({
  nodes: Array.from({ length: 12 }, (_, i) => ({ label: 'N' + i })),
  links: Array.from({ length: 20 }, () => ({ source: rnd(0,11), target: rnd(0,11), value: 1 }))
})
const mkWords = () => [
  'JavaScript','TypeScript','React','Vue','Svelte','Node','Deno','Bun','Vite','esbuild',
  'Rollup','Webpack','Turbopack','Preact','Solid','Qwik','Next','Nuxt','Remix','Astro',
  'Tailwind','CSS','HTML','SVG','Canvas','WebGL','WASM'
].map((t, i) => ({ text: t, value: rnd(20, 100) }))

const base = { animation: { duration: 700, easing: 'easeOutCubic' } }

// ---- 折线家族 ----
const lineFamily = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `line-${out.length+1}`, name, type, options })
  push('折线图', 'line', { series: mkSeries(1) })
  push('双折线', 'line', { series: mkSeries(2) })
  push('三折线', 'line', { series: mkSeries(3) })
  push('平滑曲线', 'line', { series: mkSeries(1, 12), tension: 0.5 })
  push('阶梯折线', 'step', { series: mkSeries(1, 10) })
  push('面积图', 'area', { series: mkSeries(1) })
  push('多面积', 'area', { series: mkSeries(2), fillOpacity: 0.35 })
  push('堆叠面积', 'stacked-area', { series: mkSeries(3) })
  push('虚线折线', 'line', { series: [{ name: '虚线', data: mkSeries(1)[0].data, strokeDasharray: '6 4' }] })
  push('带标记折线', 'line', { series: mkSeries(1, 6), pointRadius: 6 })
  push('极简折线', 'line', { series: mkSeries(1), grid: false, axes: false })
  push('多系列平滑', 'line', { series: mkSeries(3), tension: 0.4 })
  push('稀疏点折线', 'line', { series: mkSeries(1, 4), pointRadius: 8 })
  push('密集折线', 'line', { series: mkSeries(1, 24), pointRadius: 2 })
  push('零轴折线', 'line', { series: [{ name: '波动', data: Array.from({length:12},(_,i)=>({label:months[i],y:rnd(-80,80)})) }] })
  return out
})()

// ---- 柱状家族 ----
const barFamily = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `bar-${out.length+1}`, name, type, options })
  push('柱状图', 'bar', { series: mkSeries(1) })
  push('分组柱', 'bar', { series: mkSeries(2) })
  push('三组柱', 'bar', { series: mkSeries(3) })
  push('水平柱', 'hbar', { series: mkSeries(1) })
  push('堆叠柱', 'stacked-bar', { series: mkSeries(3) })
  push('堆叠水平', 'stacked-hbar', { series: mkSeries(3) })
  push('直方图', 'histogram', { data: Array.from({length:20},(_,i)=>({label:String(i*5),y:Math.round(60*Math.exp(-Math.pow(i-10,2)/30))+rnd(0,6)})) })
  push('窄柱', 'bar', { series: mkSeries(1, 12), barPadding: 0.6 })
  push('圆角柱', 'bar', { series: mkSeries(1), barPadding: 0.4 })
  push('负值柱', 'bar', { series: [{ name: '波动', data: Array.from({length:12},(_,i)=>({label:months[i],y:rnd(-90,90)})) }] })
  push('单色柱', 'bar', { series: mkSeries(1), colors: ['#0ea5e9'] })
  push('渐变柱', 'bar', { series: mkSeries(1), colors: ['#8b5cf6','#ec4899','#f97316','#eab308','#22c55e','#06b6d4'] })
  push('双色柱', 'bar', { series: mkSeries(2), colors: ['#3b82f6','#ef4444'] })
  push('细柱', 'bar', { series: mkSeries(1, 20), barPadding: 0.7 })
  push('粗柱', 'bar', { series: mkSeries(1, 5), barPadding: 0.1 })
  return out
})()

// ---- 圆形家族 ----
const pieFamily = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `pie-${out.length+1}`, name, type, options })
  push('饼图', 'pie', { data: mkPie(5) })
  push('六饼', 'pie', { data: mkPie(6) })
  push('环形图', 'donut', { data: mkPie(5) })
  push('厚环', 'donut', { data: mkPie(6), innerRatio: 0.4 })
  push('细环', 'donut', { data: mkPie(5), innerRatio: 0.75 })
  push('玫瑰图', 'rose', { data: mkPie(6) })
  push('极坐标', 'polar', { data: mkPie(8) })
  push('八饼', 'pie', { data: mkPie(8) })
  push('双色环', 'donut', { data: [{label:'已用',value:72},{label:'空闲',value:28}], innerRatio: 0.7, colors: ['#3b82f6','#e2e8f0'] })
  push('三段环', 'donut', { data: mkPie(3), innerRatio: 0.6, colors: ['#10b981','#f59e0b','#ef4444'] })
  push('五饼', 'pie', { data: mkPie(5), colors: ['#06b6d4','#8b5cf6','#ec4899','#f97316','#eab308'] })
  push('渐变环', 'donut', { data: mkPie(6), innerRatio: 0.55, colors: ['#0ea5e9','#6366f1','#a855f7','#ec4899','#f43f5e','#f97316'] })
  push('极细环', 'donut', { data: mkPie(5), innerRatio: 0.85 })
  push('深色玫瑰', 'rose', { data: mkPie(8), theme: 'dark' })
  push('大红环', 'donut', { data: mkPie(4), innerRatio: 0.65 })
  return out
})()

// ---- 散点/气泡 ----
const scatterFamily = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `sc-${out.length+1}`, name, type, options })
  push('散点图', 'scatter', { series: [{ name: '样本', data: mkScatter(80) }] })
  push('双色散点', 'scatter', { series: [
    { name: 'A 组', data: mkScatter(40) },
    { name: 'B 组', data: mkScatter(40).map((p) => ({ ...p, y: p.y + 30 })) }
  ] })
  push('稀疏散点', 'scatter', { series: [{ name: '样本', data: mkScatter(30) }], pointRadius: 6 })
  push('密集散点', 'scatter', { series: [{ name: '样本', data: mkScatter(200) }], pointRadius: 2.5 })
  push('气泡图', 'bubble', { series: [{ name: '市场', data: mkBubble(18) }] })
  push('大气泡', 'bubble', { series: [{ name: '市场', data: mkBubble(12) }] })
  push('多组气泡', 'bubble', { series: [
    { name: 'A', data: mkBubble(10) },
    { name: 'B', data: mkBubble(10).map((p) => ({ ...p, y: p.y + 40 })) }
  ] })
  push('单色气泡', 'bubble', { series: [{ name: '市场', data: mkBubble(20) }], colors: ['#10b981'] })
  push('稀疏气泡', 'bubble', { series: [{ name: '市场', data: mkBubble(8) }] })
  push('高密度气泡', 'bubble', { series: [{ name: '市场', data: mkBubble(30) }], pointRadius: 3 })
  return out
})()

// ---- 雷达/漏斗/仪表 ----
const misc1Family = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `m1-${out.length+1}`, name, type, options })
  const r = mkRadar()
  push('雷达图', 'radar', { labels: r.labels, series: r.series })
  push('单系雷达', 'radar', { labels: r.labels, series: [r.series[0]] })
  push('双系雷达', 'radar', { labels: r.labels, series: r.series, colors: ['#6366f1','#f43f5e'] })
  push('五维雷达', 'radar', { labels: ['A','B','C','D','E'], series: [{ name:'评分', data:[80,65,90,72,88] }] })
  push('八维雷达', 'radar', { labels: ['A','B','C','D','E','F','G','H'], series: [{ name:'评分', data:[80,65,90,72,88,60,75,85] }] })
  push('漏斗', 'funnel', { data: mkFunnel() })
  push('窄漏斗', 'funnel', { data: mkFunnel(), gap: 6 })
  push('宽漏斗', 'funnel', { data: mkFunnel(), gap: 0 })
  push('仪表盘', 'gauge', { value: 72, min: 0, max: 100, label: 'CPU 使用率' })
  push('低值仪表', 'gauge', { value: 28, min: 0, max: 100, label: '内存' })
  push('高值仪表', 'gauge', { value: 92, min: 0, max: 100, label: '磁盘' })
  push('半圆表', 'gauge', { value: 65, min: 0, max: 100, innerRatio: 0.6, label: '温度' })
  push('粗仪表', 'gauge', { value: 55, min: 0, max: 100, innerRatio: 0.5, label: '流量' })
  push('百分比表', 'gauge', { value: 88, min: 0, max: 100, label: '完成度' })
  push('评分表', 'gauge', { value: 4.5, min: 0, max: 5, label: '评分' })
  return out
})()

// ---- 热力/树图/桑基/关系/树/箱线/K线/词云 ----
const advFamily = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `adv-${out.length+1}`, name, type, options })
  push('热力图 7x12', 'heatmap', { data: mkHeatmap(7, 12) })
  push('热力图 5x5', 'heatmap', { data: mkHeatmap(5, 5) })
  push('热力图 10x8', 'heatmap', { data: mkHeatmap(10, 8) })
  push('热力图 3x20', 'heatmap', { data: mkHeatmap(3, 20) })
  push('绿热力图', 'heatmap', { data: mkHeatmap(6, 10), baseColor: [16, 185, 129] })
  push('紫热力图', 'heatmap', { data: mkHeatmap(6, 10), baseColor: [139, 92, 246] })
  push('树图', 'treemap', { data: mkPie(6).map((d) => ({ ...d, value: d.value * 2 })) })
  push('树图 8 项', 'treemap', { data: mkPie(8).map((d) => ({ ...d, value: d.value })) })
  push('树图 10 项', 'treemap', { data: mkPie(10).map((d) => ({ ...d, value: d.value })) })
  push('树图 4 项', 'treemap', { data: mkPie(4).map((d) => ({ ...d, value: d.value * 3 })) })
  push('树图 5 项', 'treemap', { data: mkPie(5).map((d) => ({ ...d, value: d.value })) })
  push('桑基图', 'sankey', mkSankey())
  push('关系图', 'network', mkNetwork())
  push('关系图 16 点', 'network', {
    nodes: Array.from({ length: 16 }, (_, i) => ({ label: 'N' + i })),
    links: Array.from({ length: 28 }, () => ({ source: rnd(0,15), target: rnd(0,15), value: 1 }))
  })
  push('树形图', 'tree', { root: mkTree() })
  push('箱线图', 'boxplot', { groups: mkBox() })
  push('箱线图 6 组', 'boxplot', { groups: mkBox().concat(mkBox().map((g, i) => ({ ...g, label: 'E' + i }))) })
  push('K线图', 'candlestick', { data: mkCandle(30) })
  push('K线 20', 'candlestick', { data: mkCandle(20) })
  push('K线 40', 'candlestick', { data: mkCandle(40) })
  push('词云', 'wordcloud', { words: mkWords() })
  return out
})()

// ---- 主题/交互变体 ----
const variantFamily = (() => {
  const out = []
  const push = (name, type, options) => out.push({ id: `var-${out.length+1}`, name, type, options })
  push('深色折线', 'line', { series: mkSeries(2), theme: 'dark' })
  push('深色柱状', 'bar', { series: mkSeries(2), theme: 'dark' })
  push('深色饼图', 'pie', { data: mkPie(5), theme: 'dark' })
  push('深色环形', 'donut', { data: mkPie(5), theme: 'dark' })
  push('深色雷达', 'radar', { ...mkRadar(), theme: 'dark' })
  push('深色热力', 'heatmap', { data: mkHeatmap(6, 10), theme: 'dark' })
  push('无网格折线', 'line', { series: mkSeries(2), grid: false })
  push('无坐标轴柱', 'bar', { series: mkSeries(2), axes: false, grid: false })
  push('无动画饼', 'pie', { data: mkPie(5), animation: false })
  push('无图例折线', 'line', { series: mkSeries(3), legend: false })
  push('无提示折线', 'line', { series: mkSeries(2), tooltip: false })
  push('无十字线', 'line', { series: mkSeries(2), crosshair: false })
  push('高柱', 'bar', { series: mkSeries(1), height: 260 })
  push('矮图', 'line', { series: mkSeries(1), height: 180 })
  push('宽图', 'area', { series: mkSeries(1), height: 340 })
  return out
})()

export const gallery = [
  ...lineFamily, ...barFamily, ...pieFamily,
  ...scatterFamily, ...misc1Family, ...advFamily, ...variantFamily
]

// 补到 100
while (gallery.length < 100) {
  const idx = gallery.length + 1
  const pick = gallery[idx % gallery.length]
  gallery.push({
    id: `extra-${idx}`,
    name: `${pick.name} #${idx}`,
    type: pick.type,
    options: { ...pick.options, animation: { duration: rnd(400, 900), easing: 'easeOutCubic' } }
  })
}

gallery.forEach((g, i) => {
  g.options = { ...base, height: 240, ...g.options }
  if (!g.options.theme) g.options.theme = 'brand'
})

export default gallery
