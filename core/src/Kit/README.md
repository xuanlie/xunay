# @xunay/kit

XuNay 框架内置组件包。

包含两大模块：

- **Charts** —— 36 种零依赖 SVG 图表
- **Icons** —— 2001 个语义化 SVG 图标

## 安装

已内置在 xunay 中，无需安装。

## 导入

### 图标

```js
// 命名导入（tree-shaking 最优）
import { IconHome, IconUser, IconArrowRight } from 'xunay/kit/icons'

// 动态导入
import { Icon, iconNames, searchIcons } from 'xunay/kit/icons'
Icon({ name: 'home', size: 24 })
iconNames()                 // 2001 个
searchIcons('arrow')        // 筛选
```

### 图表

```js
// 全部导入
import { LineChart, SankeyChart } from 'xunay/kit/charts'

// 单独导入（推荐，只打包用到的）
import LineChart from 'xunay/kit/charts/line'
import SankeyChart from 'xunay/kit/charts/sankey'

// 动态工厂
import { createChart, chartTypes } from 'xunay/kit/charts'
const chart = createChart('line', '#app', { data: [...] })
```

## 图表清单

| # | 名称 | 导入路径 | 分类 |
|---|---|---|---|
| 1 | 折线图 | `xunay/kit/charts/line` | 基础 |
| 2 | 柱状图 | `xunay/kit/charts/bar` | 基础 |
| 3 | 面积图 | `xunay/kit/charts/area` | 基础 |
| 4 | 饼图 / 环图 | `xunay/kit/charts/pie` | 基础 |
| 5 | 散点图 | `xunay/kit/charts/scatter` | 基础 |
| 6 | 雷达图 | `xunay/kit/charts/radar` | 基础 |
| 7 | 箱线图 | `xunay/kit/charts/boxplot` | 分布 |
| 8 | 小提琴图 | `xunay/kit/charts/violin` | 分布 |
| 9 | 山脊图 | `xunay/kit/charts/ridgeline` | 分布 |
| 10 | 六边形分箱 | `xunay/kit/charts/hexbin` | 分布 |
| 11 | 日历热力 | `xunay/kit/charts/calendar` | 分布 |
| 12 | 词云 | `xunay/kit/charts/wordcloud` | 分布 |
| 13 | 矩形树图 | `xunay/kit/charts/treemap` | 层级 |
| 14 | 旭日图 | `xunay/kit/charts/sunburst` | 层级 |
| 15 | 圆堆积 | `xunay/kit/charts/circlepack` | 层级 |
| 16 | 树形图 | `xunay/kit/charts/tree` | 层级 |
| 17 | 冰柱图 | `xunay/kit/charts/icicle` | 层级 |
| 18 | 马赛克图 | `xunay/kit/charts/marimekko` | 层级 |
| 19 | 桑基图 | `xunay/kit/charts/sankey` | 流向 |
| 20 | 和弦图 | `xunay/kit/charts/chord` | 流向 |
| 21 | 平行坐标 | `xunay/kit/charts/parallel` | 流向 |
| 22 | 泰森多边形 | `xunay/kit/charts/voronoi` | 流向 |
| 23 | 关系图 | `xunay/kit/charts/network` | 流向 |
| 24 | 凹凸图 | `xunay/kit/charts/bump` | 流向 |
| 25 | K 线图 | `xunay/kit/charts/candlestick` | 时间 |
| 26 | 甘特图 | `xunay/kit/charts/gantt` | 时间 |
| 27 | 瀑布图 | `xunay/kit/charts/waterfall` | 时间 |
| 28 | 斜率图 | `xunay/kit/charts/slope` | 时间 |
| 29 | 哑铃图 | `xunay/kit/charts/dumbbell` | 时间 |
| 30 | 棒棒糖图 | `xunay/kit/charts/lollipop` | 时间 |
| 31 | 华夫图 | `xunay/kit/charts/waffle` | 进阶 |
| 32 | 子弹图 | `xunay/kit/charts/bullet` | 进阶 |
| 33 | 流图 | `xunay/kit/charts/stream` | 进阶 |
| 34 | 漏斗图 | `xunay/kit/charts/funnel` | 进阶 |
| 35 | 仪表盘 | `xunay/kit/charts/gauge` | 进阶 |
| 36 | 热力图 | `xunay/kit/charts/heatmap` | 进阶 |

## 通用配置

所有图表共享以下配置：

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `width` | `number \| null` | `null` | 图表宽度，null = 撑满容器 |
| `height` | `number` | `340` | 图表高度（px） |
| `padding` | `number \| object` | 各图表不同 | 内边距，可设 `{top,right,bottom,left}` |
| `title` | `string` | - | 标题 |
| `subtitle` | `string` | - | 副标题 |
| `theme` | `"light" \| "dark"` | `"light"` | 主题 |
| `colors` | `string[]` | 内置调色板 | 颜色序列 |
| `legend` | `boolean` | `true` | 显示图例 |
| `tooltip` | `boolean` | `true` | 显示提示框 |
| `animation` | `object` | - | `{ duration, easing, stagger }` |
| `onHover` | `function` | - | 悬停回调 |

## 通用方法

所有图表实例共享：

| 方法 | 说明 |
|---|---|
| `setData(data)` | 替换数据，自动重绘 |
| `setOptions(opts)` | 更新配置，自动重绘 |
| `render({ animate })` | 手动重绘，可选动画 |
| `replay()` | 重播入场动画 |
| `destroy()` | 销毁，解绑所有监听器，清空容器 |

## 图标清单

2001 个图标，按来源分类：

| 分类 | 数量 | 说明 |
|---|---|---|
| 手绘核心 | 123 | 导航 / 操作 / 媒体 / 文件 / 通讯等常用语义 |
| 手绘扩展 | 约 500 | 乐器 / 化学 / 天文 / 医疗 / 海洋 / 动物 / 食物 / 服饰 / 棋牌 / 工具 / 建筑 / 交通 / 文具 / 家居 / 科技 / 军事 / 科学仪器 / 办公 / UI / 天气 |
| 程序化 | 约 700 | 多边形 / 星形 / 时钟 / 徽章 / 字母 / 数字 / 方向箭头 / 进度环 / 网格 / 虚线 / 波浪 / 圆点 / 同心圆 / 射线 |
| 领域补足 | 约 680 | 补充各领域详细图标 |

## 图标用法

```js
import { IconHome, IconUser, IconArrowRight } from 'xunay/kit/icons'

IconHome({ size: 24, color: '#3b82f6', stroke: 2 })
```

### 命名规则

| 图标名 | 组件名 |
|---|---|
| `home` | `IconHome` |
| `arrow-right` | `IconArrowRight` |
| `file-js` | `IconFileJs` |
| `chess-king` | `IconChessKing` |
| `badge-42` | `IconBadge42` |

### 组件 props

| 属性 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `size` | `number` | `20` | 宽高（px） |
| `color` | `string` | `currentColor` | CSS 颜色 |
| `stroke` | `number` | `1.8` | 描边宽度 |
| `style` | `string` | - | 额外内联样式 |
| `class` | `string` | - | 额外类名 |

## 主题

内置两套主题，一键切换：

```js
chart.setOptions({ theme: 'light' })   // 默认
chart.setOptions({ theme: 'dark' })    // 深色
```

切换主题时整个图表（背景、网格、文字、提示框）都跟着变。

## 特性

- **零依赖** —— 纯原生 DOM API + SVG，不依赖 D3 / ECharts / lodash
- **tree-shaking 友好** —— 单独导入只打包该图表 / 该图标的代码
- **深色 / 浅色主题** —— 内置两套配色
- **响应式** —— ResizeObserver 自动重绘
- **入场动画** —— 所有图表都有，可自定义时长 / 缓动
- **无障碍** —— 部分图表支持键盘导航
- **零运行时** —— 图标就是字符串，图表就是 SVG

## 文件结构

```
core/src/Kit/
├── README.md               本文档
├── icons.js                2001 个图标（命名导出）
├── icons-data/
│   ├── icons.js            原始图标定义
│   ├── batch5.js           领域图标批次
│   └── core.js             SVG 工具函数
└── charts/
    ├── index.js            36 图表统一入口
    ├── index.d.ts          类型定义
    ├── line.js             LineChart
    ├── bar.js              BarChart
    ├── ...                 其余 34 个
    └── voronoi.js          VoronoiChart
```

## 示例

| 页面 | 说明 |
|---|---|
| `/examples/kit-charts-all.html` | 全部 36 图表总览 |
| `/examples/kit-<name>.html` | 每个图表的独立示例 |
| `/examples/kit-icons.html` | 全部 2001 图标浏览 |

## 许可

MIT

