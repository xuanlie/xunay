// 总览
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("编译器总览"),
    P("compiler3 把 .xuy 源码编译成浏览器可运行的 JavaScript。用 acorn 生成 AST，做作用域分析，找出所有标签调用，替换成 document.createElement 或运行时标签函数。"),

    H2("两个版本"),
    Table(["版本","解析方式","状态"], [["compiler2","字符串逐字符扫描","旧版，保留兼容"],["compiler3","acorn AST + 作用域分析","当前推荐"]]),
    H2("compiler3 流程"),
    Code(" .xuy 源码\n  ↓ acorn.parse()\n ESTree AST\n  ↓ collectBindings()\n 收集所有变量名\n  ↓ findTagCalls()\n 找到所有 tagName(...) 调用\n  ↓ findOutermost()\n 取最外层\n  ↓ genTag() 从后往前替换\n JS（createElement 或 tag() 调用）", "txt"),
    H2("和 compiler2 的区别"),
    Table(["维度","compiler2","compiler3"], [["解析","字符串扫描","acorn AST"],["作用域","无","有（const div = x 后 div() 不编译）"],["value 响应式","错误（el.value = () =>）","正确（bindAttr）"],["属性判断","字符串 includes","AST 节点类型"],["测试","54 个","1391 个"]]),
    H2("三种编译模式"),
    Table(["模式","输出","场景"], [["compiled","document.createElement 硬编码","生产构建"],["runtime","源码 + 注入标签 import","开发 / 动态标签"],["hybrid","文件有 // @runtime 时走 runtime","混合"]]),
    P("配置在 package.json 的 xunay.compileMode，命令行 --mode 可覆盖，文件头部 // @runtime 优先级最高。"),
    H2("不做什么"),
    Ul("不支持 JSX","不支持模板语法","不支持 TypeScript 类型注解","不做 VDOM diff"),
    H2("相关源码"),
    Table(["文件","职责"], [["compiler3/src/index.js","compile() 入口 + AST 逻辑"],["compiler3/src/tags.js","标签白名单"],["compiler3/src/runtime.js","编译产物依赖的运行时辅助"]]),
    Tip("编译器只把已知标签名变成 DOM 创建代码。箭头函数、解构、async/await 原样透传。"),
  )
}
