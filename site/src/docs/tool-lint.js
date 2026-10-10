// 代码检查
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("代码检查"),
    P("xunay 没有内置 lint——可以用 ESLint 或自己写规则。"),
    H2("用 ESLint"),
    Code("npm install -D eslint\nnpx eslint src/", "bash"),
    H2("配置"),
    Code("// .eslintrc.json\n{\n  \"env\": { \"browser\": true, \"es2022\": true },\n  \"parserOptions\": { \"ecmaVersion\": \"latest\", \"sourceType\": \"module\" },\n  \"rules\": {\n    \"no-unused-vars\": \"warn\",\n    \"no-undef\": \"error\"\n  }\n}", "json"),
    H2("常见问题检查"),
    P("手动检查清单——避免常见坑："),
    Table(["检查","说明"], [["effect 里读写同一 signal","会导致死循环"],["动态值忘记包函数","不响应变化"],["list 用索引做 key","重排时状态错乱"],["忘记 onUnmount 清理","内存泄漏"],["style 用函数返回同一对象","引用相等不更新"]]),
    H2("自己写规则"),
    P("用正则搜代码——简单有效："),
    Code("# 查找忘记加 () 的 signal\nrg 'span\\(null, [a-zA-Z_]+\\)' src/", "bash"),
    H2("编译时检查"),
    P("xuyc 本身会检查语法——编译失败就是 lint 失败。"),
  )
}
