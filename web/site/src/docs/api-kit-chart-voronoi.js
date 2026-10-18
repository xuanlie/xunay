// kit: 泰森多边形
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 泰森多边形"),
    P("最近点（分类：流向）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("voronoi", {"height": 280, "padding": 10, "showLabels": false, "showValues": false, "legend": false, "data": [{"x": 20, "y": 30, "value": 40, "label": "A"}, {"x": 60, "y": 25, "value": 70, "label": "B"}, {"x": 40, "y": 60, "value": 55, "label": "C"}, {"x": 75, "y": 55, "value": 80, "label": "D"}, {"x": 30, "y": 85, "value": 30, "label": "E"}, {"x": 65, "y": 80, "value": 65, "label": "F"}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '泰森多边形' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
