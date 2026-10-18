// kit: 词云
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link, ChartDemo, IconGrid } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("kit: 词云"),
    P("螺旋布局（分类：分布）"),
    H2("引入"),
    Code("import Kit from '/tmp/xuyg-test/xunay-kit.js'", "js"),
    H2("实时预览"),
    ChartDemo("wordcloud", {"height": 280, "minFontSize": 12, "maxFontSize": 32, "rotateRatio": 0, "data": [{"text": "React", "value": 100}, {"text": "Vue", "value": 85}, {"text": "Svelte", "value": 65}, {"text": "Angular", "value": 70}, {"text": "Solid", "value": 45}, {"text": "Qwik", "value": 35}, {"text": "Astro", "value": 55}, {"text": "Next", "value": 75}, {"text": "Nuxt", "value": 50}, {"text": "Vite", "value": 60}]}),
    H2("示例"),
    Code("const chart = new Kit('#app', { title: '词云' })\nchart.setData([...])\nchart.setOptions({ theme: 'dark' })\nchart.replay()\nchart.destroy()", "js"),
    H2("通用方法"),
    Table(["方法","说明"], [["setData(data)","替换数据"],["setOptions(opts)","更新配置"],["render({animate})","手动重绘"],["replay()","重播动画"],["destroy()","销毁"]]),
    Tip("完整清单见「Kit 组件 → Kit 总览」。"),
  )
}
