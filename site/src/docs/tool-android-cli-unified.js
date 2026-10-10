// 统一 CLI 入口
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("统一 CLI 入口"),
    P("xuyc.js 支持 --target=ui/3d/filament 分发到对应 Android CLI。"),
    Code("node bin/xuyc.js <entry.xuy> --target=ui\nnode bin/xuyc.js <entry.xuy> --target=3d\nnode bin/xuyc.js <entry.xuy> --target=filament", "bash"),
    Table(["target","转发到","包名"], [["ui / android","xuyc-android.js","com.xunay.app"],["3d","xuyc-3d.js","com.xunay.gl"],["filament","xuyc-filament.js","com.xunay.filament"]]),
    P("不带 --target 走原 web 编译。scan 子命令扫 src/ 生成 router.xuy。"),
  )
}
