// kit: 和弦图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 和弦图"),
    P("双向流（分类：流向）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("chord", {"height": 280, "innerRadius": 0.68, "showLabels": false, "padding": 30, "labels": ["A", "B", "C", "D", "E"], "matrix": [[0, 20, 15, 10, 5], [25, 0, 18, 12, 8], [20, 22, 0, 15, 10], [15, 18, 20, 0, 12], [10, 12, 15, 18, 0]]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '和弦图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
