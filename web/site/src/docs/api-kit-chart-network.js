// kit: 关系图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 关系图"),
    P("力导向 + 拖拽（分类：流向）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("network", {"height": 280, "layout": "force", "nodes": [{"id": "A", "name": "A", "value": 30}, {"id": "B", "name": "B", "value": 50}, {"id": "C", "name": "C", "value": 40}, {"id": "D", "name": "D", "value": 60}, {"id": "E", "name": "E", "value": 45}, {"id": "F", "name": "F", "value": 35}], "links": [{"source": "A", "target": "B", "value": 2}, {"source": "A", "target": "C", "value": 3}, {"source": "B", "target": "D", "value": 2}, {"source": "C", "target": "E", "value": 4}, {"source": "D", "target": "F", "value": 1}, {"source": "E", "target": "F", "value": 2}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '关系图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
