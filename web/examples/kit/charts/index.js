import {
  LineChart, AreaChart, StackedAreaChart, StepChart,
  BarChart, HBarChart, StackedBarChart, StackedHBarChart,
  ScatterChart, BubbleChart, HistogramChart,
  PieChart, DonutChart, RoseChart, PolarChart,
  RadarChart, FunnelChart, GaugeChart, HeatmapChart,
  TreemapChart, SankeyChart, NetworkChart, TreeChart,
  BoxplotChart, CandlestickChart, WordcloudChart
} from './types.js'
import {
  registerTheme, defaultTheme, darkTheme,
  LinearScale, BandScale, Easings, EventEmitter, animate, svgEl
} from './core.js'
import { AxesPlugin, GridPlugin, LegendPlugin, HoverPlugin } from './plugins.js'
import { gallery } from './gallery.js'

export {
  LineChart, AreaChart, StackedAreaChart, StepChart,
  BarChart, HBarChart, StackedBarChart, StackedHBarChart,
  ScatterChart, BubbleChart, HistogramChart,
  PieChart, DonutChart, RoseChart, PolarChart,
  RadarChart, FunnelChart, GaugeChart, HeatmapChart,
  TreemapChart, SankeyChart, NetworkChart, TreeChart,
  BoxplotChart, CandlestickChart, WordcloudChart,
  registerTheme, defaultTheme, darkTheme,
  LinearScale, BandScale, Easings, EventEmitter, animate, svgEl,
  AxesPlugin, GridPlugin, LegendPlugin, HoverPlugin,
  gallery
}

const TYPES = {
  line: LineChart, area: AreaChart, 'stacked-area': StackedAreaChart, step: StepChart,
  bar: BarChart, hbar: HBarChart, 'stacked-bar': StackedBarChart, 'stacked-hbar': StackedHBarChart,
  histogram: HistogramChart, scatter: ScatterChart, bubble: BubbleChart,
  pie: PieChart, donut: DonutChart, doughnut: DonutChart, rose: RoseChart, polar: PolarChart,
  radar: RadarChart, funnel: FunnelChart, gauge: GaugeChart, heatmap: HeatmapChart,
  treemap: TreemapChart, sankey: SankeyChart, network: NetworkChart, tree: TreeChart,
  boxplot: BoxplotChart, candlestick: CandlestickChart, wordcloud: WordcloudChart
}

export function createChart(type, container, options = {}) {
  const Ctor = TYPES[type]
  if (!Ctor) throw new Error(`[xunay/charts] 未知图表类型: ${type}`)
  return new Ctor(container, options)
}

export const lineChart = (c, o) => new LineChart(c, o)
export const areaChart = (c, o) => new AreaChart(c, o)
export const stackedAreaChart = (c, o) => new StackedAreaChart(c, o)
export const stepChart = (c, o) => new StepChart(c, o)
export const barChart = (c, o) => new BarChart(c, o)
export const hbarChart = (c, o) => new HBarChart(c, o)
export const stackedBarChart = (c, o) => new StackedBarChart(c, o)
export const stackedHBarChart = (c, o) => new StackedHBarChart(c, o)
export const scatterChart = (c, o) => new ScatterChart(c, o)
export const bubbleChart = (c, o) => new BubbleChart(c, o)
export const histogramChart = (c, o) => new HistogramChart(c, o)
export const pieChart = (c, o) => new PieChart(c, o)
export const donutChart = (c, o) => new DonutChart(c, o)
export const roseChart = (c, o) => new RoseChart(c, o)
export const polarChart = (c, o) => new PolarChart(c, o)
export const radarChart = (c, o) => new RadarChart(c, o)
export const funnelChart = (c, o) => new FunnelChart(c, o)
export const gaugeChart = (c, o) => new GaugeChart(c, o)
export const heatmapChart = (c, o) => new HeatmapChart(c, o)
export const treemapChart = (c, o) => new TreemapChart(c, o)
export const sankeyChart = (c, o) => new SankeyChart(c, o)
export const networkChart = (c, o) => new NetworkChart(c, o)
export const treeChart = (c, o) => new TreeChart(c, o)
export const boxplotChart = (c, o) => new BoxplotChart(c, o)
export const candlestickChart = (c, o) => new CandlestickChart(c, o)
export const wordcloudChart = (c, o) => new WordcloudChart(c, o)

export default {
  createChart, gallery,
  LineChart, AreaChart, StackedAreaChart, StepChart,
  BarChart, HBarChart, StackedBarChart, StackedHBarChart,
  ScatterChart, BubbleChart, HistogramChart,
  PieChart, DonutChart, RoseChart, PolarChart,
  RadarChart, FunnelChart, GaugeChart, HeatmapChart,
  TreemapChart, SankeyChart, NetworkChart, TreeChart,
  BoxplotChart, CandlestickChart, WordcloudChart,
  registerTheme, defaultTheme, darkTheme
}
