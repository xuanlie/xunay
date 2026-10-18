// kit: 折线图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 折线图"),
    P("平滑 / 阶梯 / 面积 / 回归（分类：基础）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("line", {"height": 280, "series": [{"name": "收入", "data": [{"label": "1月", "value": 120}, {"label": "2月", "value": 200}, {"label": "3月", "value": 150}]}, {"name": "支出", "data": [{"label": "1月", "value": 80}, {"label": "2月", "value": 110}, {"label": "3月", "value": 90}]}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '折线图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
