// 故障排查
import { D, H1, H2, H3, P, Code, Ul, Ol, Quote, Tip, Warn, Danger, Table, Link } from '../docs-kit.js'

export function Doc() {
  return D(
    H1("故障排查"),
    P("遇到问题按这个清单检查。"),
    H2("页面白屏"),
    Ul("F12 看 console 报错","检查 app.js 是否 404","检查 #app 元素是否存在","检查 mount 是否执行"),
    H2("内容不更新"),
    Code("// 错误：静态求值\nspan(null, n())\n\n// 正确：动态\nspan(null, () => n())", "xuy"),
    H2("effect 无限循环"),
    Code("// 错误\neffect(() => {\n  a(a() + 1)\n})\n\n// 正确：只读\neffect(() => {\n  console.log(a())\n})", "xuy"),
    H2("内存泄漏"),
    Code("// 错误：没清理\nonMount(() => {\n  setInterval(tick, 1000)\n})\n\n// 正确：加清理\nonMount(() => {\n  const id = setInterval(tick, 1000)\n  onUnmount(() => clearInterval(id))\n})", "xuy"),
    H2("列表错乱"),
    Code("// 错误：key 不稳定\nlist(items, (i, idx) => idx, ...)\n\n// 正确：用 id\nlist(items, i => i.id, ...)", "xuy"),
    H2("请求 404"),
    Code("// 检查后端是否启动\ncurl http://localhost:12342/rpc/token\n\n// 检查路径\nfetch('/rpc/getTodos')   // 正确\nfetch('/api/getTodos')   // 错误", "bash"),
    H2("CORS 报错"),
    P("后端要开 CORS。Python FastAPI 例子："),
    Code("app.add_middleware(\n    CORSMiddleware,\n    allow_origins=['*'],\n    allow_methods=['*'],\n    allow_headers=['*']\n)", "py"),
    H2("编译失败"),
    Code("[xunay compile] 期望 )\n  行 12, 列 8\n  return div(null, span(null, 'x'\n         ^", "txt"),
    P("按提示的行列号修改。"),
    H2("构建慢"),
    Ul("减少 .xuy 文件数量","用 --out 分散到多个目录","检查是否有循环依赖"),
    H2("其他"),
    P("看 doc/13-编译器限制 或提交 issue。"),
  )
}
