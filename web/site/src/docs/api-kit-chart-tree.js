// kit: 树形图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 树形图"),
    P("可折叠（分类：层级）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("tree", {"height": 280, "orientation": "horizontal", "nodeRadius": 5, "expandAll": true, "data": {"name": "root", "children": [{"name": "A", "children": [{"name": "A1"}, {"name": "A2"}]}, {"name": "B", "children": [{"name": "B1"}, {"name": "B2"}, {"name": "B3"}]}, {"name": "C"}]}}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '树形图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
