// Android 发布 APK
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("发布 APK"),
    P("debug 和 release 两个 build type。"),
    H2("debug（默认）"),
    Code(".\\gradlew.bat assembleDebug", "bash"),
    P("产物：app/build/outputs/apk/debug/app-debug.apk。自动用 debug 签名，能直接装。"),
    H2("release"),
    P("需要配置签名。四步："),
    Ul("1. 生成 keystore 文件","2. 在 gradle.properties 里填 4 个字段","3. .\\gradlew.bat assembleRelease","4. 产物在 app/build/outputs/apk/release/"),
    H2("生成 keystore"),
    Code("keytool -genkey -v -keystore my-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias myalias", "bash"),
    H2("填 gradle.properties"),
    Code("XUNAY_KEYSTORE=E:/path/to/my-release.jks\\nXUNAY_KEYSTORE_PASSWORD=your_store_password\\nXUNAY_KEY_ALIAS=myalias\\nXUNAY_KEY_PASSWORD=your_key_password", "properties"),
    H2("编 release"),
    Code("cd build/android\\n.\\gradlew.bat assembleRelease", "bash"),
    H2("安装 release"),
    Code("adb install -r app/build/outputs/apk/release/app-release.apk", "bash"),
    H2("发布到应用市场"),
    P("大部分市场要 AAB 格式："),
    Code(".\\gradlew.bat bundleRelease", "bash"),
    P("产物：app/build/outputs/bundle/release/app-release.aab。"),
    H2("签名不一致"),
    P("装 release 前要先卸载 debug（签名不同不能覆盖）："),
    Code("adb uninstall com.xunay.app\\nadb install -r app-release.apk", "bash"),
    H2("注意事项"),
    Ul("keystore 文件和密码不要提交到仓库","丢了 keystore 就没法更新已上架的应用","minifyEnabled 默认关闭，开混淆要额外配置"),
  )
}
