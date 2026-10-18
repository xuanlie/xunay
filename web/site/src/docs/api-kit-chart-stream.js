// kit: 流图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 流图"),
    P("主题河流（分类：进阶）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("stream", {"height": 280, "baseline": "wiggle", "legend": false, "labels": ["1月", "2月", "3月", "4月", "5月"], "series": [{"name": "A", "data": [{"label": "1月", "value": 60}, {"label": "2月", "value": 80}, {"label": "3月", "value": 55}, {"label": "4月", "value": 75}, {"label": "5月", "value": 65}]}, {"name": "B", "data": [{"label": "1月", "value": 50}, {"label": "2月", "value": 40}, {"label": "3月", "value": 70}, {"label": "4月", "value": 60}, {"label": "5月", "value": 80}]}, {"name": "C", "data": [{"label": "1月", "value": 35}, {"label": "2月", "value": 55}, {"label": "3月", "value": 45}, {"label": "4月", "value": 65}, {"label": "5月", "value": 50}]}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '流图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
