// kit: 马赛克图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 马赛克图"),
    P("宽柱堆叠（分类：层级）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("marimekko", {"height": 280, "labelMode": "percent", "legend": false, "data": {"columns": [{"label": "手机", "values": {"A": 200, "B": 150, "C": 100}}, {"label": "电脑", "values": {"A": 300, "B": 120, "C": 80}}, {"label": "平板", "values": {"A": 180, "B": 140, "C": 70}}], "categories": ["A", "B", "C"]}}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '马赛克图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
