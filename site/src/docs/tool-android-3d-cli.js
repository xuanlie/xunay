// 3D CLI 命令
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("3D CLI 命令"),
    P("xuyc-3d.js 是 3D 场景的命令行入口。"),
    H2("基本用法"),
    Code("node bin/xuyc-3d.js <scene.xuy> [--out dir]", "bash"),
    H2("示例"),
    Code("node bin/xuyc-3d.js examples/scene3d.xuy\nnode bin/xuyc-3d.js examples/scene-shapes.xuy --out build/android-3d", "bash"),
    H2("生成的文件"),
    Code("app/src/main/java/com/xunay/gl/MainActivity.java\napp/src/main/java/com/xunay/gl/SceneRenderer.java\napp/src/main/java/com/xunay/gl/ShaderUtil.java\napp/src/main/java/com/xunay/gl/ObjLoader.java\napp/src/main/AndroidManifest.xml\napp/build.gradle\nsettings.gradle\ngradle.properties\napp/src/main/assets/*.obj\napp/src/main/assets/*.png", "txt"),
    H2("资源打包"),
    P("model({ src: \"xxx.obj\" }) 里的 .obj 自动打进 assets。texture({ texture: \"xxx.png\" }) 里的 png 也自动打进。"),
    H2("编译 & 安装"),
    P("CLI 不自动编译。手动执行："),
    Code("cd build/android-3d\ngradlew wrapper --gradle-version 8.7\n.\\gradlew.bat assembleDebug\nadb install -r app/build/outputs/apk/debug/app-debug.apk\nadb shell am start -n com.xunay.gl/.MainActivity", "powershell"),
    H2("包名差异"),
    Table(["命令","包名","Activity","输出目录"], [["xuyc-android.js","com.xunay.app","com.xunay.app.MainActivity","build/android"],["xuyc-3d.js","com.xunay.gl","com.xunay.gl.MainActivity","build/android-3d"],["xuyc-filament.js","com.xunay.filament","com.xunay.filament.MainActivity","build/filament"]]),
    H2("Filament 路 CLI"),
    P("新路入口是 xuyc-filament.js。用法一样，多支持 --install（adb --no-streaming + 90s 超时）。"),
    Code("node bin/xuyc-filament.js examples/scene-anim.xuy --out build/filament --build --install", "bash"),
    Table(["选项","说明"], [["--out <dir>","输出目录，默认 build/filament"],["--build","生成后立即 gradlew assembleDebug"],["--install","生成 + 编译 + adb install --no-streaming + am start"]]),
    H2("限制"),
    Ul("没有 run.ps1 一键脚本（要手动）","没有自动 gradle wrapper 生成","不打包 release 签名"),
  )
}
