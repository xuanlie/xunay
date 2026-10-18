// kit: 漏斗图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 漏斗图"),
    P("转化率（分类：进阶）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("funnel", {"height": 280, "showPercent": false, "data": [{"label": "访问", "value": 1000}, {"label": "注册", "value": 640}, {"label": "激活", "value": 420}, {"label": "付费", "value": 180}, {"label": "复购", "value": 75}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '漏斗图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
