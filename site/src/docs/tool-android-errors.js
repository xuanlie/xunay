// Android 错误码
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("错误码"),
    P("xuyc-android 在解析或翻译失败时抛出的错误。"),
    H2("解析类"),
    Table(["错误","原因","解决"], [["解析失败: Unexpected token",".xuy 里有非法 JS 语法","检查括号 / 引号 / 逗号"],["RangeError: Maximum call stack","递归引用（computed 循环依赖）","检查 computed 是否互相引用"],["ReferenceError: xxx is not defined","gen.js 里变量名拼错","报告 bug"]]),
    H2("生成类"),
    Table(["症状","原因"], [["AST: 0","parser 没识别出顶层结构（用了 page 之外的东西）"],["找不到符号: xxx","signal / computed 名跟 Java 关键字冲突"],["不兼容的类型","类型推断失败（返回类型不对）"],["文本块起始分隔符非法","JS 字符串里有未转义的换行"]]),
    H2("编译类"),
    Table(["Gradle 报错","原因"], [["package com.xunay.app does not exist","生成目录位置不对"],["cannot find symbol","引用了不存在的类 / 方法"],["AttributeNSNotUnique","XML 属性重复"],["资源链接失败","XML 属性值非法（如 autodp）"]]),
    H2("运行类"),
    Table(["崩溃","原因"], [["Unknown color","Color.parseColor 拿到非法色值（3 位 hex 等）"],["NullPointerException at onCreate","signal 未初始化 / 时序问题"],["ClassCastException","findViewById 拿到错误类型"],["IllegalStateException: setText","在子线程更新 UI（用 Signal.set）"]]),
    H2("调试方式"),
    Code("adb logcat -c\nadb shell am force-stop com.xunay.app\nadb shell am start -n com.xunay.app/.MainActivity\nStart-Sleep -Seconds 2\nadb logcat -b crash -d", "powershell"),
  )
}
