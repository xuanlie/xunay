// kit: 桑基图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 桑基图"),
    P("贝塞尔带（分类：流向）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("sankey", {"height": 280, "padding": {"top": 10, "right": 100, "bottom": 10, "left": 10}, "nodes": [{"id": "a", "name": "来源"}, {"id": "b", "name": "Web"}, {"id": "c", "name": "App"}, {"id": "d", "name": "付费"}], "links": [{"source": "a", "target": "b", "value": 60}, {"source": "a", "target": "c", "value": 40}, {"source": "b", "target": "d", "value": 20}, {"source": "c", "target": "d", "value": 28}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '桑基图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
