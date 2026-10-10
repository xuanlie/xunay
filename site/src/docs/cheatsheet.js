// 速查表
import { D, H1, H2, P, Code, Ul, Tip, Table, Card, Grid, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1('速查表'),
    P('每个特性一格里只有一段最小可运行代码，复制即用。不用读长文档。'),

    Grid(2,
      Card('/docs/cheatsheet-core', '核心', 'signal / computed / effect / show / list / router'),
      Card('/docs/cheatsheet-ui', 'UI', 'HTML 标签 / 属性 / 事件 / CSS'),
      Card('/docs/cheatsheet-3d', '3D 老路', 'scene / 7 形状 / 动画 / 材质 / 纹理 / OBJ'),
      Card('/docs/cheatsheet-filament', 'Filament', 'glTF / PBR / 粒子 / 音频 / 后处理 / 实例化'),
      Card('/docs/cheatsheet-android', 'Android 特有', '路由 / storage / theme / fetch / 通知'),
    ),

    H2('怎么写 .xuy'),
    Code(`import { div, button, span, s, app, txt } from 'xunay'

const n = s(0)

app(() => div(null,
  button({ on: { click: () => n(v => v + 1) } }, '+1'),
  span(null, txt\`n = \${n}\`)
), '#app')`, 'xuy'),

    H2('怎么跑'),
    Table(['路', '命令'], [
      ['UI 路（Android APK）', 'node bin/xuyc.js x.xuy --target=ui --build --install'],
      ['3D 老路', 'node bin/xuyc.js x.xuy --target=3d --build'],
      ['3D Filament', 'node bin/xuyc.js x.xuy --target=filament --build --install'],
      ['Web 端', 'node bin/xuyc.js build x.xuy --out dist'],
    ]),

    Tip('速查表只给最小片段。要看完整语义去对应的 tool-xxx 文档。'),
  )
}
