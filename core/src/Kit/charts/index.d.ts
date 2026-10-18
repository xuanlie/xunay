// @xunay/kit/charts —— 类型定义

export interface ChartOptions {
  width?: number | null
  height?: number
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number }
  title?: string | null
  subtitle?: string | null
  theme?: 'light' | 'dark' | string
  colors?: string[]
  legend?: boolean
  tooltip?: boolean
  animation?: { duration?: number; easing?: string; stagger?: number }
  onHover?: (payload: any) => void
  [key: string]: any
}

export interface ChartInstance {
  render(opts?: { animate?: boolean }): this
  setData(data: any): this
  setOptions(opts: Partial<ChartOptions>): this
  replay(): this
  destroy(): void
}

export type ChartType =
  | 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'doughnut'
  | 'scatter' | 'radar' | 'funnel' | 'gauge' | 'heatmap'
  | 'treemap' | 'sankey' | 'network' | 'tree' | 'boxplot'
  | 'candlestick' | 'wordcloud' | 'waterfall' | 'gantt'
  | 'sunburst' | 'chord' | 'parallel' | 'bullet' | 'waffle'
  | 'calendar' | 'violin' | 'ridgeline' | 'stream' | 'bump'
  | 'lollipop' | 'dumbbell' | 'slope' | 'hexbin'
  | 'circlepack' | 'marimekko' | 'icicle' | 'voronoi'

export class LineChart implements ChartInstance {
  constructor(container: string | Element, options?: ChartOptions)
  render(opts?: { animate?: boolean }): this
  setData(data: any): this
  setOptions(opts: Partial<ChartOptions>): this
  replay(): this
  destroy(): void
}
export class BarChart extends LineChart {}
export class AreaChart extends LineChart {}
export class PieChart extends LineChart {}
export class ScatterChart extends LineChart {}
export class RadarChart extends LineChart {}
export class FunnelChart extends LineChart {}
export class GaugeChart extends LineChart {}
export class HeatmapChart extends LineChart {}
export class TreemapChart extends LineChart {}
export class SankeyChart extends LineChart {}
export class NetworkChart extends LineChart {}
export class TreeChart extends LineChart {}
export class BoxplotChart extends LineChart {}
export class CandlestickChart extends LineChart {}
export class WordcloudChart extends LineChart {}
export class WaterfallChart extends LineChart {}
export class GanttChart extends LineChart {}
export class SunburstChart extends LineChart {}
export class ChordChart extends LineChart {}
export class ParallelChart extends LineChart {}
export class BulletChart extends LineChart {}
export class WaffleChart extends LineChart {}
export class CalendarHeatmap extends LineChart {}
export class ViolinChart extends LineChart {}
export class RidgelineChart extends LineChart {}
export class StreamChart extends LineChart {}
export class BumpChart extends LineChart {}
export class LollipopChart extends LineChart {}
export class DumbbellChart extends LineChart {}
export class SlopeChart extends LineChart {}
export class HexbinChart extends LineChart {}
export class CirclePackingChart extends LineChart {}
export class MarimekkoChart extends LineChart {}
export class IcicleChart extends LineChart {}
export class VoronoiChart extends LineChart {}

export function createChart(
  type: ChartType,
  container: string | Element,
  options?: ChartOptions
): ChartInstance

export const chartTypes: ChartType[]
