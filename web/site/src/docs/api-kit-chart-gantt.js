// kit: 甘特图
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 甘特图"),
    P("依赖箭头 + 今天线（分类：时间）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("gantt", {"rowHeight": 30, "labelWidth": 70, "padding": {"top": 36, "right": 20, "bottom": 20, "left": 0}, "showProgress": true, "showDependencies": true, "showToday": true, "tasks": [{"id": "a", "name": "需求", "start": "2026-10-11", "end": "2026-10-16", "progress": 1.0}, {"id": "b", "name": "设计", "start": "2026-10-16", "end": "2026-10-22", "progress": 0.6, "deps": ["a"]}, {"id": "c", "name": "开发", "start": "2026-10-22", "end": "2026-11-03", "progress": 0.3, "deps": ["b"]}, {"id": "d", "name": "测试", "start": "2026-10-31", "end": "2026-11-09", "progress": 0.1, "deps": ["c"]}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '甘特图' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
