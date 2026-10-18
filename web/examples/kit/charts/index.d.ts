export interface ChartPoint {
  x?: number
  y?: number
  value?: number
  label?: string | number
  color?: string
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export interface ChartDatum {
  label?: string | number
  value?: number
  y?: number
  color?: string
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export interface LineSeries {
  name?: string
  color?: string
  data: ChartPoint[]
}

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'doughnut'

export interface ChartOptions {
  width?: number
  height?: number
  padding?: number
  title?: string
  ariaLabel?: string
  colors?: string[]
  textColor?: string
  gridColor?: string
  axisColor?: string
  background?: string
  grid?: boolean
  labels?: boolean
  valueLabels?: boolean
  tooltip?: boolean
  autoResize?: boolean
  strokeWidth?: number
  pointRadius?: number
  centerText?: string | number
  centerColor?: string
  centerFontSize?: number
  data?: ChartDatum[] | LineSeries[]
  series?: LineSeries[]
  name?: string
  onPointClick?: (
    point: ChartPoint,
    seriesIndex: number,
    pointIndex: number,
    event: MouseEvent
  ) => void
  onBarClick?: (datum: ChartDatum, index: number, event: MouseEvent) => void
  onSliceClick?: (datum: ChartDatum, index: number, event: MouseEvent) => void
  [key: string]: unknown
}

export interface ChartInstance {
  render(): ChartInstance
  setData(data: unknown): ChartInstance
  setOptions(options: ChartOptions): ChartInstance
  destroy(): void
}

export function createChart(
  container: string | Element,
  options?: ChartOptions,
  type?: ChartType
): ChartInstance

export function lineChart(
  container: string | Element,
  options?: ChartOptions
): ChartInstance

export function barChart(
  container: string | Element,
  options?: ChartOptions
): ChartInstance

export function pieChart(
  container: string | Element,
  options?: ChartOptions
): ChartInstance

export function donutChart(
  container: string | Element,
  options?: ChartOptions
): ChartInstance

export function extent(values: number[]): [number, number]

export function ticks(min: number, max: number, count?: number): number[]

export function scale(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number
): (value: number) => number

declare const _default: {
  createChart: typeof createChart
  lineChart: typeof lineChart
  barChart: typeof barChart
  pieChart: typeof pieChart
  donutChart: typeof donutChart
}

export default _default
