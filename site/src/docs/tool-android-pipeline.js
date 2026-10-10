// Android 编译器管线
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("Android 编译器管线"),
    P("整条链只有 4 个核心文件，加起来约 4500 行。"),
    H2("四个文件"),
    Table(["文件","职责","行数"], [["android/src/parser.js",".xuy → AST","~400"],["android/src/gen.js","AST + CSS → Java/XML/Gradle","~2200"],["android/src/css-android.js","CSS → 布局决策","~400"],["android/src/js-to-java.js","JS 表达式 → Java 表达式","~1500"]]),
    H2("编译流程"),
    Code(".xuy 源码\n  ↓  acorn 解析\n标准 ESTree AST\n  ↓  expandComponents（组件展开）\n  ↓  自定义 AST\n  { type: \"tag\", name, props, children }\n  { type: \"text\", expr }\n  { type: \"dyn\", expr, ast }\n  { type: \"show\", cond, child }\n  ↓  gen.js + js-to-java.js\nJava + XML + Gradle（7 个文件）\n  ↓  gradlew assembleDebug\nAPK", "txt"),
    H2("生成的文件"),
    Code("app/src/main/java/com/xunay/app/MainActivity.java\napp/src/main/java/com/xunay/app/Signal.java\napp/src/main/res/layout/activity_main.xml\napp/src/main/AndroidManifest.xml\napp/build.gradle\nsettings.gradle\ngradle.properties", "txt"),
    H2("acorn 的角色"),
    P(".xuy 本质是 JS 子集——signal、computed、div 对 acorn 来说就是普通函数调用。acorn 负责把文本解析成标准 ESTree AST，剩下 80% 的翻译工作（AST → Java）由手写的 js-to-java.js 完成。"),
    Quote("acorn 解决 20%（解析），你手写 80%（翻译）。没有现成的 JS → Java 转译器，全世界都缺。"),
    H2("js-to-java 支持"),
    Table(["类别","支持"], [["语句","if / switch / for / for...of / while / do-while / try-catch / throw / break / continue"],["表达式","算术 / 比较 / 逻辑 / 位运算 / 三元 / typeof / instanceof / in"],["函数","箭头函数 / function 声明 / async 箭头"],["内置对象","Math / Number / JSON / Object.* / Array.from / Date / String 25 个方法"],["数组方法","map / filter / forEach / reduce / find / some / every / join / slice / concat / indexOf / includes / reverse / sort"],["对象","字面量 {a:1} / 属性访问 .x / [k]"],["可选链","?. 和 ??"],["异步","async/await + fetch + 主线程回调"]]),
    H2("类型推断"),
    P("js-to-java 用多轮推导（discoverComputedTypes 迭代 4 轮收敛）判断 computed 返回类型。单表达式箭头函数 () => expr 直接返回推断结果；块体箭头函数从 return 语句扫。"),
  )
}
