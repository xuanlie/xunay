// kit: 平行坐标
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 平行坐标"),
    P("轴刷选（分类：流向）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("parallel", {"height": 280, "brushable": false, "padding": {"top": 30, "right": 30, "bottom": 30, "left": 30}, "categoryKey": "name", "dimensions": [{"key": "速度", "label": "速度"}, {"key": "力量", "label": "力量"}, {"key": "敏捷", "label": "敏捷"}, {"key": "智力", "label": "智力"}, {"key": "耐力", "label": "耐力"}], "data": [{"name": "P1", "速度": 85, "力量": 70, "敏捷": 90, "智力": 60, "耐力": 75}, {"name": "P2", "速度": 60, "力量": 90, "敏捷": 65, "智力": 80, "耐力": 70}, {"name": "P3", "速度": 75, "力量": 65, "敏捷": 70, "智力": 85, "耐力": 90}, {"name": "P4", "速度": 90, "力量": 60, "敏捷": 80, "智力": 75, "耐力": 65}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '平行坐标' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
