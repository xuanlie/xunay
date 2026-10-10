// 配置
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("配置"),
    P("compiler3 的配置集中在 package.json 的 xunay 字段。"),
    H2("package.json.xunay"),
    Code("{\n  \"name\": \"my-app\",\n  \"xunay\": {\n    \"compileMode\": \"compiled\",\n    \"css\": [\"tw\", \"ui\"],\n    \"devtools\": false,\n    \"minify\": true,\n    \"sourcemap\": false,\n    \"target\": \"es2020\",\n    \"pwa\": {\n      \"name\": \"My App\",\n      \"themeColor\": \"#1f6feb\"\n    }\n  }\n}", "json"),
    H2("compileMode"),
    Table(["值","行为"], [["compiled","编译器生成 createElement（默认）"],["runtime","源码原样 + 自动注入标签 import"],["hybrid","无标记走 compiled，有 @runtime 走 runtime"]]),
    H2("配置优先级"),
    Code("文件头 // @runtime     ← 最高，单文件覆盖\n命令行 --mode runtime    ← 中，本次构建覆盖\npackage.json compileMode ← 低，项目默认", "txt"),
    H2("编译模式选择"),
    Table(["场景","推荐模式","原因"], [["生产构建","compiled","启动快、体积小"],["开发调试","runtime","产物可读、易断点"],["动态标签多","runtime","运行时决定标签名"],["大部分静态","compiled","编译优化"],["混合","hybrid","文件级控制"]]),
    H2("文件级指令"),
    Code("// @runtime\nimport { signal, mount } from 'xunay'\n// 这个文件用 runtime 模式\n\n// @compiled\nimport { signal, mount } from 'xunay'\n// 这个文件强制 compile", "js"),
    P("指令必须在前 10 行的注释里。支持 // @runtime、// @compiled、// @hybrid。"),
    H2("旧配置 xunay.config.json"),
    P("旧版本用 xunay.config.json。compiler3 优先读 package.json，其次读 xunay.config.json。"),
    Code("{\n  \"backend\": \"node\",\n  \"compileMode\": \"compiled\",\n  \"ports\": {\n    \"node\": 12341,\n    \"python\": 12342\n  }\n}", "json"),
    H2("没有 xunay 字段"),
    P("如果没有 package.json 或没有 xunay 字段，默认用 compiled 模式，其余选项用内置默认值。"),
    Tip("想切换模式，只改一处：package.json 的 xunay.compileMode。"),
  )
}
