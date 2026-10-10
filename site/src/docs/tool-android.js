// Android 总览
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Android 后端总览"),
    P("xunay 可以把 .xuy 文件编译成原生 Android 工程（Java + XML + Gradle），最终产出 APK。跟 Web 端不同，Android 端没有 JS 引擎——gen.js 把 .xuy 静态翻译成 Java，signal 变成 Java 类，div 变成 LinearLayout，computed 变成 Java 方法。"),
    H2("和 Web 端的区别"),
    Table(["","Web 端","Android 端"], [["运行方式","浏览器 JS 引擎","静态翻译成 Java，编译成 APK"],["xunay 库","运行时依赖","不存在"],["支持语法","浏览器支持多少就多少","只支持 gen.js 写好的翻译规则"],["外部 npm 库","import 直接用","翻译不了，得手写 Java 等价"]]),
    H2("两套实现"),
    Code("android/         .xuy → Java + XML → APK（UI 应用）\nandroid-3d/      .xuy → OpenGL ES Java → APK（3D 场景）", "txt"),
    P("两条路相互独立。UI 路走 LinearLayout/TextView；3D 路走 GLSurfaceView + 着色器。"),
    H2("30 秒上手"),
    Code("node bin/xuyc-android.js examples/counter.xuy --out build/android\ncd build/android\ngradlew wrapper --gradle-version 8.7\n.\\gradlew.bat assembleDebug\nadb install -r app/build/outputs/apk/debug/app-debug.apk", "bash"),
    H2("一键脚本"),
    Code(".\\run.ps1 -Entry examples/counter.xuy", "powershell"),
    P("run.ps1 自动完成：生成 → 编译 → 卸载旧版 → 安装 → 启动。"),
    H2("下一步"),
    Ul("编译器管线：从 .xuy 到 Java 的完整流程","DSL 支持：signal / computed / show / 事件 / CSS","Android 3D：GLSurfaceView + PBR 材质"),
  )
}
