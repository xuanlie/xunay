// @xunay/kit/charts —— 36 种图表统一入口
import LineChart from './line.js'
import BarChart from './bar.js'
import AreaChart from './area.js'
import PieChart from './pie.js'
import ScatterChart from './scatter.js'
import RadarChart from './radar.js'
import FunnelChart from './funnel.js'
import GaugeChart from './gauge.js'
import HeatmapChart from './heatmap.js'
import TreemapChart from './treemap.js'
import SankeyChart from './sankey.js'
import NetworkChart from './network.js'
import TreeChart from './tree.js'
import BoxplotChart from './boxplot.js'
import CandlestickChart from './candlestick.js'
import WordcloudChart from './wordcloud.js'
import WaterfallChart from './waterfall.js'
import GanttChart from './gantt.js'
import SunburstChart from './sunburst.js'
import ChordChart from './chord.js'
import ParallelChart from './parallel.js'
import BulletChart from './bullet.js'
import WaffleChart from './waffle.js'
import CalendarHeatmap from './calendar.js'
import ViolinChart from './violin.js'
import RidgelineChart from './ridgeline.js'
import StreamChart from './stream.js'
import BumpChart from './bump.js'
import LollipopChart from './lollipop.js'
import DumbbellChart from './dumbbell.js'
import SlopeChart from './slope.js'
import HexbinChart from './hexbin.js'
import CirclePackingChart from './circlepack.js'
import MarimekkoChart from './marimekko.js'
import IcicleChart from './icicle.js'
import VoronoiChart from './voronoi.js'

export {
  LineChart, BarChart, AreaChart, PieChart, ScatterChart, RadarChart,
  FunnelChart, GaugeChart, HeatmapChart, TreemapChart, SankeyChart, NetworkChart,
  TreeChart, BoxplotChart, CandlestickChart, WordcloudChart,
  WaterfallChart, GanttChart, SunburstChart, ChordChart, ParallelChart, BulletChart,
  WaffleChart, CalendarHeatmap, ViolinChart, RidgelineChart, StreamChart, BumpChart,
  LollipopChart, DumbbellChart, SlopeChart, HexbinChart, CirclePackingChart,
  MarimekkoChart, IcicleChart, VoronoiChart,
}

const REGISTRY = {
  line: LineChart, bar: BarChart, area: AreaChart,
  pie: PieChart, donut: PieChart, doughnut: PieChart,
  scatter: ScatterChart, radar: RadarChart, funnel: FunnelChart, gauge: GaugeChart,
  heatmap: HeatmapChart, treemap: TreemapChart, sankey: SankeyChart, network: NetworkChart,
  tree: TreeChart, boxplot: BoxplotChart, candlestick: CandlestickChart, wordcloud: WordcloudChart,
  waterfall: WaterfallChart, gantt: GanttChart, sunburst: SunburstChart, chord: ChordChart,
  parallel: ParallelChart, bullet: BulletChart, waffle: WaffleChart, calendar: CalendarHeatmap,
  violin: ViolinChart, ridgeline: RidgelineChart, stream: StreamChart, bump: BumpChart,
  lollipop: LollipopChart, dumbbell: DumbbellChart, slope: SlopeChart, hexbin: HexbinChart,
  circlepack: CirclePackingChart, marimekko: MarimekkoChart, icicle: IcicleChart, voronoi: VoronoiChart,
}

export function createChart(type, container, options = {}) {
  const C = REGISTRY[type]
  if (!C) throw new Error(`[xunay/charts] 未知类型: ${type}`)
  return new C(container, options)
}

export const chartTypes = Object.keys(REGISTRY)
