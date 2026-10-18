// kit: 面积图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 面积图"),
    P("堆叠 / 百分比 / 重叠（分类：基础）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("area", {"height": 280, "layout": "stacked", "series": [{"name": "移动端", "data": [{"label": "1月", "value": 100}, {"label": "2月", "value": 150}]}, {"name": "桌面端", "data": [{"label": "1月", "value": 80}, {"label": "2月", "value": 100}]}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '面积图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
