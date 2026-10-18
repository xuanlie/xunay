// kit: 棒棒糖图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 棒棒糖图"),
    P("从基线延伸（分类：时间）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("lollipop", {"rowHeight": 26, "padding": {"top": 16, "right": 60, "bottom": 24, "left": 90}, "data": [{"label": "北京", "value": 380}, {"label": "上海", "value": 420}, {"label": "广州", "value": 250}, {"label": "深圳", "value": 340}, {"label": "杭州", "value": 180}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '棒棒糖图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
